import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { AdminService } from '@/services/admin.service'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/dashboard/back-button'
import { Star } from 'lucide-react'

export default async function ReviewsPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  const adminService = new AdminService(supabase)
  
  const reviews = await adminService.getAllReviews()

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-4">
      <div>
        <BackButton href="/dashboard/admin" className="mb-6" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-100">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Reviews Moderation
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Review customer feedback and manage disputes.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!reviews || reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No reviews found.</div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {reviews.map((review: any) => (
                <div key={review.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{review.equipment?.title || 'Unknown Equipment'}</h4>
                      <p className="text-xs text-gray-500">By {review.customer?.full_name || 'Customer'}</p>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                      <span className="font-bold text-yellow-700 text-xs mr-1">{review.rating}</span>
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    {review.review || <span className="text-gray-400 italic">No review text</span>}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0.5 ${
                      review.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {review.is_published ? 'Published' : 'Hidden'}
                    </Badge>
                    <span className="text-[11px] text-gray-400">
                      {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Equipment</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Review Text</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((review: any) => (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {review.equipment?.title || 'Unknown Equipment'}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {review.customer?.full_name || 'Unknown Customer'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-bold text-yellow-600 mr-1">{review.rating}</span>
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={review.review}>
                        {review.review || <span className="text-gray-400 italic">No text provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize ${
                          review.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {review.is_published ? 'Published' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-right">
                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
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
