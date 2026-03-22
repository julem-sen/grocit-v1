import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'

class Database {
  private static instance: Database
  private sqlite = new SQLiteConnection(CapacitorSQLite)
  private db: any

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async init() {
    this.db = await this.sqlite.createConnection(
      'grocery_db',
      false,
      'no-encryption',
      1,
      false
    )

    await this.db.open()

    await this.createTables()
  }

  private async createTables() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS grocery_lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        budget REAL NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `)

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        is_checked INTEGER NOT NULL DEFAULT 0
      );
    `)

    await this.db.execute(`
      ALTER TABLE grocery_lists ADD COLUMN is_completed INTEGER DEFAULT 0;
    `).catch(() => {}) // ignore if column already exists

    await this.db.execute(`
      ALTER TABLE grocery_items ADD COLUMN is_checked INTEGER DEFAULT 0;
    `).catch(() => {})
  }

  getDB() {
    return this.db
  }
}

export const database = Database.getInstance()