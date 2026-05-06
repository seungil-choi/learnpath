export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          bio: string | null
          avatar_url: string | null
          display_name: string | null
          preferred_locale: string
          role: string
          interest_category_keys: string[]
          onboarded_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          display_name?: string | null
          preferred_locale?: string
          role?: string
          interest_category_keys?: string[]
          onboarded_at?: string | null
          created_at?: string
        }
        Update: {
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          display_name?: string | null
          preferred_locale?: string
          role?: string
          interest_category_keys?: string[]
          onboarded_at?: string | null
        }
        Relationships: []
      }
      curricula: {
        Row: {
          id: string
          title: string
          description: string | null
          goal: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: number
          category: string | null
          creator_id: string | null
          original_id: string | null
          is_published: boolean
          enrollment_count: number
          completion_count: number
          avg_rating: number
          rating_count: number
          target_audience: string[]
          prerequisites: string[]
          learning_goals: string[]
          completion_result: string | null
          thumbnail_url: string | null
          slug: string | null
          subtitle: string | null
          expected_outcome: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          goal?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: number
          category?: string | null
          creator_id?: string | null
          original_id?: string | null
          is_published?: boolean
          enrollment_count?: number
          completion_count?: number
          avg_rating?: number
          rating_count?: number
          target_audience?: string[]
          prerequisites?: string[]
          learning_goals?: string[]
          completion_result?: string | null
          thumbnail_url?: string | null
          slug?: string | null
          subtitle?: string | null
          expected_outcome?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          goal?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: number
          category?: string | null
          original_id?: string | null
          is_published?: boolean
          target_audience?: string[]
          prerequisites?: string[]
          learning_goals?: string[]
          completion_result?: string | null
          thumbnail_url?: string | null
          slug?: string | null
          subtitle?: string | null
          expected_outcome?: string | null
          published_at?: string | null
        }
        Relationships: []
      }
      curriculum_saves: {
        Row: {
          id: string
          user_id: string
          curriculum_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          curriculum_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      steps: {
        Row: {
          id: string
          curriculum_id: string
          title: string
          description: string | null
          order: number
          estimated_duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          curriculum_id: string
          title: string
          description?: string | null
          order: number
          estimated_duration?: number | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          order?: number
          estimated_duration?: number | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          step_id: string
          type: 'video' | 'article' | 'github' | 'other'
          url: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          step_id: string
          type?: 'video' | 'article' | 'github' | 'other'
          url: string
          title?: string | null
          created_at?: string
        }
        Update: {
          type?: 'video' | 'article' | 'github' | 'other'
          url?: string
          title?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          id: string
          user_id: string
          curriculum_id: string
          completed_steps: string[]
          progress_percent: number
          last_step_id: string | null
          last_accessed_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          curriculum_id: string
          completed_steps?: string[]
          progress_percent?: number
          last_step_id?: string | null
          last_accessed_at?: string
          completed_at?: string | null
        }
        Update: {
          completed_steps?: string[]
          progress_percent?: number
          last_step_id?: string | null
          last_accessed_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      step_comments: {
        Row: {
          id: string
          step_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          step_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          user_id: string | null
          curriculum_id: string | null
          properties: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          user_id?: string | null
          curriculum_id?: string | null
          properties?: Record<string, unknown>
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      curriculum_reviews: {
        Row: {
          id: string
          user_id: string
          curriculum_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          curriculum_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          rating?: number
          comment?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Curriculum = Database['public']['Tables']['curricula']['Row']
export type Step = Database['public']['Tables']['steps']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type Progress = Database['public']['Tables']['progress']['Row']
export type CurriculumReview = Database['public']['Tables']['curriculum_reviews']['Row']

export type CurriculumWithCreator = Curriculum & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null
}

export type StepWithResources = Step & {
  resources: Resource[]
}

export type CurriculumDetail = CurriculumWithCreator & {
  steps: StepWithResources[]
}
