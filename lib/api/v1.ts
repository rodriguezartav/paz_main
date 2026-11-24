import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'

export const API_VERSION = 'v1'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
}

export function apiJson(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(data, {
    status,
    headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store', ...extraHeaders },
  })
}

export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'NOT_CONFIGURED'
  | 'NOT_FOUND'
  | 'NO_AVAILABILITY'
  | 'NO_RATE_FOUND'
  | 'INTERNAL_ERROR'

export function apiError(code: ApiErrorCode, message: string, status: number, details?: unknown) {
  return apiJson({ error: { code, message, ...(details ? { details } : {}) } }, status)
}

export function apiOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * Validates the API key sent as `Authorization: Bearer <key>` or `X-API-Key: <key>`
 * against the PAZ_API_KEY environment variable. Returns an error response, or null when valid.
 */
export function requireApiKey(request: NextRequest): NextResponse | null {
  const expected = process.env.PAZ_API_KEY
  if (!expected) {
    return apiError('NOT_CONFIGURED', 'The API key is not configured on the server (PAZ_API_KEY).', 503)
  }

  const authHeader = request.headers.get('authorization') || ''
  const provided =
    request.headers.get('x-api-key') ||
    (authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '')

  if (!provided) {
    return apiError('UNAUTHORIZED', 'Missing API key. Send it as "Authorization: Bearer <key>".', 401)
  }

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return apiError('UNAUTHORIZED', 'Invalid API key.', 401)
  }

  return null
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidDate(value: string | null | undefined): value is string {
  if (!value || !DATE_RE.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value)
}

export function countNights(arrival: string, departure: string): number {
  const ms = new Date(`${departure}T00:00:00Z`).getTime() - new Date(`${arrival}T00:00:00Z`).getTime()
  return Math.round(ms / 86_400_000)
}

export function todayInCostaRica(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' })
}

/**
 * Validates an arrival/departure pair. Returns an error message or null.
 */
export function validateStayDates(arrival: string | null, departure: string | null): string | null {
  if (!isValidDate(arrival) || !isValidDate(departure)) {
    return 'arrival_date and departure_date are required in YYYY-MM-DD format.'
  }
  if (departure <= arrival) {
    return 'departure_date must be after arrival_date.'
  }
  if (countNights(arrival, departure) > 365) {
    return 'Stays longer than 365 nights are not supported.'
  }
  return null
}

export function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  return host ? `${proto}://${host}` : request.nextUrl.origin
}
