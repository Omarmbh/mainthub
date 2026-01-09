const styles = {
    card: {
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 8,
        padding: 16,
        transition: 'all 0.2s'
    },
    cardSelected: {
        borderColor: '#14b8a6',
        background: 'rgba(20, 184, 166, 0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    vendorName: {
        fontSize: 14,
        fontWeight: 600,
        color: '#e2e8f0'
    },
    vendorEmail: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2
    },
    amount: {
        fontSize: 18,
        fontWeight: 700,
        color: '#14b8a6'
    },
    currency: {
        fontSize: 12,
        fontWeight: 400,
        color: '#64748b'
    },
    details: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 12
    },
    detail: {
        fontSize: 12
    },
    detailLabel: {
        color: '#64748b',
        display: 'block',
        marginBottom: 2
    },
    detailValue: {
        color: '#e2e8f0',
        fontWeight: 500
    },
    scope: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 1.5,
        paddingTop: 12,
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
    },
    badge: {
        fontSize: 10,
        padding: '4px 10px',
        borderRadius: 4,
        fontWeight: 600,
        textTransform: 'uppercase'
    },
    actions: {
        marginTop: 12,
        display: 'flex',
        gap: 8
    },
    selectBtn: {
        flex: 1,
        padding: '10px 16px',
        background: 'rgba(20, 184, 166, 0.15)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        borderRadius: 6,
        color: '#14b8a6',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

const statusStyles = {
    received: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', text: 'Received' },
    selected: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: 'Selected' },
    not_selected: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', text: 'Not Selected' },
    pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', text: 'Pending' }
};

function QuoteCard({ quote, onSelect, canSelect = false }) {
    const statusStyle = statusStyles[quote.status] || statusStyles.received;

    return (
        <div style={{
            ...styles.card,
            ...(quote.status === 'selected' ? styles.cardSelected : {})
        }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.vendorName}>{quote.vendor_name}</div>
                    {quote.vendor_email && (
                        <div style={styles.vendorEmail}>{quote.vendor_email}</div>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={styles.amount}>
                        <span style={styles.currency}>AED </span>
                        {quote.amount?.toLocaleString()}
                    </div>
                    <span style={{
                        ...styles.badge,
                        background: statusStyle.bg,
                        color: statusStyle.color
                    }}>
                        {statusStyle.text}
                    </span>
                </div>
            </div>

            <div style={styles.details}>
                <div style={styles.detail}>
                    <span style={styles.detailLabel}>Delivery</span>
                    <span style={styles.detailValue}>
                        {quote.delivery_days ? `${quote.delivery_days} days` : 'TBD'}
                    </span>
                </div>
                <div style={styles.detail}>
                    <span style={styles.detailLabel}>Warranty</span>
                    <span style={styles.detailValue}>
                        {quote.warranty || 'Standard'}
                    </span>
                </div>
            </div>

            {quote.scope && (
                <div style={styles.scope}>
                    <strong>Scope:</strong> {quote.scope}
                </div>
            )}

            {canSelect && quote.status === 'received' && (
                <div style={styles.actions}>
                    <button
                        style={styles.selectBtn}
                        onClick={() => onSelect(quote.id)}
                    >
                        Select This Quote
                    </button>
                </div>
            )}
        </div>
    );
}

export default QuoteCard;
