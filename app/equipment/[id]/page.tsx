import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EquipmentService } from '@/services/equipment.service'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ImageGallery } from '@/components/equipment/shared/image-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Clock, Zap, CheckCircle2, Shield, Heart } from 'lucide-react'
import { BookingModal } from '@/components/equipment/marketplace/booking-modal'
import { ReviewsSection } from '@/components/equipment/marketplace/reviews-section'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const equipmentService = new EquipmentService(supabase)
  
  try {
    const equipment = await equipmentService.getEquipmentById(id)
    return {
      title: `${equipment.title} | Agriform`,
      description: equipment.description?.substring(0, 160) || 'Rent agricultural equipment on Agriform.',
      openGraph: {
        title: `${equipment.title} | Agriform`,
        description: equipment.description?.substring(0, 160) || 'Rent agricultural equipment on Agriform.',
        url: `https://agriform.in/equipment/${id}`,
        images: equipment.equipment_images?.length > 0 ? [{ url: equipment.equipment_images[0].image_url }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${equipment.title} | Agriform`,
        description: equipment.description?.substring(0, 160) || 'Rent agricultural equipment on Agriform.',
        images: equipment.equipment_images?.length > 0 ? [equipment.equipment_images[0].image_url] : [],
      }
    }
  } catch (error) {
    // Check if it's a mock ID for metadata too
    if (id.startsWith('mock-')) {
      return {
        title: 'Mock Equipment | Agriform',
        description: 'Rent agricultural equipment on Agriform.',
      }
    }
    return { title: 'Equipment Not Found | Agriform' }
  }
}

export default async function EquipmentDetailsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const equipmentService = new EquipmentService(supabase)
  
  let equipment: any
  
  if (id.startsWith('mock-')) {
    equipment = {
      id,
      title: 'Mock Agricultural Equipment',
      description: 'This is a high-quality piece of agricultural equipment available for rent. Perfect for your farming needs. Features excellent fuel efficiency and robust build quality.',
      equipment_images: [{ image_url: id === 'mock-1' ? '/mock_tractor.jpg' : id === 'mock-2' ? '/mock_harvester.jpg' : id === 'mock-3' ? '/mock_rotavator.jpg' : '/mock_trailer.jpg' }],
      owner_id: 'mock-owner',
      status: 'approved',
      categories: { name: 'Machinery' },
      brand: 'Premium Brand',
      model: 'Pro Series 2024',
      year: 2024,
      horsepower: 50,
      working_hours: 120,
      fuel_type: 'diesel',
      location: 'Hyderabad',
      district: 'Telangana',
      daily_price: id === 'mock-1' ? 2500 : id === 'mock-2' ? 4000 : id === 'mock-3' ? 1200 : 800,
      hourly_price: id === 'mock-1' ? 500 : null,
      deposit: 5000,
      availability: 'available',
      insurance_status: 'insured',
      profiles: { full_name: 'Verified Owner' }
    }
  } else {
    try {
      equipment = await equipmentService.getEquipmentById(id)
    } catch (error) {
      notFound()
    }
  }

  const { data: { session } } = await supabase.auth.getSession()
  const isOwnerOfEquipment = session?.user?.id === equipment.owner_id

  // Ensure public visibility rules
  if (equipment.status !== 'approved') {
    let isAllowed = false
    
    if (session) {
      if (isOwnerOfEquipment) {
        isAllowed = true
      } else {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if ((profile as any)?.role === 'admin') {
          isAllowed = true
        }
      }
    }

    if (!isAllowed) {
      notFound()
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': equipment.title,
    'image': equipment.equipment_images?.map((img: any) => img.image_url) || [],
    'description': equipment.description,
    'sku': equipment.id,
    'brand': {
      '@type': 'Brand',
      'name': equipment.brand || 'Unknown'
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://agriform.in/equipment/${equipment.id}`,
      'priceCurrency': 'INR',
      'price': equipment.daily_price,
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      'availability': equipment.availability === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/UsedCondition'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      
      <main className="flex-1 w-full pb-20 pt-28">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumbs (Placeholder) */}
          <div className="text-sm text-gray-500 mb-6 font-medium">
            Equipment / {equipment.categories?.name} / <span className="text-gray-900">{equipment.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Images & Details */}
            <div className="lg:col-span-2 space-y-10">
              <ImageGallery images={equipment.equipment_images || []} title={equipment.title} />
              
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{equipment.description}</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {equipment.brand && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Brand</p>
                      <p className="font-semibold text-gray-900">{equipment.brand}</p>
                    </div>
                  )}
                  {equipment.model && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Model</p>
                      <p className="font-semibold text-gray-900">{equipment.model}</p>
                    </div>
                  )}
                  {equipment.year && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Year</p>
                      <p className="font-semibold text-gray-900">{equipment.year}</p>
                    </div>
                  )}
                  {equipment.horsepower && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Horsepower</p>
                      <p className="font-semibold text-gray-900">{equipment.horsepower} HP</p>
                    </div>
                  )}
                  {equipment.working_hours && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Working Hours</p>
                      <p className="font-semibold text-gray-900">{equipment.working_hours} hrs</p>
                    </div>
                  )}
                  {equipment.fuel_type && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Fuel Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{equipment.fuel_type}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewsSection equipmentId={id} />
            </div>

            {/* Right Column: Pricing & Actions */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{equipment.title}</h1>
                    <div className="flex items-center text-gray-500 gap-1 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-primary" /> {equipment.location}, {equipment.district}
                    </div>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                <div className="py-6 border-y border-gray-100 my-6">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">₹{equipment.daily_price}</span>
                    <span className="text-gray-500 font-medium mb-1">/ day</span>
                  </div>
                  {equipment.hourly_price && (
                    <p className="text-sm text-gray-500">₹{equipment.hourly_price} / hour</p>
                  )}
                  {equipment.deposit > 0 && (
                    <div className="flex items-center gap-2 mt-4 text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <Shield className="h-4 w-4" /> Security Deposit: ₹{equipment.deposit}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Available {equipment.availability === 'available' ? 'Now' : equipment.availability}</span>
                  </div>
                  {equipment.insurance_status === 'insured' && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Fully Insured</span>
                    </div>
                  )}
                </div>

                {isOwnerOfEquipment ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl text-center border border-emerald-200">
                      You are the owner of this equipment
                    </div>
                    <Link href={`/dashboard/owner/equipment/${equipment.id}/edit`} className="block">
                      <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-sm">
                        Manage & Edit Equipment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <BookingModal equipment={equipment} />
                )}

                {/* Owner Info Snippet */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 mb-4">Equipment Owner</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-500">
                      {equipment.profiles?.full_name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{equipment.profiles?.full_name || 'Verified Owner'}</p>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-blue-500" /> Identity Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
