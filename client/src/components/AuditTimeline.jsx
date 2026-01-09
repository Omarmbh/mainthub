const styles = {
    container: {
        padding: '16px 0'
    },
    title: {
        fontSize: 13,
        fontWeight: 600,
        color: '#94a3b8',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    timeline: {
        position: 'relative',
        paddingLeft: 24
    },
    line: {
        position: 'absolute',
        left: 7,
        top: 8,
        bottom: 8,
        width: 2,
        background: 'rgba(148, 163, 184, 0.2)'
    },
    item: {
        position: 'relative',
        paddingBottom: 20,
        paddingLeft: 16
    },
    itemLast: {
        paddingBottom: 0
    },
    dot: {
        position: 'absolute',
        left: -17,
        top: 4,
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2px solid',
        background: '#1e293b'
    },
    content: {
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 8,
        padding: 12
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6
    },
    action: {
        fontSize: 13,
        fontWeight: 600,
        color: '#e2e8f0'
    },
    timestamp: {
        fontSize: 11,
        color: '#64748b',
        fontFamily: "'JetBrains Mono', monospace"
    },
    actor: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4
    },
    details: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 1.5
    },
    badge: {
        display: 'inline-block',
        fontSize: 9,
        padding: '2px 6px',
        borderRadius: 4,
        fontWeight: 600,
        textTransform: 'uppercase',
        marginLeft: 8
    }
};

const slaColors = {
    within_target: { dot: '#22c55e', badge: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' } },
    at_risk: { dot: '#f59e0b', badge: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' } },
    breached: { dot: '#ef4444', badge: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' } },
    na: { dot: '#64748b', badge: null }
};

const actionIcons = {
    'Request Created': '📝',
    'Request Acknowledged': '✓',
    'Status Changed': '🔄',
    'Quote Received': '📨',
    'Quote Selected': '✅',
    'Pending Approval': '⏳',
    'Auto-Approved': '⚡',
    'Approved': '✓',
    'Rejected': '✕',
    'Discount Requested': '💰',
    'Work Started': '🔧',
    'Work Completed': '🏁',
    'Work Verified': '✓',
    'Payment Processed': '💳',
    'AMC Coverage Confirmed': '📋',
    'Vendor Notified': '📤',
    'Documents Updated': '📄'
};

const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-AE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function AuditTimeline({ logs }) {
    if (!logs || logs.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.title}>Audit Trail</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>No audit logs available</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.title}>Audit Trail</div>
            <div style={styles.timeline}>
                <div style={styles.line}></div>
                {logs.map((log, index) => {
                    const slaStyle = slaColors[log.sla_status] || slaColors.na;
                    const isLast = index === logs.length - 1;
                    const icon = actionIcons[log.action] || '•';

                    return (
                        <div
                            key={log.id}
                            style={{
                                ...styles.item,
                                ...(isLast ? styles.itemLast : {})
                            }}
                        >
                            <div
                                style={{
                                    ...styles.dot,
                                    borderColor: slaStyle.dot
                                }}
                            />
                            <div style={styles.content}>
                                <div style={styles.header}>
                                    <div>
                                        <span style={styles.action}>
                                            {icon} {log.action}
                                        </span>
                                        {slaStyle.badge && (
                                            <span style={{
                                                ...styles.badge,
                                                background: slaStyle.badge.bg,
                                                color: slaStyle.badge.color
                                            }}>
                                                {log.sla_status.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <span style={styles.timestamp}>{formatTimestamp(log.created_at)}</span>
                                </div>
                                <div style={styles.actor}>
                                    {log.user_name}
                                    {log.user_role && (
                                        <span style={{ color: '#64748b' }}> ({log.user_role})</span>
                                    )}
                                </div>
                                {log.details && (
                                    <div style={styles.details}>{log.details}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AuditTimeline;
