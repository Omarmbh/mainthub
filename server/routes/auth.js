import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/database.js';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = db.prepare(`
            SELECT u.*, p.name as property_name
            FROM users u
            LEFT JOIN properties p ON u.property_id = p.id
            WHERE u.email = ?
        `).get(email.toLowerCase());

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;

        // Create session
        req.session.user = userWithoutPassword;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/logout
 * Destroy session and log out user
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

/**
 * GET /api/auth/me
 * Get currently authenticated user
 */
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

/**
 * POST /api/auth/switch-role
 * Demo feature: Switch user role for testing
 */
router.post('/switch-role', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const user = db.prepare(`
            SELECT u.*, p.name as property_name
            FROM users u
            LEFT JOIN properties p ON u.property_id = p.id
            WHERE u.email = ?
        `).get(email.toLowerCase());

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;

        // Update session
        req.session.user = userWithoutPassword;

        res.json({
            message: 'Role switched successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Switch role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/auth/users
 * Get all users (for demo role switcher)
 */
router.get('/users', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT u.id, u.email, u.role, u.name, u.title, u.unit, u.department, p.name as property_name
            FROM users u
            LEFT JOIN properties p ON u.property_id = p.id
            ORDER BY u.role, u.name
        `).all();

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
