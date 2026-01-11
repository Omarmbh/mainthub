import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/auth';
import Logo from './Logo';

const styles = {
    navbar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center'
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 20
    },
    roleSwitcher: {
        position: 'relative'
    },
    roleSwitcherBtn: {
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 6,
        padding: '8px 14px',
        color: '#f59e0b',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s'
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        background: 'rgba(30, 41, 59, 0.98)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: 8,
        minWidth: 280,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        zIndex: 1001
    },
    dropdownHeader: {
        padding: '12px 16px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: 1,
        color: '#64748b',
        textTransform: 'uppercase'
    },
    dropdownItem: {
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s',
        borderBottom: '1px solid rgba(148, 163, 184, 0.05)'
    },
    dropdownItemHover: {
        background: 'rgba(148, 163, 184, 0.1)'
    },
    userName: {
        fontSize: 13,
        fontWeight: 500,
        color: '#e2e8f0'
    },
    userRole: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2
    },
    roleBadge: {
        fontSize: 10,
        padding: '4px 8px',
        borderRadius: 4,
        fontWeight: 500,
        textTransform: 'uppercase'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(20, 184, 166, 0.2)',
        border: '2px solid rgba(20, 184, 166, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        color: '#14b8a6'
    },
    userDetails: {
        textAlign: 'right'
    },
    currentUserName: {
        fontSize: 14,
        fontWeight: 500,
        color: '#e2e8f0'
    },
    currentUserRole: {
        fontSize: 11,
        color: '#94a3b8',
        fontFamily: "'JetBrains Mono', monospace"
    },
    logoutBtn: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 6,
        padding: '8px 14px',
        color: '#ef4444',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

const roleColors = {
    tenant: { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', text: 'Tenant' },
    maintenance: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', text: 'Maintenance' },
    management: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', text: 'Management' },
    accounts: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: 'Accounts' }
};

function Navbar() {
    const { user, logout, switchRole } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [users, setUsers] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await authApi.getUsers();
            setUsers(response.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const handleSwitchRole = async (email) => {
        try {
            await switchRole(email);
            setShowDropdown(false);
        } catch (error) {
            console.error('Failed to switch role:', error);
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const roleStyle = roleColors[user?.role] || roleColors.tenant;

    return (
        <nav style={styles.navbar}>
            <div style={styles.logoSection}>
                <Logo size="small" />
            </div>

            <div style={styles.rightSection}>
                {/* Demo Role Switcher */}
                <div style={styles.roleSwitcher}>
                    <button
                        style={styles.roleSwitcherBtn}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span>DEMO</span>
                        <span>▾</span>
                    </button>

                    {showDropdown && (
                        <div style={styles.dropdown}>
                            <div style={styles.dropdownHeader}>Switch Demo User</div>
                            {users.map((u) => {
                                const roleStyle = roleColors[u.role];
                                return (
                                    <div
                                        key={u.email}
                                        style={{
                                            ...styles.dropdownItem,
                                            ...(hoveredItem === u.email ? styles.dropdownItemHover : {}),
                                            ...(u.email === user?.email ? { background: 'rgba(20, 184, 166, 0.1)' } : {})
                                        }}
                                        onClick={() => handleSwitchRole(u.email)}
                                        onMouseEnter={() => setHoveredItem(u.email)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <div>
                                            <div style={styles.userName}>{u.name}</div>
                                            <div style={styles.userRole}>{u.title || u.unit || u.department}</div>
                                        </div>
                                        <span style={{
                                            ...styles.roleBadge,
                                            background: roleStyle.bg,
                                            color: roleStyle.color
                                        }}>
                                            {roleStyle.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Current User Info */}
                <div style={styles.userInfo}>
                    <div style={styles.userDetails}>
                        <div style={styles.currentUserName}>{user?.name}</div>
                        <div style={styles.currentUserRole}>{user?.unit || user?.department}</div>
                    </div>
                    <div style={styles.avatar}>
                        {getInitials(user?.name || 'U')}
                    </div>
                </div>

                {/* Logout */}
                <button style={styles.logoutBtn} onClick={logout}>
                    Logout
                </button>
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </nav>
    );
}

export default Navbar;
