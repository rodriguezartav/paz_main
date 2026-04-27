// Helper function to calculate nights between two dates
export function calculateNights(arrivalDate: string, departureDate: string): number {
  const arrival = new Date(arrivalDate)
  const departure = new Date(departureDate)
  const diffTime = Math.abs(departure.getTime() - arrival.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateLong(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'CRC') {
    return `₡${amount.toLocaleString()}`
  }
  return `$${amount.toLocaleString()}`
}
