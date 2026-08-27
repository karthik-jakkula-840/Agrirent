'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudLightning, Loader2, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Default to New Delhi if geolocation is not available
    let lat = 28.6139
    let lon = 77.2090

    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
        )
        const data = await response.json()
        setWeather(data)
      } catch (err) {
        setError('Failed to fetch weather data')
      } finally {
        setLoading(false)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        () => {
          fetchWeather(lat, lon) // fallback
        }
      )
    } else {
      fetchWeather(lat, lon) // fallback
    }
  }, [])

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="h-8 w-8 text-yellow-500" />
    if (code >= 2 && code <= 45) return <Cloud className="h-8 w-8 text-gray-400" />
    if (code >= 51 && code <= 67) return <CloudRain className="h-8 w-8 text-blue-400" />
    if (code >= 80 && code <= 99) return <CloudRain className="h-8 w-8 text-blue-600" />
    if (code >= 95) return <CloudLightning className="h-8 w-8 text-purple-500" />
    return <Cloud className="h-8 w-8 text-gray-400" />
  }

  const getWeatherDescription = (code: number) => {
    if (code === 0) return 'Clear Sky'
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy'
    if (code >= 51 && code <= 67) return 'Rain'
    if (code >= 80 && code <= 99) return 'Showers'
    if (code >= 95) return 'Thunderstorm'
    return 'Cloudy'
  }

  if (loading) {
    return (
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-6 flex justify-center items-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-6 text-center text-gray-500">
          <p>Weather unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const current = weather.current_weather
  
  return (
    <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 text-primary" />
          Local Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(current.temperature)}°C</div>
            <div className="text-sm text-gray-600 mt-1">{getWeatherDescription(current.weathercode)}</div>
          </div>
          <div>
            {getWeatherIcon(current.weathercode)}
          </div>
        </div>
        
        <div className="pt-4 border-t border-blue-100 grid grid-cols-3 gap-2 text-center text-sm">
          {weather.daily?.time?.slice(1, 4).map((time: string, idx: number) => {
            const date = new Date(time)
            const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' })
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-gray-500 text-xs mb-1">{dayStr}</span>
                {getWeatherIcon(weather.daily.weathercode[idx + 1]) && 
                  <div className="scale-75 my-1">
                    {getWeatherIcon(weather.daily.weathercode[idx + 1])}
                  </div>
                }
                <span className="font-medium text-gray-800">
                  {Math.round(weather.daily.temperature_2m_max[idx + 1])}°
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
