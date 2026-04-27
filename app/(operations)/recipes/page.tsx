import { getRecipes, getIngredients } from '@/lib/db/queries'
import { RecipesPageClient } from './recipes-page-client'

export default async function RecipesPage() {
  const [recipes, ingredients] = await Promise.all([
    getRecipes(),
    getIngredients()
  ])

  return <RecipesPageClient initialRecipes={recipes} ingredients={ingredients} />
}
