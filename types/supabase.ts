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
      ai_reports: {
        Row: {
          diagnostic_hints: Json
          disclaimer: string
          evolution_vs_previous: string | null
          generated_at: string
          id: string
          model_used: string
          patterns: Json
          risk_signals: Json
          session_id: string
          similar_cases: Json
          summary: string
          therapeutic_suggestions: Json
        }
        Insert: {
          diagnostic_hints?: Json
          disclaimer: string
          evolution_vs_previous?: string | null
          generated_at?: string
          id?: string
          model_used: string
          patterns?: Json
          risk_signals?: Json
          session_id: string
          similar_cases?: Json
          summary: string
          therapeutic_suggestions?: Json
        }
        Update: {
          diagnostic_hints?: Json
          disclaimer?: string
          evolution_vs_previous?: string | null
          generated_at?: string
          id?: string
          model_used?: string
          patterns?: Json
          risk_signals?: Json
          session_id?: string
          similar_cases?: Json
          summary?: string
          therapeutic_suggestions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancellation_reason: string | null
          confirmation_token: string | null
          created_at: string
          duration_minutes: number
          google_calendar_event_id: string | null
          id: string
          meeting_url: string | null
          mode: string
          patient_id: string | null
          psychologist_id: string
          requested_by: string
          scheduled_at: string
          status: string
        }
        Insert: {
          cancellation_reason?: string | null
          confirmation_token?: string | null
          created_at?: string
          duration_minutes?: number
          google_calendar_event_id?: string | null
          id?: string
          meeting_url?: string | null
          mode?: string
          patient_id?: string | null
          psychologist_id: string
          requested_by?: string
          scheduled_at: string
          status?: string
        }
        Update: {
          cancellation_reason?: string | null
          confirmation_token?: string | null
          created_at?: string
          duration_minutes?: number
          google_calendar_event_id?: string | null
          id?: string
          meeting_url?: string | null
          mode?: string
          patient_id?: string | null
          psychologist_id?: string
          requested_by?: string
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json
          psychologist_id: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          psychologist_id: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          psychologist_id?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          buffer_minutes: number
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          psychologist_id: string
          session_duration_minutes: number
          start_time: string
        }
        Insert: {
          buffer_minutes?: number
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          psychologist_id: string
          session_duration_minutes?: number
          start_time: string
        }
        Update: {
          buffer_minutes?: number
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          psychologist_id?: string
          session_duration_minutes?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_cases: {
        Row: {
          created_at: string
          description: string
          diagnosis_explored: Json
          embedding: string | null
          id: string
          interventions_used: Json
          is_indexed: boolean
          outcome: string
          patient_id: string | null
          psychologist_id: string
          sessions_count: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          diagnosis_explored?: Json
          embedding?: string | null
          id?: string
          interventions_used?: Json
          is_indexed?: boolean
          outcome: string
          patient_id?: string | null
          psychologist_id: string
          sessions_count?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          diagnosis_explored?: Json
          embedding?: string | null
          id?: string
          interventions_used?: Json
          is_indexed?: boolean
          outcome?: string
          patient_id?: string | null
          psychologist_id?: string
          sessions_count?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_cases_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          id: string
          items_deleted: Json | null
          patient_id: string
          psychologist_id: string
          requested_at: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          items_deleted?: Json | null
          patient_id: string
          psychologist_id: string
          requested_at?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          items_deleted?: Json | null
          patient_id?: string
          psychologist_id?: string
          requested_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_deletion_requests_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          content: string
          document_id: string
          embedding: string | null
          id: string
          page_number: number | null
          psychologist_id: string
        }
        Insert: {
          content: string
          document_id: string
          embedding?: string | null
          id?: string
          page_number?: number | null
          psychologist_id: string
        }
        Update: {
          content?: string
          document_id?: string
          embedding?: string | null
          id?: string
          page_number?: number | null
          psychologist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          ai_classification: Json | null
          author: string | null
          category: string | null
          chunk_count: number | null
          file_size_bytes: number | null
          file_url: string
          group_id: string | null
          id: string
          personal_group_id: string | null
          personal_label: string | null
          processing_status: string
          psychologist_id: string | null
          source_type: string
          title: string
          uploaded_at: string
        }
        Insert: {
          ai_classification?: Json | null
          author?: string | null
          category?: string | null
          chunk_count?: number | null
          file_size_bytes?: number | null
          file_url: string
          group_id?: string | null
          id?: string
          personal_group_id?: string | null
          personal_label?: string | null
          processing_status?: string
          psychologist_id?: string | null
          source_type?: string
          title: string
          uploaded_at?: string
        }
        Update: {
          ai_classification?: Json | null
          author?: string | null
          category?: string | null
          chunk_count?: number | null
          file_size_bytes?: number | null
          file_url?: string
          group_id?: string | null
          id?: string
          personal_group_id?: string | null
          personal_label?: string | null
          processing_status?: string
          psychologist_id?: string | null
          source_type?: string
          title?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "knowledge_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_documents_personal_group_id_fkey"
            columns: ["personal_group_id"]
            isOneToOne: false
            referencedRelation: "personal_knowledge_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_documents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_groups: {
        Row: {
          book_count: number | null
          color: string
          created_at: string | null
          description: string
          id: string
          is_system: boolean | null
          name: string
          slug: string
        }
        Insert: {
          book_count?: number | null
          color?: string
          created_at?: string | null
          description: string
          id?: string
          is_system?: boolean | null
          name: string
          slug: string
        }
        Update: {
          book_count?: number | null
          color?: string
          created_at?: string | null
          description?: string
          id?: string
          is_system?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string
          id: string
          is_active: boolean
          psychologist_id: string
          subject: string | null
          trigger: string
        }
        Insert: {
          body_template: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean
          psychologist_id: string
          subject?: string | null
          trigger: string
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          psychologist_id?: string
          subject?: string | null
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_logs: {
        Row: {
          appointment_id: string | null
          channel: string
          created_at: string
          direction: string
          id: string
          intent: string | null
          message_text: string | null
          processed_at: string | null
          psychologist_id: string
          raw_payload: Json | null
          sender_id: string | null
          sender_name: string | null
        }
        Insert: {
          appointment_id?: string | null
          channel: string
          created_at?: string
          direction: string
          id?: string
          intent?: string | null
          message_text?: string | null
          processed_at?: string | null
          psychologist_id: string
          raw_payload?: Json | null
          sender_id?: string | null
          sender_name?: string | null
        }
        Update: {
          appointment_id?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          intent?: string | null
          message_text?: string | null
          processed_at?: string | null
          psychologist_id?: string
          raw_payload?: Json | null
          sender_id?: string | null
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_logs_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          consent_document_url: string | null
          consent_signed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          document_id: string | null
          emergency_contact: string | null
          gender: string | null
          id: string
          name: string
          patient_portal_token: string | null
          psychologist_id: string
          reason: string | null
          referred_by: string | null
          status: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          consent_document_url?: string | null
          consent_signed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          document_id?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          name: string
          patient_portal_token?: string | null
          psychologist_id: string
          reason?: string | null
          referred_by?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          consent_document_url?: string | null
          consent_signed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          document_id?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          name?: string
          patient_portal_token?: string | null
          psychologist_id?: string
          reason?: string | null
          referred_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          patient_id: string | null
          payment_method: string
          psychologist_id: string
          session_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          patient_id?: string | null
          payment_method: string
          psychologist_id: string
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          patient_id?: string | null
          payment_method?: string
          psychologist_id?: string
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_knowledge_groups: {
        Row: {
          created_at: string | null
          description: string | null
          document_count: number | null
          id: string
          label: string
          psychologist_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          id?: string
          label: string
          psychologist_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          id?: string
          label?: string
          psychologist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_knowledge_groups_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_integrations: {
        Row: {
          configured_at: string | null
          created_at: string
          credentials_enc: string
          display_name: string | null
          id: string
          is_active: boolean
          last_verified_at: string | null
          provider: string
          psychologist_id: string
          webhook_url: string | null
        }
        Insert: {
          configured_at?: string | null
          created_at?: string
          credentials_enc?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          provider: string
          psychologist_id: string
          webhook_url?: string | null
        }
        Update: {
          configured_at?: string | null
          created_at?: string
          credentials_enc?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          provider?: string
          psychologist_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_integrations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_knowledge_groups: {
        Row: {
          activated_at: string | null
          group_id: string
          is_active: boolean | null
          psychologist_id: string
        }
        Insert: {
          activated_at?: string | null
          group_id: string
          is_active?: boolean | null
          psychologist_id: string
        }
        Update: {
          activated_at?: string | null
          group_id?: string
          is_active?: boolean | null
          psychologist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_knowledge_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "knowledge_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_knowledge_groups_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologists: {
        Row: {
          account_status: string
          country: string
          created_at: string
          digital_signature_key: string | null
          email: string
          google_calendar_connected: boolean
          google_calendar_id: string | null
          id: string
          invited_by: string | null
          is_platform_admin: boolean
          name: string
          onboarding_completed_at: string | null
          plan: string
          professional_license: string | null
          signature_image_url: string | null
          specialty: string | null
          stripe_customer_id: string | null
          timezone: string
          trial_ends_at: string | null
        }
        Insert: {
          account_status?: string
          country?: string
          created_at?: string
          digital_signature_key?: string | null
          email: string
          google_calendar_connected?: boolean
          google_calendar_id?: string | null
          id?: string
          invited_by?: string | null
          is_platform_admin?: boolean
          name: string
          onboarding_completed_at?: string | null
          plan?: string
          professional_license?: string | null
          signature_image_url?: string | null
          specialty?: string | null
          stripe_customer_id?: string | null
          timezone?: string
          trial_ends_at?: string | null
        }
        Update: {
          account_status?: string
          country?: string
          created_at?: string
          digital_signature_key?: string | null
          email?: string
          google_calendar_connected?: boolean
          google_calendar_id?: string | null
          id?: string
          invited_by?: string | null
          is_platform_admin?: boolean
          name?: string
          onboarding_completed_at?: string | null
          plan?: string
          professional_license?: string | null
          signature_image_url?: string | null
          specialty?: string | null
          stripe_customer_id?: string | null
          timezone?: string
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologists_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_reports: {
        Row: {
          ai_draft: string | null
          approved_content: string | null
          created_at: string
          diagnosis_codes: Json
          email_sent_at: string | null
          evolution_summary: string | null
          id: string
          interventions_summary: string | null
          patient_acknowledged_at: string | null
          patient_id: string
          pdf_url: string | null
          psychologist_id: string
          reason_for_referral: string
          recipient_email: string | null
          recipient_specialist_name: string
          recipient_specialty: string
          recommendations: string | null
          status: string
        }
        Insert: {
          ai_draft?: string | null
          approved_content?: string | null
          created_at?: string
          diagnosis_codes?: Json
          email_sent_at?: string | null
          evolution_summary?: string | null
          id?: string
          interventions_summary?: string | null
          patient_acknowledged_at?: string | null
          patient_id: string
          pdf_url?: string | null
          psychologist_id: string
          reason_for_referral: string
          recipient_email?: string | null
          recipient_specialist_name: string
          recipient_specialty: string
          recommendations?: string | null
          status?: string
        }
        Update: {
          ai_draft?: string | null
          approved_content?: string | null
          created_at?: string
          diagnosis_codes?: Json
          email_sent_at?: string | null
          evolution_summary?: string | null
          id?: string
          interventions_summary?: string | null
          patient_acknowledged_at?: string | null
          patient_id?: string
          pdf_url?: string | null
          psychologist_id?: string
          reason_for_referral?: string
          recipient_email?: string | null
          recipient_specialist_name?: string
          recipient_specialty?: string
          recommendations?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_reports_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          audio_deleted_at: string | null
          audio_url: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          mode: string
          patient_id: string
          psychologist_id: string
          scheduled_at: string
          status: string
        }
        Insert: {
          audio_deleted_at?: string | null
          audio_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mode?: string
          patient_id: string
          psychologist_id: string
          scheduled_at: string
          status?: string
        }
        Update: {
          audio_deleted_at?: string | null
          audio_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mode?: string
          patient_id?: string
          psychologist_id?: string
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapeutic_plans: {
        Row: {
          ai_draft: Json | null
          approved_plan: Json | null
          created_at: string
          id: string
          patient_id: string
          psychologist_id: string
          shared_with_patient_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_draft?: Json | null
          approved_plan?: Json | null
          created_at?: string
          id?: string
          patient_id: string
          psychologist_id: string
          shared_with_patient_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_draft?: Json | null
          approved_plan?: Json | null
          created_at?: string
          id?: string
          patient_id?: string
          psychologist_id?: string
          shared_with_patient_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapeutic_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapeutic_plans_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          content: Json
          edited_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          content?: Json
          edited_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          content?: Json
          edited_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_reminder_logs: {
        Row: {
          appointment_id: string
          created_at: string
          error_message: string | null
          id: string
          patient_id: string
          psychologist_id: string
          reminder_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          patient_id: string
          psychologist_id: string
          reminder_type: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          patient_id?: string
          psychologist_id?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_reminder_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_reminder_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_reminder_logs_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_reminder_logs_for_appointment: {
        Args: { p_appointment_id: string }
        Returns: undefined
      }
      get_pending_reminders: {
        Args: never
        Returns: {
          appointment_id: string
          appointment_time: string
          patient_id: string
          patient_name: string
          patient_phone: string
          psychologist_id: string
          psychologist_name: string
          reminder_id: string
          reminder_type: string
        }[]
      }
      increment_group_book_count: { Args: { gid: string }; Returns: undefined }
      search_cases: {
        Args: {
          match_count?: number
          psychologist_uuid: string
          query_embedding: string
        }
        Returns: {
          description: string
          id: string
          interventions_used: Json
          outcome: string
          sessions_count: number
          similarity: number
          title: string
        }[]
      }
      search_knowledge: {
        Args: {
          match_count?: number
          psychologist_uuid: string
          query_embedding: string
        }
        Returns: {
          content: string
          document_author: string
          document_title: string
          id: string
          page_number: number
          similarity: number
        }[]
      }
      search_knowledge_by_groups: {
        Args: {
          active_group_ids: string[]
          match_count?: number
          query_embedding: string
        }
        Returns: {
          author: string
          content: string
          document_title: string
          group_name: string
          page_number: number
          similarity: number
          source_type: string
        }[]
      }
      search_personal_knowledge: {
        Args: {
          match_count?: number
          psychologist_id_filter: string
          query_embedding: string
        }
        Returns: {
          content: string
          document_title: string
          page_number: number
          personal_label: string
          similarity: number
          source_type: string
        }[]
      }
      sync_psychologist_profile_from_auth: {
        Args: {
          p_app_meta?: Json
          p_email: string
          p_user_id: string
          p_user_meta?: Json
        }
        Returns: undefined
      }
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
