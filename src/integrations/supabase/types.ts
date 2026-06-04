export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          created_at: string
          end_date: string | null
          html_code: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          placement: Database["public"]["Enums"]["ad_placement"]
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          html_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement: Database["public"]["Enums"]["ad_placement"]
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          html_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          placement?: Database["public"]["Enums"]["ad_placement"]
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          article_type: Database["public"]["Enums"]["article_type"]
          audio_url: string | null
          author_id: string | null
          category_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          article_type?: Database["public"]["Enums"]["article_type"]
          audio_url?: string | null
          author_id?: string | null
          category_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          article_type?: Database["public"]["Enums"]["article_type"]
          audio_url?: string | null
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_donors: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at: string
          district: string
          id: string
          is_available: boolean | null
          last_donation_date: string | null
          name: string
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          district: string
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          name: string
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          district?: string
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          name?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          chamber: string | null
          created_at: string
          designation: string | null
          district: string | null
          fee: string | null
          hospital: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          photo: string | null
          slug: string
          speciality: string | null
          updated_at: string
          visiting_time: string | null
        }
        Insert: {
          bio?: string | null
          chamber?: string | null
          created_at?: string
          designation?: string | null
          district?: string | null
          fee?: string | null
          hospital?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          photo?: string | null
          slug: string
          speciality?: string | null
          updated_at?: string
          visiting_time?: string | null
        }
        Update: {
          bio?: string | null
          chamber?: string | null
          created_at?: string
          designation?: string | null
          district?: string | null
          fee?: string | null
          hospital?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          photo?: string | null
          slug?: string
          speciality?: string | null
          updated_at?: string
          visiting_time?: string | null
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          district: string | null
          emergency_number: string | null
          google_map: string | null
          id: string
          image: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          emergency_number?: string | null
          google_map?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          emergency_number?: string | null
          google_map?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      labs: {
        Row: {
          address: string | null
          created_at: string
          district: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          price: number | null
          test_type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          price?: number | null
          test_type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          price?: number | null
          test_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mythbusters: {
        Row: {
          claim: string
          created_at: string
          doctor_name: string | null
          fact: string
          id: string
          is_published: boolean | null
          title: string
          updated_at: string
          video: string | null
        }
        Insert: {
          claim: string
          created_at?: string
          doctor_name?: string | null
          fact: string
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string
          video?: string | null
        }
        Update: {
          claim?: string
          created_at?: string
          doctor_name?: string | null
          fact?: string
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string
          video?: string | null
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          spotify_link: string | null
          thumbnail: string | null
          title: string
          updated_at: string
          youtube_link: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          spotify_link?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          youtube_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          spotify_link?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          youtube_link?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          district: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          answered_by: string | null
          created_at: string
          email: string
          id: string
          is_published: boolean | null
          name: string
          question: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          answered_by?: string | null
          created_at?: string
          email: string
          id?: string
          is_published?: boolean | null
          name: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          answered_by?: string | null
          created_at?: string
          email?: string
          id?: string
          is_published?: boolean | null
          name?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo: {
        Row: {
          description: string | null
          id: string
          keywords: string | null
          og_image: string | null
          route: string
          schema_jsonld: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          keywords?: string | null
          og_image?: string | null
          route: string
          schema_jsonld?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          keywords?: string | null
          og_image?: string | null
          route?: string
          schema_jsonld?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          thumbnail: string | null
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      blood_donors_public: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          created_at: string | null
          district: string | null
          id: string | null
          is_available: boolean | null
          last_donation_date: string | null
          name: string | null
        }
        Insert: {
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          is_available?: boolean | null
          last_donation_date?: string | null
          name?: string | null
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          is_available?: boolean | null
          last_donation_date?: string | null
          name?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      public_blood_donors: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          created_at: string | null
          district: string | null
          id: string | null
          is_available: boolean | null
          last_donation_date: string | null
          name: string | null
        }
        Insert: {
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          is_available?: boolean | null
          last_donation_date?: string | null
          name?: string | null
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          is_available?: boolean | null
          last_donation_date?: string | null
          name?: string | null
        }
        Relationships: []
      }
      questions_public: {
        Row: {
          answer: string | null
          answered_by: string | null
          created_at: string | null
          id: string | null
          name: string | null
          question: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          answered_by?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          question?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          answered_by?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          question?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ad_placement: "top_banner" | "sidebar" | "article" | "popup"
      app_role: "admin" | "editor" | "user"
      article_type: "encyclopedia" | "news" | "tip" | "research"
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_placement: ["top_banner", "sidebar", "article", "popup"],
      app_role: ["admin", "editor", "user"],
      article_type: ["encyclopedia", "news", "tip", "research"],
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
  },
} as const
