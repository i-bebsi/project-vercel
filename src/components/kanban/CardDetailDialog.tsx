"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Card, Label as LabelType } from "@/types/database"

interface CardDetailDialogProps {
  card: Card & { labels?: LabelType[] }
  labels: LabelType[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCardUpdated: () => void
  isAnonymous?: boolean
}

export default function CardDetailDialog({
  card,
  labels,
  open,
  onOpenChange,
  onCardUpdated,
  isAnonymous = false,
}: CardDetailDialogProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [dueDate, setDueDate] = useState(card.due_date?.split("T")[0] || "")
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    card.labels?.map((l) => l.id) || []
  )
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    setLoading(true)

    const { error } = await supabase
      .from("cards")
      .update({
        title,
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", card.id)

    if (!error) {
      await supabase.from("card_labels").delete().eq("card_id", card.id)

      if (selectedLabels.length > 0) {
        await supabase.from("card_labels").insert(
          selectedLabels.map((labelId) => ({
            card_id: card.id,
            label_id: labelId,
          }))
        )
      }

      onCardUpdated()
      onOpenChange(false)
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus kartu ini?")) return

    const { error } = await supabase.from("cards").delete().eq("id", card.id)

    if (!error) {
      onCardUpdated()
      onOpenChange(false)
    }
  }

  function toggleLabel(labelId: string) {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Kartu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="detailTitle">Judul</Label>
            <Input
              id="detailTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isAnonymous}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailDesc">Deskripsi</Label>
            <Textarea
              id="detailDesc"
              placeholder="Tambahkan deskripsi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isAnonymous}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailDue">Tanggal Jatuh Tempo</Label>
            <Input
              id="detailDue"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isAnonymous}
            />
          </div>

          <Separator />

          {!isAnonymous && (
            <div className="space-y-2">
              <Label>Label</Label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant={selectedLabels.includes(label.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      selectedLabels.includes(label.id)
                        ? { backgroundColor: label.color, color: "white" }
                        : { borderColor: label.color, color: label.color }
                    }
                    onClick={() => toggleLabel(label.id)}
                  >
                    {label.name}
                  </Badge>
                ))}
                {labels.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Belum ada label. Buat label di SQL editor Supabase.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {!isAnonymous ? (
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Hapus
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
