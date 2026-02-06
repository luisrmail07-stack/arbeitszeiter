// Time calculation utilities

/**
 * Format minutes to human-readable string
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted string (e.g., "2h 30m")
 */
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);

    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

/**
 * Format minutes to HH:MM:SS format
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted string (e.g., "02:30:15")
 */
function formatToHMS(minutes) {
    const totalSeconds = Math.floor(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculate duration between two dates in minutes
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time (defaults to now)
 * @returns {number} Duration in minutes
 */
function calculateDuration(startTime, endTime = new Date()) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / 1000 / 60);
}

/**
 * Get start of week (Monday)
 * @param {Date} date - Reference date (defaults to today)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
}

/**
 * Get end of week (Sunday)
 * @param {Date} date - Reference date (defaults to today)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function getWeekEnd(date = new Date()) {
    const weekStart = new Date(getWeekStart(date));
    const sunday = new Date(weekStart);
    sunday.setDate(weekStart.getDate() + 6);
    return sunday.toISOString().split('T')[0];
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.toISOString().split('T')[0] === today.toISOString().split('T')[0];
}

/**
 * Get date range for last N days
 * @param {number} days - Number of days
 * @returns {Object} Object with startDate and endDate
 */
function getLastNDays(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}

module.exports = {
    formatDuration,
    formatToHMS,
    calculateDuration,
    getWeekStart,
    getWeekEnd,
    isToday,
    getLastNDays
};
