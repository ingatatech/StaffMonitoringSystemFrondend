// src/utilis/stringUtils.tsx

/**
 * Truncates a string to a specified number of words
 * @param text - The text to truncate
 * @param wordLimit - Maximum number of words to keep
 * @returns Truncated text with ellipsis if needed
 */
export const truncateWords = (text: string, wordLimit: number): string => {
  if (!text) return "";
  
  const words = text.split(" ");
  if (words.length <= wordLimit) {
    return text;
  }
  
  return words.slice(0, wordLimit).join(" ") + "...";
};

/**
 * Truncates a string to a specified number of characters
 * @param text - The text to truncate
 * @param charLimit - Maximum number of characters to keep
 * @returns Truncated text with ellipsis if needed
 */
export const truncateChars = (text: string, charLimit: number): string => {
  if (!text) return "";
  
  if (text.length <= charLimit) {
    return text;
  }
  
  return text.slice(0, charLimit) + "...";
};

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns Text with each word capitalized
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return "";
  
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Capitalizes only the first letter of a string
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return "";
  
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Converts a string to kebab-case
 * @param text - The text to convert
 * @returns Text in kebab-case format
 */
export const toKebabCase = (text: string): string => {
  if (!text) return "";
  
  return text
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

/**
 * Converts a string to camelCase
 * @param text - The text to convert
 * @returns Text in camelCase format
 */
export const toCamelCase = (text: string): string => {
  if (!text) return "";
  
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

/**
 * Removes extra whitespace and trims a string
 * @param text - The text to clean
 * @returns Cleaned text
 */
export const cleanText = (text: string): string => {
  if (!text) return "";
  
  return text.replace(/\s+/g, " ").trim();
};

/**
 * Extracts initials from a full name
 * @param name - The full name
 * @param maxInitials - Maximum number of initials to return (default: 2)
 * @returns Initials in uppercase
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name) return "";
  
  const words = name.trim().split(" ");
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
  
  return initials;
};

/**
 * Formats a name for display (First Last)
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted full name
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim() || "";
  const last = lastName?.trim() || "";
  
  if (!first && !last) return "";
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
};

/**
 * Highlights search terms in text
 * @param text - The text to highlight
 * @param searchTerm - The term to highlight
 * @param className - CSS class for highlighting (default: 'bg-yellow-200')
 * @returns Text with highlighted search terms
 */
export const highlightText = (
  text: string, 
  searchTerm: string, 
  className: string = "bg-yellow-200"
): string => {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, `<span class="${className}">$1</span>`);
};

/**
 * Generates a slug from text
 * @param text - The text to convert to slug
 * @returns URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Masks sensitive information (like email or phone)
 * @param text - The text to mask
 * @param visibleStart - Number of characters to show at start (default: 2)
 * @param visibleEnd - Number of characters to show at end (default: 2)
 * @param maskChar - Character to use for masking (default: '*')
 * @returns Masked text
 */
export const maskText = (
  text: string, 
  visibleStart: number = 2, 
  visibleEnd: number = 2, 
  maskChar: string = "*"
): string => {
  if (!text || text.length <= visibleStart + visibleEnd) return text;
  
  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd);
  const maskLength = text.length - visibleStart - visibleEnd;
  const mask = maskChar.repeat(maskLength);
  
  return `${start}${mask}${end}`;
};

/**
 * Pluralizes a word based on count
 * @param word - The word to pluralize
 * @param count - The count to determine pluralization
 * @param pluralForm - Custom plural form (optional)
 * @returns Pluralized word
 */
export const pluralize = (word: string, count: number, pluralForm?: string): string => {
  if (!word) return "";
  
  if (count === 1) return word;
  
  if (pluralForm) return pluralForm;
  
  // Simple pluralization rules
  if (word.endsWith("y")) {
    return word.slice(0, -1) + "ies";
  }
  if (word.endsWith("s") || word.endsWith("sh") || word.endsWith("ch")) {
    return word + "es";
  }
  
  return word + "s";
};

/**
 * Formats text for display with count
 * @param word - The word to format
 * @param count - The count
 * @param showCount - Whether to show the count (default: true)
 * @returns Formatted text with count and proper pluralization
 */
export const formatWithCount = (word: string, count: number, showCount: boolean = true): string => {
  const pluralizedWord = pluralize(word, count);
  return showCount ? `${count} ${pluralizedWord}` : pluralizedWord;
};

/**
 * Converts text to sentence case
 * @param text - The text to convert
 * @returns Text in sentence case
 */
export const toSentenceCase = (text: string): string => {
  if (!text) return "";
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Removes HTML tags from text
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  
  return html.replace(/<[^>]*>/g, "");
};

/**
 * Checks if a string is a valid email
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats a phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

export default {
  truncateWords,
  truncateChars,
  capitalizeWords,
  capitalizeFirst,
  toKebabCase,
  toCamelCase,
  cleanText,
  getInitials,
  formatFullName,
  highlightText,
  generateSlug,
  maskText,
  pluralize,
  formatWithCount,
  toSentenceCase,
  stripHtml,
  isValidEmail,
  formatPhoneNumber,
};