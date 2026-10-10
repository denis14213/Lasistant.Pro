/**
 * Types de la base Supabase, générés à partir du schéma (outil « generate_typescript_types »
 * ou `supabase gen types typescript --project-id hpqdmurqidvpzrhdcglu`).
 * Ne pas modifier à la main : régénérer après chaque migration.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          actor: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          kind: Database['public']['Enums']['activity_kind'];
          label: string;
        };
        Insert: {
          actor: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          kind: Database['public']['Enums']['activity_kind'];
          label: string;
        };
        Update: {
          actor?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          kind?: Database['public']['Enums']['activity_kind'];
          label?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_users: {
        Row: {
          active: boolean;
          created_at: string;
          email: string;
          id: string;
          invitation_sent_at: string | null;
          last_login_at: string | null;
          name: string;
          notifications: Json;
          password_changed_at: string | null;
          recovery_codes_remaining: number;
          role: Database['public']['Enums']['admin_role'];
          two_factor_configured_at: string | null;
          two_factor_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          email: string;
          id: string;
          invitation_sent_at?: string | null;
          last_login_at?: string | null;
          name: string;
          notifications?: Json;
          password_changed_at?: string | null;
          recovery_codes_remaining?: number;
          role?: Database['public']['Enums']['admin_role'];
          two_factor_configured_at?: string | null;
          two_factor_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          email?: string;
          id?: string;
          invitation_sent_at?: string | null;
          last_login_at?: string | null;
          name?: string;
          notifications?: Json;
          password_changed_at?: string | null;
          recovery_codes_remaining?: number;
          role?: Database['public']['Enums']['admin_role'];
          two_factor_configured_at?: string | null;
          two_factor_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          author: string;
          body: string;
          category_id: string;
          cover_alt: string;
          cover_image: string;
          excerpt: string;
          featured: boolean;
          id: string;
          published_at: string | null;
          reading_minutes: number;
          seo: Json;
          slug: string;
          status: Database['public']['Enums']['article_status'];
          tags: string[];
          title: string;
          updated_at: string;
          use_cover_for_sharing: boolean;
        };
        Insert: {
          author?: string;
          body?: string;
          category_id: string;
          cover_alt?: string;
          cover_image?: string;
          excerpt?: string;
          featured?: boolean;
          id?: string;
          published_at?: string | null;
          reading_minutes?: number;
          seo?: Json;
          slug: string;
          status?: Database['public']['Enums']['article_status'];
          tags?: string[];
          title: string;
          updated_at?: string;
          use_cover_for_sharing?: boolean;
        };
        Update: {
          author?: string;
          body?: string;
          category_id?: string;
          cover_alt?: string;
          cover_image?: string;
          excerpt?: string;
          featured?: boolean;
          id?: string;
          published_at?: string | null;
          reading_minutes?: number;
          seo?: Json;
          slug?: string;
          status?: Database['public']['Enums']['article_status'];
          tags?: string[];
          title?: string;
          updated_at?: string;
          use_cover_for_sharing?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'articles_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      booking_events: {
        Row: {
          actor: string | null;
          actor_id: string | null;
          booking_id: string;
          created_at: string;
          id: string;
          label: string;
          type: Database['public']['Enums']['booking_event_type'];
        };
        Insert: {
          actor?: string | null;
          actor_id?: string | null;
          booking_id: string;
          created_at?: string;
          id?: string;
          label: string;
          type: Database['public']['Enums']['booking_event_type'];
        };
        Update: {
          actor?: string | null;
          actor_id?: string | null;
          booking_id?: string;
          created_at?: string;
          id?: string;
          label?: string;
          type?: Database['public']['Enums']['booking_event_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'booking_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'booking_events_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
      booking_reference_counters: {
        Row: { last_value: number; year: number };
        Insert: { last_value?: number; year: number };
        Update: { last_value?: number; year?: number };
        Relationships: [];
      };
      bookings: {
        Row: {
          arrival_date: string | null;
          assignee_id: string | null;
          attachment_name: string | null;
          attachment_path: string | null;
          confirmation_key: string;
          consent_at: string;
          contact_preference: Database['public']['Enums']['contact_preference'] | null;
          country: string | null;
          created_at: string;
          email: string;
          full_name: string;
          housing: Json | null;
          id: string;
          message: string | null;
          phone: string | null;
          profile: Database['public']['Enums']['applicant_profile'] | null;
          reference: string;
          requested_date: string | null;
          requested_time: string | null;
          service_id: string | null;
          source: Database['public']['Enums']['booking_source'];
          status: Database['public']['Enums']['booking_status'];
          stay_duration: string | null;
          subject: string | null;
          updated_at: string;
        };
        Insert: {
          arrival_date?: string | null;
          assignee_id?: string | null;
          attachment_name?: string | null;
          attachment_path?: string | null;
          confirmation_key?: string;
          consent_at?: string;
          contact_preference?: Database['public']['Enums']['contact_preference'] | null;
          country?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          housing?: Json | null;
          id?: string;
          message?: string | null;
          phone?: string | null;
          profile?: Database['public']['Enums']['applicant_profile'] | null;
          reference: string;
          requested_date?: string | null;
          requested_time?: string | null;
          service_id?: string | null;
          source: Database['public']['Enums']['booking_source'];
          status?: Database['public']['Enums']['booking_status'];
          stay_duration?: string | null;
          subject?: string | null;
          updated_at?: string;
        };
        Update: {
          arrival_date?: string | null;
          assignee_id?: string | null;
          attachment_name?: string | null;
          attachment_path?: string | null;
          confirmation_key?: string;
          consent_at?: string;
          contact_preference?: Database['public']['Enums']['contact_preference'] | null;
          country?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          housing?: Json | null;
          id?: string;
          message?: string | null;
          phone?: string | null;
          profile?: Database['public']['Enums']['applicant_profile'] | null;
          reference?: string;
          requested_date?: string | null;
          requested_time?: string | null;
          service_id?: string | null;
          source?: Database['public']['Enums']['booking_source'];
          status?: Database['public']['Enums']['booking_status'];
          stay_duration?: string | null;
          subject?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_assignee_id_fkey';
            columns: ['assignee_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          active: boolean;
          description: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          tone: Database['public']['Enums']['tone'];
        };
        Insert: {
          active?: boolean;
          description?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          tone?: Database['public']['Enums']['tone'];
        };
        Update: {
          active?: boolean;
          description?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          tone?: Database['public']['Enums']['tone'];
        };
        Relationships: [];
      };
      email_outbox: {
        Row: {
          attempts: number;
          booking_id: string | null;
          created_at: string;
          id: string;
          last_error: string | null;
          locked_until: string | null;
          next_attempt_at: string | null;
          payload: Json;
          provider_id: string | null;
          recipient: string;
          sent_at: string | null;
          status: Database['public']['Enums']['email_outbox_status'];
          template_key: string;
        };
        Insert: {
          attempts?: number;
          booking_id?: string | null;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          locked_until?: string | null;
          next_attempt_at?: string | null;
          payload?: Json;
          provider_id?: string | null;
          recipient: string;
          sent_at?: string | null;
          status?: Database['public']['Enums']['email_outbox_status'];
          template_key: string;
        };
        Update: {
          attempts?: number;
          booking_id?: string | null;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          locked_until?: string | null;
          next_attempt_at?: string | null;
          payload?: Json;
          provider_id?: string | null;
          recipient?: string;
          sent_at?: string | null;
          status?: Database['public']['Enums']['email_outbox_status'];
          template_key?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'email_outbox_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
      email_templates: {
        Row: {
          active: boolean;
          audience: Database['public']['Enums']['email_audience'];
          body: string;
          heading: string;
          id: string;
          is_system: boolean | null;
          key: string;
          kind: Database['public']['Enums']['email_template_kind'];
          name: string;
          reply_to: string;
          sender_name: string;
          subject: string;
          trigger: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          audience?: Database['public']['Enums']['email_audience'];
          body?: string;
          heading?: string;
          id?: string;
          is_system?: boolean | null;
          key: string;
          kind?: Database['public']['Enums']['email_template_kind'];
          name: string;
          reply_to?: string;
          sender_name?: string;
          subject: string;
          trigger?: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          audience?: Database['public']['Enums']['email_audience'];
          body?: string;
          heading?: string;
          id?: string;
          is_system?: boolean | null;
          key?: string;
          kind?: Database['public']['Enums']['email_template_kind'];
          name?: string;
          reply_to?: string;
          sender_name?: string;
          subject?: string;
          trigger?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faq_categories: {
        Row: { id: string; name: string; sort_order: number };
        Insert: { id?: string; name: string; sort_order?: number };
        Update: { id?: string; name?: string; sort_order?: number };
        Relationships: [];
      };
      faq_items: {
        Row: {
          answer: string;
          category_id: string;
          id: string;
          pending_note: string | null;
          question: string;
          sort_order: number;
        };
        Insert: {
          answer: string;
          category_id: string;
          id?: string;
          pending_note?: string | null;
          question: string;
          sort_order?: number;
        };
        Update: {
          answer?: string;
          category_id?: string;
          id?: string;
          pending_note?: string | null;
          question?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'faq_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'faq_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      internal_notes: {
        Row: {
          author: string;
          author_id: string | null;
          booking_id: string;
          created_at: string;
          id: string;
          text: string;
        };
        Insert: {
          author?: string;
          author_id?: string | null;
          booking_id: string;
          created_at?: string;
          id?: string;
          text: string;
        };
        Update: {
          author?: string;
          author_id?: string | null;
          booking_id?: string;
          created_at?: string;
          id?: string;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'internal_notes_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'internal_notes_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
      media: {
        Row: {
          alt_text: string;
          created_at: string;
          file_name: string;
          height: number | null;
          id: string;
          image: string;
          is_private: boolean;
          kind: Database['public']['Enums']['media_kind'];
          rights_confirmed: boolean;
          size_bytes: number;
          storage_path: string | null;
          title: string;
          uploaded_by: string;
          used_on: string[];
          width: number | null;
        };
        Insert: {
          alt_text?: string;
          created_at?: string;
          file_name: string;
          height?: number | null;
          id?: string;
          image?: string;
          is_private?: boolean;
          kind?: Database['public']['Enums']['media_kind'];
          rights_confirmed?: boolean;
          size_bytes?: number;
          storage_path?: string | null;
          title?: string;
          uploaded_by?: string;
          used_on?: string[];
          width?: number | null;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          file_name?: string;
          height?: number | null;
          id?: string;
          image?: string;
          is_private?: boolean;
          kind?: Database['public']['Enums']['media_kind'];
          rights_confirmed?: boolean;
          size_bytes?: number;
          storage_path?: string | null;
          title?: string;
          uploaded_by?: string;
          used_on?: string[];
          width?: number | null;
        };
        Relationships: [];
      };
      mfa_recovery_codes: {
        Row: { code_hash: string; created_at: string; id: string; used_at: string | null; user_id: string };
        Insert: {
          code_hash: string;
          created_at?: string;
          id?: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          code_hash?: string;
          created_at?: string;
          id?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mfa_recovery_codes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
        ];
      };
      page_contents: {
        Row: {
          content: Json;
          key: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          content: Json;
          key: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          content?: Json;
          key?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          active: boolean;
          audiences: Json;
          cta_href: string;
          cta_label: string;
          description: string;
          details: string[];
          highlights: string[];
          icon: string;
          icon_tone: Database['public']['Enums']['icon_tone'];
          id: string;
          image: string;
          image_alt: string;
          kind: Database['public']['Enums']['service_kind'];
          seo: Json;
          show_in_menu: boolean;
          show_medical_disclaimer: boolean;
          slug: string;
          sort_order: number;
          subtitle: string;
          summary: string;
          title: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          active?: boolean;
          audiences?: Json;
          cta_href?: string;
          cta_label?: string;
          description?: string;
          details?: string[];
          highlights?: string[];
          icon?: string;
          icon_tone?: Database['public']['Enums']['icon_tone'];
          id?: string;
          image?: string;
          image_alt?: string;
          kind?: Database['public']['Enums']['service_kind'];
          seo?: Json;
          show_in_menu?: boolean;
          show_medical_disclaimer?: boolean;
          slug: string;
          sort_order?: number;
          subtitle?: string;
          summary?: string;
          title: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          active?: boolean;
          audiences?: Json;
          cta_href?: string;
          cta_label?: string;
          description?: string;
          details?: string[];
          highlights?: string[];
          icon?: string;
          icon_tone?: Database['public']['Enums']['icon_tone'];
          id?: string;
          image?: string;
          image_alt?: string;
          kind?: Database['public']['Enums']['service_kind'];
          seo?: Json;
          show_in_menu?: boolean;
          show_medical_disclaimer?: boolean;
          slug?: string;
          sort_order?: number;
          subtitle?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          address: Json;
          analytics: Json;
          backups: Json;
          booking: Json;
          brand_name: string;
          description: string;
          emails: Json;
          facebook: Json;
          id: number;
          legal: Json;
          maintenance: Json;
          opening_hours: string | null;
          phones: Json;
          seo: Json;
          tagline: string;
          updated_at: string;
          updated_by: string;
          whatsapp: Json;
        };
        Insert: {
          address: Json;
          analytics: Json;
          backups: Json;
          booking: Json;
          brand_name: string;
          description?: string;
          emails?: Json;
          facebook: Json;
          id?: number;
          legal: Json;
          maintenance: Json;
          opening_hours?: string | null;
          phones?: Json;
          seo: Json;
          tagline?: string;
          updated_at?: string;
          updated_by?: string;
          whatsapp: Json;
        };
        Update: {
          address?: Json;
          analytics?: Json;
          backups?: Json;
          booking?: Json;
          brand_name?: string;
          description?: string;
          emails?: Json;
          facebook?: Json;
          id?: number;
          legal?: Json;
          maintenance?: Json;
          opening_hours?: string | null;
          phones?: Json;
          seo?: Json;
          tagline?: string;
          updated_at?: string;
          updated_by?: string;
          whatsapp?: Json;
        };
        Relationships: [];
      };
      submission_attempts: {
        Row: { created_at: string; id: number; ip_hash: string };
        Insert: { created_at?: string; id?: never; ip_hash: string };
        Update: { created_at?: string; id?: never; ip_hash?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      booking_confirmation: { Args: { p_key: string; p_reference: string }; Returns: Json };
      log_booking_reply: {
        Args: { p_booking_id: string; p_recipient: string; p_subject: string };
        Returns: {
          actor: string | null;
          actor_id: string | null;
          booking_id: string;
          created_at: string;
          id: string;
          label: string;
          type: Database['public']['Enums']['booking_event_type'];
        };
        SetofOptions: { from: '*'; to: 'booking_events'; isOneToOne: true; isSetofReturn: false };
      };
      mark_booking_viewed: { Args: { p_booking_id: string }; Returns: undefined };
      mark_password_changed: { Args: never; Returns: undefined };
      move_service: { Args: { p_direction: string; p_service_id: string }; Returns: undefined };
      outbox_claim: {
        Args: { p_limit?: number; p_token: string };
        Returns: Database['public']['Tables']['email_outbox']['Row'][];
      };
      outbox_complete: {
        Args: {
          p_error?: string;
          p_id: string;
          p_permanent?: boolean;
          p_provider_id?: string;
          p_token: string;
        };
        Returns: undefined;
      };
      outbox_provider_key: { Args: { p_token: string }; Returns: string };
      login_code_issue: { Args: { p_ip: string; p_session: string; p_user: string }; Returns: Json };
      login_code_verify: {
        Args: { p_code: string; p_session: string; p_user: string; p_validity_hours?: number };
        Returns: Json;
      };
      login_mailer_key: { Args: never; Returns: string };
      record_login: { Args: never; Returns: undefined };
      regenerate_recovery_codes: { Args: never; Returns: string[] };
      second_factor_verified: { Args: never; Returns: boolean };
      submit_booking: { Args: { p_booking: Json }; Returns: Json };
      taken_slots: { Args: never; Returns: { slot_date: string; slot_time: string }[] };
    };
    Enums: {
      activity_kind: 'settings' | 'team' | 'content';
      admin_role: 'administrateur' | 'editeur' | 'operateur';
      applicant_profile: 'patient' | 'proche' | 'etudiant' | 'personne_agee' | 'professionnel' | 'autre';
      article_status: 'brouillon' | 'publie' | 'archive';
      booking_event_type:
        | 'received'
        | 'email_sent'
        | 'notification_sent'
        | 'viewed'
        | 'status_changed'
        | 'assigned'
        | 'reply_sent'
        | 'note_added';
      booking_source: 'reservation' | 'logement' | 'demande_rapide' | 'contact';
      booking_status: 'nouveau' | 'en_cours' | 'en_attente' | 'confirme' | 'cloture' | 'annule';
      contact_preference: 'telephone' | 'email' | 'whatsapp';
      email_audience: 'demandeur' | 'equipe';
      email_outbox_status: 'en_attente' | 'envoye' | 'echec';
      email_template_kind: 'automatique' | 'manuel';
      icon_tone: 'brand' | 'success' | 'gold' | 'dark' | 'neutral';
      media_kind: 'image' | 'document';
      service_kind: 'page' | 'reservation';
      tone: 'brand' | 'success' | 'gold' | 'neutral' | 'info' | 'warning' | 'danger';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];

/** Ligne d'une table (lecture). */
export type Row<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
/** Données d'insertion d'une table. */
export type InsertRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
/** Données de mise à jour d'une table. */
export type UpdateRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
