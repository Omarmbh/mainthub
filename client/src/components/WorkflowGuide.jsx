import { useState } from 'react';

const styles = {
    container: {
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.1)',
        padding: 24,
        marginBottom: 24
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8
    },
    toggleBtn: {
        background: 'rgba(148, 163, 184, 0.1)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 6,
        padding: '6px 12px',
        color: '#94a3b8',
        fontSize: 12,
        cursor: 'pointer'
    },
    workflow: {
        display: 'flex',
        flexDirection: 'column',
        gap: 0
    },
    step: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        position: 'relative'
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        flexShrink: 0,
        position: 'relative',
        zIndex: 1
    },
    stepLine: {
        position: 'absolute',
        left: 15,
        top: 32,
        width: 2,
        height: 'calc(100% - 8px)',
        background: 'rgba(148, 163, 184, 0.2)'
    },
    stepContent: {
        flex: 1,
        paddingBottom: 20
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: 4
    },
    stepDesc: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 1.5
    },
    stepRole: {
        display: 'inline-block',
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 4,
        marginTop: 6,
        fontWeight: 500
    },
    branch: {
        marginLeft: 48,
        padding: '12px 16px',
        background: 'rgba(148, 163, 184, 0.05)',
        borderRadius: 8,
        marginBottom: 12,
        borderLeft: '3px solid'
    },
    branchTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: 4
    },
    branchDesc: {
        fontSize: 11,
        color: '#94a3b8'
    },
    thresholds: {
        marginTop: 16,
        padding: 16,
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 8,
        border: '1px solid rgba(59, 130, 246, 0.2)'
    },
    thresholdsTitle: {
        fontSize: 13,
        fontWeight: 600,
        color: '#3b82f6',
        marginBottom: 12
    },
    thresholdRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#94a3b8',
        padding: '6px 0',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
    }
};

const roleColors = {
    tenant: { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' },
    maintenance: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' },
    management: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    accounts: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
    system: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }
};

const workflowSteps = [
    {
        status: 'new',
        title: '1. Submit Request',
        desc: 'Tenant submits a new maintenance request with details, category, and priority.',
        role: 'tenant',
        color: '#f43f5e'
    },
    {
        status: 'acknowledged',
        title: '2. Acknowledge',
        desc: 'Maintenance team acknowledges the request and begins assessment.',
        role: 'maintenance',
        color: '#94a3b8'
    },
    {
        status: 'amc_check',
        title: '3. AMC Check',
        desc: 'System checks if the category is covered under an Annual Maintenance Contract.',
        role: 'system',
        color: '#f59e0b',
        branches: [
            { condition: 'AMC Covered', result: 'Skip to step 7 - Vendor dispatched automatically', color: '#22c55e' },
            { condition: 'No AMC', result: 'Proceed to collect vendor quotes', color: '#f59e0b' }
        ]
    },
    {
        status: 'pending_quotes',
        title: '4. Collect Quotes',
        desc: 'Maintenance collects quotes from approved vendors for the work.',
        role: 'maintenance',
        color: '#94a3b8'
    },
    {
        status: 'quote_selection',
        title: '5. Select Quote',
        desc: 'Maintenance selects the best quote based on price, delivery, and quality.',
        role: 'maintenance',
        color: '#94a3b8',
        branches: [
            { condition: '≤ AED 500', result: 'Auto-approved by Head Engineer', color: '#22c55e' },
            { condition: '> AED 500', result: 'Routes to management for approval', color: '#3b82f6' }
        ]
    },
    {
        status: 'pending_approval',
        title: '6. Management Approval',
        desc: 'Request routed to appropriate manager based on amount threshold.',
        role: 'management',
        color: '#3b82f6',
        branches: [
            { condition: 'Approved', result: 'Proceed to work execution', color: '#22c55e' },
            { condition: 'Rejected', result: 'Request closed with reason', color: '#ef4444' }
        ]
    },
    {
        status: 'in_progress',
        title: '7. Work Execution',
        desc: 'Vendor performs the maintenance work on-site.',
        role: 'system',
        color: '#f59e0b'
    },
    {
        status: 'pending_verification',
        title: '8. Verification',
        desc: 'Maintenance team verifies work completion through physical inspection.',
        role: 'maintenance',
        color: '#94a3b8'
    },
    {
        status: 'completed',
        title: '9. Payment Processing',
        desc: 'Accounts processes 4-Doc Pack (Invoice, Receipt, FAR, Payment Copy).',
        role: 'accounts',
        color: '#10b981'
    },
    {
        status: 'closed',
        title: '10. Closed',
        desc: 'Request fully completed and archived.',
        role: 'system',
        color: '#22c55e'
    }
];

const approvalThresholds = [
    { range: 'Up to AED 500', approver: 'Head Engineer', note: 'Auto-approved' },
    { range: 'AED 501 - 5,000', approver: 'Financial Manager', note: '' },
    { range: 'AED 5,001 - 25,000', approver: 'General Manager', note: '' },
    { range: 'Above AED 25,000', approver: 'Chairman', note: '' }
];

function WorkflowGuide({ collapsed = false, onToggle }) {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
        onToggle?.(!isCollapsed);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>
                    <span>📋</span>
                    Request Workflow Guide
                </div>
                <button style={styles.toggleBtn} onClick={handleToggle}>
                    {isCollapsed ? 'Show Guide' : 'Hide Guide'}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    <div style={styles.workflow}>
                        {workflowSteps.map((step, index) => (
                            <div key={step.status} style={styles.step}>
                                <div style={{
                                    ...styles.stepIcon,
                                    background: step.color,
                                    color: '#fff'
                                }}>
                                    {index + 1}
                                </div>
                                {index < workflowSteps.length - 1 && <div style={styles.stepLine} />}
                                <div style={styles.stepContent}>
                                    <div style={styles.stepTitle}>{step.title}</div>
                                    <div style={styles.stepDesc}>{step.desc}</div>
                                    <span style={{
                                        ...styles.stepRole,
                                        background: roleColors[step.role].bg,
                                        color: roleColors[step.role].color
                                    }}>
                                        {step.role.charAt(0).toUpperCase() + step.role.slice(1)}
                                    </span>
                                    {step.branches && step.branches.map((branch, i) => (
                                        <div key={i} style={{
                                            ...styles.branch,
                                            borderLeftColor: branch.color
                                        }}>
                                            <div style={styles.branchTitle}>{branch.condition}</div>
                                            <div style={styles.branchDesc}>{branch.result}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.thresholds}>
                        <div style={styles.thresholdsTitle}>Approval Thresholds</div>
                        {approvalThresholds.map((t, i) => (
                            <div key={i} style={styles.thresholdRow}>
                                <span>{t.range}</span>
                                <span style={{ color: '#e2e8f0' }}>
                                    {t.approver} {t.note && <span style={{ color: '#22c55e' }}>({t.note})</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default WorkflowGuide;
