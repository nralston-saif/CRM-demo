'use client'

import { useState, useMemo } from 'react'
import {
  MOCK_APPLICATIONS,
  MOCK_VOTES,
  MOCK_PARTNERS,
  CURRENT_USER_ID,
} from '@/lib/mock-data'
import type { Application, Vote, VoteValue } from '@/lib/types'
import { useToast } from '@/components/Toast'
import { formatDate, formatFounderNames, ensureProtocol } from '@/lib/utils'

export default function PipelinePage() {
  const { showToast } = useToast()

  // Local state for votes (simulating database)
  const [localVotes, setLocalVotes] = useState<Vote[]>(MOCK_VOTES)

  // Modal state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [detailApp, setDetailApp] = useState<Application | null>(null)
  const [vote, setVote] = useState<VoteValue | ''>('')
  const [notes, setNotes] = useState('')

  // Get all applications with their vote data
  const applicationsWithVotes = useMemo(() => {
    return MOCK_APPLICATIONS.filter(app => app.stage === 'new' || app.stage === 'voting').map(app => {
      const appVotes = localVotes.filter(v => v.application_id === app.id)
      const userVote = appVotes.find(v => v.user_id === CURRENT_USER_ID) || null

      return {
        ...app,
        votes: appVotes,
        userVote,
        voteCount: appVotes.length,
      }
    })
  }, [localVotes])

  // Split into sections
  const needsYourVote = applicationsWithVotes.filter(app => !app.userVote)
  const alreadyVoted = applicationsWithVotes.filter(app => app.userVote)

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
      // Remove existing vote if editing
      const filtered = prev.filter(
        v => !(v.application_id === selectedApp.id && v.user_id === CURRENT_USER_ID)
      )
      return [...filtered, newVote]
    })

    setSelectedApp(null)
    setVote('')
    setNotes('')
    showToast('Vote recorded! In the full CRM, this would notify other partners.', 'success')
  }

  const openVoteModal = (app: Application & { userVote: Vote | null }) => {
    setSelectedApp(app)
    setVote(app.userVote?.vote || '')
    setNotes(app.userVote?.notes || '')
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

  const getVoteBadgeStyle = (voteValue: string) => {
    switch (voteValue) {
      case 'yes': return 'badge-success'
      case 'maybe': return 'badge-warning'
      case 'no': return 'badge-danger'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPartnerName = (userId: string) => {
    return MOCK_PARTNERS.find(p => p.id === userId)?.name || 'Unknown'
  }

  const renderApplicationCard = (app: Application & { votes: Vote[], userVote: Vote | null, voteCount: number }) => {
    const allVotesIn = app.voteCount >= 3

    return (
      <div
        key={app.id}
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer"
        onClick={() => setDetailApp(app)}
      >
        {/* Card Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {app.company_name}
              </h3>
              {app.founder_names && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{formatFounderNames(app.founder_names)}</p>
              )}
            </div>
            {app.userVote && (
              <span className={`badge text-xs ${getVoteBadgeStyle(app.userVote.vote)}`}>
                {app.userVote.vote}
              </span>
            )}
          </div>

          {app.company_description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
              {app.company_description}
            </p>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {app.website && (
              <a
                href={ensureProtocol(app.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#1a1a1a] hover:text-black bg-[#f5f5f5] hover:bg-[#e5e5e5] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span>🌐</span> Website
              </a>
            )}
            {app.deck_link && (
              <a
                href={app.deck_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span>📊</span> Deck
              </a>
            )}
          </div>

          {/* Vote Status - Show who has voted */}
          {app.voteCount > 0 && !allVotesIn && (
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{app.voteCount}/3</span> partners have voted
              </p>
              <div className="flex flex-wrap gap-2">
                {app.votes.map((v, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-sm bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    <span className="w-2 h-2 bg-[#1a1a1a] rounded-full"></span>
                    {getPartnerName(v.user_id)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Revealed Votes - Show when all 3 have voted */}
          {allVotesIn && (
            <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-600">✓</span>
                <p className="text-sm font-medium text-emerald-800">All 3 partners have voted!</p>
              </div>
              <div className="grid gap-3">
                {app.votes.map((v, i) => (
                  <div key={i} className="bg-white rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {getPartnerName(v.user_id).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{getPartnerName(v.user_id)}</p>
                      </div>
                      <span className={`badge ${getVoteBadgeStyle(v.vote)}`}>
                        {v.vote}
                      </span>
                    </div>
                    {v.notes && (
                      <p className="text-sm text-gray-600 mt-2 ml-11">{v.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Vote Progress */}
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`vote-dot ${
                      i < app.voteCount ? 'vote-dot-yes' : 'vote-dot-empty'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                {app.voteCount}/3
              </span>
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openVoteModal(app)
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  app.userVote
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-[#1a1a1a] text-white hover:bg-black shadow-sm'
                }`}
              >
                {app.userVote ? 'Edit' : 'Vote'}
              </button>

              {allVotesIn && (
                <span className="hidden sm:inline-block px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700">
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pipeline</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              {applicationsWithVotes.length} application{applicationsWithVotes.length !== 1 ? 's' : ''} in review
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#f5f5f5] px-4 py-2 rounded-lg">
            <span className="text-[#1a1a1a] font-medium">3 votes needed</span>
            <span className="text-[#666666]">to advance</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl">💡</span>
          <div>
            <p className="font-medium text-blue-900 text-sm sm:text-base">Demo Mode: Single-User Voting</p>
            <p className="text-xs sm:text-sm text-blue-700">
              In the full CRM, votes are hidden until all 3 partners vote.
              Here, you can vote and see results immediately.
            </p>
          </div>
        </div>
      </div>

      {applicationsWithVotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications in pipeline</h3>
          <p className="text-gray-500">New applications will appear here when submitted.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-10">
          {/* Needs Your Vote Section */}
          {needsYourVote.length > 0 && (
            <section>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg">
                  <span className="text-amber-600 text-base sm:text-lg">⚡</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Needs Your Vote
                  <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-normal text-gray-500">
                    ({needsYourVote.length})
                  </span>
                </h2>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {needsYourVote.map((app) => renderApplicationCard(app))}
              </div>
            </section>
          )}

          {/* Already Voted Section */}
          {alreadyVoted.length > 0 && (
            <section>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg">
                  <span className="text-emerald-600 text-base sm:text-lg">✓</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  You&apos;ve Voted
                  <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-normal text-gray-500">
                    ({alreadyVoted.length})
                  </span>
                </h2>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {alreadyVoted.map((app) => renderApplicationCard(app))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Vote Modal */}
      {selectedApp && (
        <div className="modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedApp.company_name}
                  </h2>
                  {selectedApp.founder_names && (
                    <p className="text-gray-500 mt-1">{formatFounderNames(selectedApp.founder_names)}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 -m-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Company Description */}
              {selectedApp.company_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Company Description
                  </h3>
                  <p className="text-gray-700">{selectedApp.company_description}</p>
                </div>
              )}

              {/* Founder Bios */}
              {selectedApp.founder_bios && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Founder Bios
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.founder_bios}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {selectedApp.website && (
                  <a
                    href={ensureProtocol(selectedApp.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#1a1a1a] hover:text-black underline"
                  >
                    <span>🌐</span> {selectedApp.website}
                  </a>
                )}
                {selectedApp.deck_link && (
                  <a
                    href={selectedApp.deck_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <span>📊</span> View Deck
                  </a>
                )}
              </div>

              {/* Vote Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Your Vote
                </h3>
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

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="Share your thoughts on this application..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setVote('')
                  setNotes('')
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleVoteSubmit}
                disabled={!vote}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Submit Vote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {detailApp && (
        <div className="modal-backdrop" onClick={() => setDetailApp(null)}>
          <div
            className="modal-content max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detailApp.company_name}
                  </h2>
                  {detailApp.founder_names && (
                    <p className="text-gray-500 mt-1">{formatFounderNames(detailApp.founder_names)}</p>
                  )}
                </div>
                <button
                  onClick={() => setDetailApp(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 -m-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {detailApp.company_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Company Description
                  </h3>
                  <p className="text-gray-700">{detailApp.company_description}</p>
                </div>
              )}

              {detailApp.founder_bios && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Founder Bios
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{detailApp.founder_bios}</p>
                </div>
              )}

              {detailApp.previous_funding && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Previous Funding
                  </h3>
                  <p className="text-gray-700">{detailApp.previous_funding}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {detailApp.website && (
                  <a
                    href={ensureProtocol(detailApp.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#1a1a1a] hover:text-black bg-[#f5f5f5] hover:bg-[#e5e5e5] px-4 py-2 rounded-lg"
                  >
                    <span>🌐</span> Website
                  </a>
                )}
                {detailApp.deck_link && (
                  <a
                    href={detailApp.deck_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg"
                  >
                    <span>📊</span> View Deck
                  </a>
                )}
                {detailApp.primary_email && (
                  <a
                    href={`mailto:${detailApp.primary_email}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
                  >
                    <span>✉️</span> {detailApp.primary_email}
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Submitted
                </h3>
                <p className="text-gray-700">{formatDate(detailApp.submitted_at)}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setDetailApp(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
