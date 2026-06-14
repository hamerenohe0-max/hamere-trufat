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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      article_bookmarks: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          audio_url: string | null
          author_id: string
          content: string
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          keywords: string[] | null
          published_at: string | null
          reading_time: string | null
          related_event_ids: string[] | null
          related_feast_ids: string[] | null
          slug: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          audio_url?: string | null
          author_id: string
          content: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          reading_time?: string | null
          related_event_ids?: string[] | null
          related_feast_ids?: string[] | null
          slug: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          audio_url?: string | null
          author_id?: string
          content?: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          reading_time?: string | null
          related_event_ids?: string[] | null
          related_feast_ids?: string[] | null
          slug?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_readings: {
        Row: {
          created_at: string | null
          date: string
          epistle: Json | null
          gospel: Json
          id: string
          language: string | null
          psalms: string[] | null
          reflections: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          epistle?: Json | null
          gospel: Json
          id?: string
          language?: string | null
          psalms?: string[] | null
          reflections?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          epistle?: Json | null
          gospel?: Json
          id?: string
          language?: string | null
          psalms?: string[] | null
          reflections?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      device_sessions: {
        Row: {
          app_version: string | null
          device_id: string
          device_name: string | null
          device_platform: string | null
          id: string
          last_active_at: string | null
          last_ip: string | null
          user_id: string
        }
        Insert: {
          app_version?: string | null
          device_id: string
          device_name?: string | null
          device_platform?: string | null
          id?: string
          last_active_at?: string | null
          last_ip?: string | null
          user_id: string
        }
        Update: {
          app_version?: string | null
          device_id?: string
          device_name?: string | null
          device_platform?: string | null
          id?: string
          last_active_at?: string | null
          last_ip?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          description: string | null
          end_date: string | null
          feast_id: string | null
          featured: boolean | null
          flyer_images: string[] | null
          id: string
          location: string
          name: string
          reminder_enabled: boolean | null
          start_date: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          feast_id?: string | null
          featured?: boolean | null
          flyer_images?: string[] | null
          id?: string
          location: string
          name: string
          reminder_enabled?: boolean | null
          start_date: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          feast_id?: string | null
          featured?: boolean | null
          flyer_images?: string[] | null
          id?: string
          location?: string
          name?: string
          reminder_enabled?: boolean | null
          start_date?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      feasts: {
        Row: {
          article_ids: string[] | null
          biography: string | null
          created_at: string | null
          date: string
          description: string | null
          icon: string | null
          id: string
          name: string
          prayers: string[] | null
          readings: string[] | null
          region: string
          reminder_enabled: boolean | null
          traditions: string[] | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          article_ids?: string[] | null
          biography?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          prayers?: string[] | null
          readings?: string[] | null
          region: string
          reminder_enabled?: boolean | null
          traditions?: string[] | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          article_ids?: string[] | null
          biography?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          prayers?: string[] | null
          readings?: string[] | null
          region?: string
          reminder_enabled?: boolean | null
          traditions?: string[] | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string | null
          game: string
          id: string
          metadata: Json | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game: string
          id?: string
          metadata?: Json | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          game?: string
          id?: string
          metadata?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          cloudinary_id: string
          created_at: string | null
          filename: string
          id: string
          mime_type: string
          size: number
          type: string
          updated_at: string | null
          uploaded_by: string
          url: string
          usage_count: number | null
        }
        Insert: {
          cloudinary_id: string
          created_at?: string | null
          filename: string
          id?: string
          mime_type: string
          size: number
          type: string
          updated_at?: string | null
          uploaded_by: string
          url: string
          usage_count?: number | null
        }
        Update: {
          cloudinary_id?: string
          created_at?: string | null
          filename?: string
          id?: string
          mime_type?: string
          size?: number
          type?: string
          updated_at?: string | null
          uploaded_by?: string
          url?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string
          body: string
          comments_count: number | null
          cover_image: string | null
          created_at: string | null
          dislikes: number | null
          id: string
          likes: number | null
          published_at: string | null
          scheduled_at: string | null
          status: string
          summary: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          body: string
          comments_count?: number | null
          cover_image?: string | null
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          body?: string
          comments_count?: number | null
          cover_image?: string | null
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          news_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          news_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_bookmarks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_comments: {
        Row: {
          body: string
          created_at: string | null
          id: string
          liked_by: string[] | null
          likes: number | null
          news_id: string
          translated_body: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          liked_by?: string[] | null
          likes?: number | null
          news_id: string
          translated_body?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          liked_by?: string[] | null
          likes?: number | null
          news_id?: string
          translated_body?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_reactions: {
        Row: {
          created_at: string | null
          id: string
          news_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          news_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          news_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_reactions_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          metadata: Json | null
          read_by_user_ids: string[] | null
          read_count: number | null
          sent_at: string | null
          sent_count: number | null
          target_role: string | null
          target_user_ids: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_by_user_ids?: string[] | null
          read_count?: number | null
          sent_at?: string | null
          sent_count?: number | null
          target_role?: string | null
          target_user_ids?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_by_user_ids?: string[] | null
          read_count?: number | null
          sent_at?: string | null
          sent_count?: number | null
          target_role?: string | null
          target_user_ids?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      offline_cache: {
        Row: {
          checksum: string
          created_at: string | null
          device_id: string
          entity: string
          expires_at: string | null
          id: string
          key: string
          payload: Json
          updated_at: string | null
          user_id: string
          version: number
        }
        Insert: {
          checksum: string
          created_at?: string | null
          device_id: string
          entity: string
          expires_at?: string | null
          id?: string
          key: string
          payload: Json
          updated_at?: string | null
          user_id: string
          version: number
        }
        Update: {
          checksum?: string
          created_at?: string | null
          device_id?: string
          entity?: string
          expires_at?: string | null
          id?: string
          key?: string
          payload?: Json
          updated_at?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "offline_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_reports: {
        Row: {
          after_image: string | null
          before_image: string | null
          comments_count: number | null
          created_at: string | null
          id: string
          liked_by: string[] | null
          likes: number | null
          media_gallery: string[] | null
          pdf_url: string | null
          summary: string
          timeline: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          after_image?: string | null
          before_image?: string | null
          comments_count?: number | null
          created_at?: string | null
          id?: string
          liked_by?: string[] | null
          likes?: number | null
          media_gallery?: string[] | null
          pdf_url?: string | null
          summary: string
          timeline?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          after_image?: string | null
          before_image?: string | null
          comments_count?: number | null
          created_at?: string | null
          id?: string
          liked_by?: string[] | null
          likes?: number | null
          media_gallery?: string[] | null
          pdf_url?: string | null
          summary?: string
          timeline?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      publisher_requests: {
        Row: {
          created_at: string | null
          id: string
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          requested_at: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publisher_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publisher_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login_at: string | null
          name: string
          otp_code: string | null
          otp_expires_at: string | null
          otp_verified_at: string | null
          password_hash: string
          profile: Json | null
          refresh_token_hash: string | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          name: string
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_verified_at?: string | null
          password_hash: string
          profile?: Json | null
          refresh_token_hash?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_verified_at?: string | null
          password_hash?: string
          profile?: Json | null
          refresh_token_hash?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
