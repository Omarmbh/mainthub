import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
    },
    modal: {
        background: 'rgba(30, 41, 59, 0.98)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 560,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 18,
        fontWeight: 600,
        color: '#e2e8f0'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#94a3b8',
        fontSize: 24,
        cursor: 'pointer',
        padding: 4,
        lineHeight: 1
    },
    body: {
        padding: 24
    },
    userInfo: {
        background: 'rgba(20, 184, 166, 0.1)',
        border: '1px solid rgba(20, 184, 166, 0.2)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(20, 184, 166, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 600,
        color: '#14b8a6'
    },
    userName: {
        fontSize: 14,
        fontWeight: 500,
        color: '#e2e8f0'
    },
    userUnit: {
        fontSize: 12,
        color: '#94a3b8'
    },
    field: {
        marginBottom: 20
    },
    label: {
        display: 'block',
        fontSize: 12,
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    select: {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
        color: '#e2e8f0',
        fontSize: 14,
        cursor: 'pointer',
        outline: 'none'
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
        color: '#e2e8f0',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
        color: '#e2e8f0',
        fontSize: 14,
        outline: 'none',
        resize: 'vertical',
        minHeight: 100,
        fontFamily: 'inherit'
    },
    priorityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8
    },
    priorityBtn: {
        padding: '12px 8px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center'
    },
    priorityName: {
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 4
    },
    prioritySla: {
        fontSize: 10,
        opacity: 0.7
    },
    footer: {
        padding: '16px 24px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        gap: 12,
        justifyContent: 'flex-end'
    },
    btn: {
        padding: '12px 24px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    btnPrimary: {
        background: 'rgba(20, 184, 166, 0.15)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        color: '#14b8a6'
    },
    btnSecondary: {
        background: 'transparent',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        color: '#94a3b8'
    },
    error: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 8
    }
};

const categories = [
    { value: 'HVAC', label: 'HVAC (Heating, Ventilation, AC)' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Elevator', label: 'Elevator' },
    { value: 'General', label: 'General Maintenance' },
    { value: 'Security', label: 'Security Systems' },
    { value: 'Fire Safety', label: 'Fire Safety' }
];

const priorities = [
    { value: 'critical', label: 'Critical', sla: '1hr response', color: '#ef4444' },
    { value: 'high', label: 'High', sla: '4hr response', color: '#f97316' },
    { value: 'medium', label: 'Medium', sla: '24hr response', color: '#f59e0b' },
    { value: 'low', label: 'Low', sla: '48hr response', color: '#22c55e' }
];

function NewRequestModal({ onSubmit, onClose }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: '',
        priority: 'medium',
        title: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.category) {
            setError('Please select a category');
            return;
        }
        if (!formData.title.trim()) {
            setError('Please enter a subject');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <span style={styles.title}>New Maintenance Request</span>
                    <button style={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.body}>
                        {/* User Info */}
                        <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>{getInitials(user?.name)}</div>
                            <div>
                                <div style={styles.userName}>{user?.name}</div>
                                <div style={styles.userUnit}>{user?.unit}</div>
                            </div>
                        </div>

                        {/* Category */}
                        <div style={styles.field}>
                            <label style={styles.label}>Category</label>
                            <select
                                style={styles.select}
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select a category...</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div style={styles.field}>
                            <label style={styles.label}>Priority</label>
                            <div style={styles.priorityGrid}>
                                {priorities.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        style={{
                                            ...styles.priorityBtn,
                                            borderColor: formData.priority === p.value ? p.color : 'rgba(148, 163, 184, 0.2)',
                                            background: formData.priority === p.value ? `${p.color}15` : 'rgba(15, 23, 42, 0.8)'
                                        }}
                                        onClick={() => setFormData({ ...formData, priority: p.value })}
                                    >
                                        <div style={{ ...styles.priorityName, color: p.color }}>{p.label}</div>
                                        <div style={{ ...styles.prioritySla, color: p.color }}>{p.sla}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div style={styles.field}>
                            <label style={styles.label}>Subject</label>
                            <input
                                type="text"
                                style={styles.input}
                                placeholder="Brief description of the issue..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div style={styles.field}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Provide detailed information about the issue, including location, when it started, and any relevant details..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}
                    </div>

                    <div style={styles.footer}>
                        <button
                            type="button"
                            style={{ ...styles.btn, ...styles.btnSecondary }}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ ...styles.btn, ...styles.btnPrimary }}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewRequestModal;
