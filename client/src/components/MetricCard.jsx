const styles = {
    card: {
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'all 0.2s',
        cursor: 'default'
    },
    cardHover: {
        background: 'rgba(30, 41, 59, 0.8)',
        borderColor: 'rgba(148, 163, 184, 0.2)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    label: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: 1,
        color: '#64748b',
        textTransform: 'uppercase'
    },
    icon: {
        fontSize: 20,
        opacity: 0.8
    },
    value: {
        fontSize: 36,
        fontWeight: 700,
        lineHeight: 1.2
    },
    subtext: {
        fontSize: 12,
        color: '#64748b'
    }
};

const iconMap = {
    open: '📋',
    critical: '🔴',
    sla: '⏱️',
    approval: '✍️',
    quotes: '📨',
    verification: '✓'
};

function MetricCard({ label, value, icon, color = '#e2e8f0', subtext }) {
    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>{label}</span>
                <span style={styles.icon}>{iconMap[icon] || '📊'}</span>
            </div>
            <div style={{ ...styles.value, color }}>{value}</div>
            {subtext && <div style={styles.subtext}>{subtext}</div>}
        </div>
    );
}

export default MetricCard;
