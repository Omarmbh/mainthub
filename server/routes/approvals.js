import { Router } from 'express';
import db from '../db/database.js';
import { requireRole } from '../middleware/auth.js';

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
 * POST /api/requests/:id/approve
 * Approve a request (management only)
 */
router.post('/:id/approve', requireRole(['management']), (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const user = req.user;

        // Get request
        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending_approval') {
            return res.status(400).json({ error: 'Request is not pending approval' });
        }

        // Record approval
        db.prepare(`
            INSERT INTO approvals (request_id, approver_id, decision, amount, comments)
            VALUES (?, ?, 'approved', ?, ?)
        `).run(id, user.id, request.estimated_cost, comments);

        // Update request status
        db.prepare(`
            UPDATE requests
            SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(user.id, id);

        // Log approval with approver title
        const approverTitle = user.title || 'Management';
        logAudit(id, user, 'Approved',
            `Approved by ${approverTitle} (${user.name})${comments ? '. Comments: ' + comments : ''}`);

        res.json({
            message: 'Request approved successfully',
            approved_by: {
                id: user.id,
                name: user.name,
                title: user.title
            }
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/reject
 * Reject a request (management only)
 */
router.post('/:id/reject', requireRole(['management']), (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const user = req.user;

        // Comments are required for rejection
        if (!comments) {
            return res.status(400).json({ error: 'Comments are required when rejecting a request' });
        }

        // Get request
        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending_approval') {
            return res.status(400).json({ error: 'Request is not pending approval' });
        }

        // Record rejection
        db.prepare(`
            INSERT INTO approvals (request_id, approver_id, decision, amount, comments)
            VALUES (?, ?, 'rejected', ?, ?)
        `).run(id, user.id, request.estimated_cost, comments);

        // Update request status
        db.prepare(`
            UPDATE requests
            SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        // Log rejection
        const approverTitle = user.title || 'Management';
        logAudit(id, user, 'Rejected',
            `Rejected by ${approverTitle} (${user.name}). Reason: ${comments}`);

        res.json({
            message: 'Request rejected',
            rejected_by: {
                id: user.id,
                name: user.name,
                title: user.title
            }
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/requests/:id/request-discount
 * Request a discount from vendor (management only)
 */
router.post('/:id/request-discount', requireRole(['management']), (req, res) => {
    try {
        const { id } = req.params;
        const { target_amount, comments } = req.body;
        const user = req.user;

        // Get request
        const request = db.prepare(`
            SELECT r.*, q.vendor_name, q.amount as quote_amount
            FROM requests r
            LEFT JOIN quotes q ON r.selected_quote_id = q.id
            WHERE r.id = ?
        `).get(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending_approval') {
            return res.status(400).json({ error: 'Request is not pending approval' });
        }

        // Record discount request
        db.prepare(`
            INSERT INTO approvals (request_id, approver_id, decision, amount, comments)
            VALUES (?, ?, 'discount_requested', ?, ?)
        `).run(id, user.id, target_amount || request.estimated_cost, comments);

        // Log the discount request (status remains pending_approval)
        const approverTitle = user.title || 'Management';
        const discountInfo = target_amount ?
            `Target amount: AED ${target_amount.toLocaleString()}` :
            'No target specified';

        logAudit(id, user, 'Discount Requested',
            `${approverTitle} (${user.name}) requested discount from ${request.vendor_name}. ${discountInfo}. ${comments || ''}`);

        res.json({
            message: 'Discount request sent',
            vendor: request.vendor_name,
            original_amount: request.quote_amount,
            target_amount
        });
    } catch (error) {
        console.error('Request discount error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/approvals/pending
 * Get all requests pending approval (management only)
 */
router.get('/pending', requireRole(['management']), (req, res) => {
    try {
        const requests = db.prepare(`
            SELECT r.*,
                   u.name as tenant_name, u.unit as tenant_unit,
                   p.name as property_name,
                   q.vendor_name as selected_vendor_name, q.amount as selected_quote_amount
            FROM requests r
            LEFT JOIN users u ON r.tenant_id = u.id
            LEFT JOIN properties p ON r.property_id = p.id
            LEFT JOIN quotes q ON r.selected_quote_id = q.id
            WHERE r.status = 'pending_approval'
            ORDER BY r.created_at ASC
        `).all();

        res.json({ requests });
    } catch (error) {
        console.error('Get pending approvals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
