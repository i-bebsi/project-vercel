"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface CreateCardDialogProps {
  columnId: string
  boardId: string
  onCardCreated?: () => void
}

export default function CreateCardDialog({
  columnId,
  boardId,
  onCardCreated,
}: CreateCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: existingCards } = await supabase
      .from("cards")
      .select("position")
      .eq("column_id", columnId)
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition =
      existingCards && existingCards.length > 0
        ? existingCards[0].position + 1
        : 0

    const { error } = await supabase.from("cards").insert({
      title,
      description: description || null,
      column_id: columnId,
      board_id: boardId,
      position: nextPosition,
    })

    if (!error) {
      setOpen(false)
      setTitle("")
      setDescription("")
      onCardCreated?.()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="w-full justify-start gap-1 text-muted-foreground" />}>
        <Plus className="h-4 w-4" />
        Tambah Kartu
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kartu Baru</DialogTitle>
          <DialogDescription>
            Buat kartu baru di kolom ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardTitle">Judul</Label>
            <Input
              id="cardTitle"
              placeholder="Judul kartu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardDesc">Deskripsi (opsional)</Label>
            <Textarea
              id="cardDesc"
              placeholder="Deskripsi singkat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Membuat..." : "Buat Kartu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
