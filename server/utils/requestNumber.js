import db from '../db/database.js';

/**
 * Generate a unique request number in format MR-YYYY-NNNN
 * @returns {string} - The generated request number
 */
export function generateRequestNumber() {
    const currentYear = new Date().getFullYear();
    const prefix = `MR-${currentYear}-`;

    // Find the highest existing request number for the current year
    const result = db.prepare(`
        SELECT request_number FROM requests
        WHERE request_number LIKE ?
        ORDER BY request_number DESC
        LIMIT 1
    `).get(`${prefix}%`);

    let nextNumber = 1;

    if (result) {
        // Extract the numeric part and increment
        const lastNumber = parseInt(result.request_number.split('-')[2], 10);
        nextNumber = lastNumber + 1;
    }

    // Pad with zeros to ensure 4 digits
    const paddedNumber = nextNumber.toString().padStart(4, '0');

    return `${prefix}${paddedNumber}`;
}

export default { generateRequestNumber };
