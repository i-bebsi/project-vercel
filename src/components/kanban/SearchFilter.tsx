"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Label } from "@/types/database"

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterLabel: string
  onFilterChange: (labelId: string) => void
  labels: Label[]
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filterLabel,
  onFilterChange,
  labels,
}: SearchFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari kartu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={filterLabel}
        onValueChange={(value) => onFilterChange(value ?? "all")}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter label" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Label</SelectItem>
          {labels.map((label) => (
            <SelectItem key={label.id} value={label.id}>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
