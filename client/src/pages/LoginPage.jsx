import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 20
    },
    card: {
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 16,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32
    },
    logoMark: {
        width: 48,
        height: 48,
        background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14,
        color: '#fff'
    },
    logoText: {
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        fontSize: 18,
        color: '#e2e8f0',
        letterSpacing: 1
    },
    title: {
        fontSize: 24,
        fontWeight: 600,
        color: '#e2e8f0',
        textAlign: 'center',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 32
    },
    field: {
        marginBottom: 20
    },
    label: {
        display: 'block',
        fontSize: 12,
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: 8
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
        color: '#e2e8f0',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    submitBtn: {
        width: '100%',
        padding: '14px 24px',
        background: 'rgba(20, 184, 166, 0.15)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        borderRadius: 8,
        color: '#14b8a6',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: 8
    },
    error: {
        color: '#ef4444',
        fontSize: 13,
        marginTop: 16,
        textAlign: 'center',
        padding: '10px 16px',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8
    },
    demoInfo: {
        marginTop: 32,
        padding: 16,
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: 8
    },
    demoTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#f59e0b',
        marginBottom: 12
    },
    demoCredentials: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 1.8
    },
    demoEmail: {
        fontFamily: "'JetBrains Mono', monospace",
        color: '#e2e8f0'
    }
};

function LoginPage({ onSuccess }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            onSuccess?.();
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoEmail) => {
        setEmail(demoEmail);
        setPassword('demo123');
        setError('');
        setLoading(true);

        try {
            await login(demoEmail, 'demo123');
            onSuccess?.();
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>
                    <div style={styles.logoMark}>BHP</div>
                    <span style={styles.logoText}>Maintenance Hub</span>
                </div>

                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Sign in to your account</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {error && <div style={styles.error}>{error}</div>}
                </form>

                <div style={styles.demoInfo}>
                    <div style={styles.demoTitle}>Demo Credentials</div>
                    <div style={styles.demoCredentials}>
                        <div>
                            <span style={styles.demoEmail}>tenant@bhp.ae</span> - Tenant
                            <button
                                style={{ marginLeft: 8, background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: 11 }}
                                onClick={() => handleDemoLogin('tenant@bhp.ae')}
                            >
                                Quick Login
                            </button>
                        </div>
                        <div>
                            <span style={styles.demoEmail}>maintenance@bhp.ae</span> - Head Engineer
                            <button
                                style={{ marginLeft: 8, background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: 11 }}
                                onClick={() => handleDemoLogin('maintenance@bhp.ae')}
                            >
                                Quick Login
                            </button>
                        </div>
                        <div>
                            <span style={styles.demoEmail}>fm@bhp.ae</span> - Financial Manager
                            <button
                                style={{ marginLeft: 8, background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: 11 }}
                                onClick={() => handleDemoLogin('fm@bhp.ae')}
                            >
                                Quick Login
                            </button>
                        </div>
                        <div>
                            <span style={styles.demoEmail}>gm@bhp.ae</span> - General Manager
                            <button
                                style={{ marginLeft: 8, background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: 11 }}
                                onClick={() => handleDemoLogin('gm@bhp.ae')}
                            >
                                Quick Login
                            </button>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
                            Password for all: <span style={styles.demoEmail}>demo123</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
