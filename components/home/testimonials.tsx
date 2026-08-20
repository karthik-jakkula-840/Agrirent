import { createClient } from '@/lib/supabase/server'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'

export async function Testimonials() {
  const supabase = await createClient()

  let reviews: any[] = []
  try {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url:profile_image, role)')
      .limit(6)
    
    if (data) {
      reviews = data
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
  }

  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Trusted by Farmers Across India
          </h2>
          <p className="text-lg text-gray-600">
            Don't just take our word for it. Hear what our community has to say about renting with Agriform.
          </p>
        </div>

        {reviews.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map((review, index) => (
                <CarouselItem key={review.id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-1 text-secondary mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < (review.rating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-8 flex-1 italic">
                      "{review.comment || 'Great experience renting equipment through this platform. Highly recommended!'}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                        {review.profiles?.avatar_url ? (
                          <div className="relative w-full h-full">
                            <Image src={review.profiles.avatar_url} alt="User" fill sizes="48px" className="object-cover" />
                          </div>
                        ) : (
                          (review.profiles?.first_name?.[0] || 'A')
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {review.profiles?.first_name} {review.profiles?.last_name}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">{review.profiles?.role || 'Customer'}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-12 relative">
              <CarouselPrevious className="position-relative translate-y-0 left-0 hover:bg-primary hover:text-white border-gray-200" />
              <CarouselNext className="position-relative translate-y-0 right-0 hover:bg-primary hover:text-white border-gray-200" />
            </div>
          </Carousel>
        ) : (
          <div className="max-w-2xl mx-auto bg-white border border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">
              Our community is growing. Be the first to rent equipment and share your experience!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
