import { Router } from 'express';
import db from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

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
 * GET /api/requests/:requestId/quotes
 * Get all quotes for a request
 */
router.get('/:requestId/quotes', requireAuth, (req, res) => {
    try {
        const { requestId } = req.params;

        const quotes = db.prepare(`
            SELECT q.*, v.email as vendor_contact_email, v.phone as vendor_phone
            FROM quotes q
            LEFT JOIN vendors v ON q.vendor_id = v.id
            WHERE q.request_id = ?
            ORDER BY q.amount ASC
        `).all(requestId);

        res.json({ quotes });
    } catch (error) {
        console.error('Get quotes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:requestId/quotes
 * Add a new quote to a request
 */
router.post('/:requestId/quotes', requireAuth, (req, res) => {
    try {
        const { requestId } = req.params;
        const { vendor_id, vendor_name, vendor_email, amount, delivery_days, scope, warranty } = req.body;

        // Validate required fields
        if (!vendor_name || amount === undefined) {
            return res.status(400).json({ error: 'Vendor name and amount are required' });
        }

        // Check request exists and is in appropriate state
        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Insert quote
        const result = db.prepare(`
            INSERT INTO quotes (request_id, vendor_id, vendor_name, vendor_email, amount, delivery_days, scope, warranty, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'received')
        `).run(requestId, vendor_id || null, vendor_name, vendor_email, amount, delivery_days, scope, warranty);

        // Log the quote receipt
        logAudit(requestId, { role: 'system', name: 'System' }, 'Quote Received',
            `Quote received from ${vendor_name} - AED ${amount.toLocaleString()}`);

        const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Quote added successfully',
            quote
        });
    } catch (error) {
        console.error('Add quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:requestId/quotes/:quoteId/select
 * Select a quote for a request (maintenance only)
 */
router.post('/:requestId/quotes/:quoteId/select', requireRole(['maintenance']), (req, res) => {
    try {
        const { requestId, quoteId } = req.params;
        const user = req.user;

        // Get the quote
        const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND request_id = ?').get(quoteId, requestId);

        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        // Get request
        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Mark this quote as selected, others as not_selected
        db.prepare(`UPDATE quotes SET status = 'not_selected' WHERE request_id = ?`).run(requestId);
        db.prepare(`UPDATE quotes SET status = 'selected' WHERE id = ?`).run(quoteId);

        // Get approval authority
        const authority = getApprovalAuthority(quote.amount);

        // Check if auto-approval applies (Head Engineer can approve up to AED 500)
        if (authority.level === 'auto') {
            // Auto-approve
            db.prepare(`
                UPDATE requests
                SET status = 'approved', selected_quote_id = ?, estimated_cost = ?,
                    approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(quoteId, quote.amount, requestId);

            logAudit(requestId, user, 'Quote Selected',
                `Selected ${quote.vendor_name} for AED ${quote.amount.toLocaleString()}`);

            logAudit(requestId, user, 'Auto-Approved',
                `Amount AED ${quote.amount.toLocaleString()} within Head Engineer authority (${authority.threshold})`);

            res.json({
                message: 'Quote selected and auto-approved',
                quote,
                auto_approved: true,
                approval_authority: authority
            });
        } else {
            // Route to appropriate approver
            db.prepare(`
                UPDATE requests
                SET status = 'pending_approval', selected_quote_id = ?, estimated_cost = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(quoteId, quote.amount, requestId);

            logAudit(requestId, user, 'Quote Selected',
                `Selected ${quote.vendor_name} for AED ${quote.amount.toLocaleString()}`);

            logAudit(requestId, user, 'Pending Approval',
                `Amount AED ${quote.amount.toLocaleString()} requires ${authority.title} approval (${authority.threshold})`);

            res.json({
                message: `Quote selected - pending ${authority.title} approval`,
                quote,
                auto_approved: false,
                approval_authority: authority
            });
        }
    } catch (error) {
        console.error('Select quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
