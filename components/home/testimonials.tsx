import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

// Fallback mock data that perfectly matches the design requested
const MOCK_REVIEWS = [
  {
    id: 1,
    rating: 5,
    service_type: 'GENERAL SERVICE',
    comment: 'Super convenient doorstep service. The mechanic changed the engine oil and adjusted the brakes right in my apartment parking lot. Very clean work!',
    author_initials: 'RV',
    author_name: 'Rahul Verma',
    equipment_info: 'Honda Activa 6G • Kondapur'
  },
  {
    id: 2,
    rating: 5,
    service_type: 'EMERGENCY REPAIR',
    comment: 'Broke down near Kukatpally and booked emergency service. The mechanic reached in 25 minutes and fixed the minor wiring issue immediately.',
    author_initials: 'SK',
    author_name: 'Sai Kiran',
    equipment_info: 'Bajaj Pulsar 150 • Kukatpally'
  },
  {
    id: 3,
    rating: 5,
    service_type: 'PERIODIC MAINTENANCE',
    comment: 'Regular servicing at local garages always felt sketchy. Motronx was extremely transparent. Showed me the genuine spare parts list before installing.',
    author_initials: 'VR',
    author_name: 'Vikram Reddy',
    equipment_info: 'Royal Enfield Classic 350 • Jubilee Hills'
  },
  {
    id: 4,
    rating: 5,
    service_type: 'GENERAL SERVICE',
    comment: 'The whole experience was seamless. Saved me a trip to the service center on a weekend. Highly professional and polite staff.',
    author_initials: 'AK',
    author_name: 'Arun Kumar',
    equipment_info: 'TVS Jupiter • Madhapur'
  }
]

export async function Testimonials() {
  const supabase = await createClient()

  let reviews = MOCK_REVIEWS
  
  try {
    // Attempt to fetch from Supabase (assuming a table named 'platform_reviews' is created)
    const { data, error } = await supabase
      .from('platform_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
    
    if (data && data.length > 0) {
      reviews = data
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
  }

  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center md:text-left">
          Trusted by thousands of customers
        </h2>
      </div>

      <div className="w-full overflow-hidden">
        {/* Horizontal scrolling container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12 px-4 md:px-6 xl:px-12 gap-6 items-stretch w-full scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="snap-start shrink-0 w-[340px] md:w-[400px] bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 md:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 md:h-5 md:w-5 ${i < (review.rating || 5) ? 'fill-[#ffc107] text-[#ffc107]' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  
                  {/* Service Badge */}
                  {review.service_type && (
                    <span className="text-[10px] md:text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wide">
                      {review.service_type}
                    </span>
                  )}
                </div>
                
                {/* Review Text */}
                <p className="text-gray-600 text-[15px] md:text-base leading-relaxed mb-8 relative z-10">
                  "{review.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div>
                <div className="w-full h-px bg-gray-100 mb-6" />
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-lg shrink-0">
                    {review.author_initials || review.author_name?.substring(0, 2).toUpperCase() || 'AN'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px] md:text-base">
                      {review.author_name}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500">
                      {review.equipment_info}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Quote mark in background */}
              <div className="absolute top-6 right-8 text-9xl text-red-50 opacity-50 font-serif leading-none pointer-events-none select-none z-0">
                "
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  )
}
