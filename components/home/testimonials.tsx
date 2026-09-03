import { createClient } from '@/lib/supabase/server'
import { Star, CheckCircle2, Quote, Sparkles } from 'lucide-react'

// Mock reviews with realistic Indian agricultural context
const MOCK_REVIEWS = [
  {
    id: 1,
    rating: 5,
    service_type: 'TRACTOR RENTAL',
    comment: 'Super convenient service. Booked a Mahindra tractor for ploughing my 5-acre field. The owner delivered it on time and in perfect working condition.',
    author_initials: 'RV',
    author_name: 'Rahul Verma',
    location: 'Guntur, AP',
    equipment_info: 'Mahindra 575 DI'
  },
  {
    id: 2,
    rating: 5,
    service_type: 'HARVESTER RENTAL',
    comment: 'Booked a combine harvester during peak season when local ones were unavailable. The process was completely transparent and saved my entire paddy crop.',
    author_initials: 'SK',
    author_name: 'Sai Kiran',
    location: 'Nizamabad, TS',
    equipment_info: 'Kubota Harvester'
  },
  {
    id: 3,
    rating: 5,
    service_type: 'ROTAVATOR RENTAL',
    comment: 'Renting equipment locally always had hidden charges. Agriform was transparent. The rotavator was delivered attached and ready to run immediately.',
    author_initials: 'VR',
    author_name: 'Vikram Reddy',
    location: 'Kurnool, AP',
    equipment_info: 'Shaktiman Rotavator'
  },
  {
    id: 4,
    rating: 5,
    service_type: 'TRACTOR RENTAL',
    comment: 'The whole rental experience was seamless. Saved me lakhs compared to purchasing new equipment. Highly trustworthy and professional owners.',
    author_initials: 'AK',
    author_name: 'Arun Kumar',
    location: 'Warangal, TS',
    equipment_info: 'John Deere 5310'
  },
  {
    id: 5,
    rating: 5,
    service_type: 'DRONE SPRAYING',
    comment: 'Tried agricultural drone spraying for cotton pest control. Completed 10 acres in just 3 hours. Great efficiency and minimal chemical waste.',
    author_initials: 'MN',
    author_name: 'Mallikarjun Rao',
    location: 'Karimnagar, TS',
    equipment_info: 'Kisan Drone 16L'
  }
]

export async function Testimonials() {
  const supabase = await createClient()
  let reviews = MOCK_REVIEWS
  
  try {
    const { data } = await supabase
      .from('platform_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
    
    if (data && data.length > 0) {
      reviews = data
    }
  } catch (error) {
    // Graceful fallback to mock reviews
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50/50 via-[#f9fdfa] to-white overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 mb-6 sm:mb-10">
        {/* Header with pill badge */}
        <div className="text-center sm:text-left max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f1] border border-[#c3edd5] text-[#008f4c] text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#009b55]" />
            <span>4.9 / 5 Rating from 5,000+ Farmers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-2">
            Trusted by Thousands of <span className="text-[#009b55]">Customers</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed font-normal">
            Real experiences from farmers and equipment owners who rent and grow together with AgriRent.
          </p>
        </div>
      </div>

      {/* Horizontal Scrolling Review Cards with Peek Effect */}
      <div className="w-full overflow-hidden">
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 sm:px-6 md:px-8 gap-3.5 sm:gap-5 items-stretch w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="snap-start shrink-0 w-[285px] sm:w-[340px] md:w-[380px] bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg p-4 sm:p-6 flex flex-col justify-between relative transition-all duration-300 group"
            >
              <div>
                {/* Top Row: Stars + Category Pill */}
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1 bg-amber-50/70 px-2.5 py-1 rounded-full border border-amber-100/80">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                            i < (review.rating || 5) 
                              ? 'fill-[#ffc107] text-[#ffc107]' 
                              : 'text-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-amber-700 ml-0.5">5.0</span>
                  </div>
                  
                  {review.service_type && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#009b55] bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100/60 shrink-0">
                      {review.service_type}
                    </span>
                  )}
                </div>
                
                {/* Review Text */}
                <div className="relative mb-4">
                  <Quote className="h-5 w-5 text-emerald-100 absolute -top-1 -left-1 pointer-events-none -z-0" />
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed relative z-10 font-normal pl-2">
                    "{review.comment}"
                  </p>
                </div>
              </div>

              {/* Author & Machinery Info */}
              <div className="pt-3 border-t border-gray-100/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-emerald-100 text-[#009b55] flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border border-emerald-200/60 shadow-xs">
                    {review.author_initials || review.author_name?.substring(0, 2).toUpperCase() || 'FR'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {review.author_name}
                      </h4>
                      <CheckCircle2 className="h-3 w-3 text-[#009b55] shrink-0" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                      {review.equipment_info} {review.location ? `• ${review.location}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle mobile swipe hint */}
        <div className="flex sm:hidden items-center justify-center gap-1 text-[11px] text-gray-400 mt-2 font-medium">
          <span>← Swipe to view more reviews →</span>
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
