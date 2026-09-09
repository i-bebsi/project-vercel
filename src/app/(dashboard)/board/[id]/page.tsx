import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import KanbanBoard from "@/components/kanban/KanbanBoard"

export const dynamic = "force-dynamic"

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single()

  if (!board) {
    notFound()
  }

  const { data: columns } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", id)
    .order("position")

  const { data: cardsData } = await supabase
    .from("cards")
    .select("*, labels:card_labels(label:labels(*))")
    .eq("board_id", id)
    .order("position")

  const cards = (cardsData || []).map((card) => ({
    ...card,
    labels: card.labels?.map((cl: { label: { id: string; name: string; color: string; board_id: string } }) => cl.label) || [],
  }))

  const { data: labels } = await supabase
    .from("labels")
    .select("*")
    .eq("board_id", id)

  const totalCards = cards.length
  const columnCardCounts = (columns || []).map(col => ({
    columnId: col.id,
    name: col.name,
    count: cards.filter(c => c.column_id === col.id).length,
  }))

  return (
    <KanbanBoard
      board={board}
      initialColumns={columns || []}
      initialCards={cards}
      initialLabels={labels || []}
      totalCards={totalCards}
      columnCardCounts={columnCardCounts}
    />
  )
}
