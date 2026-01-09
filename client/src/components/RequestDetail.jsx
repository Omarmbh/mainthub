import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import QuoteCard from './QuoteCard';
import AuditTimeline from './AuditTimeline';

const styles = {
    container: {
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 12,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        padding: 20,
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    title: {
        fontSize: 18,
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: 4
    },
    requestNumber: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: '#94a3b8'
    },
    badges: {
        display: 'flex',
        gap: 8
    },
    badge: {
        fontSize: 10,
        padding: '4px 10px',
        borderRadius: 4,
        fontWeight: 600,
        textTransform: 'uppercase'
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: 20
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 600,
        color: '#94a3b8',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    description: {
        fontSize: 14,
        color: '#e2e8f0',
        lineHeight: 1.6,
        background: 'rgba(15, 23, 42, 0.5)',
        padding: 16,
        borderRadius: 8
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16
    },
    infoItem: {
        background: 'rgba(15, 23, 42, 0.5)',
        padding: 12,
        borderRadius: 8
    },
    infoLabel: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    infoValue: {
        fontSize: 14,
        color: '#e2e8f0',
        fontWeight: 500
    },
    quotesGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
    },
    approvalBox: {
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
    },
    approvalTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#3b82f6',
        marginBottom: 8
    },
    approvalAmount: {
        fontSize: 24,
        fontWeight: 700,
        color: '#e2e8f0',
        marginBottom: 4
    },
    approvalVendor: {
        fontSize: 13,
        color: '#94a3b8'
    },
    approvalThreshold: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 8,
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 4
    },
    actionButtons: {
        display: 'flex',
        gap: 12,
        marginTop: 16
    },
    btn: {
        flex: 1,
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: 'none'
    },
    btnApprove: {
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10b981'
    },
    btnDiscount: {
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#f59e0b'
    },
    btnReject: {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ef4444'
    },
    btnSecondary: {
        background: 'rgba(148, 163, 184, 0.15)',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        color: '#94a3b8'
    },
    amcBanner: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12
    },
    amcIcon: {
        fontSize: 24
    },
    amcText: {
        flex: 1
    },
    amcTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#8b5cf6',
        marginBottom: 4
    },
    amcVendor: {
        fontSize: 13,
        color: '#94a3b8'
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'rgba(148, 163, 184, 0.1)',
        border: 'none',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: 14
    },
    emptyState: {
        padding: 40,
        textAlign: 'center',
        color: '#64748b'
    }
};

const priorityColors = {
    critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
    high: { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
    medium: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    low: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    scheduled: { bg: 'rgba(100, 116, 139, 0.15)', color: '#6b7280' }
};

const statusStyles = {
    new: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
    acknowledged: { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' },
    pending_quotes: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
    pending_approval: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    approved: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
    in_progress: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    pending_verification: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
    completed: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    closed: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
    on_hold: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' }
};

const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function RequestDetail({ request, quotes, auditLogs, onAction, onClose }) {
    const { user } = useAuth();
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (!request) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    Select a request to view details
                </div>
            </div>
        );
    }

    const priorityStyle = priorityColors[request.priority] || priorityColors.medium;
    const statusStyle = statusStyles[request.status] || statusStyles.new;
    const canSelectQuote = user?.role === 'maintenance' && request.status === 'pending_quotes';
    const canApprove = user?.role === 'management' && request.status === 'pending_approval';
    const canAcknowledge = user?.role === 'maintenance' && request.status === 'new';
    const canCheckAmc = user?.role === 'maintenance' && request.status === 'acknowledged';
    const canVerify = user?.role === 'maintenance' && request.status === 'pending_verification';
    const canStartWork = request.status === 'approved';
    const canCompleteWork = request.status === 'in_progress';

    const handleApprove = () => {
        onAction('approve', request.id);
    };

    const handleReject = () => {
        if (showRejectInput && rejectReason.trim()) {
            onAction('reject', request.id, rejectReason);
            setRejectReason('');
            setShowRejectInput(false);
        } else {
            setShowRejectInput(true);
        }
    };

    const handleRequestDiscount = () => {
        onAction('requestDiscount', request.id);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerRow}>
                    <div>
                        <div style={styles.title}>{request.title}</div>
                        <div style={styles.requestNumber}>{request.request_number}</div>
                    </div>
                    <div style={styles.badges}>
                        <span style={{
                            ...styles.badge,
                            background: priorityStyle.bg,
                            color: priorityStyle.color
                        }}>
                            {request.priority}
                        </span>
                        <span style={{
                            ...styles.badge,
                            background: statusStyle.bg,
                            color: statusStyle.color
                        }}>
                            {formatStatus(request.status)}
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.content}>
                {/* AMC Banner */}
                {request.amc_covered === 1 && (
                    <div style={styles.amcBanner}>
                        <span style={styles.amcIcon}>📋</span>
                        <div style={styles.amcText}>
                            <div style={styles.amcTitle}>Covered by Annual Maintenance Contract</div>
                            <div style={styles.amcVendor}>Vendor: {request.amc_vendor_name}</div>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Description</div>
                    <div style={styles.description}>{request.description || 'No description provided'}</div>
                </div>

                {/* Details */}
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Details</div>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Tenant</div>
                            <div style={styles.infoValue}>{request.tenant_name}</div>
                        </div>
                        <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Property</div>
                            <div style={styles.infoValue}>{request.property_name}</div>
                        </div>
                        <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Category</div>
                            <div style={styles.infoValue}>{request.category}</div>
                        </div>
                        <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Created</div>
                            <div style={styles.infoValue}>{formatDate(request.created_at)}</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons for different states */}
                {canAcknowledge && (
                    <div style={styles.section}>
                        <button
                            style={{ ...styles.btn, ...styles.btnApprove, flex: 'none', width: '100%' }}
                            onClick={() => onAction('acknowledge', request.id)}
                        >
                            Acknowledge Request
                        </button>
                    </div>
                )}

                {canCheckAmc && (
                    <div style={styles.section}>
                        <button
                            style={{ ...styles.btn, ...styles.btnApprove, flex: 'none', width: '100%' }}
                            onClick={() => onAction('checkAmc', request.id)}
                        >
                            Check AMC Coverage
                        </button>
                    </div>
                )}

                {/* Approval Section */}
                {canApprove && (
                    <div style={styles.section}>
                        <div style={styles.approvalBox}>
                            <div style={styles.approvalTitle}>Pending Your Approval</div>
                            <div style={styles.approvalAmount}>
                                AED {request.estimated_cost?.toLocaleString()}
                            </div>
                            <div style={styles.approvalVendor}>
                                Vendor: {request.selected_vendor_name}
                            </div>
                            {request.approval_authority && (
                                <div style={styles.approvalThreshold}>
                                    Threshold: {request.approval_authority.threshold} ({request.approval_authority.title})
                                </div>
                            )}
                        </div>

                        {showRejectInput && (
                            <textarea
                                placeholder="Enter reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#e2e8f0',
                                    fontSize: 14,
                                    resize: 'vertical',
                                    minHeight: 80,
                                    marginBottom: 12
                                }}
                            />
                        )}

                        <div style={styles.actionButtons}>
                            <button
                                style={{ ...styles.btn, ...styles.btnApprove }}
                                onClick={handleApprove}
                            >
                                Approve
                            </button>
                            <button
                                style={{ ...styles.btn, ...styles.btnDiscount }}
                                onClick={handleRequestDiscount}
                            >
                                Request Discount
                            </button>
                            <button
                                style={{ ...styles.btn, ...styles.btnReject }}
                                onClick={handleReject}
                            >
                                {showRejectInput ? 'Confirm Reject' : 'Reject'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Work Action Buttons */}
                {canStartWork && (
                    <div style={styles.section}>
                        <button
                            style={{ ...styles.btn, ...styles.btnApprove, flex: 'none', width: '100%' }}
                            onClick={() => onAction('startWork', request.id)}
                        >
                            Start Work
                        </button>
                    </div>
                )}

                {canCompleteWork && (
                    <div style={styles.section}>
                        <button
                            style={{ ...styles.btn, ...styles.btnApprove, flex: 'none', width: '100%' }}
                            onClick={() => onAction('completeWork', request.id)}
                        >
                            Mark Work Complete
                        </button>
                    </div>
                )}

                {canVerify && (
                    <div style={styles.section}>
                        <button
                            style={{ ...styles.btn, ...styles.btnApprove, flex: 'none', width: '100%' }}
                            onClick={() => onAction('verify', request.id)}
                        >
                            Verify Work Completion
                        </button>
                    </div>
                )}

                {/* Quotes Section */}
                {quotes && quotes.length > 0 && (
                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>
                            Quotes ({quotes.length})
                        </div>
                        <div style={styles.quotesGrid}>
                            {quotes.map(quote => (
                                <QuoteCard
                                    key={quote.id}
                                    quote={quote}
                                    canSelect={canSelectQuote}
                                    onSelect={(quoteId) => onAction('selectQuote', request.id, quoteId)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Audit Timeline */}
                <div style={styles.section}>
                    <AuditTimeline logs={auditLogs} />
                </div>
            </div>
        </div>
    );
}

export default RequestDetail;
