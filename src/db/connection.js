const Database = require('better-sqlite3');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DB_PATH || 'taskr.db');
/**
 * @description The shared SQLite connection (in-memory under NODE_ENV=test, otherwise DB_PATH or taskr.db).
 * @type {import('better-sqlite3').Database}
 */
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = { db };
