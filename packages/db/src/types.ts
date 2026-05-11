export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PollStatus = 'draft' | 'active' | 'closed' | 'resolved' | 'disputed'
export type DisputeStatus = 'open' | 'reviewing' | 'upheld' | 'dismissed'
export type BatchType = 'vote' | 'reputation' | 'resolution'

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string
          slug: string
          label: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          handle: string
          verified: boolean
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          handle: string
          verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          handle?: string
          verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          topic_id: string
          question: string
          region: string
          options: Json
          source_of_truth: string
          resolution_criteria: string | null
          cutoff_at: string
          resolves_at: string
          status: PollStatus
          outcome: string | null
          resolution_notes: string | null
          resolution_source_url: string | null
          resolved_at: string | null
          resolved_by: string | null
          commitment_hash: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          question: string
          region: string
          options: Json
          source_of_truth: string
          resolution_criteria?: string | null
          cutoff_at: string
          resolves_at: string
          status?: PollStatus
          outcome?: string | null
          resolution_notes?: string | null
          resolution_source_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          commitment_hash?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          question?: string
          region?: string
          options?: Json
          source_of_truth?: string
          resolution_criteria?: string | null
          cutoff_at?: string
          resolves_at?: string
          status?: PollStatus
          outcome?: string | null
          resolution_notes?: string | null
          resolution_source_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          commitment_hash?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          encrypted_answer: string
          answer: string | null
          receipt_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          encrypted_answer: string
          answer?: string | null
          receipt_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          encrypted_answer?: string
          answer?: string | null
          receipt_hash?: string
          created_at?: string
        }
      }
      reputation_events: {
        Row: {
          id: string
          user_id: string
          poll_id: string
          topic_id: string
          delta: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          poll_id: string
          topic_id: string
          delta?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          poll_id?: string
          topic_id?: string
          delta?: number
          created_at?: string
        }
      }
      user_topic_reputation: {
        Row: {
          user_id: string
          topic_id: string
          score: number
          resolved_count: number
          correct_count: number
        }
        Insert: {
          user_id: string
          topic_id: string
          score?: number
          resolved_count?: number
          correct_count?: number
        }
        Update: {
          user_id?: string
          topic_id?: string
          score?: number
          resolved_count?: number
          correct_count?: number
        }
      }
      audit_commitments: {
        Row: {
          id: string
          poll_id: string | null
          merkle_root: string
          batch_type: BatchType
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id?: string | null
          merkle_root: string
          batch_type: BatchType
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string | null
          merkle_root?: string
          batch_type?: BatchType
          metadata?: Json | null
          created_at?: string
        }
      }
      disputes: {
        Row: {
          id: string
          poll_id: string
          flagged_by: string
          reason: string
          status: DisputeStatus
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          poll_id: string
          flagged_by: string
          reason: string
          status?: DisputeStatus
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          poll_id?: string
          flagged_by?: string
          reason?: string
          status?: DisputeStatus
          created_at?: string
          resolved_at?: string | null
        }
      }
      invites: {
        Row: {
          id: string
          code: string
          created_by: string | null
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          created_by?: string | null
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          created_by?: string | null
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      poll_status: PollStatus
      dispute_status: DisputeStatus
      batch_type: BatchType
    }
  }
}

// Convenience row types extracted from the Database interface
export type Topic = Database['public']['Tables']['topics']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Poll = Database['public']['Tables']['polls']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type ReputationEvent = Database['public']['Tables']['reputation_events']['Row']
export type UserTopicReputation = Database['public']['Tables']['user_topic_reputation']['Row']
export type AuditCommitment = Database['public']['Tables']['audit_commitments']['Row']
export type Dispute = Database['public']['Tables']['disputes']['Row']
export type Invite = Database['public']['Tables']['invites']['Row']

// Insert types
export type TopicInsert = Database['public']['Tables']['topics']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type PollInsert = Database['public']['Tables']['polls']['Insert']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']
export type ReputationEventInsert = Database['public']['Tables']['reputation_events']['Insert']
export type UserTopicReputationInsert = Database['public']['Tables']['user_topic_reputation']['Insert']
export type AuditCommitmentInsert = Database['public']['Tables']['audit_commitments']['Insert']
export type DisputeInsert = Database['public']['Tables']['disputes']['Insert']
export type InviteInsert = Database['public']['Tables']['invites']['Insert']
