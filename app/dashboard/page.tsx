'use client'

import Link from 'next/link'
import {
  MOCK_APPLICATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_PORTFOLIO_STATS,
  MOCK_STATS,
  MOCK_VOTES,
  CURRENT_USER_ID,
} from '@/lib/mock-data'
import { formatCurrencyCompact, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  // Applications that need the current user's vote
  const needsVote = MOCK_APPLICATIONS.filter(app => {
    const userVote = MOCK_VOTES.find(v => v.application_id === app.id && v.user_id === CURRENT_USER_ID)
    return !userVote && (app.stage === 'new' || app.stage === 'voting')
  })

  // Applications in deliberation
  const needsDecision = MOCK_APPLICATIONS.filter(app => app.stage === 'deliberation')

  // Unread notifications
  const unreadNotifications = MOCK_NOTIFICATIONS.filter(n => !n.read)

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'new_application': return '📥'
      case 'vote_needed': return '⚡'
      case 'decision_needed': return '🤔'
      case 'investment_closed': return '🎉'
      default: return '🔔'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Demo Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">✨</span>
          <div>
            <p className="font-medium text-purple-900 text-sm sm:text-base">Welcome to the SAIF CRM Demo</p>
            <p className="text-xs sm:text-sm text-purple-700">
              This is a preview of the internal CRM used by SAIF Ventures to manage deal flow.
              All data shown is fictional.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5f5f5] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">📊</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Investments</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{MOCK_PORTFOLIO_STATS.totalInvestments}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">💰</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Invested</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrencyCompact(MOCK_PORTFOLIO_STATS.totalInvested)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">📝</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Avg Check</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrencyCompact(MOCK_PORTFOLIO_STATS.averageCheck)}</p>
          </div>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Needs Your Vote Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">⚡</span>
              <h2 className="font-semibold text-gray-900">Needs Your Vote</h2>
            </div>
            <span className="text-sm text-gray-400">{needsVote.length}</span>
          </div>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {needsVote.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">All caught up!</div>
            ) : (
              needsVote.map((app) => (
                <Link
                  key={app.id}
                  href="/pipeline"
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{app.company_name}</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(app.submitted_at)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {needsVote.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <Link href="/pipeline" className="text-sm text-gray-500 hover:text-gray-900">
                View all →
              </Link>
            </div>
          )}
        </section>

        {/* Needs Decision Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-600">🤔</span>
              <h2 className="font-semibold text-gray-900">Needs Decision</h2>
            </div>
            <span className="text-sm text-gray-400">{needsDecision.length}</span>
          </div>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {needsDecision.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">All decisions made!</div>
            ) : (
              needsDecision.map((app) => (
                <div
                  key={app.id}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{app.company_name}</span>
                    <span className="badge badge-warning">Deliberation</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🔔</span>
              <h2 className="font-semibold text-gray-900">Notifications</h2>
            </div>
            {unreadNotifications.length > 0 ? (
              <span className="text-sm text-blue-600 font-medium">{unreadNotifications.length} new</span>
            ) : (
              <span className="text-sm text-gray-400">{MOCK_NOTIFICATIONS.length}</span>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              MOCK_NOTIFICATIONS.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getNotificationIcon(notif.type)}</span>
                    <span className={`text-sm truncate ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Pipeline Stats */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-600">📈</span>
              <h2 className="font-semibold text-gray-900">Pipeline Stats</h2>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{MOCK_STATS.pipeline}</p>
              <p className="text-xs text-gray-500">In Review</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{MOCK_STATS.deliberation}</p>
              <p className="text-xs text-gray-500">Deliberation</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-700">{MOCK_STATS.invested}</p>
              <p className="text-xs text-gray-500">Invested</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{MOCK_STATS.rejected}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
