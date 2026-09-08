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
        <BoardList boards={boards || []} />
      </main>
    </div>
  )
}
