import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/dashboard/back-button'
import { IndianRupee, ChevronLeft, ChevronRight, User, Receipt, Calendar } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    page?: string
    type?: string
  }>
}

export default async function TransactionsPage(props: PageProps) {
  await requireRole('admin')
  
  const searchParams = await props.searchParams
  const currentPage = Math.max(1, Number(searchParams.page) || 1)
  const currentType = searchParams.type || 'all'
  const limit = 5

  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const { transactions, totalCount, totalPages } = await adminService.getTransactionsPaginated(
    currentPage,
    limit,
    currentType
  )

  const buildQueryUrl = (newPage: number, newType?: string) => {
    const params = new URLSearchParams()
    const targetPage = newPage
    const targetType = newType !== undefined ? newType : currentType

    if (targetPage > 1) params.set('page', targetPage.toString())
    if (targetType && targetType !== 'all') params.set('type', targetType)

    const qs = params.toString()
    return `/dashboard/admin/transactions${qs ? `?${qs}` : ''}`
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalCount)

  const typeTabs = [
    { label: 'All Transactions', value: 'all' },
    { label: 'Payments', value: 'payment' },
    { label: 'Refunds', value: 'refund' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      {/* Header */}
      <div>
        <BackButton href="/dashboard/admin" className="mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-100">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  Platform Transactions
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {totalCount}
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm font-medium">Monitor all financial movements, payments, and refunds.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {typeTabs.map((tab) => {
          const isActive = currentType === tab.value
          return (
            <Link
              key={tab.value}
              href={buildQueryUrl(1, tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!transactions || transactions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <IndianRupee className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No transactions found</h3>
            <p className="text-gray-500 mt-1 text-sm max-w-sm">No transaction records found matching your filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Mobile View: Stacked Card List (visible on mobile < md) */}
            <div className="divide-y divide-gray-100 md:hidden">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        tx.transaction_type === 'payment' ? 'bg-green-50 text-green-700 border-green-200' :
                        tx.transaction_type === 'refund' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {tx.transaction_type}
                      </Badge>
                      <span className="font-mono text-xs text-gray-400">#{tx.id.split('-')[0]}</span>
                    </div>
                    <div className={`text-lg font-extrabold ${
                      tx.transaction_type === 'payment' ? 'text-green-600' :
                      tx.transaction_type === 'refund' ? 'text-blue-600' :
                      'text-gray-900'
                    }`}>
                      {tx.transaction_type === 'refund' ? '-' : ''}₹{tx.amount}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900">{tx.user?.full_name || 'Unknown User'}</span>
                      </div>
                      {tx.user?.email && <span className="text-gray-400 truncate max-w-[150px]">{tx.user.email}</span>}
                    </div>

                    {tx.booking && (
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl text-gray-700">
                        <div className="flex items-center gap-1.5 truncate">
                          <Receipt className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium truncate">{tx.booking.equipment?.title || 'Equipment'}</span>
                        </div>
                        <span className="font-mono text-[10px] text-gray-400 shrink-0 ml-2">{tx.booking.booking_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-gray-400 pt-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-300" />
                    {format(new Date(tx.created_at), 'MMM dd, yyyy · hh:mm a')}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Data Table (visible on md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Booking Reference</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {tx.id.split('-')[0]}...
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-xs">
                        {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        {tx.user ? (
                          <div>
                            <div className="font-medium text-gray-900">{tx.user.full_name}</div>
                            <div className="text-xs text-gray-400">{tx.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {tx.booking ? (
                          <div>
                            <div className="font-medium text-gray-900">{tx.booking.equipment?.title}</div>
                            <div className="text-xs text-gray-400 font-mono">{tx.booking.booking_number}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize font-medium text-xs px-2.5 py-0.5 rounded-full border ${
                          tx.transaction_type === 'payment' ? 'bg-green-50 text-green-700 border-green-200' :
                          tx.transaction_type === 'refund' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {tx.transaction_type}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-sm ${
                        tx.transaction_type === 'payment' ? 'text-green-600' :
                        tx.transaction_type === 'refund' ? 'text-blue-600' :
                        'text-gray-900'
                      }`}>
                        {tx.transaction_type === 'refund' ? '-' : ''}₹{tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
              <span className="font-bold text-gray-800">{endItem}</span> of{' '}
              <span className="font-bold text-gray-800">{totalCount}</span> transactions
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                {currentPage > 1 ? (
                  <Link href={buildQueryUrl(currentPage - 1)}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium text-gray-600 hover:bg-white hover:text-green-700">
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium opacity-40">
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                  </Button>
                )}

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage
                    return (
                      <Link key={p} href={buildQueryUrl(p)}>
                        <button
                          className={`h-8 min-w-8 px-2 rounded-lg text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {p}
                        </button>
                      </Link>
                    )
                  })}
                </div>

                {/* Next Button */}
                {currentPage < totalPages ? (
                  <Link href={buildQueryUrl(currentPage + 1)}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium text-gray-600 hover:bg-white hover:text-green-700">
                      Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-medium opacity-40">
                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
