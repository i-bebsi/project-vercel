import type { Metadata } from "next"
import Providers from "@/components/Providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "Kanban Board Project Management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
