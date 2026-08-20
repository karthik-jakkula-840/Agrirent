'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EquipmentCard } from '@/components/equipment/equipment-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

export function EquipmentGrid({ initialCategories, defaultCategory = '' }: { initialCategories: any[], defaultCategory?: string }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(defaultCategory)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const pageSize = 9

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['equipment', search, category, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      if (sort) params.append('sort', sort)
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      
      const res = await fetch(`/api/equipment?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch equipment')
      const result = await res.json()
      return result.data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" /> Filters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cat-all"
                    name="category"
                    checked={category === ''}
                    onChange={() => { setCategory(''); setPage(1) }}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="cat-all" className="ml-2 text-sm text-gray-600">All Categories</label>
                </div>
                {initialCategories.map(cat => (
                  <div key={cat.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`cat-${cat.id}`}
                      name="category"
                      checked={category === cat.id}
                      onChange={() => { setCategory(cat.id); setPage(1) }}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor={`cat-${cat.id}`} className="ml-2 text-sm text-gray-600">{cat.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, or location..." 
              className="pl-10 h-11 bg-gray-50 border-transparent focus:border-primary focus:bg-white transition-all"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="h-11 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Finding the best equipment...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-600 font-medium">Failed to load equipment. Please try again.</p>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              We couldn't find any equipment matching your current filters. Try adjusting your search criteria.
            </p>
            <Button onClick={() => { setSearch(''); setCategory(''); setPage(1) }} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((item: any) => {
                const primaryImage = item.equipment_images?.find((img: any) => img.is_primary)?.image_url 
                                  || item.equipment_images?.[0]?.image_url 
                                  || 'https://images.unsplash.com/photo-1605335133649-14a51e1858c4?q=80&w=600'
                
                return (
                  <EquipmentCard
                    key={item.id}
                    id={item.id}
                    name={item.title}
                    categoryName={item.categories?.name || 'Equipment'}
                    pricePerDay={item.daily_price}
                    location={item.location}
                    imageUrl={primaryImage}
                    ownerName={item.profiles?.full_name || 'Owner'}
                    rating={4.8} // Placeholder rating
                    isAvailable={item.availability === 'available'}
                    isVerifiedOwner={true} // Placeholder
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium text-gray-700 px-4">
                  Page {page} of {data.totalPages}
                </span>

                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
