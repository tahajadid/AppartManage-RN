/**
 * Date formatting utility functions
 */

/**
 * Format date to DD/MM/YYYY format for storage
 * @param date - Date object to format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to DD/MM/YYYY format for display
 * @param date - Date object to format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Parse date from DD/MM/YYYY format to Date object
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

