import bcrypt from 'bcrypt';
import db from './database.js';

const SALT_ROUNDS = 10;

export async function seedDatabase() {
    console.log('Seeding database...');

    // Hash password for all demo users
    const passwordHash = await bcrypt.hash('demo123', SALT_ROUNDS);

    // Seed properties
    const insertProperty = db.prepare(`
        INSERT INTO properties (name, address) VALUES (?, ?)
    `);

    const alReemTower = insertProperty.run('Al Reem Tower', 'Abu Dhabi, UAE');
    const marinaMall = insertProperty.run('Marina Mall', 'Abu Dhabi, UAE');

    console.log('Properties seeded');

    // Seed users
    const insertUser = db.prepare(`
        INSERT INTO users (email, password_hash, role, name, title, unit, department, phone, property_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Tenants
    insertUser.run(
        'tenant@bhp.ae', passwordHash, 'tenant', 'Ahmed Al-Rashid', null,
        'Office 401, Al Reem Tower', null, '+971-50-123-4567', alReemTower.lastInsertRowid
    );

    insertUser.run(
        'tenant2@bhp.ae', passwordHash, 'tenant', 'Sara Trading LLC', null,
        'Shop G-12, Marina Mall', null, '+971-50-234-5678', marinaMall.lastInsertRowid
    );

    // Maintenance
    insertUser.run(
        'maintenance@bhp.ae', passwordHash, 'maintenance', 'Rashid', 'Head Engineer',
        null, 'Maintenance', '+971-50-345-6789', null
    );

    // Management
    insertUser.run(
        'fm@bhp.ae', passwordHash, 'management', 'Mohammad Aser', 'Financial Manager',
        null, 'Executive', '+971-50-456-7890', null
    );

    insertUser.run(
        'gm@bhp.ae', passwordHash, 'management', 'Ramzi Yacoub', 'General Manager',
        null, 'Executive', '+971-50-567-8901', null
    );

    // Accounts
    insertUser.run(
        'accounts@bhp.ae', passwordHash, 'accounts', 'Matthew', 'Admin Manager',
        null, 'Accounts', '+971-50-678-9012', null
    );

    console.log('Users seeded');

    // Seed vendors
    const insertVendor = db.prepare(`
        INSERT INTO vendors (name, email, phone, category, is_amc, amc_contract_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertVendor.run('CoolTech HVAC LLC', 'info@cooltech.ae', '+971-4-123-4567', 'HVAC', 0, null);
    insertVendor.run('Emirates Climate Control', 'sales@emiratesclimate.ae', '+971-4-234-5678', 'HVAC', 0, null);
    insertVendor.run('Abu Dhabi Plumbing Co.', 'info@adplumbing.ae', '+971-2-345-6789', 'Plumbing', 0, null);
    insertVendor.run('Quick Fix Services', 'support@quickfix.ae', '+971-2-456-7890', 'Plumbing', 0, null);
    insertVendor.run('Emirates Maintenance', 'info@emiratesmaint.ae', '+971-4-567-8901', 'General', 0, null);
    insertVendor.run('Premium Flooring LLC', 'sales@premiumfloor.ae', '+971-4-678-9012', 'General', 0, null);
    insertVendor.run('Schindler Emirates', 'service@schindler.ae', '+971-4-789-0123', 'Elevator', 1, 'AMC-2025-ELV-001');

    console.log('Vendors seeded');
    console.log('Database seeding complete!');
}
