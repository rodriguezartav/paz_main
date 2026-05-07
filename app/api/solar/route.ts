import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for the battery reading from Browse AI
interface BatteryReading {
  Position: string
  Current: string
  'Charge Level': string
  'Time Zone': string
}

// Type for the Browse AI webhook payload
interface BrowseAIWebhookPayload {
  event: string
  task: {
    id: string
    status: string
    capturedLists?: {
      SolarBatterySOC?: BatteryReading[]
    }
    [key: string]: unknown
  }
}

// Parse current string like "0A" or "-5.2A" to number
function parseCurrent(current: string): number {
  const match = current.match(/^(-?\d+\.?\d*)A?$/i)
  return match ? parseFloat(match[1]) : 0
}

// Parse charge level string like "91.7%" to number
function parseChargeLevel(chargeLevel: string): number {
  const match = chargeLevel.match(/^(\d+\.?\d*)%?$/)
  return match ? parseFloat(match[1]) : 0
}

export async function POST(request: NextRequest) {
  try {
    const payload: BrowseAIWebhookPayload = await request.json()
    
    // Validate the payload
    if (!payload.task) {
      return NextResponse.json(
        { error: 'Invalid payload: missing task' },
        { status: 400 }
      )
    }

    const batteryReadings = payload.task.capturedLists?.SolarBatterySOC
    
    if (!batteryReadings || !Array.isArray(batteryReadings)) {
      return NextResponse.json(
        { error: 'No battery readings found in payload' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const taskId = payload.task.id
    const recordedAt = new Date().toISOString()

    // Transform and insert each battery reading
    const readings = batteryReadings.map((reading) => ({
      battery_position: parseInt(reading.Position, 10),
      charge_level: parseChargeLevel(reading['Charge Level']),
      current_amps: parseCurrent(reading.Current),
      timezone: reading['Time Zone'] || 'America/Costa_Rica',
      task_id: taskId,
      raw_payload: reading,
      recorded_at: recordedAt,
    }))

    const { data, error } = await supabase
      .from('solar_battery_readings')
      .insert(readings)
      .select()

    if (error) {
      console.error('Error inserting battery readings:', error)
      return NextResponse.json(
        { error: 'Failed to store readings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Stored ${readings.length} battery readings`,
      readings: data,
    })
  } catch (error) {
    console.error('Solar webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve recent readings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const batteryPosition = searchParams.get('battery')

    let query = supabase
      .from('solar_battery_readings')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(limit)

    if (batteryPosition) {
      query = query.eq('battery_position', parseInt(batteryPosition, 10))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch readings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ readings: data })
  } catch (error) {
    console.error('Solar GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
