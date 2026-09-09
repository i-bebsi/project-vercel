"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, LayoutGrid, UserPlus, User } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DashboardHeader() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; is_anonymous?: boolean } | null>(null)

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

  const isGuest = user?.is_anonymous === true

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
              {isGuest ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    Tamu
                  </Badge>
                  <Link href="/register">
                    <Button variant="outline" size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Daftar Akun
                    </Button>
                  </Link>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{user.email}</span>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
