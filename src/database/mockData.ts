export const mockLists = [
  { id: '1', name: 'Weekly Grocery', budget: 2000, created_at: new Date().toISOString(), is_completed: 0 },
  { id: '2', name: 'Party Supplies', budget: 5000, created_at: new Date().toISOString(), is_completed: 0 },
  { id: '3', name: 'Office Snacks', budget: 1000, created_at: new Date().toISOString(), is_completed: 0 },
]

export const mockItems = [
  { id: '1', list_id: '1', name: 'Rice', price: 55, quantity: 2, is_checked: 0 },
  { id: '2', list_id: '1', name: 'Eggs', price: 12, quantity: 12, is_checked: 0 },
  { id: '3', list_id: '1', name: 'Chicken', price: 180, quantity: 1, is_checked: 0 },
  { id: '4', list_id: '2', name: 'Balloons', price: 50, quantity: 10, is_checked: 0 },
  { id: '5', list_id: '2', name: 'Paper Plates', price: 120, quantity: 3, is_checked: 0 },
  { id: '6', list_id: '3', name: 'Biscuits', price: 35, quantity: 5, is_checked: 0 },
]