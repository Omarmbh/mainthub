import express from 'express';
import session from 'express-session';
import bcryptjs from 'bcryptjs';

const bcrypt = bcryptjs;

const app = express();

// In-memory database for serverless (resets on cold start)
let db = {
    users: [],
    properties: [],
    vendors: [],
    requests: [],
    quotes: [],
    approvals: [],
    audit_logs: [],
    four_doc_packs: []
};

let initialized = false;

// Initialize with seed data
async function initializeData() {
    if (initialized) return;

    const passwordHash = await bcrypt.hash('demo123', 10);

    // Properties
    db.properties = [
        { id: 1, name: 'Al Reem Tower', address: 'Abu Dhabi, UAE' },
        { id: 2, name: 'Marina Mall', address: 'Abu Dhabi, UAE' }
    ];

    // Users
    db.users = [
        { id: 1, email: 'tenant@bhp.ae', password_hash: passwordHash, role: 'tenant', name: 'Ahmed Al-Rashid', title: null, unit: 'Office 401, Al Reem Tower', department: null, property_id: 1, property_name: 'Al Reem Tower' },
        { id: 2, email: 'tenant2@bhp.ae', password_hash: passwordHash, role: 'tenant', name: 'Sara Trading LLC', title: null, unit: 'Shop G-12, Marina Mall', department: null, property_id: 2, property_name: 'Marina Mall' },
        { id: 3, email: 'maintenance@bhp.ae', password_hash: passwordHash, role: 'maintenance', name: 'Rashid', title: 'Head Engineer', unit: null, department: 'Maintenance', property_id: null, property_name: null },
        { id: 4, email: 'fm@bhp.ae', password_hash: passwordHash, role: 'management', name: 'Mohammad Aser', title: 'Financial Manager', unit: null, department: 'Executive', property_id: null, property_name: null },
        { id: 5, email: 'gm@bhp.ae', password_hash: passwordHash, role: 'management', name: 'Ramzi Yacoub', title: 'General Manager', unit: null, department: 'Executive', property_id: null, property_name: null },
        { id: 6, email: 'accounts@bhp.ae', password_hash: passwordHash, role: 'accounts', name: 'Matthew', title: 'Admin Manager', unit: null, department: 'Accounts', property_id: null, property_name: null }
    ];

    // Vendors
    db.vendors = [
        { id: 1, name: 'CoolTech HVAC LLC', email: 'info@cooltech.ae', phone: '+971-4-123-4567', category: 'HVAC', is_amc: 0, amc_contract_id: null, active: 1 },
        { id: 2, name: 'Emirates Climate Control', email: 'sales@emiratesclimate.ae', phone: '+971-4-234-5678', category: 'HVAC', is_amc: 0, amc_contract_id: null, active: 1 },
        { id: 3, name: 'Abu Dhabi Plumbing Co.', email: 'info@adplumbing.ae', phone: '+971-2-345-6789', category: 'Plumbing', is_amc: 0, amc_contract_id: null, active: 1 },
        { id: 4, name: 'Quick Fix Services', email: 'support@quickfix.ae', phone: '+971-2-456-7890', category: 'Plumbing', is_amc: 0, amc_contract_id: null, active: 1 },
        { id: 5, name: 'Emirates Maintenance', email: 'info@emiratesmaint.ae', phone: '+971-4-567-8901', category: 'General', is_amc: 0, amc_contract_id: null, active: 1 },
        { id: 6, name: 'Premium Flooring LLC', email: 'sales@premiumfloor.ae', phone: '+971-4-678-9012', category: 'General', is_amc: 0, amc_contract_id: null, active: 1 },
        { id: 7, name: 'Schindler Emirates', email: 'service@schindler.ae', phone: '+971-4-789-0123', category: 'Elevator', is_amc: 1, amc_contract_id: 'AMC-2025-ELV-001', active: 1 }
    ];

    const now = new Date().toISOString();
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2*24*60*60*1000).toISOString();

    // Sample requests
    db.requests = [
        { id: 1, request_number: 'MR-2026-0001', title: 'AC Unit Not Cooling - Office 401', description: 'The main air conditioning unit has stopped cooling effectively.', category: 'HVAC', priority: 'high', status: 'pending_quotes', tenant_id: 1, property_id: 1, amc_covered: 0, amc_vendor_id: null, estimated_cost: null, selected_quote_id: null, created_at: twoDaysAgo, tenant_name: 'Ahmed Al-Rashid', tenant_unit: 'Office 401, Al Reem Tower', property_name: 'Al Reem Tower' },
        { id: 2, request_number: 'MR-2026-0002', title: 'Water Leak in Basement Parking', description: 'Significant water leak detected in basement parking level B2.', category: 'Plumbing', priority: 'critical', status: 'pending_approval', tenant_id: 1, property_id: 1, amc_covered: 0, amc_vendor_id: null, estimated_cost: 8500, selected_quote_id: 3, created_at: twoDaysAgo, tenant_name: 'Ahmed Al-Rashid', tenant_unit: 'Office 401, Al Reem Tower', property_name: 'Al Reem Tower', selected_vendor_name: 'Abu Dhabi Plumbing Co.', selected_quote_amount: 8500 },
        { id: 3, request_number: 'MR-2026-0003', title: 'Elevator B - Unusual Noise', description: 'Elevator B making unusual grinding noise during operation.', category: 'Elevator', priority: 'medium', status: 'completed', tenant_id: 2, property_id: 2, amc_covered: 1, amc_vendor_id: 7, estimated_cost: 0, selected_quote_id: null, created_at: twoDaysAgo, completed_at: oneDayAgo, tenant_name: 'Sara Trading LLC', tenant_unit: 'Shop G-12, Marina Mall', property_name: 'Marina Mall', amc_vendor_name: 'Schindler Emirates' },
        { id: 4, request_number: 'MR-2026-0004', title: 'Lobby Floor Tile Replacement', description: 'Several floor tiles in the main lobby are cracked.', category: 'General', priority: 'medium', status: 'in_progress', tenant_id: 1, property_id: 1, amc_covered: 0, amc_vendor_id: null, estimated_cost: 2800, selected_quote_id: 6, approved_at: oneDayAgo, approved_by: 4, created_at: twoDaysAgo, tenant_name: 'Ahmed Al-Rashid', tenant_unit: 'Office 401, Al Reem Tower', property_name: 'Al Reem Tower', selected_vendor_name: 'Premium Flooring LLC', selected_quote_amount: 2800, approved_by_name: 'Mohammad Aser', approved_by_title: 'Financial Manager' },
        { id: 5, request_number: 'MR-2026-0005', title: 'Security Camera Malfunction', description: 'Security camera in parking area P3 showing distorted image.', category: 'Security', priority: 'high', status: 'new', tenant_id: 2, property_id: 2, amc_covered: 0, amc_vendor_id: null, estimated_cost: null, selected_quote_id: null, created_at: now, tenant_name: 'Sara Trading LLC', tenant_unit: 'Shop G-12, Marina Mall', property_name: 'Marina Mall' }
    ];

    // Quotes
    db.quotes = [
        { id: 1, request_id: 1, vendor_id: 1, vendor_name: 'CoolTech HVAC LLC', vendor_email: 'info@cooltech.ae', amount: 3500, delivery_days: 2, scope: 'Full AC unit inspection, refrigerant recharge', warranty: '90 days', status: 'received' },
        { id: 2, request_id: 1, vendor_id: 2, vendor_name: 'Emirates Climate Control', vendor_email: 'sales@emiratesclimate.ae', amount: 4200, delivery_days: 3, scope: 'Complete system diagnostic, compressor repair', warranty: '6 months', status: 'received' },
        { id: 3, request_id: 2, vendor_id: 3, vendor_name: 'Abu Dhabi Plumbing Co.', vendor_email: 'info@adplumbing.ae', amount: 8500, delivery_days: 1, scope: 'Emergency pipe repair, waterproofing', warranty: '1 year', status: 'selected' },
        { id: 4, request_id: 2, vendor_id: 4, vendor_name: 'Quick Fix Services', vendor_email: 'support@quickfix.ae', amount: 9200, delivery_days: 2, scope: 'Pipe replacement, drainage check', warranty: '6 months', status: 'not_selected' },
        { id: 5, request_id: 2, vendor_id: 5, vendor_name: 'Emirates Maintenance', vendor_email: 'info@emiratesmaint.ae', amount: 11500, delivery_days: 2, scope: 'Complete plumbing overhaul', warranty: '2 years', status: 'not_selected' },
        { id: 6, request_id: 4, vendor_id: 6, vendor_name: 'Premium Flooring LLC', vendor_email: 'sales@premiumfloor.ae', amount: 2800, delivery_days: 3, scope: 'Remove damaged tiles, install matching tiles', warranty: '2 years', status: 'selected' }
    ];

    // Audit logs
    db.audit_logs = [
        { id: 1, request_id: 1, user_id: 1, user_role: 'tenant', user_name: 'Ahmed Al-Rashid', action: 'Request Created', details: 'New maintenance request submitted', sla_status: 'within_target', created_at: twoDaysAgo },
        { id: 2, request_id: 1, user_id: 3, user_role: 'maintenance', user_name: 'Rashid', action: 'Request Acknowledged', details: 'Assigned for quote collection', sla_status: 'within_target', created_at: twoDaysAgo },
        { id: 3, request_id: 2, user_id: 1, user_role: 'tenant', user_name: 'Ahmed Al-Rashid', action: 'Request Created', details: 'Emergency request for water leak', sla_status: 'within_target', created_at: twoDaysAgo },
        { id: 4, request_id: 2, user_id: 3, user_role: 'maintenance', user_name: 'Rashid', action: 'Quote Selected', details: 'Selected Abu Dhabi Plumbing Co. for AED 8,500', sla_status: 'within_target', created_at: oneDayAgo },
        { id: 5, request_id: 2, user_id: 3, user_role: 'maintenance', user_name: 'Rashid', action: 'Pending Approval', details: 'Amount AED 8,500 requires General Manager approval', sla_status: 'at_risk', created_at: oneDayAgo },
        { id: 6, request_id: 3, user_id: 2, user_role: 'tenant', user_name: 'Sara Trading LLC', action: 'Request Created', details: 'Elevator maintenance request', sla_status: 'within_target', created_at: twoDaysAgo },
        { id: 7, request_id: 3, user_id: null, user_role: 'system', user_name: 'System', action: 'AMC Coverage Confirmed', details: 'Covered under AMC-2025-ELV-001 with Schindler Emirates', sla_status: 'within_target', created_at: twoDaysAgo },
        { id: 8, request_id: 3, user_id: 3, user_role: 'maintenance', user_name: 'Rashid', action: 'Work Verified', details: 'Bearing replacement completed', sla_status: 'within_target', created_at: oneDayAgo },
        { id: 9, request_id: 5, user_id: 2, user_role: 'tenant', user_name: 'Sara Trading LLC', action: 'Request Created', details: 'Security camera maintenance request', sla_status: 'within_target', created_at: now }
    ];

    initialized = true;
}

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'bhp-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));

// Initialize data on first request
app.use(async (req, res, next) => {
    await initializeData();
    next();
});

// Helper functions
const getNextId = (table) => Math.max(0, ...db[table].map(r => r.id)) + 1;

const generateRequestNumber = () => {
    const year = new Date().getFullYear();
    const existing = db.requests.filter(r => r.request_number.includes(`MR-${year}`));
    const nextNum = existing.length + 1;
    return `MR-${year}-${String(nextNum).padStart(4, '0')}`;
};

const logAudit = (requestId, user, action, details, slaStatus = 'na') => {
    db.audit_logs.push({
        id: getNextId('audit_logs'),
        request_id: requestId,
        user_id: user?.id || null,
        user_role: user?.role || 'system',
        user_name: user?.name || 'System',
        action,
        details,
        sla_status: slaStatus,
        created_at: new Date().toISOString()
    });
};

const getApprovalAuthority = (amount) => {
    if (amount <= 500) return { title: 'Head Engineer', level: 'auto', threshold: 'Up to AED 500' };
    if (amount <= 5000) return { title: 'Financial Manager', level: 'fm', threshold: 'AED 501 - 5,000' };
    if (amount <= 25000) return { title: 'General Manager', level: 'gm', threshold: 'AED 5,001 - 25,000' };
    return { title: 'Chairman', level: 'chairman', threshold: 'Above AED 25,000' };
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email?.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;
    res.json({ message: 'Login successful', user: userWithoutPassword });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ message: 'Logged out' }));
});

app.get('/api/auth/me', (req, res) => {
    if (req.session?.user) return res.json({ user: req.session.user });
    res.status(401).json({ error: 'Not authenticated' });
});

app.get('/api/auth/users', (req, res) => {
    const users = db.users.map(({ password_hash, ...u }) => u);
    res.json({ users });
});

app.post('/api/auth/switch-role', (req, res) => {
    const { email } = req.body;
    const user = db.users.find(u => u.email === email?.toLowerCase());
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password_hash, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;
    res.json({ message: 'Role switched', user: userWithoutPassword });
});

// Requests routes
app.get('/api/requests', (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    let requests = [...db.requests];
    if (user.role === 'tenant') {
        requests = requests.filter(r => r.tenant_id === user.id);
    }
    res.json({ requests: requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
});

app.get('/api/requests/stats', (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    let requests = user.role === 'tenant' ? db.requests.filter(r => r.tenant_id === user.id) : db.requests;

    res.json({
        stats: {
            openRequests: requests.filter(r => !['completed', 'closed', 'rejected'].includes(r.status)).length,
            criticalRequests: requests.filter(r => r.priority === 'critical' && !['completed', 'closed', 'rejected'].includes(r.status)).length,
            pendingApproval: requests.filter(r => r.status === 'pending_approval').length,
            pendingQuotes: requests.filter(r => r.status === 'pending_quotes').length,
            pendingVerification: requests.filter(r => r.status === 'pending_verification').length,
            slaCompliance: 85
        }
    });
});

app.get('/api/requests/:id', (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    const quotes = db.quotes.filter(q => q.request_id === request.id);
    const audit_logs = db.audit_logs.filter(a => a.request_id === request.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let approvalAuthority = null;
    if (request.status === 'pending_approval' && request.estimated_cost) {
        approvalAuthority = getApprovalAuthority(request.estimated_cost);
    }

    res.json({ request: { ...request, approval_authority: approvalAuthority }, quotes, audit_logs });
});

app.post('/api/requests', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'tenant') return res.status(403).json({ error: 'Only tenants can create requests' });

    const { title, description, category, priority } = req.body;
    const request = {
        id: getNextId('requests'),
        request_number: generateRequestNumber(),
        title,
        description,
        category,
        priority,
        status: 'new',
        tenant_id: user.id,
        property_id: user.property_id,
        tenant_name: user.name,
        tenant_unit: user.unit,
        property_name: user.property_name,
        created_at: new Date().toISOString()
    };

    db.requests.push(request);
    logAudit(request.id, user, 'Request Created', `New request: ${title}`, 'within_target');

    res.status(201).json({ message: 'Request created', request });
});

app.post('/api/requests/:id/acknowledge', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'maintenance') return res.status(403).json({ error: 'Maintenance only' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    request.status = 'acknowledged';
    request.acknowledged_at = new Date().toISOString();
    logAudit(request.id, user, 'Request Acknowledged', 'Acknowledged by maintenance', 'within_target');

    res.json({ message: 'Acknowledged' });
});

app.post('/api/requests/:id/check-amc', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'maintenance') return res.status(403).json({ error: 'Maintenance only' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    const amcVendor = db.vendors.find(v => v.category === request.category && v.is_amc === 1);

    if (amcVendor) {
        request.status = 'in_progress';
        request.amc_covered = 1;
        request.amc_vendor_id = amcVendor.id;
        request.amc_vendor_name = amcVendor.name;
        logAudit(request.id, { role: 'system', name: 'System' }, 'AMC Coverage Confirmed', `Covered by ${amcVendor.name}`);
        res.json({ message: 'AMC coverage confirmed', amc_covered: true, vendor: amcVendor });
    } else {
        request.status = 'pending_quotes';
        logAudit(request.id, user, 'Status Changed', 'No AMC coverage - quotes required');
        res.json({ message: 'No AMC coverage', amc_covered: false });
    }
});

app.get('/api/requests/:requestId/quotes', (req, res) => {
    const quotes = db.quotes.filter(q => q.request_id === parseInt(req.params.requestId));
    res.json({ quotes });
});

app.post('/api/requests/:requestId/quotes', (req, res) => {
    const { vendor_name, vendor_email, amount, delivery_days, scope, warranty } = req.body;
    const quote = {
        id: getNextId('quotes'),
        request_id: parseInt(req.params.requestId),
        vendor_name,
        vendor_email,
        amount,
        delivery_days,
        scope,
        warranty,
        status: 'received'
    };
    db.quotes.push(quote);
    logAudit(quote.request_id, { role: 'system', name: 'System' }, 'Quote Received', `Quote from ${vendor_name} - AED ${amount}`);
    res.status(201).json({ quote });
});

app.post('/api/requests/:requestId/quotes/:quoteId/select', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'maintenance') return res.status(403).json({ error: 'Maintenance only' });

    const requestId = parseInt(req.params.requestId);
    const quoteId = parseInt(req.params.quoteId);

    const quote = db.quotes.find(q => q.id === quoteId && q.request_id === requestId);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    const request = db.requests.find(r => r.id === requestId);

    // Update quote statuses
    db.quotes.filter(q => q.request_id === requestId).forEach(q => {
        q.status = q.id === quoteId ? 'selected' : 'not_selected';
    });

    const authority = getApprovalAuthority(quote.amount);

    if (authority.level === 'auto') {
        request.status = 'approved';
        request.approved_at = new Date().toISOString();
        logAudit(requestId, user, 'Quote Selected', `Selected ${quote.vendor_name} for AED ${quote.amount}`);
        logAudit(requestId, user, 'Auto-Approved', `Within Head Engineer authority`);
    } else {
        request.status = 'pending_approval';
    }

    request.selected_quote_id = quoteId;
    request.estimated_cost = quote.amount;
    request.selected_vendor_name = quote.vendor_name;
    request.selected_quote_amount = quote.amount;

    if (authority.level !== 'auto') {
        logAudit(requestId, user, 'Quote Selected', `Selected ${quote.vendor_name} for AED ${quote.amount}`);
        logAudit(requestId, user, 'Pending Approval', `Requires ${authority.title} approval`);
    }

    res.json({ message: 'Quote selected', quote, auto_approved: authority.level === 'auto', approval_authority: authority });
});

app.post('/api/requests/:id/approve', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'management') return res.status(403).json({ error: 'Management only' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    request.status = 'approved';
    request.approved_at = new Date().toISOString();
    request.approved_by = user.id;
    request.approved_by_name = user.name;
    request.approved_by_title = user.title;

    logAudit(request.id, user, 'Approved', `Approved by ${user.title} (${user.name})`);

    res.json({ message: 'Approved' });
});

app.post('/api/requests/:id/reject', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'management') return res.status(403).json({ error: 'Management only' });

    const { comments } = req.body;
    if (!comments) return res.status(400).json({ error: 'Comments required' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    request.status = 'rejected';
    logAudit(request.id, user, 'Rejected', `Rejected by ${user.title}: ${comments}`);

    res.json({ message: 'Rejected' });
});

app.post('/api/requests/:id/request-discount', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'management') return res.status(403).json({ error: 'Management only' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    logAudit(request.id, user, 'Discount Requested', `${user.title} requested discount from vendor`);

    res.json({ message: 'Discount requested' });
});

app.post('/api/requests/:id/start-work', (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    request.status = 'in_progress';
    logAudit(request.id, user, 'Work Started', 'Vendor commenced work');

    res.json({ message: 'Work started' });
});

app.post('/api/requests/:id/complete-work', (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    request.status = 'pending_verification';
    logAudit(request.id, user, 'Work Completed', 'Pending verification');

    res.json({ message: 'Work completed' });
});

app.post('/api/requests/:id/verify', (req, res) => {
    const user = req.session?.user;
    if (!user || user.role !== 'maintenance') return res.status(403).json({ error: 'Maintenance only' });

    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Not found' });

    request.status = 'completed';
    request.completed_at = new Date().toISOString();
    logAudit(request.id, user, 'Work Verified', 'Physical inspection completed');

    res.json({ message: 'Verified' });
});

app.get('/api/vendors', (req, res) => {
    res.json({ vendors: db.vendors.filter(v => v.active) });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
