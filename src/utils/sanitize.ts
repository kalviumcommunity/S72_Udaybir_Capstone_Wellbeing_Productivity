// Input sanitization utilities to prevent XSS attacks

// HTML entity encoding
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Encode HTML entities
export const encodeHtml = (str: string): string => {
  return str.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char] || char);
};

// Sanitize text input (remove HTML tags)
export const sanitizeText = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Sanitize HTML content (allow safe tags)
export const sanitizeHtml = (input: string): string => {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes = ['class', 'id'];
  
  // Remove script tags and dangerous attributes
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, ''); // Remove data: protocol
  
  // Only allow specific tags
  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  sanitized = sanitized.replace(tagRegex, (match, slash, tagName, attributes) => {
    if (!allowedTags.includes(tagName.toLowerCase())) {
      return ''; // Remove disallowed tags
    }
    
    // Sanitize attributes
    const cleanAttributes = attributes.replace(/\s*(\w+)\s*=\s*["'][^"']*["']/g, (attrMatch, attrName) => {
      if (allowedAttributes.includes(attrName.toLowerCase())) {
        return attrMatch; // Keep allowed attributes
      }
      return ''; // Remove disallowed attributes
    });
    
    return `<${slash}${tagName}${cleanAttributes}>`;
  });
  
  return sanitized;
};

// Sanitize URL
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http, https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email.toLowerCase().trim() : '';
};

// Sanitize user input for display
export const sanitizeForDisplay = (input: string): string => {
  return encodeHtml(sanitizeText(input));
};

// Validate and sanitize note content
export const sanitizeNoteContent = (content: string): string => {
  return sanitizeHtml(content);
};

// Validate and sanitize comment content
export const sanitizeCommentContent = (content: string): string => {
  return sanitizeText(content);
};

// Validate and sanitize task content
export const sanitizeTaskContent = (content: string): string => {
  return sanitizeText(content);
}; 