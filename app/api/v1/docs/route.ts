import type { NextRequest } from 'next/server'
import { buildApiDocs } from '@/lib/api/docs'
import { getBaseUrl } from '@/lib/api/v1'

export const dynamic = 'force-dynamic'

export function GET(request: NextRequest) {
  return new Response(buildApiDocs(getBaseUrl(request)), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
