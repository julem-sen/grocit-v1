import { GroceryRepository } from '@/repositories/GroceryRepository'
import { GroceryItem } from '@/models/GroceryItem'

export class GroceryService {
  private repo = new GroceryRepository()

  async createList(name: string, budget: number) {
    if (!name?.trim()) throw new Error('List name is required')
    if (budget <= 0) throw new Error('Budget must be greater than zero')
    await this.repo.createList(name.trim(), budget)
  }

  async getLists() {
    return await this.repo.getLists()
  }

  async getAllTotals(): Promise<Record<string, number>> {
    const rows = await this.repo.getAllTotals()
    // Convert array to a map: { list_id: total }
    return rows.reduce((map: Record<string, number>, row: any) => {
      map[row.list_id] = row.total || 0
      return map
    }, {})
  }

  async updateList(id: string, name: string, budget: number) {
    if (!id) throw new Error('List ID is required')
    if (!name?.trim()) throw new Error('List name is required')
    if (budget <= 0) throw new Error('Budget must be greater than zero')
    await this.repo.updateList(id, name.trim(), budget)
  }

  async deleteList(id: string) {
    if (!id) throw new Error('List ID is required')
    await this.repo.deleteList(id)
  }

  async completeList(id: string) {
    if (!id) throw new Error('List ID is required')
    await this.repo.completeList(id)
  }

  async getListDetails(id: string) {
    if (!id) throw new Error('List ID is required')
    return await this.repo.getListDetails(id)
  }

  async addItem(listId: string, name: string, price: number, quantity: number) {
    if (!listId) throw new Error('List ID is required')
    if (!name?.trim()) throw new Error('Item name is required')
    if (price < 0) throw new Error('Price cannot be negative')
    if (quantity <= 0) throw new Error('Quantity must be at least 1')
    await this.repo.addItem(listId, name.trim(), price, quantity)
  }

  async updateItem(id: string, name: string, price: number, quantity: number) {
    if (!id) throw new Error('Item ID is required')
    if (!name?.trim()) throw new Error('Item name is required')
    if (price < 0) throw new Error('Price cannot be negative')
    if (quantity <= 0) throw new Error('Quantity must be at least 1')
    await this.repo.updateItem(id, name.trim(), price, quantity)
  }

  async toggleItem(id: string) {
    if (!id) throw new Error('Item ID is required')
    await this.repo.toggleItem(id)
  }

  async deleteItem(id: string) {
    if (!id) throw new Error('Item ID is required')
    await this.repo.deleteItem(id)
  }

  calculateTotal(items: GroceryItem[]) {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  }

  calculateRemaining(budget: number, items: GroceryItem[]) {
    return budget - this.calculateTotal(items)
  }

  getProgress(budget: number, items: GroceryItem[]) {
    if (budget <= 0) return 0
    return Math.min((this.calculateTotal(items) / budget) * 100, 100)
  }
}