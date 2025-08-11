// Client-side crypto utilities for secure password handling

// Fallback for crypto.getRandomValues in Node.js environment
const getRandomValues = (array: Uint8Array): Uint8Array => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(array);
  }
  // Fallback for Node.js environment
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

// Generate a random salt for password hashing
export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Hash password with salt using Web Crypto API
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }
  
  // Fallback for environments without crypto.subtle
  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };
  
  return simpleHash(password + salt);
};

// Verify password hash
export const verifyPassword = async (password: string, salt: string, hash: string): Promise<boolean> => {
  const computedHash = await hashPassword(password, salt);
  return computedHash === hash;
};

// Generate secure random string
export const generateSecureString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}; 