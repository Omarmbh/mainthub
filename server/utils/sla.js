// SLA targets in minutes
const SLA_TARGETS = {
    critical: {
        response: 60,      // 1 hour
        resolution: 480    // 8 hours
    },
    high: {
        response: 240,     // 4 hours
        resolution: 2880   // 48 hours
    },
    medium: {
        response: 1440,    // 24 hours
        resolution: 7200   // 5 days
    },
    low: {
        response: 2880,    // 48 hours
        resolution: 14400  // 10 days
    },
    scheduled: {
        response: null,    // No SLA
        resolution: null   // No SLA
    }
};

/**
 * Calculate SLA status based on priority and elapsed time
 * @param {string} priority - Request priority (critical, high, medium, low, scheduled)
 * @param {Date|string} createdAt - When the request was created
 * @param {Date|string} currentTime - Current time for comparison
 * @param {string} type - 'response' or 'resolution'
 * @returns {string} - 'within_target', 'at_risk', 'breached', or 'na'
 */
export function calculateSlaStatus(priority, createdAt, currentTime = new Date(), type = 'response') {
    // Scheduled priority has no SLA
    if (priority === 'scheduled') {
        return 'na';
    }

    const targets = SLA_TARGETS[priority];
    if (!targets || targets[type] === null) {
        return 'na';
    }

    const created = new Date(createdAt);
    const current = new Date(currentTime);
    const elapsedMinutes = (current - created) / (1000 * 60);
    const target = targets[type];

    // Less than 75% of target: within_target
    if (elapsedMinutes < target * 0.75) {
        return 'within_target';
    }

    // Between 75% and 100% of target: at_risk
    if (elapsedMinutes <= target) {
        return 'at_risk';
    }

    // Exceeded target: breached
    return 'breached';
}

/**
 * Get SLA target information for a priority
 * @param {string} priority - Request priority
 * @returns {object} - Object with response and resolution targets
 */
export function getSlaTargets(priority) {
    return SLA_TARGETS[priority] || { response: null, resolution: null };
}

/**
 * Format minutes to human-readable string
 * @param {number} minutes - Minutes to format
 * @returns {string} - Formatted string (e.g., "4 hours", "2 days")
 */
export function formatSlaTarget(minutes) {
    if (minutes === null) return 'No SLA';
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${minutes / 60} hours`;
    return `${minutes / 1440} days`;
}

export default { calculateSlaStatus, getSlaTargets, formatSlaTarget };
