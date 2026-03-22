import { Capacitor } from '@capacitor/core'
import { database } from '@/database/sqliteDatabase'
import { MockRepository } from '@/database/mockRepository'
import { v4 as uuidv4 } from 'uuid'

// Use mock on web, real SQLite on native
const isWeb = Capacitor.getPlatform() === 'web'
const mock = isWeb ? new MockRepository() : null

export class GroceryRepository {
  private getDB() {
    const db = database.getDB()
    if (!db) throw new Error('Database is not initialized')
    return db
  }

  async createList(name: string, budget: number) {
    if (isWeb) return mock!.createList(name, budget)
    try {
      const db = this.getDB()
      await db.run(
        `INSERT INTO grocery_lists (id, name, budget, created_at) VALUES (?, ?, ?, ?)`,
        [uuidv4(), name, budget, new Date().toISOString()]
      )
    } catch (e: any) {
      throw new Error(`Failed to create list: ${e.message}`)
    }
  }

  async getLists() {
    if (isWeb) return mock!.getLists()
    try {
      const db = this.getDB()
      const res = await db.query(`SELECT * FROM grocery_lists`)
      return res.values || []
    } catch (e: any) {
      throw new Error(`Failed to fetch lists: ${e.message}`)
    }
  }

  async getAllTotals() {
    if (isWeb) return mock!.getAllTotals()
    try {
      const db = this.getDB()
      const res = await db.query(`
        SELECT list_id, SUM(price * quantity) as total
        FROM grocery_items
        GROUP BY list_id
      `)
      return res.values || []
    } catch (e: any) {
      throw new Error(`Failed to fetch totals: ${e.message}`)
    }
  }

  async updateList(id: string, name: string, budget: number) {
    if (isWeb) return mock!.updateList(id, name, budget)
    try {
      const db = this.getDB()
      await db.run(
        `UPDATE grocery_lists SET name = ?, budget = ? WHERE id = ?`,
        [name, budget, id]
      )
    } catch (e: any) {
      throw new Error(`Failed to update list: ${e.message}`)
    }
  }

  async deleteList(id: string) {
    if (isWeb) return mock!.deleteList(id)
    try {
      const db = this.getDB()
      await db.run(`DELETE FROM grocery_items WHERE list_id = ?`, [id])
      await db.run(`DELETE FROM grocery_lists WHERE id = ?`, [id])
    } catch (e: any) {
      throw new Error(`Failed to delete list: ${e.message}`)
    }
  }

  async completeList(id: string) {
    if (isWeb) return mock!.completeList(id)
    try {
      const db = this.getDB()
      await db.run(
        `UPDATE grocery_lists SET is_completed = 1 WHERE id = ?`,
        [id]
      )
    } catch (e: any) {
      throw new Error(`Failed to complete list: ${e.message}`)
    }
  }

  async getListDetails(id: string) {
    if (isWeb) return mock!.getListDetails(id)
    try {
      const db = this.getDB()
      const itemsRes = await db.query(`SELECT * FROM grocery_items WHERE list_id = ?`, [id])
      const listRes = await db.query(`SELECT * FROM grocery_lists WHERE id = ?`, [id])
      return {
        items: itemsRes.values || [],
        list: listRes.values?.[0] ?? null
      }
    } catch (e: any) {
      throw new Error(`Failed to fetch list details: ${e.message}`)
    }
  }

  async addItem(listId: string, name: string, price: number, quantity: number) {
    if (isWeb) return mock!.addItem(listId, name, price, quantity)
    try {
      const db = this.getDB()
      await db.run(
        `INSERT INTO grocery_items (id, list_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), listId, name, price, quantity]
      )
    } catch (e: any) {
      throw new Error(`Failed to add item: ${e.message}`)
    }
  }

  async updateItem(id: string, name: string, price: number, quantity: number) {
    if (isWeb) return mock!.updateItem(id, name, price, quantity)
    try {
      const db = this.getDB()
      await db.run(
        `UPDATE grocery_items SET name = ?, price = ?, quantity = ? WHERE id = ?`,
        [name, price, quantity, id]
      )
    } catch (e: any) {
      throw new Error(`Failed to update item: ${e.message}`)
    }
  }

  async toggleItem(id: string) {
    if (isWeb) return mock!.toggleItem(id)
    try {
      const db = this.getDB()
      await db.run(
        `UPDATE grocery_items SET is_checked = CASE WHEN is_checked = 1 THEN 0 ELSE 1 END WHERE id = ?`,
        [id]
      )
    } catch (e: any) {
      throw new Error(`Failed to toggle item: ${e.message}`)
    }
  }

  async deleteItem(id: string) {
    if (isWeb) return mock!.deleteItem(id)
    try {
      const db = this.getDB()
      await db.run(`DELETE FROM grocery_items WHERE id = ?`, [id])
    } catch (e: any) {
      throw new Error(`Failed to delete item: ${e.message}`)
    }
  }
}