import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { BookingService } from '@/services/booking.service'
import { Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

export const metadata = {
  title: 'Reviews | Owner Portal | Agriform',
}

export default async function OwnerReviewsPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Note: we fetch reviews where equipment owner_id = user.id
  // We can do an inner join with equipment
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      equipment:equipment_id!inner(title, owner_id),
      customer:customer_id(full_name, avatar_url:profile_image)
    `)
    .eq('equipment.owner_id', user!.id)
    .order('created_at', { ascending: false })

  let averageRating = 0
  let totalReviews = reviews?.length || 0
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  if (totalReviews > 0) {
    let sum = 0
    reviews?.forEach((r: any) => {
      sum += r.rating
      // @ts-ignore
      if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++
    })
    averageRating = Number((sum / totalReviews).toFixed(1))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Equipment Reviews</h1>
        <p className="text-gray-500 mt-1">Feedback from customers who rented your equipment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex text-amber-400 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-5 w-5 ${i <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200'}`} />
            ))}
          </div>
          <p className="text-gray-500 text-sm">Based on {totalReviews} reviews</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            // @ts-ignore
            const count = ratingCounts[stars]
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            
            return (
              <div key={stars} className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 w-12 text-gray-600 font-medium">
                  {stars} <Star className="h-4 w-4 text-amber-400 fill-current" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <div className="w-10 text-right text-gray-500">{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        {(!reviews || reviews.length === 0) ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Customers will be prompted to leave a review after their rental period ends.
            </p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 relative overflow-hidden border border-gray-200">
                    {review.customer?.avatar_url ? (
                      <Image src={review.customer.avatar_url} alt={review.customer.full_name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-bold">
                        {review.customer?.full_name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.customer?.full_name}</h4>
                    <p className="text-xs text-gray-500">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <div className="mb-3 text-sm font-medium text-primary bg-primary/10 inline-block px-2 py-1 rounded-md">
                Equipment: {review.equipment?.title}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
