/**
 * Utility functions for formatting data
 * Centralized location for common formatting functions
 */

/**
 * Formats a date string to Brazilian Portuguese format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Truncates content to specified length with ellipsis
 * @param content - Text content to truncate
 * @param maxLength - Maximum length before truncation (default: 150)
 * @returns Truncated content with ellipsis if needed
 */
export const truncateContent = (content: string, maxLength: number = 150): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

