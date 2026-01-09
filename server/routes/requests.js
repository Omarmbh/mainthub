import { Router } from 'express';
import db from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { generateRequestNumber } from '../utils/requestNumber.js';
import { calculateSlaStatus } from '../utils/sla.js';

const router = Router();

/**
 * Helper: Log to audit trail
 */
function logAudit(requestId, user, action, details, slaStatus = 'na') {
    db.prepare(`
        INSERT INTO audit_logs (request_id, user_id, user_role, user_name, action, details, sla_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(requestId, user?.id || null, user?.role || 'system', user?.name || 'System', action, details, slaStatus);
}

/**
 * Helper: Get approval authority based on amount
 * Returns the required approver title and threshold info
 */
function getApprovalAuthority(amount) {
    if (amount <= 500) {
        return { title: 'Head Engineer', level: 'auto', threshold: 'Up to AED 500' };
    } else if (amount <= 5000) {
        return { title: 'Financial Manager', level: 'fm', threshold: 'AED 501 - 5,000' };
    } else if (amount <= 25000) {
        return { title: 'General Manager', level: 'gm', threshold: 'AED 5,001 - 25,000' };
    } else {
        return { title: 'Chairman', level: 'chairman', threshold: 'Above AED 25,000' };
    }
}

/**
 * GET /api/requests
 * Get all requests with role-based filtering
 */
router.get('/', requireAuth, (req, res) => {
    try {
        const { status, priority, category } = req.query;
        const user = req.user;

        let query = `
            SELECT r.*,
                   u.name as tenant_name, u.unit as tenant_unit, u.email as tenant_email,
                   p.name as property_name,
                   v.name as amc_vendor_name,
                   sq.vendor_name as selected_vendor_name, sq.amount as selected_quote_amount
            FROM requests r
            LEFT JOIN users u ON r.tenant_id = u.id
            LEFT JOIN properties p ON r.property_id = p.id
            LEFT JOIN vendors v ON r.amc_vendor_id = v.id
            LEFT JOIN quotes sq ON r.selected_quote_id = sq.id
            WHERE 1=1
        `;

        const params = [];

        // Role-based filtering: tenants only see their own requests
        if (user.role === 'tenant') {
            query += ' AND r.tenant_id = ?';
            params.push(user.id);
        }

        // Optional filters
        if (status) {
            query += ' AND r.status = ?';
            params.push(status);
        }

        if (priority) {
            query += ' AND r.priority = ?';
            params.push(priority);
        }

        if (category) {
            query += ' AND r.category = ?';
            params.push(category);
        }

        query += ' ORDER BY r.created_at DESC';

        const requests = db.prepare(query).all(...params);

        // Add SLA status to each request
        const requestsWithSla = requests.map(r => ({
            ...r,
            sla_status: calculateSlaStatus(r.priority, r.created_at, new Date(), 'response')
        }));

        res.json({ requests: requestsWithSla });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/requests/stats
 * Get dashboard statistics
 */
router.get('/stats', requireAuth, (req, res) => {
    try {
        const user = req.user;
        let whereClause = '';
        const params = [];

        if (user.role === 'tenant') {
            whereClause = 'WHERE tenant_id = ?';
            params.push(user.id);
        }

        // Open requests count
        const openCount = db.prepare(`
            SELECT COUNT(*) as count FROM requests
            ${whereClause ? whereClause + ' AND' : 'WHERE'} status NOT IN ('completed', 'closed', 'rejected')
        `).get(...params).count;

        // Critical requests count
        const criticalCount = db.prepare(`
            SELECT COUNT(*) as count FROM requests
            ${whereClause ? whereClause + ' AND' : 'WHERE'} priority = 'critical' AND status NOT IN ('completed', 'closed', 'rejected')
        `).get(...params).count;

        // Pending approval count
        const pendingApprovalCount = db.prepare(`
            SELECT COUNT(*) as count FROM requests
            ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'pending_approval'
        `).get(...params).count;

        // Pending quotes count
        const pendingQuotesCount = db.prepare(`
            SELECT COUNT(*) as count FROM requests
            ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'pending_quotes'
        `).get(...params).count;

        // Pending verification count
        const pendingVerificationCount = db.prepare(`
            SELECT COUNT(*) as count FROM requests
            ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'pending_verification'
        `).get(...params).count;

        // Calculate SLA compliance
        const allActiveRequests = db.prepare(`
            SELECT priority, created_at FROM requests
            ${whereClause ? whereClause + ' AND' : 'WHERE'} status NOT IN ('completed', 'closed', 'rejected', 'scheduled')
        `).all(...params);

        let withinSla = 0;
        let totalWithSla = 0;

        allActiveRequests.forEach(r => {
            if (r.priority !== 'scheduled') {
                totalWithSla++;
                const status = calculateSlaStatus(r.priority, r.created_at);
                if (status === 'within_target') {
                    withinSla++;
                }
            }
        });

        const slaCompliance = totalWithSla > 0 ? Math.round((withinSla / totalWithSla) * 100) : 100;

        res.json({
            stats: {
                openRequests: openCount,
                criticalRequests: criticalCount,
                pendingApproval: pendingApprovalCount,
                pendingQuotes: pendingQuotesCount,
                pendingVerification: pendingVerificationCount,
                slaCompliance
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/requests/:id
 * Get single request with quotes and audit logs
 */
router.get('/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const request = db.prepare(`
            SELECT r.*,
                   u.name as tenant_name, u.unit as tenant_unit, u.email as tenant_email, u.phone as tenant_phone,
                   p.name as property_name, p.address as property_address,
                   v.name as amc_vendor_name,
                   sq.vendor_name as selected_vendor_name, sq.amount as selected_quote_amount,
                   ap.name as approved_by_name, ap.title as approved_by_title
            FROM requests r
            LEFT JOIN users u ON r.tenant_id = u.id
            LEFT JOIN properties p ON r.property_id = p.id
            LEFT JOIN vendors v ON r.amc_vendor_id = v.id
            LEFT JOIN quotes sq ON r.selected_quote_id = sq.id
            LEFT JOIN users ap ON r.approved_by = ap.id
            WHERE r.id = ?
        `).get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Check permission for tenants
        if (user.role === 'tenant' && request.tenant_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get quotes
        const quotes = db.prepare(`
            SELECT q.*, v.email as vendor_contact_email, v.phone as vendor_phone
            FROM quotes q
            LEFT JOIN vendors v ON q.vendor_id = v.id
            WHERE q.request_id = ?
            ORDER BY q.amount ASC
        `).all(id);

        // Get audit logs
        const auditLogs = db.prepare(`
            SELECT * FROM audit_logs
            WHERE request_id = ?
            ORDER BY created_at ASC
        `).all(id);

        // Get four doc pack if exists
        const fourDocPack = db.prepare(`
            SELECT * FROM four_doc_packs WHERE request_id = ?
        `).get(id);

        // Calculate current SLA status
        const slaStatus = calculateSlaStatus(request.priority, request.created_at);

        // Get approval authority info if pending approval
        let approvalAuthority = null;
        if (request.status === 'pending_approval' && request.estimated_cost) {
            approvalAuthority = getApprovalAuthority(request.estimated_cost);
        }

        res.json({
            request: {
                ...request,
                sla_status: slaStatus,
                approval_authority: approvalAuthority
            },
            quotes,
            audit_logs: auditLogs,
            four_doc_pack: fourDocPack
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests
 * Create new request (tenants only)
 */
router.post('/', requireRole(['tenant']), (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        const user = req.user;

        // Validate required fields
        if (!title || !category || !priority) {
            return res.status(400).json({ error: 'Title, category, and priority are required' });
        }

        // Generate request number
        const requestNumber = generateRequestNumber();

        // Create request
        const result = db.prepare(`
            INSERT INTO requests (request_number, title, description, category, priority, status, tenant_id, property_id)
            VALUES (?, ?, ?, ?, ?, 'new', ?, ?)
        `).run(requestNumber, title, description, category, priority, user.id, user.property_id);

        const requestId = result.lastInsertRowid;

        // Log creation
        const slaStatus = calculateSlaStatus(priority, new Date());
        logAudit(requestId, user, 'Request Created', `New maintenance request submitted: ${title}`, slaStatus);

        // Get created request
        const request = db.prepare(`
            SELECT r.*, p.name as property_name
            FROM requests r
            LEFT JOIN properties p ON r.property_id = p.id
            WHERE r.id = ?
        `).get(requestId);

        res.status(201).json({
            message: 'Request created successfully',
            request
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PATCH /api/requests/:id
 * Update request fields
 */
router.patch('/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = req.user;

        // Get current request
        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Build update query dynamically
        const allowedFields = ['title', 'description', 'category', 'priority', 'status'];
        const updateFields = [];
        const params = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add updated_at
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        db.prepare(`UPDATE requests SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);

        // Log status change if applicable
        if (updates.status && updates.status !== request.status) {
            logAudit(id, user, 'Status Changed', `Status changed from ${request.status} to ${updates.status}`);
        }

        const updatedRequest = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

        res.json({
            message: 'Request updated successfully',
            request: updatedRequest
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/acknowledge
 * Acknowledge a new request (maintenance only)
 */
router.post('/:id/acknowledge', requireRole(['maintenance']), (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'new') {
            return res.status(400).json({ error: 'Request has already been acknowledged' });
        }

        // Calculate SLA status
        const slaStatus = calculateSlaStatus(request.priority, request.created_at);

        // Update request
        db.prepare(`
            UPDATE requests
            SET status = 'acknowledged', acknowledged_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        logAudit(id, user, 'Request Acknowledged', 'Request acknowledged by maintenance team', slaStatus);

        res.json({ message: 'Request acknowledged successfully' });
    } catch (error) {
        console.error('Acknowledge request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/check-amc
 * Check AMC coverage and route accordingly
 */
router.post('/:id/check-amc', requireRole(['maintenance']), (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const request = db.prepare(`
            SELECT r.*, p.id as prop_id
            FROM requests r
            LEFT JOIN properties p ON r.property_id = p.id
            WHERE r.id = ?
        `).get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Check for active AMC vendor for this category
        const amcVendor = db.prepare(`
            SELECT * FROM vendors
            WHERE category = ? AND is_amc = 1 AND active = 1
            LIMIT 1
        `).get(request.category);

        if (amcVendor) {
            // AMC covered - route directly to vendor
            db.prepare(`
                UPDATE requests
                SET status = 'in_progress', amc_covered = 1, amc_vendor_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(amcVendor.id, id);

            logAudit(id, { role: 'system', name: 'System' }, 'AMC Coverage Confirmed',
                `Request covered under ${amcVendor.amc_contract_id} with ${amcVendor.name}`);

            logAudit(id, { role: 'system', name: 'System' }, 'Vendor Notified',
                `${amcVendor.name} notified for service dispatch`);

            res.json({
                message: 'AMC coverage confirmed',
                amc_covered: true,
                vendor: amcVendor
            });
        } else {
            // Not AMC covered - need quotes
            db.prepare(`
                UPDATE requests SET status = 'pending_quotes', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(id);

            logAudit(id, user, 'Status Changed', 'No AMC coverage - proceeding to quote collection');

            res.json({
                message: 'No AMC coverage - quotes required',
                amc_covered: false
            });
        }
    } catch (error) {
        console.error('Check AMC error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/start-work
 * Mark work as started
 */
router.post('/:id/start-work', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        db.prepare(`
            UPDATE requests SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        logAudit(id, user, 'Work Started', 'Vendor has commenced work on the request');

        res.json({ message: 'Work started successfully' });
    } catch (error) {
        console.error('Start work error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/complete-work
 * Mark work as completed (pending verification)
 */
router.post('/:id/complete-work', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { notes } = req.body;

        db.prepare(`
            UPDATE requests SET status = 'pending_verification', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        logAudit(id, user, 'Work Completed', notes || 'Work has been completed, pending verification');

        res.json({ message: 'Work completed - pending verification' });
    } catch (error) {
        console.error('Complete work error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/verify
 * Verify completed work (maintenance only)
 */
router.post('/:id/verify', requireRole(['maintenance']), (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { notes } = req.body;

        // Update request status
        db.prepare(`
            UPDATE requests
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        // Create four doc pack record
        db.prepare(`
            INSERT INTO four_doc_packs (request_id) VALUES (?)
        `).run(id);

        logAudit(id, user, 'Work Verified', notes || 'Physical inspection completed - work verified and approved');

        res.json({ message: 'Work verified successfully' });
    } catch (error) {
        console.error('Verify work error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/process-payment
 * Process payment and close request (accounts only)
 */
router.post('/:id/process-payment', requireRole(['accounts']), (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { invoice_received, receipt_received, far_required, far_received, payment_copy_received } = req.body;

        // Update four doc pack
        const fourDocPack = db.prepare('SELECT * FROM four_doc_packs WHERE request_id = ?').get(id);

        if (!fourDocPack) {
            return res.status(400).json({ error: 'Four doc pack not found - work may not be verified' });
        }

        // Update document status
        const inv = invoice_received ?? fourDocPack.invoice_received;
        const rec = receipt_received ?? fourDocPack.receipt_received;
        const farReq = far_required ?? fourDocPack.far_required;
        const farRec = far_received ?? fourDocPack.far_received;
        const pay = payment_copy_received ?? fourDocPack.payment_copy_received;

        // Check if complete (all required docs received)
        const isComplete = inv && rec && pay && (!farReq || farRec);

        db.prepare(`
            UPDATE four_doc_packs
            SET invoice_received = ?, receipt_received = ?, far_required = ?, far_received = ?,
                payment_copy_received = ?, complete = ?, submitted_to_accounts_at = CURRENT_TIMESTAMP
            WHERE request_id = ?
        `).run(inv, rec, farReq, farRec, pay, isComplete ? 1 : 0, id);

        if (isComplete) {
            // Close request
            db.prepare(`
                UPDATE requests
                SET status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(id);

            logAudit(id, user, 'Payment Processed', '4-Doc pack complete. Payment released. Request closed.');

            res.json({ message: 'Payment processed - request closed' });
        } else {
            logAudit(id, user, 'Documents Updated', 'Payment documentation updated');

            res.json({
                message: 'Documents updated',
                complete: false,
                missing: {
                    invoice: !inv,
                    receipt: !rec,
                    far: farReq && !farRec,
                    payment_copy: !pay
                }
            });
        }
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/requests/:id/audit
 * Get audit trail for a request
 */
router.get('/:id/audit', requireAuth, (req, res) => {
    try {
        const { id } = req.params;

        const auditLogs = db.prepare(`
            SELECT * FROM audit_logs
            WHERE request_id = ?
            ORDER BY created_at ASC
        `).all(id);

        res.json({ audit_logs: auditLogs });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
