import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { CreditCard, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function PaymentsPage() {
  const user = await getCurrentUser()
  const adminSupabase = createAdminClient()

  // Fetch transactions and payments for the user
  const { data: transactions } = await adminSupabase
    .from('transactions')
    .select(`
      *,
      booking:booking_id(booking_number, equipment:equipment_id(title))
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const typedTransactions = transactions as any[] || []
  const totalPaid = typedTransactions.filter(t => t.transaction_type === 'payment').reduce((acc, t) => acc + Number(t.amount), 0)
  const totalRefunds = typedTransactions.filter(t => t.transaction_type === 'refund').reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment History</h1>
        <p className="text-gray-500 mt-1">View your transactions, deposits, and refunds.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-green-100 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalPaid.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Refunds</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalRefunds.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">All Transactions</h2>
        </div>
        
        {!transactions || transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No payment history yet</h3>
            <p className="text-gray-500">Your payments for rentals will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {typedTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 text-gray-600">{format(new Date(tx.created_at), 'MMM dd, yyyy h:mm a')}</td>
                    <td className="px-6 py-4">
                      {tx.booking ? (
                        <Link href={`/dashboard/user/bookings/${tx.booking_id}`} className="hover:underline">
                          <div className="font-medium text-gray-900">{tx.booking.equipment?.title}</div>
                          <div className="text-xs text-gray-500">{tx.booking.booking_number}</div>
                        </Link>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${tx.transaction_type === 'refund' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {tx.transaction_type}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.transaction_type === 'refund' ? 'text-blue-600' : 'text-gray-900'}`}>
                      {tx.transaction_type === 'refund' ? '+' : ''}₹{tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
