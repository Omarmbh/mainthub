import { useEffect } from 'react';

const styles = {
    container: {
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 10000,
        animation: 'slideUp 0.3s ease-out'
    },
    toast: {
        padding: '12px 20px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        minWidth: 250,
        maxWidth: 400
    },
    success: {
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10b981'
    },
    error: {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ef4444'
    },
    warning: {
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#f59e0b'
    },
    info: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#3b82f6'
    },
    icon: {
        fontSize: 18
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: 500
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'inherit',
        opacity: 0.7,
        cursor: 'pointer',
        padding: 4,
        fontSize: 16,
        lineHeight: 1
    }
};

// Add animation
const styleSheet = document.createElement('style');
if (!document.querySelector('#toast-styles')) {
    styleSheet.id = 'toast-styles';
    styleSheet.textContent = `
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
}

const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
};

function Toast({ message, type = 'success', duration = 4000, onClose }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const typeStyle = styles[type] || styles.success;

    return (
        <div style={styles.container}>
            <div style={{ ...styles.toast, ...typeStyle }}>
                <span style={styles.icon}>{icons[type]}</span>
                <span style={styles.message}>{message}</span>
                <button style={styles.closeBtn} onClick={onClose}>×</button>
            </div>
        </div>
    );
}

export default Toast;
