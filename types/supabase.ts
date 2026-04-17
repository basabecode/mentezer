// Ejecutar para regenerar: supabase gen types typescript --local > types/supabase.ts
// Este placeholder refleja el schema real con Insert opcionales en campos nullable/default

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  | Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          psychologist_id: string;
          content: string;
          page_number: number;
          embedding: number[];
        };
        Insert: {
          id?: string;
          document_id: string;
          psychologist_id: string;
          content: string;
          page_number: number;
          embedding: number[];
        };
        Update: Partial<Database["public"]["Tables"]["document_chunks"]["Insert"]>;
        Relationships: never[];
      };
      data_deletion_requests: {
        Row: {
          id: string;
          patient_id: string;
          psychologist_id: string;
          requested_at: string;
          completed_at: string | null;
          items_deleted: Json;
        };
        Insert: {
          id?: string;
          patient_id: string;
          psychologist_id: string;
          requested_at?: string;
          completed_at?: string | null;
          items_deleted?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["data_deletion_requests"]["Insert"]>;
        Relationships: never[];
      };
      psychologists: {
        Row: {
          id: string;
          email: string;
          name: string;
          professional_license: string | null;
          specialty: string | null;
          country: string;
          timezone: string;
          stripe_customer_id: string | null;
          plan: "trial" | "starter" | "professional" | "clinic";
          trial_ends_at: string | null;
          signature_image_url: string | null;
          google_calendar_connected: boolean;
          google_calendar_id: string | null;
          is_platform_admin: boolean;
          account_status: "active" | "suspended" | "pending";
          onboarding_completed_at: string | null;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          professional_license?: string | null;
          specialty?: string | null;
          country?: string;
          timezone?: string;
          stripe_customer_id?: string | null;
          plan?: "trial" | "starter" | "professional" | "clinic";
          trial_ends_at?: string | null;
          signature_image_url?: string | null;
          google_calendar_connected?: boolean;
          google_calendar_id?: string | null;
          is_platform_admin?: boolean;
          account_status?: "active" | "suspended" | "pending";
          onboarding_completed_at?: string | null;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["psychologists"]["Insert"]>;
        Relationships: never[];
      };
      patients: {
        Row: {
          id: string;
          psychologist_id: string;
          name: string;
          document_id: string | null;
          age: number | null;
          gender: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          emergency_contact: string | null;
          reason: string | null;
          referred_by: string | null;
          status: "active" | "paused" | "closed";
          consent_signed_at: string | null;
          consent_document_url: string | null;
          patient_portal_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          name: string;
          document_id?: string | null;
          age?: number | null;
          gender?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          reason?: string | null;
          referred_by?: string | null;
          status?: "active" | "paused" | "closed";
          consent_signed_at?: string | null;
          consent_document_url?: string | null;
          patient_portal_token?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
        Relationships: never[];
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          psychologist_id: string;
          mode: "presential" | "virtual";
          scheduled_at: string;
          duration_minutes: number | null;
          audio_url: string | null;
          audio_deleted_at: string | null;
          status: "scheduled" | "recording" | "transcribing" | "analyzing" | "complete";
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          psychologist_id: string;
          mode: "presential" | "virtual";
          scheduled_at: string;
          duration_minutes?: number | null;
          audio_url?: string | null;
          audio_deleted_at?: string | null;
          status?: "scheduled" | "recording" | "transcribing" | "analyzing" | "complete";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: never[];
      };
      transcripts: {
        Row: {
          id: string;
          session_id: string;
          content: Json;
          edited_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: Json;
          edited_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["transcripts"]["Insert"]>;
        Relationships: never[];
      };
      ai_reports: {
        Row: {
          id: string;
          session_id: string;
          summary: string;
          patterns: Json;
          diagnostic_hints: Json;
          risk_signals: Json;
          similar_cases: Json;
          evolution_vs_previous: string | null;
          therapeutic_suggestions: Json;
          disclaimer: string;
          generated_at: string;
          model_used: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          summary: string;
          patterns: Json;
          diagnostic_hints: Json;
          risk_signals: Json;
          similar_cases: Json;
          evolution_vs_previous?: string | null;
          therapeutic_suggestions: Json;
          disclaimer: string;
          generated_at?: string;
          model_used: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_reports"]["Insert"]>;
        Relationships: never[];
      };
      referral_reports: {
        Row: {
          id: string;
          patient_id: string;
          psychologist_id: string;
          recipient_specialist_name: string;
          recipient_specialty: string;
          recipient_email: string | null;
          reason_for_referral: string;
          ai_draft: string | null;
          approved_content: string | null;
          diagnosis_codes: Json;
          interventions_summary: string | null;
          evolution_summary: string | null;
          recommendations: string | null;
          pdf_url: string | null;
          email_sent_at: string | null;
          patient_acknowledged_at: string | null;
          status: "draft" | "approved" | "sent" | "acknowledged";
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          psychologist_id: string;
          recipient_specialist_name: string;
          recipient_specialty: string;
          recipient_email?: string | null;
          reason_for_referral: string;
          ai_draft?: string | null;
          approved_content?: string | null;
          diagnosis_codes?: Json;
          interventions_summary?: string | null;
          evolution_summary?: string | null;
          recommendations?: string | null;
          pdf_url?: string | null;
          email_sent_at?: string | null;
          patient_acknowledged_at?: string | null;
          status?: "draft" | "approved" | "sent" | "acknowledged";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_reports"]["Insert"]>;
        Relationships: never[];
      };
      knowledge_documents: {
        Row: {
          id: string;
          psychologist_id: string;
          title: string;
          author: string | null;
          category: string | null;
          file_url: string;
          file_size_bytes: number | null;
          processing_status: "pending" | "processing" | "ready" | "error";
          chunk_count: number | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          title: string;
          author?: string | null;
          category?: string | null;
          file_url: string;
          file_size_bytes?: number | null;
          processing_status?: "pending" | "processing" | "ready" | "error";
          chunk_count?: number | null;
          uploaded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["knowledge_documents"]["Insert"]>;
        Relationships: never[];
      };
      audit_logs: {
        Row: {
          id: string;
          psychologist_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: never[];
      };
      psychologist_integrations: {
        Row: {
          id: string;
          psychologist_id: string;
          provider: "google_calendar" | "email_resend" | "email_smtp" | "whatsapp_twilio" | "whatsapp_meta" | "telegram";
          credentials_enc: string;
          display_name: string | null;
          webhook_url: string | null;
          is_active: boolean;
          last_verified_at: string | null;
          configured_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          provider: "google_calendar" | "email_resend" | "email_smtp" | "whatsapp_twilio" | "whatsapp_meta" | "telegram";
          credentials_enc?: string;
          display_name?: string | null;
          webhook_url?: string | null;
          is_active?: boolean;
          last_verified_at?: string | null;
          configured_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["psychologist_integrations"]["Insert"]>;
        Relationships: never[];
      };
      messaging_logs: {
        Row: {
          id: string;
          psychologist_id: string;
          channel: "whatsapp" | "telegram" | "email";
          direction: "inbound" | "outbound";
          sender_id: string | null;
          sender_name: string | null;
          message_text: string | null;
          raw_payload: Json | null;
          intent: string | null;
          appointment_id: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          channel: "whatsapp" | "telegram" | "email";
          direction: "inbound" | "outbound";
          sender_id?: string | null;
          sender_name?: string | null;
          message_text?: string | null;
          raw_payload?: Json | null;
          intent?: string | null;
          appointment_id?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messaging_logs"]["Insert"]>;
        Relationships: never[];
      };
      message_templates: {
        Row: {
          id: string;
          psychologist_id: string;
          channel: "whatsapp" | "telegram" | "email" | "all";
          trigger: "appointment_confirmed" | "appointment_reminder_24h" | "appointment_cancelled" | "booking_received" | "booking_rejected" | "welcome";
          subject: string | null;
          body_template: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          channel: "whatsapp" | "telegram" | "email" | "all";
          trigger: "appointment_confirmed" | "appointment_reminder_24h" | "appointment_cancelled" | "booking_received" | "booking_rejected" | "welcome";
          subject?: string | null;
          body_template: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["message_templates"]["Insert"]>;
        Relationships: never[];
      };
      booking_requests: {
        Row: {
          id: string;
          psychologist_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          preferred_date: string | null;
          alternate_dates: Json | null;
          reason: string | null;
          status: "pending" | "approved" | "rejected";
          approved_appointment_id: string | null;
          source: "whatsapp" | "telegram" | "email" | "web" | null;
          source_sender_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          preferred_date?: string | null;
          alternate_dates?: Json | null;
          reason?: string | null;
          status?: "pending" | "approved" | "rejected";
          approved_appointment_id?: string | null;
          source?: "whatsapp" | "telegram" | "email" | "web" | null;
          source_sender_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_requests"]["Insert"]>;
        Relationships: never[];
      };
      clinical_cases: {
        Row: {
          id: string;
          psychologist_id: string;
          patient_id: string | null;
          title: string;
          description: string;
          diagnosis_explored: Json;
          interventions_used: Json;
          outcome: "successful" | "partial" | "failed";
          sessions_count: number;
          embedding: number[] | null;
          is_indexed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          psychologist_id: string;
          patient_id?: string | null;
          title: string;
          description: string;
          diagnosis_explored?: Json;
          interventions_used?: Json;
          outcome: "successful" | "partial" | "failed";
          sessions_count?: number;
          embedding?: number[] | null;
          is_indexed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clinical_cases"]["Insert"]>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_knowledge: {
        Args: {
          query_embedding: number[];
          psychologist_uuid: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          content: string;
          page_number: number;
          similarity: number;
          document_title: string;
          document_author: string | null;
        }[];
      };
      search_cases: {
        Args: {
          query_embedding: number[];
          psychologist_uuid: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          title: string;
          description: string;
          outcome: string;
          interventions_used: Json;
          sessions_count: number;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}
