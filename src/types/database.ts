export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Board {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface BoardMember {
  id: string
  board_id: string
  user_id: string
  role: "owner" | "member"
  created_at: string
}

export interface BoardColumn {
  id: string
  board_id: string
  name: string
  position: number
  created_at: string
}

export interface Card {
  id: string
  column_id: string
  board_id: string
  title: string
  description: string | null
  position: number
  assignee_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Label {
  id: string
  board_id: string
  name: string
  color: string
}

export interface CardLabel {
  card_id: string
  label_id: string
}

export interface BoardWithColumns extends Board {
  columns: BoardColumn[]
  cards: Card[]
}

export interface CardWithLabels extends Card {
  labels: Label[]
  assignee?: Profile | null
}
