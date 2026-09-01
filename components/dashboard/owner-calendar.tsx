'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Tractor } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OwnerCalendarProps {
  bookings: any[]
}

export function OwnerCalendar({ bookings = [] }: OwnerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Fill in empty days before the first day of the month
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: firstDayOfWeek }).map((_, i) => i)

  // Bookings for selected date
  const selectedDayBookings = bookings.filter(b => {
    const start = new Date(b.start_time)
    const end = new Date(b.end_time)
    return selectedDate >= start && selectedDate <= end
  })

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h2>
            <p className="text-xs text-gray-500">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} scheduled this period
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 px-2.5 text-xs text-gray-600 hover:text-green-700 border-gray-200">
            Today
          </Button>
          <Button variant="outline" size="icon" aria-label="Previous month" onClick={prevMonth} className="h-8 w-8 rounded-lg border-gray-200 hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next month" onClick={nextMonth} className="h-8 w-8 rounded-lg border-gray-200 hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-semibold text-gray-400 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="h-10 sm:h-12" />
        ))}
        {daysInMonth.map((day, idx) => {
          // Find bookings that overlap with this day
          const dayBookings = bookings.filter(b => {
            const start = new Date(b.start_time)
            const end = new Date(b.end_time)
            return day >= start && day <= end
          })

          const isCurrentMonth = isSameMonth(day, monthStart)
          const isCurrentDay = isToday(day)
          const isSelected = isSameDay(day, selectedDate)
          const hasBookings = dayBookings.length > 0

          return (
            <button 
              key={idx} 
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`
                h-10 sm:h-12 p-1 flex flex-col items-center justify-center rounded-xl text-sm font-medium relative transition-all duration-150
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected 
                  ? 'bg-green-600 text-white font-bold shadow-md shadow-green-200 ring-2 ring-green-600 ring-offset-1' 
                  : isCurrentDay 
                  ? 'bg-green-100 text-green-900 font-bold border border-green-300' 
                  : hasBookings 
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasBookings && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Legend & Selected Day Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-100 border border-green-300 inline-block"></span> Today
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Booked Day
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span> Selected
          </div>
        </div>

        <div className="text-gray-600 font-medium">
          {format(selectedDate, 'MMM d, yyyy')}:{' '}
          {selectedDayBookings.length > 0 ? (
            <span className="text-green-700 font-semibold">
              {selectedDayBookings.length} {selectedDayBookings.length === 1 ? 'equipment booked' : 'equipments booked'}
            </span>
          ) : (
            <span className="text-gray-400">Available</span>
          )}
        </div>
      </div>

      {/* Selected Day Details (if any bookings on selected date) */}
      {selectedDayBookings.length > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-gray-100 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Bookings on {format(selectedDate, 'MMM d')}:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedDayBookings.map((b: any) => (
              <div key={b.id} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Tractor className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-gray-900 truncate">{b.equipment?.title || 'Equipment'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 font-medium shrink-0 ml-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>Ends {format(new Date(b.end_time), 'MMM d')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
