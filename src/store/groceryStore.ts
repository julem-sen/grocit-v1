import { defineStore } from 'pinia'
import { GroceryService } from '@/services/GroceryService'
import { GroceryList } from '@/models/GroceryList'
import { GroceryItem } from '@/models/GroceryItem'

const service = new GroceryService()

export const useGroceryStore = defineStore('grocery', {
  state: () => ({
    lists: [] as GroceryList[],
    items: [] as GroceryItem[],
    selectedList: null as GroceryList | null,
    listTotals: {} as Record<string, number>,
    listCheckedTotals: {} as Record<string, number>,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async loadLists() {
      this.loading = true
      this.error = null
      try {
        const [lists, totals, checkedTotals] = await Promise.all([
          service.getLists(),
          service.getAllTotals(),
          service.getAllCheckedTotals()
        ])
        this.lists = lists
        this.listTotals = totals
        this.listCheckedTotals = checkedTotals
      } catch (e: any) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async createList(name: string, budget: number) {
      try {
        await service.createList(name, budget)
        await this.loadLists()
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async updateList(id: string, name: string, budget: number) {
      try {
        await service.updateList(id, name, budget)
        await this.loadLists()
        await this.selectList(id)
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async deleteList(id: string) {
      try {
        await service.deleteList(id)
        await this.loadLists()
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async completeList(id: string) {
      try {
        await service.completeList(id)
        await this.loadLists()
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async selectList(id: string) {
      this.loading = true
      this.error = null
      try {
        const details = await service.getListDetails(id)
        this.selectedList = details.list
        this.items = details.items
        // Keep listTotals in sync for this list
        this.listTotals[id] = details.items.reduce(
          (sum: number, i: GroceryItem) => sum + i.price * i.quantity, 0
        )
        this.listCheckedTotals[id] = details.items
          .filter((i: GroceryItem) => i.is_checked)
          .reduce((sum: number, i: GroceryItem) => sum + i.price * i.quantity, 0)
      } catch (e: any) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async addItem(name: string, price: number, quantity: number) {
      if (!this.selectedList) throw new Error('No list selected')
      try {
        await service.addItem(this.selectedList.id, name, price, quantity)
        await this.selectList(this.selectedList.id)
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async updateItem(id: string, name: string, price: number, quantity: number) {
      try {
        await service.updateItem(id, name, price, quantity)
        if (this.selectedList) await this.selectList(this.selectedList.id)
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async toggleItem(id: string) {
      try {
        await service.toggleItem(id)
        if (this.selectedList) await this.selectList(this.selectedList.id)
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },

    async deleteItem(id: string) {
      try {
        await service.deleteItem(id)
        if (this.selectedList) await this.selectList(this.selectedList.id)
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    }
  }
})