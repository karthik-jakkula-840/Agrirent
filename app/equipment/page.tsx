import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EquipmentGrid } from '@/components/equipment/marketplace/equipment-grid'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Equipment Marketplace | Agriform',
  description: 'Browse and rent agricultural equipment from verified owners across India.',
  openGraph: {
    title: 'Equipment Marketplace | Agriform',
    description: 'Browse and rent agricultural equipment from verified owners across India.',
    url: 'https://agriform.in/equipment',
  }
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MarketplacePage(props: Props) {
  const searchParams = await props.searchParams
  const defaultCategory = typeof searchParams.category === 'string' ? searchParams.category : ''
  const defaultSearch = typeof searchParams.search === 'string' ? searchParams.search : ''
  const defaultDistrict = typeof searchParams.district === 'string' ? searchParams.district : ''
  const defaultMinPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const defaultMaxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''
  const defaultAvailability = typeof searchParams.availability === 'string' ? searchParams.availability : ''
  const defaultSort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'

  const supabase = await createClient()
  
  // Fetch initial categories for the sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  // Resolve category slug to ID if needed
  let resolvedCategory = defaultCategory
  if (categories && defaultCategory) {
    const matched = categories.find(
      (c: any) => c.id === defaultCategory || c.slug === defaultCategory || c.name.toLowerCase() === defaultCategory.toLowerCase()
    )
    if (matched) {
      resolvedCategory = matched.id
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="flex-1 w-full pb-32 md:pb-20 pt-20 md:pt-24">
        <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent py-6 md:py-12 border-b border-primary/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <span>🚜 Verified Agricultural Fleet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 md:mb-3">
              Equipment Marketplace
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl">
              Rent high-performance tractors, harvesters, and implements directly from trusted local owners.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-4 md:pt-8">
          <EquipmentGrid 
            initialCategories={categories || []} 
            defaultCategory={resolvedCategory} 
            defaultSearch={defaultSearch}
            defaultDistrict={defaultDistrict}
            defaultMinPrice={defaultMinPrice}
            defaultMaxPrice={defaultMaxPrice}
            defaultAvailability={defaultAvailability}
            defaultSort={defaultSort}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
