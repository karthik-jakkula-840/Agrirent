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
      
      <main className="flex-1 w-full pb-36 md:pb-20 pt-20 md:pt-28">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumbs */}
          <div className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6 font-medium flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <Link href="/equipment" className="hover:text-emerald-700">Equipment</Link>
            <span>/</span>
            <span>{equipment.categories?.name || 'Machinery'}</span>
            <span>/</span>
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-none">{equipment.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            {/* Left Column: Images, Mobile Quick Summary, Description, Specs, Reviews */}
            <div className="lg:col-span-2 space-y-6 md:space-y-10">
              <ImageGallery images={equipment.equipment_images || []} title={equipment.title} />
              
              {/* Mobile Quick Summary & Booking Card (Visible on mobile only) */}
              <div className="block lg:hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-extrabold text-gray-900 mb-1">{equipment.title}</h1>
                    <div className="flex items-center text-gray-500 gap-1 text-xs font-medium">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {equipment.location}, {equipment.district}
                    </div>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-gray-400 hover:text-red-500 hover:border-red-200 shrink-0">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="py-3 border-y border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-gray-900">₹{equipment.daily_price}</span>
                      <span className="text-xs text-gray-500 font-medium">/ day</span>
                    </div>
                    {equipment.hourly_price && (
                      <p className="text-xs font-semibold text-emerald-700">₹{equipment.hourly_price} / hour</p>
                    )}
                  </div>
                  {equipment.deposit > 0 && (
                    <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/70">
                      Deposit: ₹{equipment.deposit}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Available {equipment.availability === 'available' ? 'Now' : equipment.availability}</span>
                  </div>
                  {equipment.insurance_status === 'insured' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-100">
                      <Shield className="h-3.5 w-3.5 text-blue-600" />
                      <span>Fully Insured</span>
                    </div>
                  )}
                </div>

                {isOwnerOfEquipment ? (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl text-center border border-emerald-200">
                      You are the owner of this equipment
                    </div>
                    <Link href={`/dashboard/owner/equipment/${equipment.id}/edit`} className="block">
                      <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm">
                        Manage & Edit Equipment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <BookingModal equipment={equipment} />
                )}
              </div>

              {/* Description */}
              <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Description</h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{equipment.description}</p>
              </div>

              {/* Specifications */}
              <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {equipment.brand && (
                    <div className="bg-gray-50/70 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Brand</p>
                      <p className="font-bold text-sm text-gray-900">{equipment.brand}</p>
                    </div>
                  )}
                  {equipment.model && (
                    <div className="bg-gray-50/70 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Model</p>
                      <p className="font-bold text-sm text-gray-900">{equipment.model}</p>
                    </div>
                  )}
                  {equipment.year && (
                    <div className="bg-gray-50/70 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Year</p>
                      <p className="font-bold text-sm text-gray-900">{equipment.year}</p>
                    </div>
                  )}
                  {equipment.horsepower && (
                    <div className="bg-gray-50/70 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Horsepower</p>
                      <p className="font-bold text-sm text-gray-900">{equipment.horsepower} HP</p>
                    </div>
                  )}
                  {equipment.working_hours && (
                    <div className="bg-gray-50/70 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Working Hours</p>
                      <p className="font-bold text-sm text-gray-900">{equipment.working_hours} hrs</p>
                    </div>
                  )}
                  {equipment.fuel_type && (
                    <div className="bg-gray-50/70 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Fuel Type</p>
                      <p className="font-bold text-sm text-gray-900 capitalize">{equipment.fuel_type}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewsSection equipmentId={id} />
            </div>

            {/* Right Column: Pricing & Actions (Desktop Sticky View) */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
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

        {/* Mobile Sticky Booking Bar */}
        {!isOwnerOfEquipment && (
          <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200/90 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900">₹{equipment.daily_price}</span>
                <span className="text-xs font-semibold text-gray-500">/day</span>
              </div>
              {equipment.hourly_price && (
                <span className="text-[11px] font-semibold text-emerald-700">₹{equipment.hourly_price}/hr</span>
              )}
            </div>
            <div className="w-1/2">
              <BookingModal 
                equipment={equipment} 
                trigger={
                  <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md active:scale-98">
                    Rent Now
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
