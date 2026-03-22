import { mockLists, mockItems } from './mockData'
import { v4 as uuidv4 } from 'uuid'

let lists = [...mockLists]
let items = [...mockItems]

export class MockRepository {
  async createList(name: string, budget: number) {
    lists.push({ id: uuidv4(), name, budget, created_at: new Date().toISOString(), is_completed: 0 })
  }

  async getLists() {
    return [...lists]
  }

  async updateList(id: string, name: string, budget: number) {
    lists = lists.map(l => l.id === id ? { ...l, name, budget } : l)
  }

  async deleteList(id: string) {
    lists = lists.filter(l => l.id !== id)
    items = items.filter(i => i.list_id !== id)
  }

  async completeList(id: string) {
    lists = lists.map(l => l.id === id ? { ...l, is_completed: 1 } : l)
  }

  async getListDetails(id: string) {
    return {
      items: items.filter(i => i.list_id === id),
      list: lists.find(l => l.id === id) ?? null
    }
  }

  async addItem(listId: string, name: string, price: number, quantity: number) {
    items.push({ id: uuidv4(), list_id: listId, name, price, quantity, is_checked: 0 })
  }

  async updateItem(id: string, name: string, price: number, quantity: number) {
    items = items.map(i => i.id === id ? { ...i, name, price, quantity } : i)
  }

  async toggleItem(id: string) {
    items = items.map(i => i.id === id ? { ...i, is_checked: i.is_checked ? 0 : 1 } : i)
  }

  async deleteItem(id: string) {
    items = items.filter(i => i.id !== id)
  }

  async getAllTotals() {
    const totalsMap: Record<string, number> = {}
    items.forEach(item => {
      totalsMap[item.list_id] = (totalsMap[item.list_id] || 0) + item.price * item.quantity
    })
    return Object.entries(totalsMap).map(([list_id, total]) => ({ list_id, total }))
  }
}