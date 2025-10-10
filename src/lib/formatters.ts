export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const stripHtmlTags = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

export const truncateContent = (content: string, maxLength: number = 150): string => {
  const plainText = stripHtmlTags(content);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
};

export const calculateReadingTime = (content: string): number => {

  const plainText = stripHtmlTags(content);
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const wordsPerMinute = 225;
  const readingTimeMinutes = wordCount / wordsPerMinute;
  const roundedMinutes = Math.max(1, Math.round(readingTimeMinutes));

  return roundedMinutes;
};

export const countTextCharacters = (html: string): number => {
  if (!html || html.trim() === '') return 0;
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    let cleanText = textContent.trim();
    
    cleanText = cleanText.replace(/&[a-zA-Z0-9#]+;/g, ' ');
    
    cleanText = cleanText.replace(/\s+/g, ' ');
    
    cleanText = cleanText.trim();
    
    console.log('HTML length:', html.length);
    console.log('Text content:', cleanText);
    console.log('Text length:', cleanText.length);
    
    return cleanText.length;
  } catch (error) {
    console.error('Error counting text characters:', error);
    const textOnly = html.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z0-9#]+;/g, ' ').trim();
    return textOnly.length;
  }
};