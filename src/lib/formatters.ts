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
 * Strips HTML tags from content
 * @param html - HTML content to strip
 * @returns Plain text content
 */
export const stripHtmlTags = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

/**
 * Truncates content to specified length with ellipsis
 * @param content - Text content to truncate
 * @param maxLength - Maximum length before truncation (default: 150)
 * @returns Truncated content with ellipsis if needed
 */
export const truncateContent = (content: string, maxLength: number = 150): string => {
  // Strip HTML tags first
  const plainText = stripHtmlTags(content);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
};

/**
 * Calculates realistic reading time based on content
 * @param content - HTML content to analyze
 * @returns Reading time in minutes (rounded to nearest minute, minimum 1)
 */
export const calculateReadingTime = (content: string): number => {
  // Strip HTML tags to get plain text
  const plainText = stripHtmlTags(content);

  // Count words (split by whitespace and filter out empty strings)
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200-250 words per minute
  // Using 225 words per minute as a realistic average
  const wordsPerMinute = 225;

  // Calculate reading time in minutes
  const readingTimeMinutes = wordCount / wordsPerMinute;

  // Round to nearest minute, minimum 1 minute
  const roundedMinutes = Math.max(1, Math.round(readingTimeMinutes));

  return roundedMinutes;
};

/**
 * Counts only the text content from HTML, ignoring all tags and attributes
 * @param html - HTML string to count text from
 * @returns Number of characters in the text content only
 */
export const countTextCharacters = (html: string): number => {
  if (!html || html.trim() === '') return 0;
  
  try {
    // Create a temporary DOM element to properly extract text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get only the text content, ignoring HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up the text
    let cleanText = textContent.trim();
    
    // Remove HTML entities
    cleanText = cleanText.replace(/&[a-zA-Z0-9#]+;/g, ' ');
    
    // Remove extra whitespace
    cleanText = cleanText.replace(/\s+/g, ' ');
    
    // Remove leading/trailing spaces
    cleanText = cleanText.trim();
    
    console.log('HTML length:', html.length);
    console.log('Text content:', cleanText);
    console.log('Text length:', cleanText.length);
    
    return cleanText.length;
  } catch (error) {
    console.error('Error counting text characters:', error);
    // Fallback: use regex to strip HTML tags
    const textOnly = html.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z0-9#]+;/g, ' ').trim();
    return textOnly.length;
  }
};

