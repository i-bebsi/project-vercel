"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutGrid, LogIn, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DashboardHeader() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  return (
    <header className="border-b bg-background px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6" />
          <h1 className="text-xl font-bold">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
