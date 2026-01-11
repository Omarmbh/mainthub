import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import RequestList from '../components/RequestList';
import RequestDetail from '../components/RequestDetail';
import NewRequestModal from '../components/NewRequestModal';
import WorkflowGuide from '../components/WorkflowGuide';
import requestsApi from '../api/requests';

const styles = {
    container: {
        paddingTop: 80,
        paddingBottom: 60,
        minHeight: '100vh'
    },
    content: {
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px'
    },
    header: {
        marginBottom: 24
    },
    greeting: {
        fontSize: 24,
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8'
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
    },
    quickActions: {
        display: 'flex',
        gap: 12,
        marginBottom: 24
    },
    actionBtn: {
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 8
    },
    primaryBtn: {
        background: 'rgba(20, 184, 166, 0.15)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        color: '#14b8a6'
    },
    secondaryBtn: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#3b82f6'
    },
    badge: {
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '2px 8px',
        borderRadius: 10,
        fontSize: 12
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        alignItems: 'start'
    },
    footer: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100
    },
    footerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 20
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        color: '#94a3b8'
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#22c55e'
    },
    footerRight: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: '#64748b'
    }
};

function Dashboard({ showToast }) {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [quotes, setQuotes] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadRequests = useCallback(async () => {
        try {
            const response = await requestsApi.getAll();
            setRequests(response.requests);
        } catch (error) {
            console.error('Failed to load requests:', error);
            showToast?.('Failed to load requests', 'error');
        }
    }, [showToast]);

    const loadStats = useCallback(async () => {
        try {
            const response = await requestsApi.getStats();
            setStats(response.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }, []);

    const loadRequestDetail = useCallback(async (id) => {
        try {
            const response = await requestsApi.getById(id);
            setSelectedRequest(response.request);
            setQuotes(response.quotes || []);
            setAuditLogs(response.audit_logs || []);
        } catch (error) {
            console.error('Failed to load request detail:', error);
            showToast?.('Failed to load request details', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([loadRequests(), loadStats()]);
            setLoading(false);
        };
        loadData();
    }, [loadRequests, loadStats]);

    useEffect(() => {
        if (selectedRequestId) {
            loadRequestDetail(selectedRequestId);
        } else {
            setSelectedRequest(null);
            setQuotes([]);
            setAuditLogs([]);
        }
    }, [selectedRequestId, loadRequestDetail]);

    const handleSelectRequest = (id) => {
        setSelectedRequestId(id);
    };

    const handleCreateRequest = async (data) => {
        try {
            await requestsApi.create(data);
            showToast?.('Request submitted successfully', 'success');
            await loadRequests();
            await loadStats();
        } catch (error) {
            throw error;
        }
    };

    const handleAction = async (action, requestId, extra) => {
        try {
            switch (action) {
                case 'acknowledge':
                    await requestsApi.acknowledge(requestId);
                    showToast?.('Request acknowledged', 'success');
                    break;
                case 'checkAmc':
                    const amcResult = await requestsApi.checkAmc(requestId);
                    if (amcResult.amc_covered) {
                        showToast?.(`AMC coverage confirmed - ${amcResult.vendor.name}`, 'success');
                    } else {
                        showToast?.('No AMC coverage - quotes required', 'info');
                    }
                    break;
                case 'selectQuote':
                    await requestsApi.selectQuote(requestId, extra);
                    showToast?.('Quote selected successfully', 'success');
                    break;
                case 'approve':
                    await requestsApi.approve(requestId);
                    showToast?.('Request approved', 'success');
                    break;
                case 'reject':
                    await requestsApi.reject(requestId, extra);
                    showToast?.('Request rejected', 'success');
                    break;
                case 'requestDiscount':
                    await requestsApi.requestDiscount(requestId, null, 'Please provide best price');
                    showToast?.('Discount requested from vendor', 'success');
                    break;
                case 'startWork':
                    await requestsApi.startWork(requestId);
                    showToast?.('Work started', 'success');
                    break;
                case 'completeWork':
                    await requestsApi.completeWork(requestId);
                    showToast?.('Work marked complete', 'success');
                    break;
                case 'verify':
                    await requestsApi.verify(requestId);
                    showToast?.('Work verified successfully', 'success');
                    break;
                default:
                    console.warn('Unknown action:', action);
            }

            // Reload data
            await loadRequests();
            await loadStats();
            if (selectedRequestId) {
                await loadRequestDetail(selectedRequestId);
            }
        } catch (error) {
            console.error('Action failed:', error);
            showToast?.(error.message || 'Action failed', 'error');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (loading) {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#94a3b8' }}>Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div style={styles.container} className="fade-in">
                <div style={styles.content}>
                    {/* Header */}
                    <div style={styles.header}>
                        <h1 style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
                        <p style={styles.subtitle}>
                            {user?.role === 'tenant' && `Managing maintenance for ${user?.unit}`}
                            {user?.role === 'maintenance' && 'Maintenance Operations Dashboard'}
                            {user?.role === 'management' && 'Management Approval Dashboard'}
                            {user?.role === 'accounts' && 'Accounts & Payment Processing'}
                        </p>
                    </div>

                    {/* Metrics */}
                    <div style={styles.metricsGrid}>
                        <MetricCard
                            label="Open Requests"
                            value={stats?.openRequests || 0}
                            icon="open"
                            color="#e2e8f0"
                        />
                        <MetricCard
                            label="Critical"
                            value={stats?.criticalRequests || 0}
                            icon="critical"
                            color="#ef4444"
                        />
                        <MetricCard
                            label="SLA Compliance"
                            value={`${stats?.slaCompliance || 100}%`}
                            icon="sla"
                            color={stats?.slaCompliance >= 80 ? '#22c55e' : stats?.slaCompliance >= 60 ? '#f59e0b' : '#ef4444'}
                        />
                        <MetricCard
                            label="Pending Approval"
                            value={stats?.pendingApproval || 0}
                            icon="approval"
                            color="#3b82f6"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div style={styles.quickActions}>
                        {user?.role === 'tenant' && (
                            <button
                                style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                onClick={() => setShowNewRequestModal(true)}
                            >
                                + Submit New Request
                            </button>
                        )}
                        {user?.role === 'maintenance' && (
                            <>
                                <button
                                    style={{ ...styles.actionBtn, ...styles.secondaryBtn }}
                                    onClick={() => setFilter('all')}
                                >
                                    Awaiting Quote Selection
                                    <span style={styles.badge}>{stats?.pendingQuotes || 0}</span>
                                </button>
                                <button
                                    style={{ ...styles.actionBtn, ...styles.secondaryBtn }}
                                    onClick={() => setFilter('all')}
                                >
                                    Pending Verification
                                    <span style={styles.badge}>{stats?.pendingVerification || 0}</span>
                                </button>
                            </>
                        )}
                        {user?.role === 'management' && (
                            <button
                                style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                onClick={() => setFilter('pending')}
                            >
                                Pending Your Approval
                                <span style={styles.badge}>{stats?.pendingApproval || 0}</span>
                            </button>
                        )}
                        {user?.role === 'accounts' && (
                            <button
                                style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                onClick={() => setFilter('completed')}
                            >
                                Process Payments
                            </button>
                        )}
                        <button
                            style={{
                                ...styles.actionBtn,
                                background: showWorkflowGuide ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                                border: showWorkflowGuide ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                                color: showWorkflowGuide ? '#f59e0b' : '#94a3b8',
                                marginLeft: 'auto'
                            }}
                            onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
                        >
                            {showWorkflowGuide ? 'Hide Guide' : 'Workflow Guide'}
                        </button>
                    </div>

                    {/* Workflow Guide - show when toggled or when no requests */}
                    {(showWorkflowGuide || requests.length === 0) && (
                        <WorkflowGuide
                            collapsed={requests.length > 0 && !showWorkflowGuide}
                            onToggle={setShowWorkflowGuide}
                        />
                    )}

                    {/* Main Content Grid */}
                    <div style={styles.mainGrid}>
                        <RequestList
                            requests={requests}
                            selectedId={selectedRequestId}
                            onSelect={handleSelectRequest}
                            filter={filter}
                            onFilterChange={setFilter}
                        />
                        <RequestDetail
                            request={selectedRequest}
                            quotes={quotes}
                            auditLogs={auditLogs}
                            onAction={handleAction}
                            onQuoteAdded={async () => {
                                await loadRequests();
                                await loadStats();
                                if (selectedRequestId) {
                                    await loadRequestDetail(selectedRequestId);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Status Bar */}
            <div style={styles.footer}>
                <div style={styles.footerLeft}>
                    <div style={styles.statusIndicator}>
                        <div style={styles.statusDot}></div>
                        <span>EPMS</span>
                    </div>
                    <div style={styles.statusIndicator}>
                        <div style={styles.statusDot}></div>
                        <span>Accounts</span>
                    </div>
                    <div style={styles.statusIndicator}>
                        <div style={styles.statusDot}></div>
                        <span>Vendors</span>
                    </div>
                </div>
                <div style={styles.footerRight}>
                    BHP Maintenance Hub v1.0 | {new Date().toLocaleDateString('en-AE')}
                </div>
            </div>

            {/* New Request Modal */}
            {showNewRequestModal && (
                <NewRequestModal
                    onSubmit={handleCreateRequest}
                    onClose={() => setShowNewRequestModal(false)}
                />
            )}
        </>
    );
}

export default Dashboard;
