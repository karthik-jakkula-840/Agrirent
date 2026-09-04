'use client'

import { useState, useTransition, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { EquipmentCard } from '@/components/equipment/equipment-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  IndianRupee,
  RotateCcw,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  Sparkles
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

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('tractor')) return '🚜'
  if (lower.includes('harvester') || lower.includes('combine')) return '🌾'
  if (lower.includes('tillage') || lower.includes('plough') || lower.includes('cultivator')) return '⛏️'
  if (lower.includes('sow') || lower.includes('seed') || lower.includes('plant')) return '🌱'
  if (lower.includes('spray') || lower.includes('irrigation') || lower.includes('water')) return '💧'
  if (lower.includes('trailer') || lower.includes('transport') || lower.includes('trolley')) return '🚛'
  if (lower.includes('thresh')) return '⚙️'
  return '🚜'
}

function EquipmentCardSkeleton() {
  return (
    <div className="rounded-2xl md:rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-xs animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-3/5 bg-gray-200 rounded-md" />
          <div className="h-4 w-12 bg-gray-200 rounded-full" />
        </div>
        <div className="h-3.5 w-2/5 bg-gray-100 rounded-md" />
        <div className="h-4 w-1/2 bg-gray-100 rounded-md pt-1" />
        <div className="pt-2 flex justify-between items-end border-t border-gray-100">
          <div className="h-6 w-24 bg-gray-200 rounded-md" />
          <div className="h-9 w-28 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
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
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false)
  const pageSize = 9

  // Prevent background scrolling when bottom sheet is open
  useEffect(() => {
    if (showMobileFilterDrawer) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileFilterDrawer])

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
    <div className="space-y-4 md:space-y-6">
      {/* 1. Mobile Horizontal Category Scroll Bar (Always visible on mobile) */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Browse Categories
          </span>
          {category && (
            <button
              onClick={() => handleCategoryChange('')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-none snap-x">
          <button
            type="button"
            onClick={() => handleCategoryChange('')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all shadow-2xs snap-start ${
              category === '' 
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-600/30' 
                : 'bg-white text-gray-700 border border-gray-200/90 active:bg-gray-100'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>All Machinery</span>
          </button>
          {initialCategories.map((cat) => {
            const isSelected = category === cat.id || category === cat.slug
            const icon = getCategoryIcon(cat.name)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all shadow-2xs snap-start ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-600/30' 
                    : 'bg-white text-gray-700 border border-gray-200/90 active:bg-gray-100'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Top Unified Search, Filter Button & Sort Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl md:rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          {/* Keyword search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search machinery, brand (e.g. Mahindra)..." 
              className="pl-10 pr-8 h-11 bg-gray-50/80 border-gray-200 focus:border-emerald-500 focus:bg-white transition-all text-sm rounded-xl font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch('')
                  syncToUrl({ search: '' })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* District search input */}
          <div className="relative sm:w-52">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              value={districtInput}
              onChange={(e) => setDistrictInput(e.target.value)}
              placeholder="Location or District..." 
              className="pl-10 pr-8 h-11 bg-gray-50/80 border-gray-200 focus:border-emerald-500 focus:bg-white transition-all text-sm rounded-xl font-medium"
            />
            {districtInput && (
              <button
                type="button"
                onClick={() => {
                  setDistrictInput('')
                  setDistrict('')
                  syncToUrl({ district: '' })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Row on Mobile */}
          <div className="flex items-center gap-2">
            <Button 
              type="submit" 
              className="h-11 flex-1 sm:flex-initial px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Search
            </Button>

            {/* Mobile Filter Sheet Trigger Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMobileFilterDrawer(true)}
              className="md:hidden h-11 px-3.5 rounded-xl flex items-center gap-1.5 font-bold text-xs border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-5 min-w-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Quick Sort on Mobile / Desktop */}
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => {
                  const newSort = e.target.value
                  setSort(newSort)
                  setPage(1)
                  syncToUrl({ sort: newSort })
                }}
                className="h-11 rounded-xl border border-gray-200 bg-gray-50/80 px-3 pr-7 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="newest">⚡ Newest</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </form>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mr-1">
              Active:
            </span>
            
            {selectedCategoryName && (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-200/80 gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold">
                Category: {selectedCategoryName}
                <button 
                  onClick={() => handleCategoryChange('')} 
                  className="hover:text-emerald-950 ml-0.5"
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {search && (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-200/80 gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold">
                Keyword: {search}
                <button 
                  onClick={() => {
                    setSearch('')
                    setSearchInput('')
                    syncToUrl({ search: '' })
                  }} 
                  className="hover:text-emerald-950 ml-0.5"
                  aria-label="Remove keyword filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {district && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200/80 gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold">
                Location: {district}
                <button 
                  onClick={() => {
                    setDistrict('')
                    setDistrictInput('')
                    syncToUrl({ district: '' })
                  }} 
                  className="hover:text-blue-950 ml-0.5"
                  aria-label="Remove location filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200/80 gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold">
                Price: {minPrice ? `₹${minPrice}` : '₹0'} - {maxPrice ? `₹${maxPrice}` : 'Any'}
                <button 
                  onClick={() => handlePricePreset('', '')} 
                  className="hover:text-amber-950 ml-0.5"
                  aria-label="Remove price filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {availability && (
              <Badge variant="secondary" className="bg-green-50 text-green-800 border-green-200/80 gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold">
                Available Now
                <button 
                  onClick={() => handleAvailabilityToggle('')} 
                  className="hover:text-green-950 ml-0.5"
                  aria-label="Remove availability filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset all
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Grid Layout (Sidebar on Desktop, Full Width on Mobile) */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-72 shrink-0 sticky top-28">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" /> Filters
                {activeFiltersCount > 0 && (
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
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

            {/* Desktop Category Filter */}
            <div>
              <label className="text-sm font-bold text-gray-800 mb-2.5 block">
                Category
              </label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    category === '' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
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
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-sm' 
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

            {/* Desktop Price Range Filter */}
            <div className="border-t border-gray-100 pt-5">
              <label className="text-sm font-bold text-gray-800 mb-2.5 block flex items-center gap-1">
                <IndianRupee className="h-4 w-4 text-gray-500" /> Daily Rate (₹)
              </label>

              {/* Quick Price Presets */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => handlePricePreset('', '1000')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    minPrice === '' && maxPrice === '1000'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  Under ₹1,000
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset('1000', '2500')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    minPrice === '1000' && maxPrice === '2500'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₹1k - ₹2.5k
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset('2500', '5000')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    minPrice === '2500' && maxPrice === '5000'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₹2.5k - ₹5k
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset('5000', '')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    minPrice === '5000' && maxPrice === ''
                      ? 'bg-emerald-600 text-white border-emerald-600'
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
                      className="pl-6 h-9 text-xs rounded-lg font-medium"
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
                      className="pl-6 h-9 text-xs rounded-lg font-medium"
                    />
                  </div>
                </div>
                <Button type="submit" variant="secondary" size="sm" className="w-full h-8 text-xs font-bold">
                  Apply Price
                </Button>
              </form>
            </div>

            {/* Desktop Availability Filter */}
            <div className="border-t border-gray-100 pt-5">
              <label className="text-sm font-bold text-gray-800 mb-2.5 block">
                Availability
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="desktop_availability"
                    checked={availability === ''}
                    onChange={() => handleAvailabilityToggle('')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <span>All Machinery</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="desktop_availability"
                    checked={availability === 'available'}
                    onChange={() => handleAvailabilityToggle('available')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Available Now Only
                  </span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Listings Content Area */}
        <div className="flex-1 w-full space-y-4">
          {/* Results Summary */}
          {!isLoading && !error && data && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 px-1">
              <span>
                Found <span className="font-extrabold text-gray-900">{data.total || 0}</span> equipment available
              </span>
              {data.totalPages > 1 && (
                <span>Page {page} of {data.totalPages}</span>
              )}
            </div>
          )}

          {/* Grid Render */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <EquipmentCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50/70 rounded-3xl border border-red-100 p-6">
              <p className="text-red-700 font-bold mb-1">Failed to load equipment.</p>
              <p className="text-gray-500 text-xs mb-4">Please check your internet connection or search parameters.</p>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
                Try Again
              </Button>
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No equipment found</h3>
              <p className="text-gray-500 mb-5 max-w-xs mx-auto text-xs">
                We couldn't find any machinery matching your criteria. Try adjusting or clearing your filters.
              </p>
              <Button onClick={clearAllFilters} className="rounded-xl bg-emerald-600 text-white text-xs font-bold px-5">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const p = Math.max(1, page - 1)
                      setPage(p)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={page === 1}
                    className="rounded-xl h-10 px-3 flex items-center gap-1 text-xs font-bold border-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  
                  <span className="text-xs font-bold text-gray-700 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    {page} / {data.totalPages}
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
                    className="rounded-xl h-10 px-3 flex items-center gap-1 text-xs font-bold border-gray-200"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. Mobile Slide-Up Filter Drawer / Bottom Sheet */}
      <AnimatePresence>
        {showMobileFilterDrawer && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilterDrawer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drag handle pill */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-extrabold text-lg text-gray-900">Filter Equipment</h3>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {activeFiltersCount} active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilterDrawer(false)}
                  className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Sheet Content */}
              <div className="overflow-y-auto px-5 py-4 space-y-6 flex-1">
                {/* Categories Pills */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        category === ''
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {initialCategories.map((cat) => {
                      const isSelected = category === cat.id || category === cat.slug
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <span>{getCategoryIcon(cat.name)}</span>
                          <span>{cat.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Price Presets */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 block flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" /> Daily Rate Range
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handlePricePreset('', '1000')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        minPrice === '' && maxPrice === '1000'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      Under ₹1,000
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricePreset('1000', '2500')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        minPrice === '1000' && maxPrice === '2500'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      ₹1,000 - ₹2,500
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricePreset('2500', '5000')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        minPrice === '2500' && maxPrice === '5000'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      ₹2,500 - ₹5,000
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricePreset('5000', '')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        minPrice === '5000' && maxPrice === ''
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      Above ₹5,000
                    </button>
                  </div>

                  {/* Custom Min / Max inputs */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="pl-7 h-10 text-xs rounded-xl font-medium"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="pl-7 h-10 text-xs rounded-xl font-medium"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleApplyPrice}
                      variant="secondary"
                      size="sm"
                      className="h-10 px-3 rounded-xl text-xs font-bold shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 block">
                    Equipment Availability
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAvailabilityToggle('')}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                        availability === ''
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>All</span>
                        {availability === '' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <span className="text-[11px] font-normal text-gray-500">Show all listings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAvailabilityToggle('available')}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                        availability === 'available'
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          Available Now
                        </span>
                        {availability === 'available' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <span className="text-[11px] font-normal text-gray-500">Ready for instant booking</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Bar inside sheet */}
              <div className="p-4 bg-gray-50/90 border-t border-gray-100 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex-1 h-12 rounded-xl text-xs font-bold text-gray-700 border-gray-300"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset All
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowMobileFilterDrawer(false)}
                  className="flex-[2] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md"
                >
                  Show Results {data?.total ? `(${data.total})` : ''}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
