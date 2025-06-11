export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bets: {
        Row: {
          // Lo que obtienes al hacer un SELECT
          id: string;
          title: string;
          category: string;
          stake: number;
          odds: number;
          potential_winnings: number;
          status: string;
          created_at: string;
          resolved_at: string | null;
          actual_winnings: number | null;
        };
        Insert: {
          // Lo que necesitas para un INSERT
          id?: string; // Opcional, ya que Supabase lo genera
          title: string;
          category: string;
          stake: number;
          odds: number;
          potential_winnings: number;
          status?: string; // Opcional, default 'Pending' en DB
          created_at?: string; // Opcional, default now() en DB
          resolved_at?: string | null;
          actual_winnings?: number | null;
        };
        Update: {
          // Lo que puedes enviar para un UPDATE
          id?: string;
          title?: string;
          category?: string;
          stake?: number;
          odds?: number;
          potential_winnings?: number;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
          actual_winnings?: number | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          type: string;
          amount: number;
          description: string;
          date: string; // ISO string
        };
        Insert: {
          id?: string;
          type: string;
          amount: number;
          description: string;
          date: string; // ISO string
        };
        Update: {
          id?: string;
          type?: string;
          amount?: number;
          description?: string;
          date?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
