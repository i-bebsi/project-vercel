"use client"

import { BarChart3 } from "lucide-react"

interface ColumnCount {
  columnId: string
  name: string
  count: number
}

interface BoardStatsProps {
  totalCards: number
  columnCardCounts: ColumnCount[]
}

const STATUS_COLORS: Record<string, string> = {
  "to do": "bg-gray-400",
  "in progress": "bg-blue-500",
  "done": "bg-green-500",
}

function getStatusColor(name: string): string {
  return STATUS_COLORS[name.toLowerCase()] || "bg-gray-400"
}

export default function BoardStats({ totalCards, columnCardCounts }: BoardStatsProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Rekap Board</h3>
      </div>

      <div className="mb-4 flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold">{totalCards}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        {columnCardCounts.map((col) => (
          <div key={col.columnId} className="text-center">
            <p className="text-2xl font-bold">{col.count}</p>
            <p className="text-xs text-muted-foreground">{col.name}</p>
          </div>
        ))}
      </div>

      {totalCards > 0 && (
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {columnCardCounts.map((col) => (
            <div
              key={col.columnId}
              className={`${getStatusColor(col.name)} transition-all`}
              style={{ width: `${(col.count / totalCards) * 100}%` }}
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-4">
        {columnCardCounts.map((col) => (
          <div key={col.columnId} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(col.name)}`} />
            <span className="text-xs text-muted-foreground">{col.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
