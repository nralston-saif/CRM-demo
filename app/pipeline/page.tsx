'use client'

import { useState, useMemo } from 'react'
import {
  MOCK_APPLICATIONS,
  MOCK_VOTES,
  MOCK_PARTNERS,
  MOCK_DELIBERATION_APPLICATIONS,
  MOCK_ARCHIVED_APPLICATIONS,
  MOCK_INTERVIEW_TAGS,
  CURRENT_USER_ID,
} from '@/lib/mock-data'
import type { Application, Vote, VoteValue, DeliberationApplication, ArchivedApplication } from '@/lib/types'
import { useToast } from '@/components/Toast'
import { formatDate, formatDateShort, formatFounderNames, ensureProtocol } from '@/lib/utils'

// ============================================
// Types
// ============================================

type Tab = 'applications' | 'interviews' | 'archive'
type SortOption = 'date-newest' | 'date-oldest' | 'name-az' | 'name-za' | 'stage'

interface ApplicationWithVotes extends Application {
  votes: Vote[]
  userVote: Vote | null
  voteCount: number
}

// ============================================
// Helper Functions
// ============================================

function getVoteBadgeStyle(voteValue: string): string {
  switch (voteValue) {
    case 'yes': return 'bg-emerald-100 text-emerald-700'
    case 'maybe': return 'bg-amber-100 text-amber-700'
    case 'no': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getStageBadgeStyle(stage: string | null): string {
  if (!stage) return 'bg-gray-100 text-gray-700'
  switch (stage) {
    case 'invested': return 'bg-emerald-100 text-emerald-700'
    case 'deliberation': return 'bg-amber-100 text-amber-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getTagColor(tagName: string): string {
  const tag = MOCK_INTERVIEW_TAGS.find(t => t.name === tagName)
  return tag?.color || '#9ca3af'
}

function formatTagName(tagName: string): string {
  return tagName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// ============================================
// Icons
// ============================================

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function DotsMenuIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
      <circle cx="8" cy="2.5" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13.5" r="1.5" />
    </svg>
  )
}

// ============================================
// Component
// ============================================

export default function DealsPage() {
  const { showToast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('applications')

  // ============================================
  // Pipeline State Management
  // ============================================

  // Applications in voting stage
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)
  const [localVotes, setLocalVotes] = useState<Vote[]>(MOCK_VOTES)

  // Applications in interview stage
  const [interviewApps, setInterviewApps] = useState<DeliberationApplication[]>(MOCK_DELIBERATION_APPLICATIONS)

  // Archived applications (invested/rejected)
  const [archivedApps, setArchivedApps] = useState<ArchivedApplication[]>(MOCK_ARCHIVED_APPLICATIONS)

  // ============================================
  // Modal State
  // ============================================

  // Vote modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [vote, setVote] = useState<VoteValue | ''>('')
  const [notes, setNotes] = useState('')

  // Detail modals
  const [detailApp, setDetailApp] = useState<Application | null>(null)
  const [detailDelibApp, setDetailDelibApp] = useState<DeliberationApplication | null>(null)
  const [detailArchivedApp, setDetailArchivedApp] = useState<ArchivedApplication | null>(null)

  // Move to Interviews modal
  const [moveToInterviewsApp, setMoveToInterviewsApp] = useState<ApplicationWithVotes | null>(null)

  // Decision modal (Invest/Reject)
  const [decisionApp, setDecisionApp] = useState<DeliberationApplication | null>(null)

  // Success modal (after investing)
  const [investedCompanyName, setInvestedCompanyName] = useState<string | null>(null)

  // Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Archive search/sort
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('')
  const [archiveSortOption, setArchiveSortOption] = useState<SortOption>('date-newest')

  // ============================================
  // Computed Data
  // ============================================

  // Get applications with vote data
  const applicationsWithVotes = useMemo(() => {
    return applications.filter(app => app.stage === 'new' || app.stage === 'voting').map(app => {
      const appVotes = localVotes.filter(v => v.application_id === app.id)
      const userVote = appVotes.find(v => v.user_id === CURRENT_USER_ID) || null
      return {
        ...app,
        votes: appVotes,
        userVote,
        voteCount: appVotes.length,
      }
    })
  }, [applications, localVotes])

  const needsYourVote = applicationsWithVotes.filter(app => !app.userVote)
  const alreadyVoted = applicationsWithVotes.filter(app => app.userVote)

  // Filtered archived applications
  const filteredArchivedApplications = useMemo(() => {
    let filtered = archivedApps

    if (archiveSearchQuery.trim()) {
      const query = archiveSearchQuery.toLowerCase()
      filtered = filtered.filter(app =>
        app.company_name.toLowerCase().includes(query) ||
        app.founder_names?.toLowerCase().includes(query) ||
        app.company_description?.toLowerCase().includes(query)
      )
    }

    return [...filtered].sort((a, b) => {
      switch (archiveSortOption) {
        case 'date-newest':
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        case 'date-oldest':
          return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        case 'name-az':
          return a.company_name.localeCompare(b.company_name)
        case 'name-za':
          return b.company_name.localeCompare(a.company_name)
        case 'stage':
          return (a.stage || '').localeCompare(b.stage || '')
        default:
          return 0
      }
    })
  }, [archivedApps, archiveSearchQuery, archiveSortOption])

  // ============================================
  // Handlers
  // ============================================

  const handleVoteSubmit = () => {
    if (!selectedApp || !vote) return

    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      application_id: selectedApp.id,
      user_id: CURRENT_USER_ID,
      vote: vote,
      notes: notes || null,
    }

    setLocalVotes(prev => {
      const filtered = prev.filter(
        v => !(v.application_id === selectedApp.id && v.user_id === CURRENT_USER_ID)
      )
      return [...filtered, newVote]
    })

    setSelectedApp(null)
    setVote('')
    setNotes('')
    showToast('Vote recorded!', 'success')
  }

  const openVoteModal = (app: ApplicationWithVotes) => {
    setSelectedApp(app)
    setVote(app.userVote?.vote || '')
    setNotes(app.userVote?.notes || '')
  }

  // Move application to Interviews
  const handleMoveToInterviews = () => {
    if (!moveToInterviewsApp) return

    // Remove from applications
    setApplications(prev => prev.filter(a => a.id !== moveToInterviewsApp.id))

    // Add to interviews
    const newInterviewApp: DeliberationApplication = {
      ...moveToInterviewsApp,
      stage: 'deliberation',
      votes: moveToInterviewsApp.votes,
      deliberation: {
        id: `delib-${Date.now()}`,
        application_id: moveToInterviewsApp.id,
        decision: 'pending',
        status: 'scheduled',
        tags: [],
        meeting_date: null,
        idea_summary: null,
        thoughts: null,
        created_at: new Date().toISOString(),
      },
      email_sent: false,
      email_sent_at: null,
    }

    setInterviewApps(prev => [newInterviewApp, ...prev])
    setMoveToInterviewsApp(null)
    setOpenMenuId(null)
    showToast(`${moveToInterviewsApp.company_name} moved to Interviews!`, 'success')
    setActiveTab('interviews')
  }

  // Handle decision (Invest or Reject)
  const handleDecision = (decision: 'invested' | 'rejected') => {
    if (!decisionApp) return

    // Remove from interviews
    setInterviewApps(prev => prev.filter(a => a.id !== decisionApp.id))

    // Add to archive
    const newArchivedApp: ArchivedApplication = {
      id: decisionApp.id,
      company_name: decisionApp.company_name,
      founder_names: decisionApp.founder_names,
      founder_linkedins: decisionApp.founder_linkedins,
      founder_bios: decisionApp.founder_bios,
      primary_email: decisionApp.primary_email,
      company_description: decisionApp.company_description,
      website: decisionApp.website,
      previous_funding: decisionApp.previous_funding,
      deck_link: decisionApp.deck_link,
      submitted_at: decisionApp.submitted_at,
      stage: decision,
      votes: decisionApp.votes,
      email_sent: false,
      email_sent_at: null,
    }

    setArchivedApps(prev => [newArchivedApp, ...prev])
    setDecisionApp(null)

    if (decision === 'invested') {
      setInvestedCompanyName(decisionApp.company_name)
    } else {
      showToast(`${decisionApp.company_name} marked as rejected`, 'success')
      setActiveTab('archive')
    }
  }

  const getVoteButtonStyle = (option: string) => {
    const isSelected = vote === option
    const baseClasses = 'flex-1 py-4 px-4 rounded-xl border-2 font-semibold text-center transition-all cursor-pointer'

    if (isSelected) {
      if (option === 'yes') return `${baseClasses} border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md`
      if (option === 'maybe') return `${baseClasses} border-amber-500 bg-amber-50 text-amber-700 shadow-md`
      if (option === 'no') return `${baseClasses} border-red-500 bg-red-50 text-red-700 shadow-md`
    }
    return `${baseClasses} border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50`
  }

  const getPartnerName = (userId: string) => {
    return MOCK_PARTNERS.find(p => p.id === userId)?.name || 'Unknown'
  }

  // Tab counts
  const applicationsCount = applicationsWithVotes.length
  const interviewsCount = interviewApps.length
  const archiveCount = archivedApps.length

  // Tab button renderer
  const renderTabButton = (tab: Tab, label: string, count: number) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
        activeTab === tab
          ? 'border-[#1a1a1a] text-[#1a1a1a]'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
          activeTab === tab ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div className="mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Deals</h1>
      </div>

      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="font-medium text-blue-900 text-sm">Demo Mode</p>
            <p className="text-xs text-blue-700">
              Move companies through the pipeline: Applications → Interviews → Archive. State resets on refresh.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="-mb-px flex gap-4">
          {renderTabButton('applications', 'Applications', applicationsCount)}
          {renderTabButton('interviews', 'Interviews', interviewsCount)}
          {renderTabButton('archive', 'Archive', archiveCount)}
        </nav>
      </div>

      {/* ============================================ */}
      {/* APPLICATIONS TAB */}
      {/* ============================================ */}
      {activeTab === 'applications' && (
        <div>
          {applicationsWithVotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">No applications in the pipeline. All have been moved to Interviews!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Needs Your Vote Section */}
              {needsYourVote.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Needs Your Vote</h2>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {needsYourVote.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setDetailApp(app)}
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {app.company_name}
                              </h3>
                              {app.founder_names && (
                                <p className="text-xs text-gray-500 truncate">
                                  {formatFounderNames(app.founder_names)}
                                </p>
                              )}
                            </div>
                            <div className="relative ml-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(openMenuId === app.id ? null : app.id)
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                              >
                                <DotsMenuIcon />
                              </button>
                              {openMenuId === app.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenMenuId(null)
                                    }}
                                  />
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setMoveToInterviewsApp(app)
                                      }}
                                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                    >
                                      Move to Interviews →
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {app.company_description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {app.company_description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {app.website && (
                              <a
                                href={ensureProtocol(app.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Web
                              </a>
                            )}
                            {app.deck_link && (
                              <a
                                href={app.deck_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Deck
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500">{app.voteCount}/3 votes</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openVoteModal(app)
                            }}
                            className="px-2.5 py-1 rounded text-xs font-medium bg-[#1a1a1a] text-white hover:bg-black transition-all"
                          >
                            Vote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Already Voted Section */}
              {alreadyVoted.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">You&apos;ve Voted</h2>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {alreadyVoted.map((app) => {
                      const allVotesIn = app.voteCount >= 3
                      return (
                        <div
                          key={app.id}
                          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setDetailApp(app)}
                        >
                          <div className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {app.company_name}
                                </h3>
                                {app.founder_names && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {formatFounderNames(app.founder_names)}
                                  </p>
                                )}
                              </div>
                              {app.userVote && (
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getVoteBadgeStyle(app.userVote.vote)}`}>
                                  {app.userVote.vote}
                                </span>
                              )}
                            </div>

                            {app.company_description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {app.company_description}
                              </p>
                            )}

                            {/* Revealed Votes when all 3 are in */}
                            {allVotesIn && (
                              <div className="bg-emerald-50 rounded-lg p-2 mb-2 border border-emerald-100">
                                <p className="text-xs font-medium text-emerald-800 mb-2">All 3 votes in!</p>
                                <div className="space-y-1.5">
                                  {app.votes.map((v, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span
                                        className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${getVoteBadgeStyle(v.vote)}`}
                                      >
                                        {getPartnerName(v.user_id).split(' ')[0]}: {v.vote}
                                      </span>
                                      {v.notes && (
                                        <span className="text-xs text-gray-600 italic line-clamp-2">
                                          &ldquo;{v.notes}&rdquo;
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Vote progress when not all in */}
                            {!allVotesIn && app.voteCount > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {app.votes.map((v, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                                  >
                                    {getPartnerName(v.user_id).split(' ')[0]} voted
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                              {app.website && (
                                <a
                                  href={ensureProtocol(app.website)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Web
                                </a>
                              )}
                              {app.deck_link && (
                                <a
                                  href={app.deck_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Deck
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{app.voteCount}/3 votes</span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openVoteModal(app)
                                }}
                                className="px-2.5 py-1 rounded text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                              >
                                Edit
                              </button>
                              {allVotesIn && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setMoveToInterviewsApp(app)
                                  }}
                                  className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
                                >
                                  Advance →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* INTERVIEWS TAB */}
      {/* ============================================ */}
      {activeTab === 'interviews' && (
        <div>
          {interviewApps.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">No applications in Interviews. Move some from Applications!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {interviewApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setDetailDelibApp(app)}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {app.company_name}
                        </h3>
                        {app.founder_names && (
                          <p className="text-xs text-gray-500 truncate">{formatFounderNames(app.founder_names)}</p>
                        )}
                        {app.deliberation?.created_at && (
                          <p className="text-xs text-gray-400">
                            Added: {formatDate(app.deliberation.created_at)}
                          </p>
                        )}
                      </div>
                      {app.email_sent && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <svg className="w-3 h-3 -ml-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {app.email_sent_at && <span className="text-gray-500">{formatDateShort(app.email_sent_at)}</span>}
                        </span>
                      )}
                    </div>

                    {/* Interview Tags */}
                    {app.deliberation?.tags && app.deliberation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {app.deliberation.tags.map((tagName) => (
                          <span
                            key={tagName}
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: getTagColor(tagName) }}
                          >
                            {formatTagName(tagName)}
                          </span>
                        ))}
                      </div>
                    )}

                    {app.company_description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {app.company_description}
                      </p>
                    )}

                    {/* Compact vote summary */}
                    {app.votes && app.votes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.votes.map((voteItem) => (
                          <span
                            key={voteItem.user_id}
                            className={`text-xs px-1.5 py-0.5 rounded ${getVoteBadgeStyle(voteItem.vote)}`}
                          >
                            {getPartnerName(voteItem.user_id).split(' ')[0]}: {voteItem.vote}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.website && (
                        <a
                          href={ensureProtocol(app.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Web
                        </a>
                      )}
                      {app.deck_link && (
                        <a
                          href={app.deck_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Deck
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDecisionApp(app)
                      }}
                      className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                    >
                      Invest
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDecisionApp(app)
                      }}
                      className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                    >
                      Reject
                    </button>
                    <span className="text-xs text-gray-400 ml-auto">Click card for details</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* ARCHIVE TAB */}
      {/* ============================================ */}
      {activeTab === 'archive' && (
        <div>
          {archivedApps.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">No archived applications yet. Invest or reject from Interviews!</p>
            </div>
          ) : (
            <div>
              {/* Search and Sort Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search by company, founder, or description..."
                      value={archiveSearchQuery}
                      onChange={(e) => setArchiveSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={archiveSortOption}
                      onChange={(e) => setArchiveSortOption(e.target.value as SortOption)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
                    >
                      <option value="date-newest">Newest First</option>
                      <option value="date-oldest">Oldest First</option>
                      <option value="name-az">Name (A-Z)</option>
                      <option value="name-za">Name (Z-A)</option>
                      <option value="stage">By Status</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredArchivedApplications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-gray-500">No applications match your search.</p>
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredArchivedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setDetailArchivedApp(app)}
                    >
                      <div className="mb-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 truncate flex-1 min-w-0">
                            {app.company_name}
                          </h3>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize flex-shrink-0 ${getStageBadgeStyle(app.stage)}`}>
                            {app.stage}
                          </span>
                        </div>
                        {app.founder_names && (
                          <p className="text-xs text-gray-500 truncate">{formatFounderNames(app.founder_names)}</p>
                        )}
                      </div>
                      {app.company_description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{app.company_description}</p>
                      )}
                      {/* Compact vote summary */}
                      {app.votes && app.votes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {app.votes.map((voteItem) => (
                            <span
                              key={voteItem.id}
                              className={`text-xs px-1.5 py-0.5 rounded ${getVoteBadgeStyle(voteItem.vote)}`}
                            >
                              {getPartnerName(voteItem.user_id).split(' ')[0]}: {voteItem.vote}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400">{formatDate(app.submitted_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* VOTE MODAL */}
      {/* ============================================ */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedApp.company_name}</h2>
                  {selectedApp.founder_names && (
                    <p className="text-gray-500 mt-1">{formatFounderNames(selectedApp.founder_names)}</p>
                  )}
                </div>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {selectedApp.company_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-700">{selectedApp.company_description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Your Vote</h3>
                <div className="flex gap-3">
                  {(['yes', 'maybe', 'no'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setVote(option)}
                      className={getVoteButtonStyle(option)}
                    >
                      <div className="text-2xl mb-1">
                        {option === 'yes' ? '👍' : option === 'maybe' ? '🤔' : '👎'}
                      </div>
                      <div className="capitalize">{option}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent resize-none"
                  placeholder="Share your thoughts on this application..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setVote('')
                  setNotes('')
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoteSubmit}
                disabled={!vote}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-white hover:bg-black disabled:opacity-50"
              >
                Submit Vote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MOVE TO INTERVIEWS MODAL */}
      {/* ============================================ */}
      {moveToInterviewsApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setMoveToInterviewsApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-gray-900">Move to Interviews</h2>
                <button onClick={() => setMoveToInterviewsApp(null)} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Move <span className="font-semibold">{moveToInterviewsApp.company_name}</span> to the Interviews stage?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This will advance the application for partner interviews and final decision.
              </p>

              {/* Show vote summary */}
              {moveToInterviewsApp.votes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current votes:</p>
                  <div className="flex flex-wrap gap-2">
                    {moveToInterviewsApp.votes.map((v, i) => (
                      <span
                        key={i}
                        className={`text-sm px-2 py-1 rounded ${getVoteBadgeStyle(v.vote)}`}
                      >
                        {getPartnerName(v.user_id)}: {v.vote}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setMoveToInterviewsApp(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToInterviews}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-white hover:bg-black"
              >
                Move to Interviews
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DECISION MODAL (Invest/Reject) */}
      {/* ============================================ */}
      {decisionApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDecisionApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-gray-900">Final Decision</h2>
                <button onClick={() => setDecisionApp(null)} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                What&apos;s the decision for <span className="font-semibold">{decisionApp.company_name}</span>?
              </p>

              {/* Show vote summary */}
              {decisionApp.votes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Partner votes:</p>
                  <div className="flex flex-wrap gap-2">
                    {decisionApp.votes.map((v, i) => (
                      <span
                        key={i}
                        className={`text-sm px-2 py-1 rounded ${getVoteBadgeStyle(v.vote)}`}
                      >
                        {getPartnerName(v.user_id)}: {v.vote}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleDecision('invested')}
                  className="flex-1 py-4 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-all"
                >
                  <div className="text-2xl mb-1">💰</div>
                  <div>Invest</div>
                </button>
                <button
                  onClick={() => handleDecision('rejected')}
                  className="flex-1 py-4 px-4 rounded-xl border-2 border-red-500 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-all"
                >
                  <div className="text-2xl mb-1">❌</div>
                  <div>Reject</div>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setDecisionApp(null)}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* APPLICATION DETAIL MODAL */}
      {/* ============================================ */}
      {detailApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detailApp.company_name}</h2>
                  {detailApp.founder_names && (
                    <p className="text-gray-500 mt-1">{formatFounderNames(detailApp.founder_names)}</p>
                  )}
                </div>
                <button onClick={() => setDetailApp(null)} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {detailApp.company_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-700">{detailApp.company_description}</p>
                </div>
              )}
              {detailApp.founder_bios && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Founder Bios</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{detailApp.founder_bios}</p>
                </div>
              )}
              {detailApp.previous_funding && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Previous Funding</h3>
                  <p className="text-gray-700">{detailApp.previous_funding}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {detailApp.website && (
                  <a href={ensureProtocol(detailApp.website)} target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] hover:text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
                    Website
                  </a>
                )}
                {detailApp.deck_link && (
                  <a href={detailApp.deck_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm">
                    View Deck
                  </a>
                )}
                {detailApp.primary_email && (
                  <a href={`mailto:${detailApp.primary_email}`} className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm">
                    {detailApp.primary_email}
                  </a>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Submitted</h3>
                <p className="text-gray-700">{formatDate(detailApp.submitted_at)}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setDetailApp(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* INTERVIEW DETAIL MODAL */}
      {/* ============================================ */}
      {detailDelibApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailDelibApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detailDelibApp.company_name}</h2>
                  {detailDelibApp.founder_names && (
                    <p className="text-gray-500 mt-1">{formatFounderNames(detailDelibApp.founder_names)}</p>
                  )}
                </div>
                <button onClick={() => setDetailDelibApp(null)} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {detailDelibApp.deliberation?.tags && detailDelibApp.deliberation.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detailDelibApp.deliberation.tags.map((tagName) => (
                    <span
                      key={tagName}
                      className="text-sm px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: getTagColor(tagName) }}
                    >
                      {formatTagName(tagName)}
                    </span>
                  ))}
                </div>
              )}
              {detailDelibApp.company_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-700">{detailDelibApp.company_description}</p>
                </div>
              )}
              {detailDelibApp.deliberation?.idea_summary && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Idea Summary</h3>
                  <p className="text-gray-700">{detailDelibApp.deliberation.idea_summary}</p>
                </div>
              )}
              {detailDelibApp.deliberation?.thoughts && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Thoughts</h3>
                  <p className="text-gray-700">{detailDelibApp.deliberation.thoughts}</p>
                </div>
              )}
              {detailDelibApp.votes && detailDelibApp.votes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Votes</h3>
                  <div className="space-y-2">
                    {detailDelibApp.votes.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{getPartnerName(v.user_id).charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{getPartnerName(v.user_id)}</p>
                          {v.notes && <p className="text-sm text-gray-500">{v.notes}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getVoteBadgeStyle(v.vote)}`}>
                          {v.vote}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {detailDelibApp.website && (
                  <a href={ensureProtocol(detailDelibApp.website)} target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] hover:text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
                    Website
                  </a>
                )}
                {detailDelibApp.deck_link && (
                  <a href={detailDelibApp.deck_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm">
                    View Deck
                  </a>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-between">
              <button onClick={() => setDetailDelibApp(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDetailDelibApp(null)
                    setDecisionApp(detailDelibApp)
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-white hover:bg-black"
                >
                  Make Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ARCHIVED DETAIL MODAL */}
      {/* ============================================ */}
      {detailArchivedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailArchivedApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detailArchivedApp.company_name}</h2>
                  {detailArchivedApp.founder_names && (
                    <p className="text-gray-500 mt-1">{formatFounderNames(detailArchivedApp.founder_names)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-2 py-1 rounded font-medium capitalize ${getStageBadgeStyle(detailArchivedApp.stage)}`}>
                    {detailArchivedApp.stage}
                  </span>
                  <button onClick={() => setDetailArchivedApp(null)} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
                    <CloseIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {detailArchivedApp.company_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-700">{detailArchivedApp.company_description}</p>
                </div>
              )}
              {detailArchivedApp.founder_bios && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Founder Bios</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{detailArchivedApp.founder_bios}</p>
                </div>
              )}
              {detailArchivedApp.votes && detailArchivedApp.votes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Votes</h3>
                  <div className="space-y-2">
                    {detailArchivedApp.votes.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{getPartnerName(v.user_id).charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{getPartnerName(v.user_id)}</p>
                          {v.notes && <p className="text-sm text-gray-500">{v.notes}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getVoteBadgeStyle(v.vote)}`}>
                          {v.vote}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {detailArchivedApp.website && (
                  <a href={ensureProtocol(detailArchivedApp.website)} target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] hover:text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
                    Website
                  </a>
                )}
                {detailArchivedApp.deck_link && (
                  <a href={detailArchivedApp.deck_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm">
                    View Deck
                  </a>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Submitted</h3>
                <p className="text-gray-700">{formatDate(detailArchivedApp.submitted_at)}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setDetailArchivedApp(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* INVESTED SUCCESS MODAL */}
      {/* ============================================ */}
      {investedCompanyName && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Invested in {investedCompanyName}!
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                This is a demo, so {investedCompanyName} has been added to the Archive tab. In the real app, it would appear in your Portfolio.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  setInvestedCompanyName(null)
                  setActiveTab('archive')
                }}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-white hover:bg-black"
              >
                View in Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
