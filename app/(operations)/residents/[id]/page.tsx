import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ResidentDetailsPanel } from '@/components/residents/resident-details-panel'
import { getResidentById, getPaymentByResidentId, getApplicationById } from '@/lib/db/queries'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResidentDetailsPage({ params }: PageProps) {
  const { id } = await params
  const resident = await getResidentById(id)
  
  if (!resident) {
    notFound()
  }

  const [payment, application] = await Promise.all([
    getPaymentByResidentId(id),
    resident.application_id ? getApplicationById(resident.application_id) : null
  ])

  return (
    <div className="space-y-6">
      <Link href="/residents">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Residents
        </Button>
      </Link>
      
      <ResidentDetailsPanel resident={resident} payment={payment} application={application} />
    </div>
  )
}
