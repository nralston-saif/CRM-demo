'use client'

import { useState, useMemo } from 'react'
import { MOCK_INVESTMENTS, MOCK_PORTFOLIO_STATS } from '@/lib/mock-data'
import type { Investment } from '@/lib/types'
import { formatCurrency, formatCurrencyCompact, formatDate, ensureProtocol, getMonthKey, formatMonthLabel } from '@/lib/utils'

type SortOption = 'date-newest' | 'date-oldest' | 'name-az' | 'name-za' | 'amount-high' | 'amount-low'

export default function PortfolioPage() {
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('date-newest')

  // Filter and sort investments
  const filteredInvestments = useMemo(() => {
    let filtered = MOCK_INVESTMENTS

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(inv =>
        inv.company_name.toLowerCase().includes(query) ||
        inv.founders.some(f => f.name.toLowerCase().includes(query)) ||
        (inv.short_description?.toLowerCase().includes(query))
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'date-newest':
          return new Date(b.investment_date).getTime() - new Date(a.investment_date).getTime()
        case 'date-oldest':
          return new Date(a.investment_date).getTime() - new Date(b.investment_date).getTime()
        case 'name-az':
          return a.company_name.localeCompare(b.company_name)
        case 'name-za':
          return b.company_name.localeCompare(a.company_name)
        case 'amount-high':
          return b.amount - a.amount
        case 'amount-low':
          return a.amount - b.amount
        default:
          return 0
      }
    })

    return sorted
  }, [searchQuery, sortOption])

  // Calculate investments by month
  const investmentsByMonth: Record<string, { count: number; amount: number; label: string; companies: string[] }> = {}
  MOCK_INVESTMENTS.forEach(inv => {
    const key = getMonthKey(inv.investment_date)
    const label = formatMonthLabel(key)

    if (!investmentsByMonth[key]) {
      investmentsByMonth[key] = { count: 0, amount: 0, label, companies: [] }
    }
    investmentsByMonth[key].count++
    investmentsByMonth[key].amount += inv.amount
    investmentsByMonth[key].companies.push(inv.company_name)
  })

  // Sort months chronologically and take last 6
  const sortedMonths = Object.entries(investmentsByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)

  const maxMonthlyAmount = Math.max(...sortedMonths.map(([, data]) => data.amount), 1)
  const maxMonthlyCount = Math.max(...sortedMonths.map(([, data]) => data.count), 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Track and manage your investments
        </p>
      </div>

      {/* Dashboard */}
      <div className="mb-4 sm:mb-8">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {/* Total Investments */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5f5f5] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Investments</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{MOCK_PORTFOLIO_STATS.totalInvestments}</p>
              </div>
            </div>
          </div>

          {/* Total Invested */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Invested</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrencyCompact(MOCK_PORTFOLIO_STATS.totalInvested)}</p>
              </div>
            </div>
          </div>

          {/* Average Check */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📝</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Avg Check</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrencyCompact(MOCK_PORTFOLIO_STATS.averageCheck)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        {sortedMonths.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                Activity
              </h3>
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#1a1a1a] rounded"></div>
                  <span className="hidden sm:inline">Amount</span>
                  <span className="sm:hidden">$</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
                  <span className="hidden sm:inline">Count</span>
                  <span className="sm:hidden">#</span>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-2 sm:gap-4 h-28 sm:h-40">
              {sortedMonths.map(([key, data]) => (
                <div key={key} className="flex-1 flex flex-col items-center group relative">
                  {/* Bar container */}
                  <div className="relative w-full h-20 sm:h-32 flex items-end justify-center gap-0.5 sm:gap-1">
                    {/* Amount bar */}
                    <div
                      className="w-3 sm:w-5 bg-[#1a1a1a] rounded-t transition-all group-hover:bg-gray-700"
                      style={{
                        height: `${Math.max((data.amount / maxMonthlyAmount) * 100, 4)}%`,
                      }}
                    />
                    {/* Count indicator */}
                    <div
                      className="w-3 sm:w-5 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
                      style={{
                        height: `${Math.max((data.count / maxMonthlyCount) * 100, 4)}%`,
                      }}
                    />
                  </div>

                  {/* Tooltip on hover - hidden on mobile */}
                  <div className="hidden sm:block opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-opacity pointer-events-none z-10 min-w-[180px]">
                    <p className="font-semibold text-sm border-b border-gray-700 pb-1 mb-2">{data.label}</p>
                    <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                      {data.companies.map((company, idx) => (
                        <p key={idx} className="text-gray-300">• {company}</p>
                      ))}
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <p className="font-medium">{formatCurrency(data.amount)} total</p>
                      <p className="text-gray-400">{data.count} investment{data.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Month label */}
                  <div className="mt-2 sm:mt-3 text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-gray-700">
                      {data.label.split(' ')[0].slice(0, 3)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500">6 Mo Total: </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrencyCompact(sortedMonths.reduce((sum, [, d]) => sum + d.amount, 0))}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {sortedMonths.reduce((sum, [, d]) => sum + d.count, 0)}
                </span>
                <span className="text-gray-500"> investments</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input !pl-10 sm:!pl-11 text-sm sm:text-base"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-56">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="input text-sm sm:text-base"
            >
              <option value="date-newest">Newest First</option>
              <option value="date-oldest">Oldest First</option>
              <option value="name-az">Name (A-Z)</option>
              <option value="name-za">Name (Z-A)</option>
              <option value="amount-high">Amount (High)</option>
              <option value="amount-low">Amount (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investment Grid */}
      {filteredInvestments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-gray-500">No investments match your search.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInvestments.map((investment) => (
            <div
              key={investment.id}
              onClick={() => setSelectedInvestment(investment)}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {/* Company Logo Placeholder */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-lg font-bold text-gray-400">
                      {investment.company_name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {investment.company_name}
                    </h3>
                    {investment.founders.length > 0 && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                        {investment.founders.map(f => f.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {investment.short_description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {investment.short_description}
                  </p>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(investment.amount)}
                    </span>
                  </div>
                  {(investment.type || investment.round) && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Round</span>
                      <span className="text-gray-700 font-medium">
                        {[investment.round, investment.type?.toUpperCase()].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}
                  {investment.post_money_valuation && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Cap</span>
                      <span className="text-gray-700 font-medium">
                        {formatCurrencyCompact(investment.post_money_valuation)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-700">
                      {formatDate(investment.investment_date)}
                    </span>
                  </div>
                </div>

                {/* Links */}
                {investment.website && (
                  <div className="mt-3 sm:mt-4">
                    <a
                      href={ensureProtocol(investment.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#1a1a1a] hover:text-black underline"
                    >
                      <span>🌐</span> Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Investment Detail Modal */}
      {selectedInvestment && (
        <div className="modal-backdrop" onClick={() => setSelectedInvestment(null)}>
          <div
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedInvestment.company_name}
                  </h2>
                  {selectedInvestment.founders.length > 0 && (
                    <p className="text-gray-500 mt-1">
                      {selectedInvestment.founders.map(f => f.name).join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedInvestment(null)}
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
              {selectedInvestment.short_description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">{selectedInvestment.short_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Investment Amount
                  </h3>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedInvestment.amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Investment Date
                  </h3>
                  <p className="text-xl font-bold text-gray-900">{formatDate(selectedInvestment.investment_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedInvestment.round && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Round
                    </h3>
                    <p className="text-gray-700">{selectedInvestment.round}</p>
                  </div>
                )}
                {selectedInvestment.type && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Type
                    </h3>
                    <p className="text-gray-700">{selectedInvestment.type.toUpperCase()}</p>
                  </div>
                )}
              </div>

              {selectedInvestment.post_money_valuation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Post-Money Valuation / Cap
                  </h3>
                  <p className="text-gray-700">{formatCurrency(selectedInvestment.post_money_valuation)}</p>
                </div>
              )}

              {selectedInvestment.founders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Founders
                  </h3>
                  <div className="space-y-2">
                    {selectedInvestment.founders.map((founder, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {founder.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{founder.name}</p>
                          {founder.title && <p className="text-sm text-gray-500">{founder.title}</p>}
                          {founder.email && (
                            <a href={`mailto:${founder.email}`} className="text-sm text-blue-600 hover:underline">
                              {founder.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInvestment.website && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Website
                  </h3>
                  <a
                    href={ensureProtocol(selectedInvestment.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedInvestment.website}
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedInvestment(null)}
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
