"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Columns3 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Board } from "@/types/database"

interface ColumnCount {
  columnId: string
  name: string
  count: number
}

interface BoardCardProps {
  board: Board & {
    column_count?: number
    total_cards?: number
    column_card_counts?: ColumnCount[]
  }
}

const STATUS_COLORS: Record<string, string> = {
  "to do": "bg-gray-400",
  "in progress": "bg-blue-500",
  "done": "bg-green-500",
}

function getStatusColor(name: string): string {
  return STATUS_COLORS[name.toLowerCase()] || "bg-gray-400"
}

export default function BoardCard({ board }: BoardCardProps) {
  const totalCards = board.total_cards ?? 0
  const columnCardCounts = board.column_card_counts ?? []

  return (
    <Link href={`/board/${board.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-accent">
        <CardHeader>
          <CardTitle className="text-lg">{board.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {board.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {board.description}
            </p>
          )}

          {totalCards > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-medium">{totalCards} task</span>
                {columnCardCounts.map((col) => (
                  <span key={col.columnId} className="text-muted-foreground">
                    {col.name}: {col.count}
                  </span>
                ))}
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {columnCardCounts.map((col) => (
                  <div
                    key={col.columnId}
                    className={`${getStatusColor(col.name)} transition-all`}
                    style={{ width: `${(col.count / totalCards) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                {columnCardCounts.map((col) => (
                  <div key={col.columnId} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(col.name)}`} />
                    <span className="text-xs text-muted-foreground">{col.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalCards === 0 && (
            <p className="text-xs text-muted-foreground italic">Belum ada task</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Columns3 className="h-3.5 w-3.5" />
              <span>{board.column_count ?? 3} kolom</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {format(new Date(board.created_at), "d MMM yyyy", { locale: id })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
