import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import { 
  Tractor, 
  Combine, 
  Wind, 
  Sprout, 
  Droplets, 
  ArrowRight,
  ShieldAlert 
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Equipment Categories | Agriform',
  description: 'Browse agricultural equipment by category. Find tractors, harvesters, tillage tools, irrigation pumps, and more.',
}

const iconMap: Record<string, any> = {
  'tractors': Tractor,
  'harvesters': Combine,
  'tillage-equipment': Wind,
  'seeding-planting': Sprout,
  'irrigation': Droplets,
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch active categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="flex-1 w-full pb-20 pt-24">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 border-b border-primary/10">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Browse by Category
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Select a category to find specialized agricultural machinery, tractors, and tools listed by verified owners near you.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 md:px-6 pt-16">
          {error || !categories || categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
              <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Available</h3>
              <p className="text-gray-500">
                We couldn't load the categories right now. Please try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => {
                const IconComponent = iconMap[cat.slug] || Tractor
                return (
                  <Link 
                    key={cat.id}
                    href={`/equipment?category=${cat.id}`}
                    className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-gray-500 line-clamp-3 leading-relaxed mb-6">
                        {cat.description || 'Discover available rentals for this category.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <span>Explore Equipment</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
