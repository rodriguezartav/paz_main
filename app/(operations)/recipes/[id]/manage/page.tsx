import { getRecipeById, getIngredients, getRecipes } from '@/lib/db/queries'
import { RecipeManagerClient } from './recipe-manager-client'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecipeManagerPage({ params }: PageProps) {
  const { id } = await params
  const [recipe, ingredients, allRecipes] = await Promise.all([
    getRecipeById(id),
    getIngredients(),
    getRecipes()
  ])

  if (!recipe) {
    notFound()
  }

  return <RecipeManagerClient recipe={recipe} allIngredients={ingredients} allRecipes={allRecipes} />
}
