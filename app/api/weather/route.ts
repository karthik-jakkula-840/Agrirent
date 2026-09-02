import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '28.6139'
  const lon = searchParams.get('lon') || '77.2090'

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`,
      { next: { revalidate: 1800 } } // cache for 30 minutes
    )
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
