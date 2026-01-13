import type { Partner, Application, Vote, Investment, Notification } from './types'

// Partners (voters)
export const MOCK_PARTNERS: Partner[] = [
  { id: 'partner-1', name: 'Demo User', avatar: 'D' },
  { id: 'partner-2', name: 'Alex Chen', avatar: 'A' },
  { id: 'partner-3', name: 'Jordan Smith', avatar: 'J' },
]

// Current user (the demo visitor)
export const CURRENT_USER_ID = 'partner-1'
export const CURRENT_USER = MOCK_PARTNERS[0]

// Applications in the pipeline
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    company_name: 'NeuralSafe AI',
    founder_names: 'Sarah Chen, Marcus Williams',
    founder_linkedins: 'https://linkedin.com/in/sarahchen, https://linkedin.com/in/marcuswilliams',
    founder_bios: 'Sarah: Ex-Google AI Safety researcher with 8 years experience in mechanistic interpretability. Previously led the Circuits team. Marcus: Stanford ML PhD, former OpenAI alignment researcher. Published 12 papers on AI safety.',
    primary_email: 'sarah@neuralsafe.ai',
    company_description: 'Building interpretable AI systems with built-in safety constraints. Our approach uses mechanistic interpretability to ensure AI systems remain aligned with human values. We\'ve developed a novel technique called "Circuit Tracing" that allows us to understand and verify the decision-making process of large language models.',
    website: 'https://neuralsafe.ai',
    previous_funding: 'Pre-seed: $500K from angels',
    deck_link: 'https://docsend.com/neuralsafe-deck',
    submitted_at: '2025-01-10T10:00:00Z',
    stage: 'voting',
  },
  {
    id: 'app-2',
    company_name: 'AlignmentLabs',
    founder_names: 'James Park',
    founder_linkedins: 'https://linkedin.com/in/jamespark',
    founder_bios: 'Former Anthropic researcher focused on constitutional AI and RLHF. 5 years at DeepMind before that. Co-author of the influential "Scalable Oversight" paper.',
    primary_email: 'james@alignmentlabs.co',
    company_description: 'Developing scalable oversight techniques for large language models. Our platform enables organizations to maintain control over AI systems as they become more capable, using a combination of automated red-teaming and human-in-the-loop verification.',
    website: 'https://alignmentlabs.co',
    previous_funding: 'None',
    deck_link: null,
    submitted_at: '2025-01-08T14:30:00Z',
    stage: 'voting',
  },
  {
    id: 'app-3',
    company_name: 'RedTeam Security',
    founder_names: 'Elena Rodriguez, David Kim',
    founder_linkedins: 'https://linkedin.com/in/elenarodriguez, https://linkedin.com/in/davidkim',
    founder_bios: 'Elena: Former NSA cybersecurity specialist, now focused on AI security. David: MIT CS PhD, expert in adversarial machine learning.',
    primary_email: 'elena@redteamsec.io',
    company_description: 'AI vulnerability testing and red-teaming as a service. We help companies identify weaknesses in their AI systems before bad actors do. Our automated platform runs thousands of adversarial tests and provides detailed remediation guidance.',
    website: 'https://redteamsec.io',
    previous_funding: 'Seed: $1.2M from Sequoia Scout',
    deck_link: 'https://docsend.com/redteam-deck',
    submitted_at: '2025-01-05T09:15:00Z',
    stage: 'new',
  },
  {
    id: 'app-4',
    company_name: 'SafeRobotics',
    founder_names: 'Michael Torres',
    founder_linkedins: 'https://linkedin.com/in/michaeltorres',
    founder_bios: 'Ex-Boston Dynamics engineer with 10 years in robotics safety systems. Led the safety certification team for Spot.',
    primary_email: 'michael@saferobotics.tech',
    company_description: 'Verifiable safety guarantees for autonomous robots. We provide formal verification tools that mathematically prove robots will behave safely in all scenarios. Currently focused on warehouse and manufacturing applications.',
    website: 'https://saferobotics.tech',
    previous_funding: 'Pre-seed: $750K',
    deck_link: 'https://docsend.com/saferobotics-deck',
    submitted_at: '2024-12-20T11:00:00Z',
    stage: 'deliberation',
  },
  {
    id: 'app-5',
    company_name: 'EthicsEngine',
    founder_names: 'Priya Patel, Omar Hassan',
    founder_linkedins: 'https://linkedin.com/in/priyapatel, https://linkedin.com/in/omarhassan',
    founder_bios: 'Priya: Philosophy PhD from Oxford, specialized in AI ethics. Former ethics advisor to Google DeepMind. Omar: ML engineer with experience at Meta AI.',
    primary_email: 'priya@ethicsengine.ai',
    company_description: 'Bias detection and ethical AI assessment platform. We help companies ensure their AI systems are fair, transparent, and aligned with ethical principles. Our tools integrate directly into ML pipelines to catch issues before deployment.',
    website: 'https://ethicsengine.ai',
    previous_funding: 'None',
    deck_link: null,
    submitted_at: '2024-12-15T16:45:00Z',
    stage: 'invested',
  },
]

// Pre-existing votes (from other partners)
export const MOCK_VOTES: Vote[] = [
  // Votes for NeuralSafe AI (app-1)
  { id: 'vote-1', application_id: 'app-1', user_id: 'partner-2', vote: 'yes', notes: 'Strong technical founders with deep expertise. Clear problem-solution fit.' },
  { id: 'vote-2', application_id: 'app-1', user_id: 'partner-3', vote: 'maybe', notes: 'Great team but need to understand GTM strategy better.' },

  // Votes for AlignmentLabs (app-2)
  { id: 'vote-3', application_id: 'app-2', user_id: 'partner-2', vote: 'yes', notes: 'Anthropic pedigree is impressive. Solo founder risk but capable.' },

  // Votes for SafeRobotics (app-4) - in deliberation
  { id: 'vote-4', application_id: 'app-4', user_id: 'partner-1', vote: 'yes', notes: 'Unique technical approach to a real problem.' },
  { id: 'vote-5', application_id: 'app-4', user_id: 'partner-2', vote: 'yes', notes: 'Market timing is right. Strong IP potential.' },
  { id: 'vote-6', application_id: 'app-4', user_id: 'partner-3', vote: 'maybe', notes: 'Love the tech but worried about enterprise sales cycle.' },
]

// Portfolio investments
export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv-1',
    company_name: 'EthicsEngine',
    logo_url: null,
    short_description: 'Bias detection and ethical AI assessment platform',
    website: 'https://ethicsengine.ai',
    investment_date: '2025-01-02',
    type: 'SAFE',
    amount: 250000,
    round: 'Pre-seed',
    post_money_valuation: 8000000,
    status: 'active',
    founders: [
      { id: 'f-1', name: 'Priya Patel', email: 'priya@ethicsengine.ai', title: 'CEO' },
      { id: 'f-2', name: 'Omar Hassan', email: 'omar@ethicsengine.ai', title: 'CTO' },
    ],
  },
  {
    id: 'inv-2',
    company_name: 'GuardianML',
    logo_url: null,
    short_description: 'Enterprise AI monitoring and governance platform',
    website: 'https://guardianml.com',
    investment_date: '2024-12-15',
    type: 'SAFE',
    amount: 300000,
    round: 'Seed',
    post_money_valuation: 12000000,
    status: 'active',
    founders: [
      { id: 'f-3', name: 'Lisa Wang', email: 'lisa@guardianml.com', title: 'CEO' },
    ],
  },
  {
    id: 'inv-3',
    company_name: 'TrustLayer AI',
    logo_url: null,
    short_description: 'Automated AI safety testing infrastructure',
    website: 'https://trustlayer.ai',
    investment_date: '2024-11-20',
    type: 'Equity',
    amount: 400000,
    round: 'Seed',
    post_money_valuation: 15000000,
    status: 'active',
    founders: [
      { id: 'f-4', name: 'Ryan Chen', email: 'ryan@trustlayer.ai', title: 'CEO' },
      { id: 'f-5', name: 'Amy Zhou', email: 'amy@trustlayer.ai', title: 'CTO' },
    ],
  },
  {
    id: 'inv-4',
    company_name: 'Sentinel Systems',
    logo_url: null,
    short_description: 'Real-time AI behavior monitoring for autonomous systems',
    website: 'https://sentinelsystems.io',
    investment_date: '2024-10-05',
    type: 'SAFE',
    amount: 200000,
    round: 'Pre-seed',
    post_money_valuation: 6000000,
    status: 'active',
    founders: [
      { id: 'f-6', name: 'Marcus Johnson', email: 'marcus@sentinelsystems.io', title: 'CEO' },
    ],
  },
  {
    id: 'inv-5',
    company_name: 'AlignAI',
    logo_url: null,
    short_description: 'Constitutional AI training toolkit for enterprises',
    website: 'https://alignai.dev',
    investment_date: '2024-09-12',
    type: 'SAFE',
    amount: 350000,
    round: 'Pre-seed',
    post_money_valuation: 10000000,
    status: 'active',
    founders: [
      { id: 'f-7', name: 'Jennifer Lee', email: 'jennifer@alignai.dev', title: 'CEO' },
      { id: 'f-8', name: 'Daniel Park', email: 'daniel@alignai.dev', title: 'CTO' },
    ],
  },
  {
    id: 'inv-6',
    company_name: 'VerifyAI',
    logo_url: null,
    short_description: 'Formal verification tools for neural networks',
    website: 'https://verifyai.tech',
    investment_date: '2024-08-18',
    type: 'Equity',
    amount: 275000,
    round: 'Seed',
    post_money_valuation: 11000000,
    status: 'active',
    founders: [
      { id: 'f-9', name: 'Thomas Anderson', email: 'thomas@verifyai.tech', title: 'CEO' },
    ],
  },
  {
    id: 'inv-7',
    company_name: 'SafePrompt',
    logo_url: null,
    short_description: 'Prompt injection defense and LLM security',
    website: 'https://safeprompt.ai',
    investment_date: '2024-07-22',
    type: 'SAFE',
    amount: 225000,
    round: 'Pre-seed',
    post_money_valuation: 7500000,
    status: 'active',
    founders: [
      { id: 'f-10', name: 'Sofia Martinez', email: 'sofia@safeprompt.ai', title: 'CEO' },
      { id: 'f-11', name: 'Kevin Liu', email: 'kevin@safeprompt.ai', title: 'CTO' },
    ],
  },
  {
    id: 'inv-8',
    company_name: 'RobustML',
    logo_url: null,
    short_description: 'Adversarial robustness testing platform',
    website: 'https://robustml.co',
    investment_date: '2024-06-10',
    type: 'SAFE',
    amount: 150000,
    round: 'Pre-seed',
    post_money_valuation: 5000000,
    status: 'active',
    founders: [
      { id: 'f-12', name: 'Alex Kim', email: 'alex@robustml.co', title: 'CEO' },
    ],
  },
]

// Mock notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'vote_needed',
    title: 'Vote needed: NeuralSafe AI',
    description: 'Application awaiting your vote',
    created_at: '2025-01-10T10:30:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'vote_needed',
    title: 'Vote needed: AlignmentLabs',
    description: 'Application awaiting your vote',
    created_at: '2025-01-08T15:00:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'decision_needed',
    title: 'Decision needed: SafeRobotics',
    description: 'Ready for final investment decision',
    created_at: '2025-01-07T09:00:00Z',
    read: false,
  },
  {
    id: 'notif-4',
    type: 'new_application',
    title: 'New application: RedTeam Security',
    description: 'New company applied to SAIF',
    created_at: '2025-01-05T09:15:00Z',
    read: true,
  },
  {
    id: 'notif-5',
    type: 'investment_closed',
    title: 'Investment closed: EthicsEngine',
    description: '$250K investment finalized',
    created_at: '2025-01-02T14:00:00Z',
    read: true,
  },
]

// Dashboard stats
export const MOCK_STATS = {
  pipeline: MOCK_APPLICATIONS.filter(a => a.stage === 'new' || a.stage === 'voting').length,
  deliberation: MOCK_APPLICATIONS.filter(a => a.stage === 'deliberation').length,
  invested: MOCK_INVESTMENTS.length,
  rejected: 12, // Historical
}

// Portfolio stats (computed from investments)
export const MOCK_PORTFOLIO_STATS = {
  totalInvestments: MOCK_INVESTMENTS.length,
  totalInvested: MOCK_INVESTMENTS.reduce((sum, inv) => sum + inv.amount, 0),
  averageCheck: Math.round(MOCK_INVESTMENTS.reduce((sum, inv) => sum + inv.amount, 0) / MOCK_INVESTMENTS.length),
}
