import { createClient } from '@/lib/supabase/server'
import { EquipmentCard } from '@/components/equipment/equipment-card'
import { SearchX } from 'lucide-react'

export async function FeaturedEquipment() {
  const supabase = await createClient()

  // Fetch featured equipment from DB
  let equipment: any[] = []
  try {
    const { data } = await supabase
      .from('equipment')
      .select('*, profiles(first_name, last_name, is_verified)')
      .eq('is_active', true)
      .limit(4)
      
    if (data && data.length > 0) {
      equipment = data
    } else {
      // Use fallback data for presentation if DB is empty
      equipment = [
        {
          id: 'mock-1',
          name: 'Mahindra 575 DI Tractor',
          category: 'Tractors',
          price_per_day: 2500,
          price_per_hour: 500,
          rating: 4.8,
          location: 'Hyderabad, Telangana',
          images: ['/mock_tractor.jpg'],
          is_available: true,
          profiles: { first_name: 'Rahul', last_name: 'Reddy', is_verified: true }
        },
        {
          id: 'mock-2',
          name: 'Swaraj 744 FE Harvester',
          category: 'Harvesters',
          price_per_day: 4000,
          rating: 4.9,
          location: 'Warangal, Telangana',
          images: ['/mock_harvester.jpg'],
          is_available: true,
          profiles: { first_name: 'Venkat', last_name: 'Rao', is_verified: true }
        },
        {
          id: 'mock-3',
          name: 'John Deere Rotavator',
          category: 'Tillage',
          price_per_day: 1200,
          price_per_hour: 200,
          rating: 4.7,
          location: 'Nizamabad, Telangana',
          images: ['/mock_rotavator.jpg'],
          is_available: false,
          profiles: { first_name: 'Anil', last_name: 'Kumar', is_verified: true }
        },
        {
          id: 'mock-4',
          name: 'Heavy Duty Trailer 5T',
          category: 'Trailers',
          price_per_day: 800,
          rating: 4.5,
          location: 'Karimnagar, Telangana',
          images: ['/mock_trailer.jpg'],
          is_available: true,
          profiles: { first_name: 'Srinivas', last_name: 'Goud', is_verified: false }
        }
      ]
    }
  } catch (error) {
    // Handle table missing or errors gracefully
    console.error('Failed to fetch equipment:', error)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Featured Equipment
            </h2>
            <p className="text-lg text-gray-600">
              Top-rated agricultural machinery available for rent near you right now.
            </p>
          </div>
        </div>

        {equipment.length > 0 ? (
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 gap-6 snap-x snap-mandatory">
            {equipment.map((item) => (
              <div key={item.id} className="w-[280px] min-w-[280px] max-w-[85vw] sm:w-auto sm:min-w-0 sm:max-w-none snap-start shrink-0">
                <EquipmentCard
                  id={item.id}
                  name={item.name}
                  ownerName={`${item.profiles?.first_name || 'Verified'} ${item.profiles?.last_name || 'Owner'}`}
                  categoryName={item.category || 'Machinery'}
                  pricePerDay={item.price_per_day}
                  pricePerHour={item.price_per_hour}
                  rating={item.rating || 5.0}
                  location={item.location || 'India'}
                  imageUrl={item.images?.[0] || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=800&auto=format&fit=crop'}
                  isAvailable={item.is_available ?? true}
                  isVerifiedOwner={item.profiles?.is_verified ?? true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <SearchX className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No equipment available yet</h3>
            <p className="text-gray-500 max-w-md">
              We are currently onboarding verified owners in your area. Check back soon for high-quality agricultural equipment!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
