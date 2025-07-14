// Updated interfaces to match the new API response structure
export interface Company {
  id: number
  name: string
}

export interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

export interface AttachedDocument {
  url?: string
  secure_url?: string
  public_id?: string
  resource_type?: string
  format?: string
  bytes?: number
  size?: number
  original_filename?: string
  name?: string
  upload_timestamp?: string
  type?: string
}

export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  position: string
  level: string
  teams: string[]
  relationship_type: "subordinate" | "team_member"
  team_name?: string
}

export interface Task {
  id: number
  title: string
  description: string
  company: Company
  department: string
  status: string
  review_status: string
  contribution: string
  achieved_deliverables: string
  related_project: string
  reviewed: boolean
  reviewed_by: number | null
  reviewed_at: string | null
  comments: Comment[]
  workDaysCount: number
  originalDueDate: string
  location_name: string
  attachments: AttachedDocument[]
  lastShiftedDate: string | null
  isShifted: boolean
  isForDirectSupervisorTasks: boolean
  isTeamTask: boolean
  reviewTeam: any | null
  user?: User
  due_date?: string // For compatibility
  attached_documents?: AttachedDocument[] // For compatibility
}

export interface DailySubmission {
  dailyTasksId: number
  date: string
  tasks: Task[]
  submitted_at: string
  total_tasks_filtered: number
  original_tasks_count: number
}

export interface TeamTasksData {
  user: User
  submissions: Record<string, DailySubmission>
}

export interface HierarchicalReview {
  user: User
  submissions: Record<string, DailySubmission>
}

export interface TeamReview {
  team_name: string
  members: {
    user: User
    submissions: Record<string, DailySubmission>
  }[]
}

export interface ReviewResponse {
  hierarchical_reviews: HierarchicalReview[]
  team_reviews: TeamReview[]
}
