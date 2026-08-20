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

  const supabase = await createClient()
  
  // Fetch initial categories for the sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="flex-1 w-full pb-20">
        <div className="bg-primary/5 py-12 border-b border-primary/10">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Equipment Marketplace</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Find the perfect machinery for your farm. Rent directly from verified owners at affordable rates.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 pt-12">
          <EquipmentGrid initialCategories={categories || []} defaultCategory={defaultCategory} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
