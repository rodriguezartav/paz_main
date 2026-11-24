import type { NextRequest } from 'next/server'
import { apiJson, apiOptions, getBaseUrl } from '@/lib/api/v1'

export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return apiOptions()
}

export function GET(request: NextRequest) {
  const api = `${getBaseUrl(request)}/api/v1`
  return apiJson({
    name: 'Paz Reservations API',
    version: 'v1',
    docs: `${api}/docs`,
    endpoints: [
      { method: 'GET', path: '/rooms', auth: false },
      { method: 'GET', path: '/rates', auth: false },
      { method: 'GET', path: '/rates/quote', auth: false },
      { method: 'GET', path: '/reservations', auth: true },
      { method: 'GET', path: '/reservations/{id}', auth: true },
      { method: 'POST', path: '/reservations', auth: true },
    ],
  })
}
