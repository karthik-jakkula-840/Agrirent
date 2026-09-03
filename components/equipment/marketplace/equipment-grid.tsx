'use client'

import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { EquipmentCard } from '@/components/equipment/equipment-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Loader2, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  IndianRupee,
  RotateCcw,
  CheckCircle2
} from 'lucide-react'

interface EquipmentGridProps {
  initialCategories: any[]
  defaultCategory?: string
  defaultSearch?: string
  defaultDistrict?: string
  defaultMinPrice?: string
  defaultMaxPrice?: string
  defaultAvailability?: string
  defaultSort?: string
}

export function EquipmentGrid({ 
  initialCategories, 
  defaultCategory = '',
  defaultSearch = '',
  defaultDistrict = '',
  defaultMinPrice = '',
  defaultMaxPrice = '',
  defaultAvailability = '',
  defaultSort = 'newest'
}: EquipmentGridProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Filter States
  const [search, setSearch] = useState(defaultSearch)
  const [searchInput, setSearchInput] = useState(defaultSearch)
  
  const [district, setDistrict] = useState(defaultDistrict)
  const [districtInput, setDistrictInput] = useState(defaultDistrict)
  
  const [category, setCategory] = useState(defaultCategory)
  
  const [minPrice, setMinPrice] = useState(defaultMinPrice)
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice)
  const [minPriceInput, setMinPriceInput] = useState(defaultMinPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(defaultMaxPrice)
  
  const [availability, setAvailability] = useState(defaultAvailability)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const pageSize = 9

  // URL Sync Helper
  const syncToUrl = (updates: Record<string, string | undefined>) => {
    startTransition(() => {
      const params = new URLSearchParams()
      const newSearch = updates.search !== undefined ? updates.search : search
      const newDistrict = updates.district !== undefined ? updates.district : district
      const newCategory = updates.category !== undefined ? updates.category : category
      const newMinPrice = updates.minPrice !== undefined ? updates.minPrice : minPrice
      const newMaxPrice = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice
      const newAvailability = updates.availability !== undefined ? updates.availability : availability
      const newSort = updates.sort !== undefined ? updates.sort : sort

      if (newSearch) params.set('search', newSearch)
      if (newDistrict) params.set('district', newDistrict)
      if (newCategory) params.set('category', newCategory)
      if (newMinPrice) params.set('minPrice', newMinPrice)
      if (newMaxPrice) params.set('maxPrice', newMaxPrice)
      if (newAvailability) params.set('availability', newAvailability)
      if (newSort && newSort !== 'newest') params.set('sort', newSort)

      const qs = params.toString()
      router.replace(`/equipment${qs ? `?${qs}` : ''}`, { scroll: false })
    })
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['equipment', search, district, category, minPrice, maxPrice, availability, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (district) params.append('district', district)
      if (category) params.append('category', category)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (availability) params.append('availability', availability)
      if (sort) params.append('sort', sort)
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      
      const res = await fetch(`/api/equipment?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch equipment')
      const result = await res.json()
      return result.data
    },
  })

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setDistrict(districtInput)
    setPage(1)
    syncToUrl({ search: searchInput, district: districtInput })
    refetch()
  }

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setMinPrice(minPriceInput)
    setMaxPrice(maxPriceInput)
    setPage(1)
    syncToUrl({ minPrice: minPriceInput, maxPrice: maxPriceInput })
  }

  const handlePricePreset = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
    setMinPriceInput(min)
    setMaxPriceInput(max)
    setPage(1)
    syncToUrl({ minPrice: min, maxPrice: max })
  }

  const handleCategoryChange = (catId: string) => {
    setCategory(catId)
    setPage(1)
    syncToUrl({ category: catId })
  }

  const handleAvailabilityToggle = (avail: string) => {
    setAvailability(avail)
    setPage(1)
    syncToUrl({ availability: avail })
  }

  const clearAllFilters = () => {
    setSearch('')
    setSearchInput('')
    setDistrict('')
    setDistrictInput('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setAvailability('')
    setSort('newest')
    setPage(1)
    syncToUrl({
      search: '',
      district: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      availability: '',
      sort: 'newest'
    })
  }

  // Active filters calculation
  const activeFiltersCount = 
    (search ? 1 : 0) + 
    (district ? 1 : 0) + 
    (category ? 1 : 0) + 
    (minPrice || maxPrice ? 1 : 0) + 
    (availability ? 1 : 0)

  const selectedCategoryName = initialCategories.find(
    cat => cat.id === category || cat.slug === category
  )?.name

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile Filter Trigger */}
      <div className="md:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 font-medium"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          {activeFiltersCount > 0 && (
            <Badge className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Sidebar Filters */}
      <aside 
        className={`w-full md:w-72 shrink-0 space-y-6 ${
          showMobileFilters ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              {activeFiltersCount > 0 && (
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-800 mb-3 block">
              Category
            </label>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                  category === '' 
                    ? 'bg-primary text-white font-semibold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
                {category === '' && <CheckCircle2 className="h-4 w-4" />}
              </button>
              {initialCategories.map((cat) => {
                const isSelected = category === cat.id || category === cat.slug
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-primary text-white font-semibold shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-gray-100 pt-5">
            <label className="text-sm font-semibold text-gray-800 mb-3 block flex items-center gap-1">
              <IndianRupee className="h-4 w-4 text-gray-500" /> Daily Rate (₹)
            </label>

            {/* Quick Price Presets */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => handlePricePreset('', '1000')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  minPrice === '' && maxPrice === '1000'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Under ₹1,000
              </button>
              <button
                type="button"
                onClick={() => handlePricePreset('1000', '2500')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  minPrice === '1000' && maxPrice === '2500'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                ₹1k - ₹2.5k
              </button>
              <button
                type="button"
                onClick={() => handlePricePreset('2500', '5000')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  minPrice === '2500' && maxPrice === '5000'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                ₹2.5k - ₹5k
              </button>
              <button
                type="button"
                onClick={() => handlePricePreset('5000', '')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  minPrice === '5000' && maxPrice === ''
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Above ₹5,000
              </button>
            </div>

            {/* Custom Min / Max Inputs */}
            <form onSubmit={handleApplyPrice} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="pl-6 h-9 text-xs rounded-lg"
                  />
                </div>
                <span className="text-gray-400 text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="pl-6 h-9 text-xs rounded-lg"
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm" className="w-full h-8 text-xs font-semibold">
                Apply Price Range
              </Button>
            </form>
          </div>

          {/* Availability Filter */}
          <div className="border-t border-gray-100 pt-5">
            <label className="text-sm font-semibold text-gray-800 mb-3 block">
              Availability
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === ''}
                  onChange={() => handleAvailabilityToggle('')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span>All Machinery</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === 'available'}
                  onChange={() => handleAvailabilityToggle('available')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                  Available Now Only
                </span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Search & Sort Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, brand (e.g. Mahindra)..." 
                  className="pl-9 pr-8 h-11 bg-gray-50/70 border-gray-200 focus:border-primary focus:bg-white transition-all text-sm rounded-xl"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                      syncToUrl({ search: '' })
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="relative sm:w-56">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  value={districtInput}
                  onChange={(e) => setDistrictInput(e.target.value)}
                  placeholder="District or State..." 
                  className="pl-9 pr-8 h-11 bg-gray-50/70 border-gray-200 focus:border-primary focus:bg-white transition-all text-sm rounded-xl"
                />
                {districtInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setDistrictInput('')
                      setDistrict('')
                      syncToUrl({ district: '' })
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button type="submit" className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
                Search
              </Button>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  const newSort = e.target.value
                  setSort(newSort)
                  setPage(1)
                  syncToUrl({ sort: newSort })
                }}
                className="h-11 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              
              {selectedCategoryName && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-2.5 rounded-lg text-xs">
                  Category: {selectedCategoryName}
                  <button 
                    onClick={() => handleCategoryChange('')} 
                    className="hover:text-primary/70"
                    aria-label="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {search && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1.5 py-1 px-2.5 rounded-lg text-xs">
                  Keyword: {search}
                  <button 
                    onClick={() => {
                      setSearch('')
                      setSearchInput('')
                      syncToUrl({ search: '' })
                    }} 
                    className="hover:text-emerald-950"
                    aria-label="Remove keyword filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {district && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200 gap-1.5 py-1 px-2.5 rounded-lg text-xs">
                  Location: {district}
                  <button 
                    onClick={() => {
                      setDistrict('')
                      setDistrictInput('')
                      syncToUrl({ district: '' })
                    }} 
                    className="hover:text-blue-950"
                    aria-label="Remove location filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 gap-1.5 py-1 px-2.5 rounded-lg text-xs">
                  Price: {minPrice ? `₹${minPrice}` : '₹0'} - {maxPrice ? `₹${maxPrice}` : 'Any'}
                  <button 
                    onClick={() => handlePricePreset('', '')} 
                    className="hover:text-amber-950"
                    aria-label="Remove price filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {availability && (
                <Badge variant="secondary" className="bg-green-50 text-green-800 border-green-200 gap-1.5 py-1 px-2.5 rounded-lg text-xs">
                  Available Now Only
                  <button 
                    onClick={() => handleAvailabilityToggle('')} 
                    className="hover:text-green-950"
                    aria-label="Remove availability filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-red-600 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        {!isLoading && !error && data && (
          <div className="flex items-center justify-between text-sm text-gray-500 px-1">
            <span>
              Showing <span className="font-semibold text-gray-900">{data.items?.length || 0}</span> of{' '}
              <span className="font-semibold text-gray-900">{data.total || 0}</span> equipment listings
            </span>
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Finding the best equipment...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 p-8">
            <p className="text-red-600 font-semibold mb-2">Failed to load equipment.</p>
            <p className="text-gray-500 text-sm mb-4">There was an issue processing your filter request.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              We couldn't find any equipment matching your current filter criteria. Try clearing or relaxing your filters.
            </p>
            <Button onClick={clearAllFilters} variant="outline" className="rounded-xl">
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
                    pricePerHour={item.hourly_price}
                    location={item.location}
                    imageUrl={primaryImage}
                    ownerName={item.profiles?.full_name || 'Verified Owner'}
                    rating={4.8}
                    isAvailable={item.availability === 'available'}
                    isVerifiedOwner={true}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-8 pb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const p = Math.max(1, page - 1)
                    setPage(p)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === 1}
                  className="rounded-xl flex items-center gap-1 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                
                <span className="text-xs font-semibold text-gray-700 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm">
                  Page {page} of {data.totalPages}
                </span>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const p = Math.min(data.totalPages, page + 1)
                    setPage(p)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === data.totalPages}
                  className="rounded-xl flex items-center gap-1 text-xs"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
