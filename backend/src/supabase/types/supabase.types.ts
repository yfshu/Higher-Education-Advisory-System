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
      // New schema tables (Task 2)
      users: {
        Row: {
          user_id: string;
          full_name: string;
          email: string;
          password_hash: string | null;  // Nullable: passwords may be managed by Supabase Auth
          phone_number: string | null;
          registration_step: number;
          is_profile_completed: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id?: string;
          full_name: string;
          email: string;
          password_hash?: string | null;  // Nullable: passwords may be managed by Supabase Auth
          phone_number?: string | null;
          registration_step?: number;
          is_profile_completed?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          email?: string;
          password_hash?: string | null;
          phone_number?: string | null;
          registration_step?: number;
          is_profile_completed?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      student_profile: {
        Row: {
          user_id: string;
          phone_number: string | null;
          country_code: string | null;
          avatar_url: string | null;
          avatar_updated_at: string | null;
          study_level: Database['public']['Enums']['study_level_enum'];
          extracurricular: boolean;
          // Academic Subjects
          bm: Database['public']['Enums']['subject_grade'];
          english: Database['public']['Enums']['subject_grade'];
          history: Database['public']['Enums']['subject_grade'];
          mathematics: Database['public']['Enums']['subject_grade'];
          islamic_education_moral_education: Database['public']['Enums']['subject_grade'];
          physics: Database['public']['Enums']['subject_grade'];
          chemistry: Database['public']['Enums']['subject_grade'];
          biology: Database['public']['Enums']['subject_grade'];
          additional_mathematics: Database['public']['Enums']['subject_grade'];
          geography: Database['public']['Enums']['subject_grade'];
          economics: Database['public']['Enums']['subject_grade'];
          accounting: Database['public']['Enums']['subject_grade'];
          chinese: Database['public']['Enums']['subject_grade'];
          tamil: Database['public']['Enums']['subject_grade'];
          ict: Database['public']['Enums']['subject_grade'];
          // Interest Survey
          maths_interest: number | null;
          science_interest: number | null;
          computer_interest: number | null;
          writing_interest: number | null;
          art_interest: number | null;
          business_interest: number | null;
          social_interest: number | null;
          // Skills Survey
          logical_thinking: number | null;
          problem_solving: number | null;
          creativity: number | null;
          communication: number | null;
          teamwork: number | null;
          leadership: number | null;
          attention_to_detail: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          phone_number?: string | null;
          country_code?: string | null;
          avatar_url?: string | null;
          avatar_updated_at?: string | null;
          study_level: Database['public']['Enums']['study_level_enum'];
          extracurricular?: boolean;
          bm?: Database['public']['Enums']['subject_grade'];
          english?: Database['public']['Enums']['subject_grade'];
          history?: Database['public']['Enums']['subject_grade'];
          mathematics?: Database['public']['Enums']['subject_grade'];
          islamic_education_moral_education?: Database['public']['Enums']['subject_grade'];
          physics?: Database['public']['Enums']['subject_grade'];
          chemistry?: Database['public']['Enums']['subject_grade'];
          biology?: Database['public']['Enums']['subject_grade'];
          additional_mathematics?: Database['public']['Enums']['subject_grade'];
          geography?: Database['public']['Enums']['subject_grade'];
          economics?: Database['public']['Enums']['subject_grade'];
          accounting?: Database['public']['Enums']['subject_grade'];
          chinese?: Database['public']['Enums']['subject_grade'];
          tamil?: Database['public']['Enums']['subject_grade'];
          ict?: Database['public']['Enums']['subject_grade'];
          maths_interest?: number | null;
          science_interest?: number | null;
          computer_interest?: number | null;
          writing_interest?: number | null;
          art_interest?: number | null;
          business_interest?: number | null;
          social_interest?: number | null;
          logical_thinking?: number | null;
          problem_solving?: number | null;
          creativity?: number | null;
          communication?: number | null;
          teamwork?: number | null;
          leadership?: number | null;
          attention_to_detail?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          phone_number?: string | null;
          country_code?: string | null;
          avatar_url?: string | null;
          avatar_updated_at?: string | null;
          study_level?: Database['public']['Enums']['study_level_enum'];
          extracurricular?: boolean;
          bm?: Database['public']['Enums']['subject_grade'];
          english?: Database['public']['Enums']['subject_grade'];
          history?: Database['public']['Enums']['subject_grade'];
          mathematics?: Database['public']['Enums']['subject_grade'];
          islamic_education_moral_education?: Database['public']['Enums']['subject_grade'];
          physics?: Database['public']['Enums']['subject_grade'];
          chemistry?: Database['public']['Enums']['subject_grade'];
          biology?: Database['public']['Enums']['subject_grade'];
          additional_mathematics?: Database['public']['Enums']['subject_grade'];
          geography?: Database['public']['Enums']['subject_grade'];
          economics?: Database['public']['Enums']['subject_grade'];
          accounting?: Database['public']['Enums']['subject_grade'];
          chinese?: Database['public']['Enums']['subject_grade'];
          tamil?: Database['public']['Enums']['subject_grade'];
          ict?: Database['public']['Enums']['subject_grade'];
          maths_interest?: number | null;
          science_interest?: number | null;
          computer_interest?: number | null;
          writing_interest?: number | null;
          art_interest?: number | null;
          business_interest?: number | null;
          social_interest?: number | null;
          logical_thinking?: number | null;
          problem_solving?: number | null;
          creativity?: number | null;
          communication?: number | null;
          teamwork?: number | null;
          leadership?: number | null;
          attention_to_detail?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_profile_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
        ];
      };
      preferences: {
        Row: {
          user_id: string;
          budget_range: string | null;
          preferred_location: string | null;
          preferred_country: string | null;
          study_mode: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          budget_range?: string | null;
          preferred_location?: string | null;
          preferred_country?: string | null;
          study_mode?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          budget_range?: string | null;
          preferred_location?: string | null;
          preferred_country?: string | null;
          study_mode?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
        ];
      };
      // Legacy tables (kept for backward compatibility during migration)
      activity_logs: {
        Row: {
          activity_type: string | null;
          description: string | null;
          id: number;
          timestamp: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_type?: string | null;
          description?: string | null;
          id?: number;
          timestamp?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_type?: string | null;
          description?: string | null;
          id?: number;
          timestamp?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_details';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_details: {
        Row: {
          created_at: string | null;
          id: string;
          last_login: string | null;
          position: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          last_login?: string | null;
          position?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          last_login?: string | null;
          position?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_details_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users_details';
            referencedColumns: ['id'];
          },
        ];
      };
      dashboard_metrics: {
        Row: {
          id: number;
          last_updated: string | null;
          metric_name: string | null;
          metric_value: number | null;
        };
        Insert: {
          id?: number;
          last_updated?: string | null;
          metric_name?: string | null;
          metric_value?: number | null;
        };
        Update: {
          id?: number;
          last_updated?: string | null;
          metric_name?: string | null;
          metric_value?: number | null;
        };
        Relationships: [];
      };
      field_of_interest: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      help_support: {
        Row: {
          category: Database['public']['Enums']['help_category'] | null;
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          id: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category?: Database['public']['Enums']['help_category'] | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category?: Database['public']['Enums']['help_category'] | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'help_support_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'admin_details';
            referencedColumns: ['id'];
          },
        ];
      };
      program_comparison: {
        Row: {
          created_at: string | null;
          id: number;
          program_ids: Json | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          program_ids?: Json | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          program_ids?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'program_comparison_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_details';
            referencedColumns: ['id'];
          },
        ];
      };
      program_reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: string;
          program_id: number | null;
          rating: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          program_id?: number | null;
          rating?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          program_id?: number | null;
          rating?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'program_reviews_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'program_reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_details';
            referencedColumns: ['id'];
          },
        ];
      };
      programs: {
        Row: {
          average_salary: number | null;
          created_at: string | null;
          deadline: string | null;
          description: string | null;
          duration: string | null;
          employment_rate: number | null;
          entry_requirements: string | null;
          field_id: number | null;
          id: number;
          level: Database['public']['Enums']['program_level'] | null;
          name: string;
          rating: number | null;
          review_count: number | null;
          satisfaction_rate: number | null;
          start_month: string | null;
          status: Database['public']['Enums']['program_status'] | null;
          tags: Json | null;
          tuition_fee: number | null;
          university_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          average_salary?: number | null;
          created_at?: string | null;
          deadline?: string | null;
          description?: string | null;
          duration?: string | null;
          employment_rate?: number | null;
          entry_requirements?: string | null;
          field_id?: number | null;
          id?: number;
          level?: Database['public']['Enums']['program_level'] | null;
          name: string;
          rating?: number | null;
          review_count?: number | null;
          satisfaction_rate?: number | null;
          start_month?: string | null;
          status?: Database['public']['Enums']['program_status'] | null;
          tags?: Json | null;
          tuition_fee?: number | null;
          university_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          average_salary?: number | null;
          created_at?: string | null;
          deadline?: string | null;
          description?: string | null;
          duration?: string | null;
          employment_rate?: number | null;
          entry_requirements?: string | null;
          field_id?: number | null;
          id?: number;
          level?: Database['public']['Enums']['program_level'] | null;
          name?: string;
          rating?: number | null;
          review_count?: number | null;
          satisfaction_rate?: number | null;
          start_month?: string | null;
          status?: Database['public']['Enums']['program_status'] | null;
          tags?: Json | null;
          tuition_fee?: number | null;
          university_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'programs_field_id_fkey';
            columns: ['field_id'];
            isOneToOne: false;
            referencedRelation: 'field_of_interest';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'programs_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'university';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_items: {
        Row: {
          id: number;
          item_id: number;
          item_type: Database['public']['Enums']['item_type'];
          saved_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          item_id: number;
          item_type: Database['public']['Enums']['item_type'];
          saved_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: number;
          item_id?: number;
          item_type?: Database['public']['Enums']['item_type'];
          saved_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_details';
            referencedColumns: ['id'];
          },
        ];
      };
      scholarships: {
        Row: {
          amount: number | null;
          benefits: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string | null;
          deadline: string | null;
          description: string | null;
          field_id: number | null;
          id: number;
          level: string | null;
          location: string | null;
          name: string;
          organization_name: string | null;
          requirements: string | null;
          status: Database['public']['Enums']['scholarship_status'] | null;
          success_rate: number | null;
          type: Database['public']['Enums']['scholarship_type'] | null;
          updated_at: string | null;
          website_url: string | null;
        };
        Insert: {
          amount?: number | null;
          benefits?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string | null;
          deadline?: string | null;
          description?: string | null;
          field_id?: number | null;
          id?: number;
          level?: string | null;
          location?: string | null;
          name: string;
          organization_name?: string | null;
          requirements?: string | null;
          status?: Database['public']['Enums']['scholarship_status'] | null;
          success_rate?: number | null;
          type?: Database['public']['Enums']['scholarship_type'] | null;
          updated_at?: string | null;
          website_url?: string | null;
        };
        Update: {
          amount?: number | null;
          benefits?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string | null;
          deadline?: string | null;
          description?: string | null;
          field_id?: number | null;
          id?: number;
          level?: string | null;
          location?: string | null;
          name?: string;
          organization_name?: string | null;
          requirements?: string | null;
          status?: Database['public']['Enums']['scholarship_status'] | null;
          success_rate?: number | null;
          type?: Database['public']['Enums']['scholarship_type'] | null;
          updated_at?: string | null;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'scholarships_field_id_fkey';
            columns: ['field_id'];
            isOneToOne: false;
            referencedRelation: 'field_of_interest';
            referencedColumns: ['id'];
          },
        ];
      };
      students_details: {
        Row: {
          academic_result: string | null;
          created_at: string | null;
          education_level:
            | Database['public']['Enums']['education_level']
            | null;
          field_of_interest_id: number | null;
          id: string;
          study_preferences: string | null;
          updated_at: string | null;
        };
        Insert: {
          academic_result?: string | null;
          created_at?: string | null;
          education_level?:
            | Database['public']['Enums']['education_level']
            | null;
          field_of_interest_id?: number | null;
          id: string;
          study_preferences?: string | null;
          updated_at?: string | null;
        };
        Update: {
          academic_result?: string | null;
          created_at?: string | null;
          education_level?:
            | Database['public']['Enums']['education_level']
            | null;
          field_of_interest_id?: number | null;
          id?: string;
          study_preferences?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'students_details_field_of_interest_id_fkey';
            columns: ['field_of_interest_id'];
            isOneToOne: false;
            referencedRelation: 'field_of_interest';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'students_details_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users_details';
            referencedColumns: ['id'];
          },
        ];
      };
      system_alerts: {
        Row: {
          created_at: string | null;
          id: number;
          message: string | null;
          status: Database['public']['Enums']['alert_status'] | null;
          type: Database['public']['Enums']['alert_type'] | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          message?: string | null;
          status?: Database['public']['Enums']['alert_status'] | null;
          type?: Database['public']['Enums']['alert_type'] | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          message?: string | null;
          status?: Database['public']['Enums']['alert_status'] | null;
          type?: Database['public']['Enums']['alert_type'] | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          description: string | null;
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          description?: string | null;
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          description?: string | null;
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      university: {
        Row: {
          address: string | null;
          average_fee: number | null;
          based_in: string | null;
          city: string | null;
          created_at: string | null;
          description: string | null;
          email: string | null;
          id: number;
          image_urls: Json | null;
          logo_url: string | null;
          name: string;
          phone_number: string | null;
          state: string | null;
          university_type: Database['public']['Enums']['university_type'];
          updated_at: string | null;
          website_url: string | null;
        };
        Insert: {
          address?: string | null;
          average_fee?: number | null;
          based_in?: string | null;
          city?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: number;
          image_urls?: Json | null;
          logo_url?: string | null;
          name: string;
          phone_number?: string | null;
          state?: string | null;
          university_type: Database['public']['Enums']['university_type'];
          updated_at?: string | null;
          website_url?: string | null;
        };
        Update: {
          address?: string | null;
          average_fee?: number | null;
          based_in?: string | null;
          city?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: number;
          image_urls?: Json | null;
          logo_url?: string | null;
          name?: string;
          phone_number?: string | null;
          state?: string | null;
          university_type?: Database['public']['Enums']['university_type'];
          updated_at?: string | null;
          website_url?: string | null;
        };
        Relationships: [];
      };
      users_details: {
        Row: {
          avatar_url: string | null;
          career_goal: string | null;
          created_at: string | null;
          current_institution_id: number | null;
          current_location: string | null;
          dob: string | null;
          email: string;
          email_verified: boolean | null;
          first_name: string | null;
          ic_number: string | null;
          id: string;
          language: Json | null;
          last_name: string | null;
          nationality: string | null;
          passport_number: string | null;
          password: string | null;
          phone_number: string | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string | null;
          user_status: Database['public']['Enums']['user_status'];
        };
        Insert: {
          avatar_url?: string | null;
          career_goal?: string | null;
          created_at?: string | null;
          current_institution_id?: number | null;
          current_location?: string | null;
          dob?: string | null;
          email: string;
          email_verified?: boolean | null;
          first_name?: string | null;
          ic_number?: string | null;
          id: string;
          language?: Json | null;
          last_name?: string | null;
          nationality?: string | null;
          passport_number?: string | null;
          password?: string | null;
          phone_number?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
          user_status?: Database['public']['Enums']['user_status'];
        };
        Update: {
          avatar_url?: string | null;
          career_goal?: string | null;
          created_at?: string | null;
          current_institution_id?: number | null;
          current_location?: string | null;
          dob?: string | null;
          email?: string;
          email_verified?: boolean | null;
          first_name?: string | null;
          ic_number?: string | null;
          id?: string;
          language?: Json | null;
          last_name?: string | null;
          nationality?: string | null;
          passport_number?: string | null;
          password?: string | null;
          phone_number?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
          user_status?: Database['public']['Enums']['user_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'users_details_current_institution_id_fkey';
            columns: ['current_institution_id'];
            isOneToOne: false;
            referencedRelation: 'university';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_recommendations: {
        Row: {
          recommendation_id: string;
          user_id: string;
          recommendation_type: 'field' | 'program';
          field_of_interest_id: number | null;
          field_name: string | null;
          program_id: number | null;
          program_name: string | null;
          ml_confidence_score: number;
          ml_rank: number | null;
          openai_validated: boolean;
          openai_adjusted_score: number | null;
          openai_explanation: string | null;
          final_rank: number | null;
          final_score: number | null;
          powered_by: string[] | null;
          recommendation_session_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          recommendation_id?: string;
          user_id: string;
          recommendation_type: 'field' | 'program';
          field_of_interest_id?: number | null;
          field_name?: string | null;
          program_id?: number | null;
          program_name?: string | null;
          ml_confidence_score: number;
          ml_rank?: number | null;
          openai_validated?: boolean;
          openai_adjusted_score?: number | null;
          openai_explanation?: string | null;
          final_rank?: number | null;
          final_score?: number | null;
          powered_by?: string[] | null;
          recommendation_session_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          recommendation_id?: string;
          user_id?: string;
          recommendation_type?: 'field' | 'program';
          field_of_interest_id?: number | null;
          field_name?: string | null;
          program_id?: number | null;
          program_name?: string | null;
          ml_confidence_score?: number;
          ml_rank?: number | null;
          openai_validated?: boolean;
          openai_adjusted_score?: number | null;
          openai_explanation?: string | null;
          final_rank?: number | null;
          final_score?: number | null;
          powered_by?: string[] | null;
          recommendation_session_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_recommendations_field_of_interest_id_fkey';
            columns: ['field_of_interest_id'];
            isOneToOne: false;
            referencedRelation: 'field_of_interest';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_recommendations_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      set_limit: {
        Args: { '': number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
    };
    Enums: {
      alert_status: 'open' | 'resolved';
      alert_type: 'info' | 'warning' | 'error';
      education_level:
        | 'SPM'
        | 'STPM';
      help_category: 'FAQ' | 'System Message' | 'Policy';
      item_type: 'program' | 'scholarship';
      program_level: 'Foundation' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD';
      program_status: 'active' | 'draft' | 'archived';
      scholarship_status: 'active' | 'expired' | 'draft';
      scholarship_type: 'Merit-based' | 'Need-based' | 'Academic' | 'Other';
      study_level_enum: 'SPM' | 'STPM';
      subject_grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'G' | '0';
      university_type: 'public' | 'private';
      user_role: 'student' | 'admin';
      user_status: 'active' | 'inactive' | 'banned';
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
      alert_status: ['open', 'resolved'],
      alert_type: ['info', 'warning', 'error'],
      education_level: [
        'SPM',
        'STPM',
      ],
      help_category: ['FAQ', 'System Message', 'Policy'],
      item_type: ['program', 'scholarship'],
      program_level: ['Foundation', 'Diploma', 'Bachelor', 'Master', 'PhD'],
      program_status: ['active', 'draft', 'archived'],
      scholarship_status: ['active', 'expired', 'draft'],
      scholarship_type: ['Merit-based', 'Need-based', 'Academic', 'Other'],
      study_level_enum: ['SPM', 'STPM'],
      subject_grade: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
      university_type: ['public', 'private'],
      user_role: ['student', 'admin'],
      user_status: ['active', 'inactive', 'banned'],
    },
  },
} as const;
