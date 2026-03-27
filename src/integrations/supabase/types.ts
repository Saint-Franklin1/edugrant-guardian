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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      bursary_records: {
        Row: {
          allocated_amount: number | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bursary_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          allocated_amount?: number | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bursary_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          allocated_amount?: number | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bursary_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bursary_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          comment_text: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          student_id: string
        }
        Insert: {
          author_id: string
          comment_text: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          student_id: string
        }
        Update: {
          author_id?: string
          comment_text?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      constituencies: {
        Row: {
          county_id: string
          id: string
          name: string
        }
        Insert: {
          county_id: string
          id?: string
          name: string
        }
        Update: {
          county_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "constituencies_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      counties: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          extraction_attempts: number | null
          file_name: string | null
          file_url: string
          flag_reason: string | null
          id: string
          is_active: boolean | null
          is_flagged: boolean | null
          student_id: string
          type: Database["public"]["Enums"]["document_type"]
          version: number
        }
        Insert: {
          created_at?: string
          extraction_attempts?: number | null
          file_name?: string | null
          file_url: string
          flag_reason?: string | null
          id?: string
          is_active?: boolean | null
          is_flagged?: boolean | null
          student_id: string
          type: Database["public"]["Enums"]["document_type"]
          version?: number
        }
        Update: {
          created_at?: string
          extraction_attempts?: number | null
          file_name?: string | null
          file_url?: string
          flag_reason?: string | null
          id?: string
          is_active?: boolean | null
          is_flagged?: boolean | null
          student_id?: string
          type?: Database["public"]["Enums"]["document_type"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_flags: {
        Row: {
          created_at: string
          details: string | null
          flag_type: string
          id: string
          resolved: boolean | null
          student_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          flag_type: string
          id?: string
          resolved?: boolean | null
          student_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          flag_type?: string
          id?: string
          resolved?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          admin_level: string | null
          constituency: string | null
          county: string | null
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          invited_email: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
          ward: string | null
        }
        Insert: {
          admin_level?: string | null
          constituency?: string | null
          county?: string | null
          created_at?: string
          expires_at: string
          id?: string
          invited_by: string
          invited_email: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token: string
          ward?: string | null
        }
        Update: {
          admin_level?: string | null
          constituency?: string | null
          county?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          ward?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_level: string | null
          constituency: string
          county: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          ward: string
        }
        Insert: {
          admin_level?: string | null
          constituency: string
          county: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          ward: string
        }
        Update: {
          admin_level?: string | null
          constituency?: string
          county?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          ward?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          birth_cert_number: string | null
          created_at: string
          education_id: string | null
          id: string
          school_name: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_name: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_cert_number?: string | null
          created_at?: string
          education_id?: string | null
          id?: string
          school_name?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_name: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_cert_number?: string | null
          created_at?: string
          education_id?: string | null
          id?: string
          school_name?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_name?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_records: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["verification_decision"]
          id: string
          role: Database["public"]["Enums"]["app_role"]
          student_id: string
          verifier_id: string
        }
        Insert: {
          created_at?: string
          decision: Database["public"]["Enums"]["verification_decision"]
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          student_id: string
          verifier_id: string
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["verification_decision"]
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          student_id?: string
          verifier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          constituency_id: string
          id: string
          name: string
        }
        Insert: {
          constituency_id: string
          id?: string
          name: string
        }
        Update: {
          constituency_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "wards_constituency_id_fkey"
            columns: ["constituency_id"]
            isOneToOne: false
            referencedRelation: "constituencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_student_constituency: {
        Args: { _student_id: string }
        Returns: string
      }
      get_student_ward: { Args: { _student_id: string }; Returns: string }
      get_user_constituency: { Args: { _user_id: string }; Returns: string }
      get_user_ward: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "chief" | "admin" | "super_admin"
      bursary_status:
        | "verified"
        | "approved_for_funding"
        | "allocated"
        | "disbursed"
        | "completed"
      document_type:
        | "student_id"
        | "birth_certificate"
        | "parent_id"
        | "admission_letter"
        | "school_id"
        | "fee_structure"
        | "fee_statement"
        | "vulnerability_proof"
        | "residency_proof"
      student_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "verified"
        | "rejected"
      verification_decision: "approved" | "rejected"
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
      app_role: ["user", "chief", "admin", "super_admin"],
      bursary_status: [
        "verified",
        "approved_for_funding",
        "allocated",
        "disbursed",
        "completed",
      ],
      document_type: [
        "student_id",
        "birth_certificate",
        "parent_id",
        "admission_letter",
        "school_id",
        "fee_structure",
        "fee_statement",
        "vulnerability_proof",
        "residency_proof",
      ],
      student_status: [
        "draft",
        "submitted",
        "under_review",
        "verified",
        "rejected",
      ],
      verification_decision: ["approved", "rejected"],
    },
  },
} as const
