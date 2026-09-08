"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Board } from "@/types/database"

interface BoardHeaderProps {
  board: Board
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <header className="border-b bg-background px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{board.name}</h1>
          {board.description && (
            <p className="text-sm text-muted-foreground">{board.description}</p>
          )}
        </div>
      </div>
    </header>
  )
}
