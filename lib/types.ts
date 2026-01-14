export type VoteValue = 'yes' | 'maybe' | 'no'

export interface Partner {
  id: string
  name: string
  avatar: string
}

export interface Vote {
  id: string
  application_id: string
  user_id: string
  vote: VoteValue
  notes: string | null
}

export interface Application {
  id: string
  company_name: string
  founder_names: string | null
  founder_linkedins: string | null
  founder_bios: string | null
  primary_email: string | null
  company_description: string | null
  website: string | null
  previous_funding: string | null
  deck_link: string | null
  submitted_at: string
  stage: 'new' | 'voting' | 'deliberation' | 'invested' | 'rejected'
}

export interface ApplicationWithVotes extends Application {
  votes: Vote[]
  userVote: Vote | null
}

export interface Founder {
  id: string
  name: string
  email: string | null
  title: string | null
}

export interface Investment {
  id: string
  company_name: string
  logo_url: string | null
  short_description: string | null
  website: string | null
  investment_date: string
  type: string | null
  amount: number
  round: string | null
  post_money_valuation: number | null
  status: 'active' | 'acquired' | 'ipo' | 'written_off'
  founders: Founder[]
}

export interface Notification {
  id: string
  type: 'vote_needed' | 'decision_needed' | 'new_application' | 'investment_closed'
  title: string
  description: string
  created_at: string
  read: boolean
}

export interface Deliberation {
  id: string
  application_id: string
  decision: 'pending' | 'yes' | 'no' | 'maybe'
  status: 'scheduled' | 'met' | 'emailed' | null
  tags: string[]
  meeting_date: string | null
  idea_summary: string | null
  thoughts: string | null
  created_at: string
}

export interface DeliberationApplication extends Application {
  votes: Vote[]
  deliberation: Deliberation | null
  email_sent: boolean
  email_sent_at: string | null
}

export interface ArchivedApplication extends Application {
  votes: Vote[]
  email_sent: boolean
  email_sent_at: string | null
}

export interface Stats {
  pipeline: number
  deliberation: number
  invested: number
  rejected: number
}

export interface PortfolioStats {
  totalInvestments: number
  totalInvested: number
  averageCheck: number
}
