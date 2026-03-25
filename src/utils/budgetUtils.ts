import { GroceryItem } from '@/models/GroceryItem'
import { GroceryList } from '@/models/GroceryList'

export const calculateTotal = (items: GroceryItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export const calculateCheckedTotal = (items: GroceryItem[]) =>
  items.filter(i => i.is_checked).reduce((sum, i) => sum + i.price * i.quantity, 0)

export const getSpent = (list: GroceryList, listTotals: Record<string, number>) =>
  listTotals[list.id] || 0

export const getProgress = (list: GroceryList, listTotals: Record<string, number>) => {
  const spent = getSpent(list, listTotals)
  return list.budget > 0 ? Math.min((spent / list.budget) * 100, 100) : 0
}

export const isOverBudget = (list: GroceryList, listTotals: Record<string, number>) =>
  getSpent(list, listTotals) > list.budget

export const getStatusLabel = (list: GroceryList, listTotals: Record<string, number>) => {
  const pct = getProgress(list, listTotals)
  if (pct < 50) return '✦ SAFE ZONE'
  if (pct < 75) return '⚠ APPROACHING LIMIT'
  if (pct < 100) return '⚠ NEAR BUDGET'
  return '✕ BUDGET EXCEEDED'
}

export const getTagStyle = (list: GroceryList, listTotals: Record<string, number>) => {
  const pct = getProgress(list, listTotals)
  if (pct < 50) return { background: '#e8f5e9', color: '#2d5a27' }
  if (pct < 75) return { background: '#fff3e0', color: '#e65100' }
  return { background: '#ffebee', color: '#b71c1c' }
}

export const getProgressStyle = (list: GroceryList, listTotals: Record<string, number>) => {
  const pct = getProgress(list, listTotals)
  let gradient = 'linear-gradient(90deg, #66bb6a, #2e7d32)'
  if (pct >= 75) gradient = 'linear-gradient(90deg, #ef5350, #b71c1c)'
  else if (pct >= 50) gradient = 'linear-gradient(90deg, #ffa726, #e65100)'
  return { width: `${pct}%`, background: gradient }
}

export const calcProgressStyle = (pct: number) => {
  let gradient = 'linear-gradient(90deg, #66bb6a, #2e7d32)'
  if (pct >= 75) gradient = 'linear-gradient(90deg, #ef5350, #b71c1c)'
  else if (pct >= 50) gradient = 'linear-gradient(90deg, #ffa726, #e65100)'
  return { width: `${Math.min(pct, 100)}%`, background: gradient }
}

export const formatCurrency = (value: number) => value.toFixed(2)