import { createClient } from "@/lib/supabase/server"
import DashboardHeader from "@/components/board/DashboardHeader"
import BoardList from "@/components/board/BoardList"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false })

  const boardIds = (boards || []).map((b) => b.id)

  const { data: allColumns } = boardIds.length
    ? await supabase.from("columns").select("*").in("board_id", boardIds)
    : { data: [] }

  const { data: allCards } = boardIds.length
    ? await supabase.from("cards").select("id, board_id, column_id").in("board_id", boardIds)
    : { data: [] }

  const boardsWithStats = (boards || []).map((board) => {
    const boardColumns = (allColumns || [])
      .filter((c) => c.board_id === board.id)
      .sort((a, b) => a.position - b.position)
    const boardCards = (allCards || []).filter((c) => c.board_id === board.id)

    const columnCardCounts = boardColumns.map((col) => ({
      columnId: col.id,
      name: col.name,
      count: boardCards.filter((card) => card.column_id === col.id).length,
    }))

    return {
      ...board,
      column_count: boardColumns.length,
      total_cards: boardCards.length,
      column_card_counts: columnCardCounts,
    }
  })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              {user
                ? `Selamat datang, ${user?.user_metadata?.full_name || user?.email}`
                : "Selamat datang di Kanban Board"}
            </p>
          </div>
        </div>
        <BoardList boards={boardsWithStats} />
      </main>
    </div>
  )
}
