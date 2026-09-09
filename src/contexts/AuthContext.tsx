"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isAnonymous: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAnonymous: false,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log("[AuthContext] getUser result:", user)
      console.log("[AuthContext] is_anonymous:", user?.is_anonymous)
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthContext] onAuthStateChange:", event, session?.user?.is_anonymous)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const isAnonymous = !user || user.is_anonymous === true

  console.log("[AuthContext] render - user:", user?.id, "isAnonymous:", isAnonymous, "loading:", loading)

  return (
    <AuthContext.Provider value={{ user, isAnonymous, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
