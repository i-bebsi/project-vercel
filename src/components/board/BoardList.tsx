"use client"

import BoardCard from "./BoardCard"
import CreateBoardDialog from "./CreateBoardDialog"
import { LayoutGrid } from "lucide-react"
import type { Board } from "@/types/database"

interface ColumnCount {
  columnId: string
  name: string
  count: number
}

interface BoardWithStats extends Board {
  column_count?: number
  total_cards?: number
  column_card_counts?: ColumnCount[]
}

interface BoardListProps {
  boards: BoardWithStats[]
}

export default function BoardList({ boards }: BoardListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Board Saya</h3>
        <CreateBoardDialog />
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <LayoutGrid className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Belum ada board</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Mulai dengan membuat board baru untuk proyek kamu.
          </p>
          <CreateBoardDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  )
}
