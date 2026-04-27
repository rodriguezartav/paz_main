import { getIngredients } from '@/lib/db/queries'
import { IngredientsPageClient } from './ingredients-page-client'

export default async function IngredientsPage() {
  const ingredients = await getIngredients()

  return <IngredientsPageClient initialIngredients={ingredients} />
}
