import { getWeeklyMealPlansForShoppingList, getIngredientsForInventory, getUnresolvedShortageReports } from '@/lib/db/queries'
import { ShoppingListPageClient } from './shopping-list-page-client'

export default async function ShoppingListPage() {
  const [weeklyMealPlans, ingredients, shortageReports] = await Promise.all([
    getWeeklyMealPlansForShoppingList(),
    getIngredientsForInventory(),
    getUnresolvedShortageReports(),
  ])

  return (
    <ShoppingListPageClient 
      weeklyMealPlans={weeklyMealPlans} 
      ingredients={ingredients}
      shortageReports={shortageReports}
    />
  )
}
