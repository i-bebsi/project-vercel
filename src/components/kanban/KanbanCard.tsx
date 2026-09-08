"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GripVertical } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Card as CardType, Label } from "@/types/database"

interface KanbanCardProps {
  card: CardType & { labels?: Label[] }
  onClick?: () => void
  isDragging?: boolean
}

export default function KanbanCard({ card, onClick, isDragging }: KanbanCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isDragging ? "shadow-lg ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium leading-snug">{card.title}</p>
            {card.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {card.description}
              </p>
            )}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {card.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: label.color + "20", color: label.color, border: `1px solid ${label.color}40` }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            )}
            {card.due_date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(card.due_date), "d MMM yyyy", { locale: id })}
              </p>
            )}
          </div>
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  )
}
