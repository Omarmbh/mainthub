import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path - use DATA_DIR env var for Railway volumes, otherwise use project root
const dataDir = process.env.DATA_DIR || join(__dirname, '..', '..');
const dbPath = join(dataDir, 'maintenance.db');

// Ensure data directory exists
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

console.log(`Database path: ${dbPath}`);

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
export function initializeDatabase() {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('Database schema initialized');
}

// Check if database is empty (no users)
export function isDatabaseEmpty() {
    const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
    return result.count === 0;
}

export default db;
