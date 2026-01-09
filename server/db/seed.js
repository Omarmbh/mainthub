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
    const tenant1 = insertUser.run(
        'tenant@bhp.ae', passwordHash, 'tenant', 'Ahmed Al-Rashid', null,
        'Office 401, Al Reem Tower', null, '+971-50-123-4567', alReemTower.lastInsertRowid
    );

    const tenant2 = insertUser.run(
        'tenant2@bhp.ae', passwordHash, 'tenant', 'Sara Trading LLC', null,
        'Shop G-12, Marina Mall', null, '+971-50-234-5678', marinaMall.lastInsertRowid
    );

    // Maintenance
    const maintenance = insertUser.run(
        'maintenance@bhp.ae', passwordHash, 'maintenance', 'Rashid', 'Head Engineer',
        null, 'Maintenance', '+971-50-345-6789', null
    );

    // Management
    const fm = insertUser.run(
        'fm@bhp.ae', passwordHash, 'management', 'Mohammad Aser', 'Financial Manager',
        null, 'Executive', '+971-50-456-7890', null
    );

    const gm = insertUser.run(
        'gm@bhp.ae', passwordHash, 'management', 'Ramzi Yacoub', 'General Manager',
        null, 'Executive', '+971-50-567-8901', null
    );

    // Accounts
    const accounts = insertUser.run(
        'accounts@bhp.ae', passwordHash, 'accounts', 'Matthew', 'Admin Manager',
        null, 'Accounts', '+971-50-678-9012', null
    );

    console.log('Users seeded');

    // Seed vendors
    const insertVendor = db.prepare(`
        INSERT INTO vendors (name, email, phone, category, is_amc, amc_contract_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const cooltech = insertVendor.run('CoolTech HVAC LLC', 'info@cooltech.ae', '+971-4-123-4567', 'HVAC', 0, null);
    const emiratesClimate = insertVendor.run('Emirates Climate Control', 'sales@emiratesclimate.ae', '+971-4-234-5678', 'HVAC', 0, null);
    const abuDhabiPlumbing = insertVendor.run('Abu Dhabi Plumbing Co.', 'info@adplumbing.ae', '+971-2-345-6789', 'Plumbing', 0, null);
    const quickFix = insertVendor.run('Quick Fix Services', 'support@quickfix.ae', '+971-2-456-7890', 'Plumbing', 0, null);
    const emiratesMaint = insertVendor.run('Emirates Maintenance', 'info@emiratesmaint.ae', '+971-4-567-8901', 'General', 0, null);
    const premiumFlooring = insertVendor.run('Premium Flooring LLC', 'sales@premiumfloor.ae', '+971-4-678-9012', 'General', 0, null);
    const schindler = insertVendor.run('Schindler Emirates', 'service@schindler.ae', '+971-4-789-0123', 'Elevator', 1, 'AMC-2025-ELV-001');

    console.log('Vendors seeded');

    // Seed sample requests
    const insertRequest = db.prepare(`
        INSERT INTO requests (
            request_number, title, description, category, priority, status,
            tenant_id, property_id, amc_covered, amc_vendor_id, estimated_cost,
            selected_quote_id, acknowledged_at, approved_at, approved_by, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQuote = db.prepare(`
        INSERT INTO quotes (request_id, vendor_id, vendor_name, vendor_email, amount, delivery_days, scope, warranty, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAuditLog = db.prepare(`
        INSERT INTO audit_logs (request_id, user_id, user_role, user_name, action, details, sla_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now - 4 * 24 * 60 * 60 * 1000);

    // Request 1: In pending_quotes with 2 quotes received
    const req1 = insertRequest.run(
        'MR-2026-0001', 'AC Unit Not Cooling - Office 401',
        'The main air conditioning unit in Office 401 has stopped cooling effectively. Temperature remains at 28°C despite thermostat being set to 22°C. Affecting productivity of 15 staff members.',
        'HVAC', 'high', 'pending_quotes',
        tenant1.lastInsertRowid, alReemTower.lastInsertRowid,
        0, null, null, null, twoHoursAgo.toISOString(), null, null, null, threeDaysAgo.toISOString()
    );

    // Add quotes for request 1
    insertQuote.run(req1.lastInsertRowid, cooltech.lastInsertRowid, 'CoolTech HVAC LLC', 'info@cooltech.ae', 3500, 2, 'Full AC unit inspection, refrigerant recharge, filter replacement', '90 days on parts and labor', 'received');
    insertQuote.run(req1.lastInsertRowid, emiratesClimate.lastInsertRowid, 'Emirates Climate Control', 'sales@emiratesclimate.ae', 4200, 3, 'Complete system diagnostic, compressor repair if needed, refrigerant top-up', '6 months warranty', 'received');

    // Audit logs for request 1
    insertAuditLog.run(req1.lastInsertRowid, tenant1.lastInsertRowid, 'tenant', 'Ahmed Al-Rashid', 'Request Created', 'New maintenance request submitted for AC issue', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req1.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Request Acknowledged', 'Assigned for quote collection', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req1.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Status Changed', 'Status changed to pending_quotes - awaiting vendor quotes', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req1.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote received from CoolTech HVAC LLC - AED 3,500', 'within_target', oneDayAgo.toISOString());
    insertAuditLog.run(req1.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote received from Emirates Climate Control - AED 4,200', 'within_target', oneHourAgo.toISOString());

    // Request 2: In pending_approval awaiting GM (amount > 5000)
    const req2 = insertRequest.run(
        'MR-2026-0002', 'Water Leak in Basement Parking',
        'Significant water leak detected in basement parking level B2. Water is pooling near electrical panels. Requires immediate attention.',
        'Plumbing', 'critical', 'pending_approval',
        tenant1.lastInsertRowid, alReemTower.lastInsertRowid,
        0, null, 8500, null, fourDaysAgo.toISOString(), null, null, null, fourDaysAgo.toISOString()
    );

    // Add quotes for request 2 (one selected)
    insertQuote.run(req2.lastInsertRowid, abuDhabiPlumbing.lastInsertRowid, 'Abu Dhabi Plumbing Co.', 'info@adplumbing.ae', 8500, 1, 'Emergency pipe repair, waterproofing, electrical isolation', '1 year warranty', 'selected');
    insertQuote.run(req2.lastInsertRowid, quickFix.lastInsertRowid, 'Quick Fix Services', 'support@quickfix.ae', 9200, 2, 'Pipe replacement, drainage system check, waterproofing membrane', '6 months warranty', 'not_selected');
    insertQuote.run(req2.lastInsertRowid, emiratesMaint.lastInsertRowid, 'Emirates Maintenance', 'info@emiratesmaint.ae', 11500, 2, 'Complete plumbing overhaul, new drainage system', '2 years warranty', 'not_selected');

    // Update selected quote id
    const quotes2 = db.prepare('SELECT id FROM quotes WHERE request_id = ? AND status = ?').get(req2.lastInsertRowid, 'selected');
    db.prepare('UPDATE requests SET selected_quote_id = ? WHERE id = ?').run(quotes2.id, req2.lastInsertRowid);

    // Audit logs for request 2
    insertAuditLog.run(req2.lastInsertRowid, tenant1.lastInsertRowid, 'tenant', 'Ahmed Al-Rashid', 'Request Created', 'Emergency request submitted for water leak', 'within_target', fourDaysAgo.toISOString());
    insertAuditLog.run(req2.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Request Acknowledged', 'CRITICAL: Immediate response required', 'within_target', fourDaysAgo.toISOString());
    insertAuditLog.run(req2.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote from Abu Dhabi Plumbing - AED 8,500', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req2.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote from Quick Fix Services - AED 9,200', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req2.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote from Emirates Maintenance - AED 11,500', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req2.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Quote Selected', 'Selected Abu Dhabi Plumbing Co. for AED 8,500 - best value with fastest delivery', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req2.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Pending Approval', 'Amount AED 8,500 requires General Manager approval (threshold: AED 5,001-25,000)', 'at_risk', twoDaysAgo.toISOString());

    // Request 3: Completed AMC request (Elevator)
    const req3 = insertRequest.run(
        'MR-2026-0003', 'Elevator B - Unusual Noise',
        'Elevator B making unusual grinding noise during operation. Passengers reported vibration.',
        'Elevator', 'medium', 'completed',
        tenant2.lastInsertRowid, marinaMall.lastInsertRowid,
        1, schindler.lastInsertRowid, 0, null,
        fourDaysAgo.toISOString(), null, null, oneDayAgo.toISOString(), fourDaysAgo.toISOString()
    );

    // Audit logs for request 3 (AMC covered)
    insertAuditLog.run(req3.lastInsertRowid, tenant2.lastInsertRowid, 'tenant', 'Sara Trading LLC', 'Request Created', 'Elevator maintenance request submitted', 'within_target', fourDaysAgo.toISOString());
    insertAuditLog.run(req3.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Request Acknowledged', 'Checking AMC coverage', 'within_target', fourDaysAgo.toISOString());
    insertAuditLog.run(req3.lastInsertRowid, null, 'system', 'System', 'AMC Coverage Confirmed', 'Request covered under AMC-2025-ELV-001 with Schindler Emirates', 'within_target', fourDaysAgo.toISOString());
    insertAuditLog.run(req3.lastInsertRowid, null, 'system', 'System', 'Vendor Notified', 'Schindler Emirates notified for service dispatch', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req3.lastInsertRowid, null, 'system', 'System', 'Work Started', 'Schindler technician on-site', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req3.lastInsertRowid, null, 'system', 'System', 'Work Completed', 'Bearing replacement and lubrication completed', 'within_target', oneDayAgo.toISOString());
    insertAuditLog.run(req3.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Work Verified', 'Physical inspection completed. Elevator operating smoothly.', 'within_target', oneDayAgo.toISOString());

    // Request 4: Approved and in_progress
    const req4 = insertRequest.run(
        'MR-2026-0004', 'Lobby Floor Tile Replacement',
        'Several floor tiles in the main lobby are cracked and pose a safety hazard. Need replacement.',
        'General', 'medium', 'in_progress',
        tenant1.lastInsertRowid, alReemTower.lastInsertRowid,
        0, null, 2800, null, threeDaysAgo.toISOString(), twoDaysAgo.toISOString(), fm.lastInsertRowid, null, fourDaysAgo.toISOString()
    );

    // Add quotes for request 4
    insertQuote.run(req4.lastInsertRowid, premiumFlooring.lastInsertRowid, 'Premium Flooring LLC', 'sales@premiumfloor.ae', 2800, 3, 'Remove damaged tiles, prepare subfloor, install matching porcelain tiles', '2 years warranty', 'selected');
    insertQuote.run(req4.lastInsertRowid, emiratesMaint.lastInsertRowid, 'Emirates Maintenance', 'info@emiratesmaint.ae', 3500, 5, 'Full tile replacement with upgraded material', '3 years warranty', 'not_selected');
    insertQuote.run(req4.lastInsertRowid, quickFix.lastInsertRowid, 'Quick Fix Services', 'support@quickfix.ae', 2500, 4, 'Basic tile replacement', '1 year warranty', 'not_selected');

    // Update selected quote id
    const quotes4 = db.prepare('SELECT id FROM quotes WHERE request_id = ? AND status = ?').get(req4.lastInsertRowid, 'selected');
    db.prepare('UPDATE requests SET selected_quote_id = ? WHERE id = ?').run(quotes4.id, req4.lastInsertRowid);

    // Audit logs for request 4
    insertAuditLog.run(req4.lastInsertRowid, tenant1.lastInsertRowid, 'tenant', 'Ahmed Al-Rashid', 'Request Created', 'Floor tile replacement request', 'within_target', fourDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Request Acknowledged', 'Assigned for quote collection', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote from Premium Flooring - AED 2,800', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote from Emirates Maintenance - AED 3,500', 'within_target', threeDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, null, 'system', 'System', 'Quote Received', 'Quote from Quick Fix Services - AED 2,500', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, maintenance.lastInsertRowid, 'maintenance', 'Rashid', 'Quote Selected', 'Selected Premium Flooring LLC - AED 2,800 (best quality-to-price ratio)', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, fm.lastInsertRowid, 'management', 'Mohammad Aser', 'Approved', 'Approved by Financial Manager (amount within AED 501-5,000 threshold)', 'within_target', twoDaysAgo.toISOString());
    insertAuditLog.run(req4.lastInsertRowid, null, 'system', 'System', 'Work Started', 'Premium Flooring LLC commenced work', 'within_target', oneDayAgo.toISOString());

    // Request 5: New request just submitted
    const req5 = insertRequest.run(
        'MR-2026-0005', 'Security Camera Malfunction',
        'Security camera in parking area P3 showing distorted image. Unable to record clearly.',
        'Security', 'high', 'new',
        tenant2.lastInsertRowid, marinaMall.lastInsertRowid,
        0, null, null, null, null, null, null, null, oneHourAgo.toISOString()
    );

    insertAuditLog.run(req5.lastInsertRowid, tenant2.lastInsertRowid, 'tenant', 'Sara Trading LLC', 'Request Created', 'New security camera maintenance request', 'within_target', oneHourAgo.toISOString());

    console.log('Sample requests seeded');
    console.log('Database seeding complete!');
}
