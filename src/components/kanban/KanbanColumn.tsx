"use client"

import { Draggable, Droppable } from "@hello-pangea/dnd"
import KanbanCard from "./KanbanCard"
import CreateCardDialog from "./CreateCardDialog"
import type { Card, BoardColumn, Label } from "@/types/database"

interface KanbanColumnProps {
  column: BoardColumn
  cards: (Card & { labels?: Label[] })[]
  boardId: string
  onCardClick: (card: Card & { labels?: Label[] }) => void
  onCardRefresh: () => void
  isAnonymous?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  "to do": "border-t-gray-400",
  "in progress": "border-t-blue-500",
  "done": "border-t-green-500",
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  "to do": "bg-gray-400",
  "in progress": "bg-blue-500",
  "done": "bg-green-500",
}

export default function KanbanColumn({
  column,
  cards,
  boardId,
  onCardClick,
  onCardRefresh,
  isAnonymous = false,
}: KanbanColumnProps) {
  const borderTopColor = STATUS_COLORS[column.name.toLowerCase()] || "border-t-gray-400"
  const badgeColor = STATUS_BADGE_COLORS[column.name.toLowerCase()] || "bg-gray-400"

  return (
    <div className={`flex w-72 shrink-0 flex-col rounded-lg bg-muted/50 p-3 border-t-2 ${borderTopColor}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{column.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs text-white ${badgeColor}`}>
          {cards.length}
        </span>
      </div>

      {isAnonymous ? (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-md p-1" style={{ minHeight: 100 }}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              isAnonymous={true}
            />
          ))}
        </div>
      ) : (
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-md p-1 transition-colors ${
                snapshot.isDraggingOver ? "bg-accent" : ""
              }`}
              style={{ minHeight: 100 }}
            >
              {cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <KanbanCard
                        card={card}
                        onClick={() => onCardClick(card)}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}

      {!isAnonymous && (
        <div className="mt-2">
          <CreateCardDialog
            columnId={column.id}
            boardId={boardId}
            onCardCreated={onCardRefresh}
          />
        </div>
      )}
    </div>
  )
}
