const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📦 Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Businesses table
      `CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_place_id TEXT UNIQUE,
        name TEXT NOT NULL,
        industry TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        latitude REAL,
        longitude REAL,
        google_rating REAL,
        google_reviews_count INTEGER,
        website_url TEXT,
        facebook_url TEXT,
        instagram_url TEXT,
        yelp_url TEXT,
        discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'discovered'
      )`,

      // Analysis results table
      `CREATE TABLE IF NOT EXISTS analysis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id INTEGER NOT NULL,
        health_score INTEGER,
        has_website BOOLEAN,
        has_ssl BOOLEAN,
        mobile_responsive BOOLEAN,
        page_load_time REAL,
        has_meta_tags BOOLEAN,
        has_schema_markup BOOLEAN,
        has_contact_info BOOLEAN,
        has_hours BOOLEAN,
        has_cta BOOLEAN,
        broken_links_count INTEGER,
        missing_images_count INTEGER,
        lighthouse_score INTEGER,
        red_flags TEXT,
        opportunities TEXT,
        analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )`,

      // Generated demos table
      `CREATE TABLE IF NOT EXISTS demos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id INTEGER NOT NULL,
        demo_url TEXT UNIQUE,
        template_used TEXT,
        generated_content TEXT,
        status TEXT DEFAULT 'active',
        expires_at DATETIME,
        views_count INTEGER DEFAULT 0,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )`,

      // Outreach campaigns table
      `CREATE TABLE IF NOT EXISTS outreach_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id INTEGER NOT NULL,
        method TEXT NOT NULL,
        subject TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        sent_at DATETIME,
        opened_at DATETIME,
        clicked_at DATETIME,
        replied_at DATETIME,
        converted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )`,

      // Conversions/Sales table
      `CREATE TABLE IF NOT EXISTS conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id INTEGER NOT NULL,
        package TEXT NOT NULL,
        price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    console.log('✅ Database tables created/verified');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📦 Database connection closed');
          resolve();
        }
      });
    });
  }
}

const db = new Database();
module.exports = db;
