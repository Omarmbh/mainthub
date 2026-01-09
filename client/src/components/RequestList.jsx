import { useState } from 'react';

const styles = {
    container: {
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 12,
        overflow: 'hidden'
    },
    header: {
        padding: '16px 20px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        color: '#e2e8f0'
    },
    tabs: {
        display: 'flex',
        gap: 4
    },
    tab: {
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 500,
        background: 'transparent',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        borderRadius: 6,
        transition: 'all 0.2s'
    },
    tabActive: {
        background: 'rgba(20, 184, 166, 0.15)',
        color: '#14b8a6'
    },
    list: {
        maxHeight: 500,
        overflowY: 'auto'
    },
    item: {
        padding: '16px 20px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
        cursor: 'pointer',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
    },
    itemHover: {
        background: 'rgba(148, 163, 184, 0.05)'
    },
    itemSelected: {
        background: 'rgba(20, 184, 166, 0.1)',
        borderLeft: '3px solid #14b8a6'
    },
    priorityDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        marginTop: 6,
        flexShrink: 0
    },
    content: {
        flex: 1,
        minWidth: 0
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4
    },
    requestTitle: {
        fontSize: 14,
        fontWeight: 500,
        color: '#e2e8f0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    badges: {
        display: 'flex',
        gap: 6,
        flexShrink: 0
    },
    badge: {
        fontSize: 9,
        padding: '2px 6px',
        borderRadius: 4,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
        color: '#64748b'
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
    },
    requestNumber: {
        fontFamily: "'JetBrains Mono', monospace",
        color: '#94a3b8'
    },
    emptyState: {
        padding: 40,
        textAlign: 'center',
        color: '#64748b'
    }
};

const priorityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#22c55e',
    scheduled: '#6b7280'
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
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

function RequestList({ requests, selectedId, onSelect, filter, onFilterChange }) {
    const [hoveredId, setHoveredId] = useState(null);

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'critical', label: 'Critical' },
        { key: 'pending', label: 'Pending' },
        { key: 'completed', label: 'Completed' }
    ];

    const filteredRequests = requests.filter(r => {
        if (filter === 'critical') return r.priority === 'critical';
        if (filter === 'pending') return ['new', 'acknowledged', 'pending_quotes', 'pending_approval', 'in_progress', 'pending_verification'].includes(r.status);
        if (filter === 'completed') return ['completed', 'closed'].includes(r.status);
        return true;
    });

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.title}>Maintenance Requests</span>
                <div style={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            style={{
                                ...styles.tab,
                                ...(filter === tab.key ? styles.tabActive : {})
                            }}
                            onClick={() => onFilterChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={styles.list}>
                {filteredRequests.length === 0 ? (
                    <div style={styles.emptyState}>
                        No requests found
                    </div>
                ) : (
                    filteredRequests.map(request => {
                        const statusStyle = statusStyles[request.status] || statusStyles.new;
                        const isSelected = request.id === selectedId;
                        const isHovered = request.id === hoveredId;

                        return (
                            <div
                                key={request.id}
                                style={{
                                    ...styles.item,
                                    ...(isHovered && !isSelected ? styles.itemHover : {}),
                                    ...(isSelected ? styles.itemSelected : {})
                                }}
                                onClick={() => onSelect(request.id)}
                                onMouseEnter={() => setHoveredId(request.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <div
                                    style={{
                                        ...styles.priorityDot,
                                        background: priorityColors[request.priority]
                                    }}
                                />
                                <div style={styles.content}>
                                    <div style={styles.titleRow}>
                                        <span style={styles.requestTitle}>{request.title}</span>
                                        <div style={styles.badges}>
                                            {request.amc_covered === 1 && (
                                                <span style={{
                                                    ...styles.badge,
                                                    background: 'rgba(139, 92, 246, 0.15)',
                                                    color: '#8b5cf6'
                                                }}>
                                                    AMC
                                                </span>
                                            )}
                                            <span style={{
                                                ...styles.badge,
                                                background: statusStyle.bg,
                                                color: statusStyle.color
                                            }}>
                                                {formatStatus(request.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.metaRow}>
                                        <span style={styles.requestNumber}>{request.request_number}</span>
                                        <span style={styles.metaItem}>
                                            <span>📍</span>
                                            {request.property_name}
                                        </span>
                                        <span style={styles.metaItem}>
                                            <span>🏷️</span>
                                            {request.category}
                                        </span>
                                        <span style={styles.metaItem}>
                                            <span>⏰</span>
                                            {formatTimeAgo(request.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default RequestList;
