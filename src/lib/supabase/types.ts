export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "exalted"
  | "celestial"
  | "transcendent";

type Timestamp = string;

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      auras: {
        Row: {
          id: number;
          name: string;
          rarity: Rarity;
          rarity_odds: number | null;
          biome: string | null;
          image_url: string | null;
          description: string | null;
        };
        Insert: {
          name: string;
          rarity: Rarity;
          rarity_odds?: number | null;
          biome?: string | null;
          image_url?: string | null;
          description?: string | null;
        };
        Update: {
          name?: string;
          rarity?: Rarity;
          rarity_odds?: number | null;
          biome?: string | null;
          image_url?: string | null;
          description?: string | null;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: number;
          name: string;
          description: string;
          category: string | null;
        };
        Insert: {
          name: string;
          description: string;
          category?: string | null;
        };
        Update: {
          name?: string;
          description?: string;
          category?: string | null;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: number;
          name: string;
          kind: string;
          description: string | null;
          image_url: string | null;
        };
        Insert: {
          name: string;
          kind: string;
          description?: string | null;
          image_url?: string | null;
        };
        Update: {
          name?: string;
          kind?: string;
          description?: string | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
      user_auras: {
        Row: {
          user_id: string;
          aura_id: number;
          count: number;
          first_obtained_at: Timestamp;
        };
        Insert: {
          user_id: string;
          aura_id: number;
          count?: number;
          first_obtained_at?: Timestamp;
        };
        Update: {
          count?: number;
          first_obtained_at?: Timestamp;
        };
        Relationships: [
          {
            foreignKeyName: "user_auras_aura_id_fkey";
            columns: ["aura_id"];
            referencedRelation: "auras";
            referencedColumns: ["id"];
          },
        ];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: number;
          unlocked_at: Timestamp;
        };
        Insert: {
          user_id: string;
          achievement_id: number;
          unlocked_at?: Timestamp;
        };
        Update: {
          unlocked_at?: Timestamp;
        };
        Relationships: [];
      };
      user_items: {
        Row: {
          user_id: string;
          item_id: number;
          count: number;
        };
        Insert: {
          user_id: string;
          item_id: number;
          count?: number;
        };
        Update: {
          count?: number;
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
      rarity: Rarity;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
