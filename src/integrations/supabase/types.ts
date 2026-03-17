export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          birth_date: string | null
          birth_time: string | null
          birth_place: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_place?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_place?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dreams: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          mood: string | null
          symbols: string | null
          interpretation: string | null
          is_recurring: boolean | null
          emotion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          mood?: string | null
          symbols?: string | null
          interpretation?: string | null
          is_recurring?: boolean | null
          emotion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          mood?: string | null
          symbols?: string | null
          interpretation?: string | null
          is_recurring?: boolean | null
          emotion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dream_symbols: {
        Row: {
          id: string
          user_id: string
          symbol: string
          interpretation: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          interpretation?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          interpretation?: string | null
          category?: string | null
          created_at?: string
        }
      }
      cosmic_letters: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Database = Database
