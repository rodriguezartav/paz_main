import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { buildApiDocs } from '@/lib/api/docs'
import { CopyDocsButton } from './copy-docs-button'

export const metadata: Metadata = {
  title: 'Paz Reservations API — Developer Docs',
  description: 'How to list rooms, check availability, get rates and create reservations at Paz via API.',
}

export default async function DevelopersPage() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') || 'https'
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const baseUrl = `${proto}://${host}`
  const docs = buildApiDocs(baseUrl)
  const docsUrl = `${baseUrl}/api/v1/docs`

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm text-muted-foreground">API v1</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Paz Reservations API
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          Query rooms, availability and rates, and create reservations from another app. To build an
          integration with v0, paste this into the other project&apos;s chat:
        </p>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4">
          <code className="break-all font-mono text-sm text-foreground">
            {`Read ${docsUrl} and integrate the Paz Reservations API.`}
          </code>
          <div className="flex flex-wrap gap-3">
            <CopyDocsButton text={docs} />
            <a
              href="/api/v1/docs"
              className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-background"
            >
              Open raw markdown
            </a>
          </div>
        </div>
      </header>

      <section aria-label="Full API documentation">
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-card p-6 font-mono text-sm leading-relaxed text-card-foreground">
          {docs}
        </pre>
      </section>
    </main>
  )
}
