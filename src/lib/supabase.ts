import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'citizen' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ai_severity_score: number;
  priority_score: number;
  status: 'pending' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  voice_transcription?: string;
  ai_classification?: {
    category: string;
    confidence: number;
    keywords: string[];
  };
  duplicate_of?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  escalated_at?: string;
}

export interface StatusHistory {
  id: string;
  complaint_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  complaint_id: string;
  user_id: string;
  type: 'email' | 'sms';
  status: 'pending' | 'sent' | 'failed';
  content: string;
  sent_at?: string;
  created_at: string;
}
