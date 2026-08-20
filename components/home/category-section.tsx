import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CategoryCard } from './category-card'
import { Tractor, Combine, Truck, Wind, Droplets, Leaf, Sprout, Axe } from 'lucide-react'

// Fallback hardcoded categories as requested if DB is empty
const defaultCategories = [
  { id: 'tractor', name: 'Tractor', count: 124, icon: Tractor },
  { id: 'harvester', name: 'Harvester', count: 45, icon: Combine },
  { id: 'trailer', name: 'Trailer', count: 89, icon: Truck },
  { id: 'rotavator', name: 'Rotavator', count: 67, icon: Wind },
  { id: 'water-tanker', name: 'Water Tanker', count: 34, icon: Droplets },
  { id: 'seeder', name: 'Seeder', count: 56, icon: Sprout },
  { id: 'sprayer', name: 'Sprayer', count: 78, icon: Leaf },
  { id: 'cultivator', name: 'Cultivator', count: 92, icon: Axe },
]

// Simple icon mapper based on name matching
function getIconForCategory(name: string) {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('tractor')) return Tractor
  if (lowerName.includes('harvest')) return Combine
  if (lowerName.includes('trailer')) return Truck
  if (lowerName.includes('rotavator')) return Wind
  if (lowerName.includes('water')) return Droplets
  if (lowerName.includes('seed')) return Sprout
  if (lowerName.includes('spray')) return Leaf
  if (lowerName.includes('cultivat')) return Axe
  return Tractor
}

export async function CategorySection() {
  const supabase = await createClient()
  
  // Attempt to fetch categories from Supabase (assuming a categories table exists)
  // Catching error silently to fallback
  let dbCategories: any[] = []
  try {
    const { data } = await supabase.from('categories').select('*').limit(8)
    if (data && data.length > 0) {
      dbCategories = data
    }
  } catch (e) {
    // Table might not exist yet, use fallback
  }

  const displayCategories = dbCategories.length > 0 
    ? dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat.equipment_count || 0,
        icon: getIconForCategory(cat.name)
      }))
    : defaultCategories

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything You Need for the Field
            </h2>
            <p className="text-lg text-gray-600">
              Find the right equipment for every agricultural task. From tractors to harvesters, rent from trusted owners in your area.
            </p>
          </div>
          <Link href="/equipment" className="text-primary font-semibold hover:text-primary/80 transition-colors whitespace-nowrap">
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              count={category.count}
              icon={<category.icon className="h-6 w-6" />}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
