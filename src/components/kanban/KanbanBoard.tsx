"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { createClient } from "@/lib/supabase/client"
import KanbanColumn from "./KanbanColumn"
import CardDetailDialog from "./CardDetailDialog"
import SearchFilter from "./SearchFilter"
import BoardHeader from "./BoardHeader"
import BoardStats from "./BoardStats"
import type { BoardColumn, Card, Label, Board } from "@/types/database"

interface ColumnCount {
  columnId: string
  name: string
  count: number
}

interface KanbanBoardProps {
  board: Board
  initialColumns: BoardColumn[]
  initialCards: (Card & { labels?: Label[] })[]
  initialLabels: Label[]
  totalCards: number
  columnCardCounts: ColumnCount[]
}

export default function KanbanBoard({
  board,
  initialColumns,
  initialCards,
  initialLabels,
  totalCards: initialTotalCards,
  columnCardCounts: initialColumnCardCounts,
}: KanbanBoardProps) {
  const [columns] = useState(initialColumns)
  const [cards, setCards] = useState(initialCards)
  const [labels] = useState(initialLabels)
  const [totalCards, setTotalCards] = useState(initialTotalCards)
  const [columnCardCounts, setColumnCardCounts] = useState(initialColumnCardCounts)
  const [selectedCard, setSelectedCard] = useState<(Card & { labels?: Label[] }) | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLabel, setFilterLabel] = useState<string>("all")
  const supabase = createClient()

  const fetchCards = useCallback(async () => {
    const { data } = await supabase
      .from("cards")
      .select("*, labels:card_labels(label:labels(*))")
      .eq("board_id", board.id)
      .order("position")

    if (data) {
      const formatted = data.map((card) => ({
        ...card,
        labels: card.labels?.map((cl: { label: Label }) => cl.label) || [],
      }))
      setCards(formatted)
      setTotalCards(formatted.length)
      setColumnCardCounts(
        columns.map((col) => ({
          columnId: col.id,
          name: col.name,
          count: formatted.filter((c) => c.column_id === col.id).length,
        }))
      )
    }
  }, [board.id, supabase, columns])

  useEffect(() => {
    const channel = supabase
      .channel(`board-${board.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards", filter: `board_id=eq.${board.id}` },
        () => {
          fetchCards()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [board.id, supabase, fetchCards])

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceColumnCards = cards
      .filter((c) => c.column_id === source.droppableId)
      .sort((a, b) => a.position - b.position)

    const destColumnCards =
      source.droppableId === destination.droppableId
        ? sourceColumnCards
        : cards
            .filter((c) => c.column_id === destination.droppableId)
            .sort((a, b) => a.position - b.position)

    const draggedCard = sourceColumnCards.find((c) => c.id === draggableId)
    if (!draggedCard) return

    const newSourceCards = sourceColumnCards.filter((c) => c.id !== draggableId)
    const newDestCards =
      source.droppableId === destination.droppableId
        ? newSourceCards
        : [...destColumnCards]

    newDestCards.splice(destination.index, 0, draggedCard)

    const updates: { id: string; position: number; column_id?: string }[] = []

    newSourceCards.forEach((card, index) => {
      if (card.position !== index || card.column_id !== source.droppableId) {
        updates.push({ id: card.id, position: index, column_id: source.droppableId })
      }
    })

    if (source.droppableId !== destination.droppableId) {
      newDestCards.forEach((card, index) => {
        if (card.position !== index || card.column_id !== destination.droppableId) {
          updates.push({ id: card.id, position: index, column_id: destination.droppableId })
        }
      })
    } else {
      newDestCards.forEach((card, index) => {
        if (card.position !== index) {
          updates.push({ id: card.id, position: index })
        }
      })
    }

    setCards((prev) => {
      const updated = prev.map((c) => {
        const newSourceIdx = newSourceCards.findIndex((ns) => ns.id === c.id)
        const newDestIdx = newDestCards.findIndex((nd) => nd.id === c.id)

        if (newSourceIdx !== -1 && source.droppableId === destination.droppableId) {
          return { ...c, position: newSourceIdx, column_id: source.droppableId }
        }
        if (newDestIdx !== -1) {
          return { ...c, position: newDestIdx, column_id: destination.droppableId }
        }
        return c
      })
      return updated
    })

    for (const update of updates) {
      if (update.column_id) {
        await supabase
          .from("cards")
          .update({ position: update.position, column_id: update.column_id })
          .eq("id", update.id)
      } else {
        await supabase
          .from("cards")
          .update({ position: update.position })
          .eq("id", update.id)
      }
    }
  }

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLabel =
      filterLabel === "all" ||
      (card.labels && card.labels.some((l) => l.id === filterLabel))

    return matchesSearch && matchesLabel
  })

  return (
    <div className="flex min-h-screen flex-col">
      <BoardHeader board={board} />
      <div className="flex-1 overflow-x-auto p-6">
        <div className="mb-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterLabel={filterLabel}
            onFilterChange={setFilterLabel}
            labels={labels}
          />
        </div>
        <div className="mb-6">
          <BoardStats totalCards={totalCards} columnCardCounts={columnCardCounts} />
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {columns
              .sort((a, b) => a.position - b.position)
              .map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={filteredCards
                    .filter((c) => c.column_id === column.id)
                    .sort((a, b) => a.position - b.position)}
                  boardId={board.id}
                  onCardClick={setSelectedCard}
                  onCardRefresh={fetchCards}
                />
              ))}
          </div>
        </DragDropContext>
      </div>

      {selectedCard && (
        <CardDetailDialog
          card={selectedCard}
          labels={labels}
          open={!!selectedCard}
          onOpenChange={(open) => !open && setSelectedCard(null)}
          onCardUpdated={fetchCards}
        />
      )}
    </div>
  )
}
