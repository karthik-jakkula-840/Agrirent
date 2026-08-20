import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, IndianRupee } from 'lucide-react'

export default async function TransactionsPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const transactions = await adminService.getAllTransactions()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/admin" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <IndianRupee className="h-8 w-8 text-emerald-600" /> Platform Transactions
        </h1>
        <p className="text-gray-500 mt-1">Monitor all financial movements, payments, and refunds.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!transactions || transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Booking Reference</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {tx.id.split('-')[0]}...
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      {tx.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{tx.user.full_name}</div>
                          <div className="text-xs text-gray-500">{tx.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {tx.booking ? (
                        <div>
                          <div className="font-medium text-gray-900">{tx.booking.equipment?.title}</div>
                          <div className="text-xs text-gray-500">{tx.booking.booking_number}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${
                        tx.transaction_type === 'payment' ? 'bg-green-50 text-green-700 border-green-200' :
                        tx.transaction_type === 'refund' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {tx.transaction_type}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
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
        )}
      </div>
    </div>
  )
}
