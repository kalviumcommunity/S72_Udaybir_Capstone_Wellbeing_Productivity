// CSRF Protection Utility

class CSRFProtection {
  private readonly TOKEN_KEY = 'csrf_token';
  private readonly TOKEN_LENGTH = 32;

  // Generate a random CSRF token
  generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get or create CSRF token
  getToken(): string {
    let token = sessionStorage.getItem(this.TOKEN_KEY);
    
    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    
    return token;
  }

  // Validate CSRF token
  validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    return storedToken === token;
  }

  // Clear CSRF token
  clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  // Add CSRF token to request headers
  addTokenToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      'X-CSRF-Token': this.getToken(),
    };
  }
}

export const csrfProtection = new CSRFProtection(); 