import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import db, { initializeDatabase, isDatabaseEmpty } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/auth.js';
import requestsRoutes from './routes/requests.js';
import quotesRoutes from './routes/quotes.js';
import approvalsRoutes from './routes/approvals.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway/production reverse proxy
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    credentials: true
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'bhp-maintenance-hub-demo-secret-2026',
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === 'production',
    cookie: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/requests', quotesRoutes);
app.use('/api/approvals', approvalsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Get vendors endpoint
app.get('/api/vendors', (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM vendors WHERE active = 1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY name';

        const vendors = db.prepare(query).all(...params);
        res.json({ vendors });
    } catch (error) {
        console.error('Get vendors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get properties endpoint
app.get('/api/properties', (req, res) => {
    try {
        const properties = db.prepare('SELECT * FROM properties ORDER BY name').all();
        res.json({ properties });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientBuildPath));

    // Handle client-side routing
    app.get('*', (req, res) => {
        res.sendFile(join(clientBuildPath, 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database schema
        initializeDatabase();

        // Seed database if empty
        if (isDatabaseEmpty()) {
            await seedDatabase();
        }

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    BHP Maintenance Hub Server                              ║
║                                                            ║
║    Server running on http://localhost:${PORT}                 ║
║                                                            ║
║    API Endpoints:                                          ║
║    - POST /api/auth/login                                  ║
║    - POST /api/auth/logout                                 ║
║    - GET  /api/auth/me                                     ║
║    - GET  /api/requests                                    ║
║    - POST /api/requests                                    ║
║    - GET  /api/requests/:id                                ║
║    - POST /api/requests/:id/approve                        ║
║    - POST /api/requests/:id/reject                         ║
║                                                            ║
║    Demo Users (password: demo123):                         ║
║    - tenant@bhp.ae (Tenant)                                ║
║    - maintenance@bhp.ae (Head Engineer)                    ║
║    - fm@bhp.ae (Financial Manager)                         ║
║    - gm@bhp.ae (General Manager)                           ║
║    - accounts@bhp.ae (Accounts)                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
