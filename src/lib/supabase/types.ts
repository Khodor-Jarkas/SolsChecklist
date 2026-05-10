export type Obtainment =
  | "roll"         // standard RNG roll
  | "craft"        // crafted from items / recipe
  | "shop"         // purchased in-game (Lime's, Mari's, token shops, etc.)
  | "battle_pass"  // season/battle pass reward
  | "quest"        // quest or questline completion
  | "wheel";       // roulette / wheel spin

export type Rarity =
  | "basic"           // 1 – 999
  | "epic"            // 1,000 – 9,999
  | "unique"          // 10,000 – 99,999
  | "legendary"       // 100,000 – 999,999
  | "mythic"          // 1,000,000 – 10,000,000
  | "exalted"         // 11,000,000 – 99,000,000
  | "glorious"        // 99,900,000 – 999,000,000
  | "transcendent"    // 1,000,000,000 – 7,500,000,000
  | "dimensional"     // 7,500,000,001+
  | "challenged"      // special: challenged auras
  | "challenged_plus" // special: challenged+ auras
  | "craftable";      // special: auras obtained via crafting

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
          is_private: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          is_private?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          is_private?: boolean;
        };
        Relationships: [];
      };
      auras: {
        Row: {
          id: number;
          name: string;
          rarity: Rarity;
          rarity_odds: number | null;
          native_biome_odds: number | null;
          biome: string | null;
          event_name: string | null;
          event_year: number | null;
          obtainment: Obtainment | null;
          secondary_obtainment: Obtainment | null;
          image_url: string | null;
          description: string | null;
        };
        Insert: {
          name: string;
          rarity: Rarity;
          rarity_odds?: number | null;
          native_biome_odds?: number | null;
          biome?: string | null;
          event_name?: string | null;
          event_year?: number | null;
          obtainment?: Obtainment | null;
          secondary_obtainment?: Obtainment | null;
          image_url?: string | null;
          description?: string | null;
        };
        Update: {
          name?: string;
          rarity?: Rarity;
          rarity_odds?: number | null;
          native_biome_odds?: number | null;
          biome?: string | null;
          event_name?: string | null;
          event_year?: number | null;
          obtainment?: Obtainment | null;
          secondary_obtainment?: Obtainment | null;
          image_url?: string | null;
          description?: string | null;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          requirement: string | null;
          reward: string | null;
          category: string | null;
          image_url: string | null;
        };
        Insert: {
          name: string;
          description?: string | null;
          requirement?: string | null;
          reward?: string | null;
          category?: string | null;
          image_url?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          requirement?: string | null;
          reward?: string | null;
          category?: string | null;
          image_url?: string | null;
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
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
        ];
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
