import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

// Fallback mock data that perfectly matches the design requested
const MOCK_REVIEWS = [
  {
    id: 1,
    rating: 5,
    service_type: 'TRACTOR RENTAL',
    comment: 'Super convenient service. Booked a Mahindra tractor for ploughing my 5-acre field. The owner delivered it on time and in perfect condition.',
    author_initials: 'RV',
    author_name: 'Rahul Verma',
    equipment_info: 'Mahindra 575 DI • Guntur'
  },
  {
    id: 2,
    rating: 5,
    service_type: 'HARVESTER RENTAL',
    comment: 'Booked a harvester during the peak season when local ones were unavailable. The process was completely transparent and saved my crop.',
    author_initials: 'SK',
    author_name: 'Sai Kiran',
    equipment_info: 'Kubota Harvester • Nizamabad'
  },
  {
    id: 3,
    rating: 5,
    service_type: 'ROTAVATOR RENTAL',
    comment: 'Renting equipment locally always felt sketchy with hidden charges. Agrirent was extremely transparent. The rotavator was attached and ready to use.',
    author_initials: 'VR',
    author_name: 'Vikram Reddy',
    equipment_info: 'Shaktiman Rotavator • Kurnool'
  },
  {
    id: 4,
    rating: 5,
    service_type: 'TRACTOR RENTAL',
    comment: 'The whole experience was seamless. Saved me a lot of money compared to buying new equipment. Highly professional owners.',
    author_initials: 'AK',
    author_name: 'Arun Kumar',
    equipment_info: 'John Deere 5310 • Warangal'
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
                    <span className="text-[10px] md:text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wide">
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
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
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
              <div className="absolute top-6 right-8 text-9xl text-primary/5 opacity-50 font-serif leading-none pointer-events-none select-none z-0">
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
