import { getApplicationById } from '@/lib/db/queries'
import { notFound } from 'next/navigation'
import { ApplicationReviewClient } from './application-review-client'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await getApplicationById(id)
  
  return {
    title: application?.applicant_name 
      ? `Review: ${application.applicant_name} - Paz Operations`
      : 'Application Review - Paz Operations',
  }
}

export default async function ApplicationReviewPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application) {
    notFound()
  }
  
  return <ApplicationReviewClient application={application} />
}
