'use client'

import { useReviews, useCreateReview } from '@/hooks/use-reviews'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function ReviewsSection({ equipmentId }: { equipmentId: string }) {
  const { data: reviews, isLoading } = useReviews(equipmentId)
  const { mutateAsync: createReview, isPending } = useCreateReview()
  
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error('Please enter a review comment')
      return
    }

    try {
      await createReview({ equipment_id: equipmentId, rating, comment })
      toast.success('Review submitted successfully!')
      setComment('')
      setRating(5)
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review. You must have a completed booking.')
    }
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Rate your experience</h3>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star className={`h-8 w-8 transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <Textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience with this equipment..."
            className="mb-4 bg-white"
            rows={4}
          />
          <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-white">
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Review'}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : reviews?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to rent and review this equipment!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews?.map((review: any) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {review.customer?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.customer?.full_name || 'Anonymous User'}</div>
                    <div className="text-xs text-gray-500">{format(new Date(review.created_at), 'MMMM d, yyyy')}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mt-3">{review.review}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
