/**
 * Smart Gym Management - Formatting & Display Utilities
 * Provides consistent formatting for currency (INR), dates, times, and status badges.
 */

/**
 * Format an amount into Indian Rupee currency format (e.g., ₹1,500)
 * Safely handles null, undefined, numeric strings, and invalid values.
 *
 * @param {number|string} amount
 * @param {string} [fallback='₹0']
 * @returns {string}
 */
export const formatCurrency = (amount, fallback = '₹0') => {
  if (amount === null || amount === undefined || amount === '') {
    return fallback;
  }
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
    return fallback;
  }
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `₹${numeric}`;
  }
};

/**
 * Format date string into Indian standard display format (e.g., "12 Oct 2026")
 * Safely parses YYYY-MM-DD without UTC timezone drift, timestamps, and ISO strings.
 *
 * @param {string|Date|number} dateInput
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export const formatDate = (dateInput, fallback = 'N/A') => {
  if (!dateInput) return fallback;

  // If already a Date object
  if (dateInput instanceof Date) {
    if (Number.isNaN(dateInput.getTime())) return fallback;
    return dateInput.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // If dateInput is a plain string like "2026-10-12" or "2026-10-12T00:00:00"
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return fallback;

    // Check for YYYY-MM-DD pattern to avoid timezone shift
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const localDate = new Date(year, month, day);
      if (!Number.isNaN(localDate.getTime())) {
        return localDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }
  }

  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) {
    return String(dateInput);
  }

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format time string (HH:mm:ss or HH:mm) into 12-hour format with AM/PM (e.g., "7:00 AM", "06:30 PM")
 * Safely handles null, undefined, invalid time strings.
 *
 * @param {string|Date} timeInput
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export const formatTime = (timeInput, fallback = 'N/A') => {
  if (!timeInput) return fallback;

  if (timeInput instanceof Date) {
    if (Number.isNaN(timeInput.getTime())) return fallback;
    return timeInput.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (typeof timeInput === 'string') {
    const trimmed = timeInput.trim();
    if (!trimmed) return fallback;

    // Handle standard HH:mm or HH:mm:ss strings
    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1].padStart(2, '0').substring(0, 2);
      if (!Number.isNaN(hours) && hours >= 0 && hours <= 23) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
      }
    }

    // Try parsing as ISO timestamp if string contains 'T'
    if (trimmed.includes('T')) {
      const d = new Date(trimmed);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    }

    return trimmed;
  }

  return fallback;
};

/**
 * Format full date and time (e.g., "12 Oct 2026, 06:30 PM")
 *
 * @param {string|Date|number} dateTimeInput
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export const formatDateTime = (dateTimeInput, fallback = 'N/A') => {
  if (!dateTimeInput) return fallback;

  const d = new Date(dateTimeInput);
  if (Number.isNaN(d.getTime())) {
    return String(dateTimeInput);
  }

  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Map status strings to CSS badge classes defined in global.css
 * (.badge-active, .badge-pending, .badge-expired)
 *
 * @param {string} status
 * @returns {string} CSS class name
 */
export const getStatusBadgeClass = (status) => {
  if (!status) return 'badge-pending';
  const s = String(status).trim().toLowerCase();
  switch (s) {
    case 'active':
    case 'verified':
    case 'confirmed':
    case 'present':
    case 'completed':
    case 'approved':
      return 'badge-active';

    case 'pending':
    case 'in_progress':
    case 'excused':
      return 'badge-pending';

    case 'expired':
    case 'cancelled':
    case 'canceled':
    case 'rejected':
    case 'failed':
    case 'absent':
    case 'inactive':
    case 'refunded':
      return 'badge-expired';

    default:
      return 'badge-pending';
  }
};

/**
 * Format numeric count with Indian commas
 *
 * @param {number|string} num
 * @param {string} [fallback='0']
 * @returns {string}
 */
export const formatNumber = (num, fallback = '0') => {
  if (num === null || num === undefined || num === '') return fallback;
  const n = typeof num === 'number' ? num : Number(num);
  if (Number.isNaN(n)) return fallback;
  return new Intl.NumberFormat('en-IN').format(n);
};
