import { getWeeklyMealPlansForShoppingList, getIngredientsForInventory } from '@/lib/db/queries'
import { ShoppingListPageClient } from './shopping-list-page-client'

export default async function ShoppingListPage() {
  const [weeklyMealPlans, ingredients] = await Promise.all([
    getWeeklyMealPlansForShoppingList(),
    getIngredientsForInventory()
  ])

  return (
    <ShoppingListPageClient 
      weeklyMealPlans={weeklyMealPlans} 
      ingredients={ingredients} 
    />
  )
}
