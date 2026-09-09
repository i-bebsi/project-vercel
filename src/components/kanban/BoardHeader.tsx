"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import type { Board } from "@/types/database"

interface BoardHeaderProps {
  board: Board
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  const { isAnonymous, loading, user } = useAuth()

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
        <div className="ml-auto flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            loading ? "bg-yellow-100 text-yellow-800" :
            isAnonymous ? "bg-orange-100 text-orange-800" :
            "bg-green-100 text-green-800"
          }`}>
            {loading ? "Loading..." :
             isAnonymous ? `TAMU (is_anonymous=true)` :
             user ? `USER: ${user.email || user.id}` : "NO USER"}
          </span>
        </div>
      </div>
    </header>
  )
}
