import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { CreditCard, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = {
  title: 'Payments | Owner Portal | Agriform',
}

export default async function OwnerPaymentsPage() {
  const user = await getCurrentUser()
  const adminSupabase = createAdminClient()

  // Note: For real payment integration, we would use a PaymentService
  // Since we haven't built Razorpay/Stripe yet, we use the transactions table
  const { data: transactions } = await adminSupabase
    .from('transactions')
    .select(`
      *,
      booking!inner (
        id, 
        owner_id,
        equipment:equipment_id(title),
        customer:customer_id(full_name)
      )
    `)
    .eq('booking.owner_id', user!.id)
    .order('created_at', { ascending: false })

  // Calculate aggregates
  let totalPaid = 0
  let pending = 0
  let refunded = 0

  transactions?.forEach((t: any) => {
    if (t.transaction_type === 'payment') {
      totalPaid += Number(t.amount)
    } else if (t.transaction_type === 'refund') {
      refunded += Number(t.amount)
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments & Earnings</h1>
        <p className="text-gray-500 mt-1">Track your transactions and payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">₹{pending.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <RotateCcw className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Refunded</p>
            <p className="text-2xl font-bold text-gray-900">₹{refunded.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
        </div>
        
        {!transactions || transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions yet</h3>
            <p className="text-gray-500">Your payments will appear here once customers book your equipment.</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {tx.booking?.equipment?.title || 'Equipment Rental'}
                      </h4>
                      <p className="text-xs text-gray-500">Customer: {tx.booking?.customer?.full_name || 'Customer'}</p>
                    </div>
                    <span className={`font-bold text-base ${tx.transaction_type === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.transaction_type === 'refund' ? '-' : '+'}₹{tx.amount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl">
                    <span className="font-mono text-[11px] text-gray-400">ID: {tx.id.split('-')[0]}...</span>
                    <span>{format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-green-100 text-green-700">
                      Completed
                    </span>
                    {tx.booking_id && (
                      <span className="text-[11px] text-gray-400 font-mono">
                        Booking: {tx.booking_id.split('-')[0]}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Booking / Equipment</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">
                        {tx.id.split('-')[0]}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tx.booking?.equipment?.title || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 font-mono">Booking: {tx.booking_id?.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {tx.booking?.customer?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-green-100 text-green-700`}>
                          Completed
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold text-right ${tx.transaction_type === 'refund' ? 'text-red-600' : 'text-primary'}`}>
                        {tx.transaction_type === 'refund' ? '-' : '+'}₹{tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
