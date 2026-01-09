-- BHP Maintenance Hub Database Schema

CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('tenant', 'maintenance', 'management', 'accounts')),
    name TEXT NOT NULL,
    title TEXT,
    unit TEXT,
    department TEXT,
    phone TEXT,
    property_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified INTEGER DEFAULT 1,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    category TEXT NOT NULL,
    is_amc INTEGER DEFAULT 0,
    amc_contract_id TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('HVAC', 'Plumbing', 'Electrical', 'Elevator', 'General', 'Security', 'Fire Safety')),
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low', 'scheduled')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'pending_quotes', 'pending_approval', 'approved', 'in_progress', 'pending_verification', 'completed', 'closed', 'rejected', 'on_hold')),
    tenant_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    amc_covered INTEGER DEFAULT 0,
    amc_vendor_id INTEGER,
    estimated_cost REAL,
    selected_quote_id INTEGER,
    acknowledged_at DATETIME,
    approved_at DATETIME,
    approved_by INTEGER,
    completed_at DATETIME,
    closed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (amc_vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (selected_quote_id) REFERENCES quotes(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    vendor_id INTEGER,
    vendor_name TEXT NOT NULL,
    vendor_email TEXT,
    amount REAL NOT NULL,
    delivery_days INTEGER,
    scope TEXT,
    warranty TEXT,
    status TEXT DEFAULT 'received' CHECK (status IN ('pending', 'received', 'selected', 'not_selected')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    approver_id INTEGER NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'discount_requested')),
    amount REAL,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    user_id INTEGER,
    user_role TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    sla_status TEXT CHECK (sla_status IN ('within_target', 'at_risk', 'breached', 'na')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS four_doc_packs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    invoice_received INTEGER DEFAULT 0,
    receipt_received INTEGER DEFAULT 0,
    far_required INTEGER DEFAULT 0,
    far_received INTEGER DEFAULT 0,
    payment_copy_received INTEGER DEFAULT 0,
    complete INTEGER DEFAULT 0,
    submitted_to_accounts_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_tenant ON requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requests_property ON requests(property_id);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_approvals_request ON approvals(request_id);
