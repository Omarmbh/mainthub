import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Toast from './components/Toast';

const styles = {
    app: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative'
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#94a3b8'
    },
    spinner: {
        width: 40,
        height: 40,
        border: '3px solid rgba(148, 163, 184, 0.2)',
        borderTopColor: '#14b8a6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

function App() {
    const { user, loading, isAuthenticated } = useAuth();
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onSuccess={() => showToast('Login successful')} />;
    }

    return (
        <div style={styles.app}>
            <Navbar />
            <Dashboard showToast={showToast} />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </div>
    );
}

export default App;
