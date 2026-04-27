import { getRecipeById, getIngredients } from '@/lib/db/queries'
import { RecipeManagerClient } from './recipe-manager-client'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecipeManagerPage({ params }: PageProps) {
  const { id } = await params
  const [recipe, ingredients] = await Promise.all([
    getRecipeById(id),
    getIngredients()
  ])

  if (!recipe) {
    notFound()
  }

  return <RecipeManagerClient recipe={recipe} allIngredients={ingredients} />
}
