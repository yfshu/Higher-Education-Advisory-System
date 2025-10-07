export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: unknown | null;
          location: string | null;
          metadata: Json | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: unknown | null;
          location?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: unknown | null;
          location?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_profiles: {
        Row: {
          created_at: string | null;
          department: string | null;
          first_name: string;
          ic_number: string | null;
          id: string;
          job_title: string | null;
          last_name: string;
          managed_universities: string[] | null;
          permissions: Json | null;
          phone_number: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          department?: string | null;
          first_name: string;
          ic_number?: string | null;
          id?: string;
          job_title?: string | null;
          last_name: string;
          managed_universities?: string[] | null;
          permissions?: Json | null;
          phone_number?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          department?: string | null;
          first_name?: string;
          ic_number?: string | null;
          id?: string;
          job_title?: string | null;
          last_name?: string;
          managed_universities?: string[] | null;
          permissions?: Json | null;
          phone_number?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      applications: {
        Row: {
          additional_essays: Json | null;
          admin_notes: string | null;
          application_date: string | null;
          application_number: string | null;
          career_goals: string | null;
          created_at: string | null;
          deadline_date: string | null;
          decision_date: string | null;
          email_sent_date: string | null;
          email_sent_to_university: boolean | null;
          financial_documents_submitted: boolean | null;
          ic_verified: boolean | null;
          id: string;
          interview_date: string | null;
          notes: string | null;
          personal_statement: string | null;
          program_id: string;
          reference_number: string | null;
          reminder_sent: boolean | null;
          spm_certificate_verified: boolean | null;
          status: Database['public']['Enums']['application_status'] | null;
          student_id: string;
          submission_date: string | null;
          university_response_received: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          additional_essays?: Json | null;
          admin_notes?: string | null;
          application_date?: string | null;
          application_number?: string | null;
          career_goals?: string | null;
          created_at?: string | null;
          deadline_date?: string | null;
          decision_date?: string | null;
          email_sent_date?: string | null;
          email_sent_to_university?: boolean | null;
          financial_documents_submitted?: boolean | null;
          ic_verified?: boolean | null;
          id?: string;
          interview_date?: string | null;
          notes?: string | null;
          personal_statement?: string | null;
          program_id: string;
          reference_number?: string | null;
          reminder_sent?: boolean | null;
          spm_certificate_verified?: boolean | null;
          status?: Database['public']['Enums']['application_status'] | null;
          student_id: string;
          submission_date?: string | null;
          university_response_received?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          additional_essays?: Json | null;
          admin_notes?: string | null;
          application_date?: string | null;
          application_number?: string | null;
          career_goals?: string | null;
          created_at?: string | null;
          deadline_date?: string | null;
          decision_date?: string | null;
          email_sent_date?: string | null;
          email_sent_to_university?: boolean | null;
          financial_documents_submitted?: boolean | null;
          ic_verified?: boolean | null;
          id?: string;
          interview_date?: string | null;
          notes?: string | null;
          personal_statement?: string | null;
          program_id?: string;
          reference_number?: string | null;
          reminder_sent?: boolean | null;
          spm_certificate_verified?: boolean | null;
          status?: Database['public']['Enums']['application_status'] | null;
          student_id?: string;
          submission_date?: string | null;
          university_response_received?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'student_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      countries: {
        Row: {
          code: string;
          continent: string | null;
          created_at: string | null;
          currency: string | null;
          id: string;
          is_popular: boolean | null;
          language: string[] | null;
          name: string;
        };
        Insert: {
          code: string;
          continent?: string | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_popular?: boolean | null;
          language?: string[] | null;
          name: string;
        };
        Update: {
          code?: string;
          continent?: string | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_popular?: boolean | null;
          language?: string[] | null;
          name?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          application_id: string | null;
          created_at: string | null;
          description: string | null;
          document_type: Database['public']['Enums']['document_type'];
          file_name: string;
          file_size: number | null;
          file_url: string;
          id: string;
          is_verified: boolean | null;
          mime_type: string | null;
          student_id: string | null;
          title: string | null;
          updated_at: string | null;
          verification_notes: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          application_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          document_type: Database['public']['Enums']['document_type'];
          file_name: string;
          file_size?: number | null;
          file_url: string;
          id?: string;
          is_verified?: boolean | null;
          mime_type?: string | null;
          student_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          verification_notes?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          application_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          document_type?: Database['public']['Enums']['document_type'];
          file_name?: string;
          file_size?: number | null;
          file_url?: string;
          id?: string;
          is_verified?: boolean | null;
          mime_type?: string | null;
          student_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          verification_notes?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'student_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_verified_by_fkey';
            columns: ['verified_by'];
            isOneToOne: false;
            referencedRelation: 'admin_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      kv_store_103a41a7: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          application_id: string | null;
          attachments: string[] | null;
          content: string;
          created_at: string | null;
          id: string;
          is_important: boolean | null;
          is_read: boolean | null;
          read_at: string | null;
          recipient_id: string;
          sender_id: string;
          subject: string;
        };
        Insert: {
          application_id?: string | null;
          attachments?: string[] | null;
          content: string;
          created_at?: string | null;
          id?: string;
          is_important?: boolean | null;
          is_read?: boolean | null;
          read_at?: string | null;
          recipient_id: string;
          sender_id: string;
          subject: string;
        };
        Update: {
          application_id?: string | null;
          attachments?: string[] | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_important?: boolean | null;
          is_read?: boolean | null;
          read_at?: string | null;
          recipient_id?: string;
          sender_id?: string;
          subject?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          application_id: string | null;
          created_at: string | null;
          email_sent: boolean | null;
          id: string;
          is_read: boolean | null;
          message: string;
          program_id: string | null;
          read_at: string | null;
          scheduled_for: string | null;
          sent_at: string | null;
          sms_sent: boolean | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          university_id: string | null;
          user_id: string;
        };
        Insert: {
          application_id?: string | null;
          created_at?: string | null;
          email_sent?: boolean | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          program_id?: string | null;
          read_at?: string | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          sms_sent?: boolean | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          university_id?: string | null;
          user_id: string;
        };
        Update: {
          application_id?: string | null;
          created_at?: string | null;
          email_sent?: boolean | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          program_id?: string | null;
          read_at?: string | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          sms_sent?: boolean | null;
          title?: string;
          type?: Database['public']['Enums']['notification_type'];
          university_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      programs: {
        Row: {
          acceptance_rate: number | null;
          application_deadline: string | null;
          application_fee_myr: number | null;
          application_requirements: string[] | null;
          average_starting_salary_myr: number | null;
          created_at: string | null;
          credits_required: number | null;
          degree_level: Database['public']['Enums']['degree_level'];
          department: string | null;
          description: string | null;
          diploma_requirements: Json | null;
          duration_months: number;
          english_requirements: Json | null;
          field_of_study: string;
          financial_aid_available: boolean | null;
          foundation_requirements: Json | null;
          graduate_employment_rate: number | null;
          id: string;
          intake_months: number[] | null;
          is_active: boolean | null;
          is_popular: boolean | null;
          min_spm_credits: number | null;
          min_spm_grades: Json | null;
          mode_of_study: string | null;
          mqa_approved: boolean | null;
          name: string;
          other_fees_myr: Json | null;
          other_test_requirements: Json | null;
          professional_accreditation: string[] | null;
          required_spm_subjects: string[] | null;
          scholarship_details: Json | null;
          scholarships_available: boolean | null;
          start_date: string | null;
          stpm_requirements: Json | null;
          tuition_fee_myr: number | null;
          university_id: string;
          updated_at: string | null;
        };
        Insert: {
          acceptance_rate?: number | null;
          application_deadline?: string | null;
          application_fee_myr?: number | null;
          application_requirements?: string[] | null;
          average_starting_salary_myr?: number | null;
          created_at?: string | null;
          credits_required?: number | null;
          degree_level: Database['public']['Enums']['degree_level'];
          department?: string | null;
          description?: string | null;
          diploma_requirements?: Json | null;
          duration_months: number;
          english_requirements?: Json | null;
          field_of_study: string;
          financial_aid_available?: boolean | null;
          foundation_requirements?: Json | null;
          graduate_employment_rate?: number | null;
          id?: string;
          intake_months?: number[] | null;
          is_active?: boolean | null;
          is_popular?: boolean | null;
          min_spm_credits?: number | null;
          min_spm_grades?: Json | null;
          mode_of_study?: string | null;
          mqa_approved?: boolean | null;
          name: string;
          other_fees_myr?: Json | null;
          other_test_requirements?: Json | null;
          professional_accreditation?: string[] | null;
          required_spm_subjects?: string[] | null;
          scholarship_details?: Json | null;
          scholarships_available?: boolean | null;
          start_date?: string | null;
          stpm_requirements?: Json | null;
          tuition_fee_myr?: number | null;
          university_id: string;
          updated_at?: string | null;
        };
        Update: {
          acceptance_rate?: number | null;
          application_deadline?: string | null;
          application_fee_myr?: number | null;
          application_requirements?: string[] | null;
          average_starting_salary_myr?: number | null;
          created_at?: string | null;
          credits_required?: number | null;
          degree_level?: Database['public']['Enums']['degree_level'];
          department?: string | null;
          description?: string | null;
          diploma_requirements?: Json | null;
          duration_months?: number;
          english_requirements?: Json | null;
          field_of_study?: string;
          financial_aid_available?: boolean | null;
          foundation_requirements?: Json | null;
          graduate_employment_rate?: number | null;
          id?: string;
          intake_months?: number[] | null;
          is_active?: boolean | null;
          is_popular?: boolean | null;
          min_spm_credits?: number | null;
          min_spm_grades?: Json | null;
          mode_of_study?: string | null;
          mqa_approved?: boolean | null;
          name?: string;
          other_fees_myr?: Json | null;
          other_test_requirements?: Json | null;
          professional_accreditation?: string[] | null;
          required_spm_subjects?: string[] | null;
          scholarship_details?: Json | null;
          scholarships_available?: boolean | null;
          start_date?: string | null;
          stpm_requirements?: Json | null;
          tuition_fee_myr?: number | null;
          university_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'programs_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
        ];
      };
      student_bookmarks: {
        Row: {
          bookmark_type: string | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          program_id: string | null;
          student_id: string;
          university_id: string | null;
        };
        Insert: {
          bookmark_type?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          program_id?: string | null;
          student_id: string;
          university_id?: string | null;
        };
        Update: {
          bookmark_type?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          program_id?: string | null;
          student_id?: string;
          university_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_bookmarks_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_bookmarks_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'student_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_bookmarks_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
        ];
      };
      student_comparisons: {
        Row: {
          comparison_criteria: Json | null;
          comparison_name: string;
          created_at: string | null;
          id: string;
          program_ids: string[];
          student_id: string;
          updated_at: string | null;
        };
        Insert: {
          comparison_criteria?: Json | null;
          comparison_name: string;
          created_at?: string | null;
          id?: string;
          program_ids: string[];
          student_id: string;
          updated_at?: string | null;
        };
        Update: {
          comparison_criteria?: Json | null;
          comparison_name?: string;
          created_at?: string | null;
          id?: string;
          program_ids?: string[];
          student_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_comparisons_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'student_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      student_profiles: {
        Row: {
          address: Json | null;
          alternative_phone: string | null;
          budget_range: Json | null;
          career_goals: string | null;
          created_at: string | null;
          current_cgpa: number | null;
          current_education_level:
            | Database['public']['Enums']['education_level']
            | null;
          current_institution: string | null;
          date_of_birth: string | null;
          diploma_results: Json | null;
          emergency_contact: Json | null;
          family_income_range: string | null;
          field_of_study: string | null;
          financial_aid_needed: boolean | null;
          first_name: string;
          foundation_results: Json | null;
          gender: string | null;
          graduation_year: number | null;
          ic_number: string | null;
          id: string;
          interests: string[] | null;
          last_name: string;
          nationality: string | null;
          phone_number: string | null;
          preferred_fields: string[] | null;
          preferred_states:
            | Database['public']['Enums']['state_malaysia'][]
            | null;
          preferred_universities: string[] | null;
          profile_completion_percentage: number | null;
          race: string | null;
          religion: string | null;
          scholarship_eligibility: boolean | null;
          spm_aggregate: number | null;
          spm_results: Json | null;
          spm_year: number | null;
          stpm_results: Json | null;
          test_scores: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address?: Json | null;
          alternative_phone?: string | null;
          budget_range?: Json | null;
          career_goals?: string | null;
          created_at?: string | null;
          current_cgpa?: number | null;
          current_education_level?:
            | Database['public']['Enums']['education_level']
            | null;
          current_institution?: string | null;
          date_of_birth?: string | null;
          diploma_results?: Json | null;
          emergency_contact?: Json | null;
          family_income_range?: string | null;
          field_of_study?: string | null;
          financial_aid_needed?: boolean | null;
          first_name: string;
          foundation_results?: Json | null;
          gender?: string | null;
          graduation_year?: number | null;
          ic_number?: string | null;
          id?: string;
          interests?: string[] | null;
          last_name: string;
          nationality?: string | null;
          phone_number?: string | null;
          preferred_fields?: string[] | null;
          preferred_states?:
            | Database['public']['Enums']['state_malaysia'][]
            | null;
          preferred_universities?: string[] | null;
          profile_completion_percentage?: number | null;
          race?: string | null;
          religion?: string | null;
          scholarship_eligibility?: boolean | null;
          spm_aggregate?: number | null;
          spm_results?: Json | null;
          spm_year?: number | null;
          stpm_results?: Json | null;
          test_scores?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address?: Json | null;
          alternative_phone?: string | null;
          budget_range?: Json | null;
          career_goals?: string | null;
          created_at?: string | null;
          current_cgpa?: number | null;
          current_education_level?:
            | Database['public']['Enums']['education_level']
            | null;
          current_institution?: string | null;
          date_of_birth?: string | null;
          diploma_results?: Json | null;
          emergency_contact?: Json | null;
          family_income_range?: string | null;
          field_of_study?: string | null;
          financial_aid_needed?: boolean | null;
          first_name?: string;
          foundation_results?: Json | null;
          gender?: string | null;
          graduation_year?: number | null;
          ic_number?: string | null;
          id?: string;
          interests?: string[] | null;
          last_name?: string;
          nationality?: string | null;
          phone_number?: string | null;
          preferred_fields?: string[] | null;
          preferred_states?:
            | Database['public']['Enums']['state_malaysia'][]
            | null;
          preferred_universities?: string[] | null;
          profile_completion_percentage?: number | null;
          race?: string | null;
          religion?: string | null;
          scholarship_eligibility?: boolean | null;
          spm_aggregate?: number | null;
          spm_results?: Json | null;
          spm_year?: number | null;
          stpm_results?: Json | null;
          test_scores?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      student_search_history: {
        Row: {
          created_at: string | null;
          id: string;
          results_count: number | null;
          search_filters: Json | null;
          search_query: string;
          student_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          results_count?: number | null;
          search_filters?: Json | null;
          search_query: string;
          student_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          results_count?: number | null;
          search_filters?: Json | null;
          search_query?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_search_history_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'student_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      system_settings: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_public: boolean | null;
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      universities: {
        Row: {
          acceptance_rate: number | null;
          accommodation_fee_myr: number | null;
          accreditations: string[] | null;
          address: Json | null;
          average_tuition_fee_myr: number | null;
          city: string;
          country_id: string | null;
          created_at: string | null;
          description: string | null;
          email: string | null;
          facilities: string[] | null;
          id: string;
          images: string[] | null;
          international_student_percentage: number | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          is_verified: boolean | null;
          living_cost_estimate_myr: number | null;
          logo_url: string | null;
          ministry_approved: boolean | null;
          mqa_approved: boolean | null;
          name: string;
          national_ranking: number | null;
          phone: string | null;
          setara_rating: number | null;
          state: Database['public']['Enums']['state_malaysia'] | null;
          student_population: number | null;
          university_type: string | null;
          updated_at: string | null;
          virtual_tour_url: string | null;
          website_url: string | null;
          world_ranking: number | null;
        };
        Insert: {
          acceptance_rate?: number | null;
          accommodation_fee_myr?: number | null;
          accreditations?: string[] | null;
          address?: Json | null;
          average_tuition_fee_myr?: number | null;
          city: string;
          country_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          facilities?: string[] | null;
          id?: string;
          images?: string[] | null;
          international_student_percentage?: number | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          is_verified?: boolean | null;
          living_cost_estimate_myr?: number | null;
          logo_url?: string | null;
          ministry_approved?: boolean | null;
          mqa_approved?: boolean | null;
          name: string;
          national_ranking?: number | null;
          phone?: string | null;
          setara_rating?: number | null;
          state?: Database['public']['Enums']['state_malaysia'] | null;
          student_population?: number | null;
          university_type?: string | null;
          updated_at?: string | null;
          virtual_tour_url?: string | null;
          website_url?: string | null;
          world_ranking?: number | null;
        };
        Update: {
          acceptance_rate?: number | null;
          accommodation_fee_myr?: number | null;
          accreditations?: string[] | null;
          address?: Json | null;
          average_tuition_fee_myr?: number | null;
          city?: string;
          country_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          facilities?: string[] | null;
          id?: string;
          images?: string[] | null;
          international_student_percentage?: number | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          is_verified?: boolean | null;
          living_cost_estimate_myr?: number | null;
          logo_url?: string | null;
          ministry_approved?: boolean | null;
          mqa_approved?: boolean | null;
          name?: string;
          national_ranking?: number | null;
          phone?: string | null;
          setara_rating?: number | null;
          state?: Database['public']['Enums']['state_malaysia'] | null;
          student_population?: number | null;
          university_type?: string | null;
          updated_at?: string | null;
          virtual_tour_url?: string | null;
          website_url?: string | null;
          world_ranking?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'universities_country_id_fkey';
            columns: ['country_id'];
            isOneToOne: false;
            referencedRelation: 'countries';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          email_verified: boolean | null;
          id: string;
          is_active: boolean | null;
          last_login: string | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          email_verified?: boolean | null;
          id: string;
          is_active?: boolean | null;
          last_login?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          email_verified?: boolean | null;
          id?: string;
          is_active?: boolean | null;
          last_login?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      validate_malaysian_ic: {
        Args: { ic_text: string };
        Returns: boolean;
      };
      validate_malaysian_phone: {
        Args: { phone_text: string };
        Returns: boolean;
      };
    };
    Enums: {
      application_status:
        | 'draft'
        | 'submitted'
        | 'under_review'
        | 'accepted'
        | 'rejected';
      degree_level:
        | 'foundation'
        | 'diploma'
        | 'bachelor'
        | 'master'
        | 'phd'
        | 'professional';
      document_type:
        | 'spm_certificate'
        | 'stpm_certificate'
        | 'diploma_certificate'
        | 'degree_certificate'
        | 'transcript'
        | 'recommendation_letter'
        | 'personal_statement'
        | 'cv'
        | 'portfolio'
        | 'ic_copy'
        | 'passport_copy'
        | 'other';
      education_level:
        | 'spm'
        | 'stpm'
        | 'foundation'
        | 'diploma'
        | 'bachelor'
        | 'master'
        | 'phd';
      notification_type:
        | 'application_update'
        | 'deadline_reminder'
        | 'system_announcement'
        | 'message'
        | 'interview_invitation';
      program_type: 'Bachelor' | 'Master' | 'PhD' | 'Diploma';
      spm_grade:
        | 'A+'
        | 'A'
        | 'A-'
        | 'B+'
        | 'B'
        | 'C+'
        | 'C'
        | 'D'
        | 'E'
        | 'F'
        | 'G';
      state_malaysia:
        | 'Johor'
        | 'Kedah'
        | 'Kelantan'
        | 'Kuala Lumpur'
        | 'Labuan'
        | 'Melaka'
        | 'Negeri Sembilan'
        | 'Pahang'
        | 'Penang'
        | 'Perak'
        | 'Perlis'
        | 'Putrajaya'
        | 'Sabah'
        | 'Sarawak'
        | 'Selangor'
        | 'Terengganu';
      user_role: 'student' | 'admin';
      user_status: 'active' | 'inactive' | 'pending';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      application_status: [
        'draft',
        'submitted',
        'under_review',
        'accepted',
        'rejected',
      ],
      degree_level: [
        'foundation',
        'diploma',
        'bachelor',
        'master',
        'phd',
        'professional',
      ],
      document_type: [
        'spm_certificate',
        'stpm_certificate',
        'diploma_certificate',
        'degree_certificate',
        'transcript',
        'recommendation_letter',
        'personal_statement',
        'cv',
        'portfolio',
        'ic_copy',
        'passport_copy',
        'other',
      ],
      education_level: [
        'spm',
        'stpm',
        'foundation',
        'diploma',
        'bachelor',
        'master',
        'phd',
      ],
      notification_type: [
        'application_update',
        'deadline_reminder',
        'system_announcement',
        'message',
        'interview_invitation',
      ],
      program_type: ['Bachelor', 'Master', 'PhD', 'Diploma'],
      spm_grade: ['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'F', 'G'],
      state_malaysia: [
        'Johor',
        'Kedah',
        'Kelantan',
        'Kuala Lumpur',
        'Labuan',
        'Melaka',
        'Negeri Sembilan',
        'Pahang',
        'Penang',
        'Perak',
        'Perlis',
        'Putrajaya',
        'Sabah',
        'Sarawak',
        'Selangor',
        'Terengganu',
      ],
      user_role: ['student', 'admin'],
      user_status: ['active', 'inactive', 'pending'],
    },
  },
} as const;
