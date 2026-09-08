"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Columns3 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Board } from "@/types/database"

interface BoardCardProps {
  board: Board & { column_count?: number; card_count?: number }
}

export default function BoardCard({ board }: BoardCardProps) {
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
