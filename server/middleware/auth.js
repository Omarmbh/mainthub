/**
 * Middleware to require authentication
 * Checks for valid session with user data
 */
export function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

/**
 * Middleware factory to require specific roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        // First check if authenticated
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        req.user = req.session.user;

        // Check if user's role is in allowed roles
        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({
                error: 'Access denied',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
    };
}

export default { requireAuth, requireRole };
