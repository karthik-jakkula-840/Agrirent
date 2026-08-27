'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OwnerCalendarProps {
  bookings: any[]
}

export function OwnerCalendar({ bookings }: OwnerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Fill in empty days before the first day of the month
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: firstDayOfWeek }).map((_, i) => i)

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square p-1" />
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
          const hasBookings = dayBookings.length > 0

          return (
            <div 
              key={idx} 
              className={`
                aspect-square p-1 flex flex-col items-center justify-center rounded-lg text-sm relative transition-all cursor-default
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isCurrentDay ? 'bg-primary text-white font-bold' : 'hover:bg-gray-50'}
                ${hasBookings && !isCurrentDay ? 'bg-green-50 text-green-700 font-medium' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasBookings && !isCurrentDay && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500" />
              )}
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Today
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-50 inline-block border border-green-200"></span> Booked
        </div>
      </div>
    </div>
  )
}
