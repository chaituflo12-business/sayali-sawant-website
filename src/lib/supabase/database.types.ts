export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenderT = "female" | "male" | "other" | "prefer_not_to_say";
export type VisitType =
  | "new_consult"
  | "follow_up"
  | "antenatal"
  | "infertility"
  | "procedure_review"
  | "other";
export type ApptStatus =
  | "booked"
  | "rescheduled"
  | "cancelled"
  | "completed"
  | "no_show";

export type Database = {
  public: {
    Tables: {
      opd_schedule: {
        Row: {
          id: number;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes: number;
          capacity_per_slot: number;
          active: boolean;
        };
        Insert: {
          id?: number;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes?: number;
          capacity_per_slot?: number;
          active?: boolean;
        };
        Update: {
          id?: number;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          slot_minutes?: number;
          capacity_per_slot?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      slots: {
        Row: {
          id: string;
          starts_at: string;
          ends_at: string;
          capacity: number;
          blocked: boolean;
          block_reason: string | null;
        };
        Insert: {
          id?: string;
          starts_at: string;
          ends_at: string;
          capacity?: number;
          blocked?: boolean;
          block_reason?: string | null;
        };
        Update: {
          id?: string;
          starts_at?: string;
          ends_at?: string;
          capacity?: number;
          blocked?: boolean;
          block_reason?: string | null;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          public_ref: string;
          slot_id: string;
          patient_name: string;
          whatsapp_e164: string;
          age: number;
          gender: GenderT;
          visit_type: VisitType;
          reason: string | null;
          status: ApptStatus;
          manage_token: string;
          consent_at: string;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          public_ref?: string;
          slot_id: string;
          patient_name: string;
          whatsapp_e164: string;
          age: number;
          gender: GenderT;
          visit_type: VisitType;
          reason?: string | null;
          status?: ApptStatus;
          manage_token?: string;
          consent_at?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          public_ref?: string;
          slot_id?: string;
          patient_name?: string;
          whatsapp_e164?: string;
          age?: number;
          gender?: GenderT;
          visit_type?: VisitType;
          reason?: string | null;
          status?: ApptStatus;
          manage_token?: string;
          consent_at?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_outbox: {
        Row: {
          id: number;
          event: string;
          payload: Json;
          attempts: number;
          delivered_at: string | null;
          last_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          event: string;
          payload: Json;
          attempts?: number;
          delivered_at?: string | null;
          last_error?: string | null;
          created_at?: string;
        };
        Update: {
          attempts?: number;
          delivered_at?: string | null;
          last_error?: string | null;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          user_id: string;
          role: "doctor" | "reception";
          display_name: string;
        };
        Insert: {
          user_id: string;
          role: "doctor" | "reception";
          display_name: string;
        };
        Update: {
          role?: "doctor" | "reception";
          display_name?: string;
        };
        Relationships: [];
      };
      clinic_settings: {
        Row: {
          id: number;
          doctor_name: string;
          address: string;
          maps_url: string;
          site_url: string;
        };
        Insert: {
          id?: number;
          doctor_name?: string;
          address: string;
          maps_url: string;
          site_url: string;
        };
        Update: {
          doctor_name?: string;
          address?: string;
          maps_url?: string;
          site_url?: string;
        };
        Relationships: [];
      };
      booking_attempts: {
        Row: {
          id: number;
          ip_hash: string;
          created_at: string;
        };
        Insert: {
          ip_hash: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
    Functions: {
      get_available_slots: {
        Args: { from_date: string; to_date: string };
        Returns: {
          slot_id: string;
          starts_at: string;
          ends_at: string;
          remaining: number;
        }[];
      };
      book_appointment: {
        Args: {
          p_slot_id: string;
          p_patient_name: string;
          p_whatsapp_e164: string;
          p_age: number;
          p_gender: GenderT;
          p_visit_type: VisitType;
          p_reason: string | null;
          p_source?: string;
        };
        Returns: Json;
      };
      reschedule_appointment: {
        Args: { p_token: string; p_new_slot_id: string };
        Returns: Json;
      };
      cancel_appointment: {
        Args: { p_token: string };
        Returns: Json;
      };
      get_appointment_by_token: {
        Args: { p_token: string };
        Returns: Json;
      };
      get_upcoming_appointments: {
        Args: { from_date: string; to_date: string };
        Returns: Json;
      };
      assert_booking_rate_limit: {
        Args: { p_ip_hash: string; p_max?: number; p_minutes?: number };
        Returns: boolean;
      };
      materialise_slots: {
        Args: { days_ahead?: number };
        Returns: undefined;
      };
      claim_webhook_outbox: {
        Args: { batch_size?: number };
        Returns: Database["public"]["Tables"]["webhook_outbox"]["Row"][];
      };
    };
    Enums: {
      appt_status: ApptStatus;
      visit_type: VisitType;
      gender_t: GenderT;
    };
  };
};
