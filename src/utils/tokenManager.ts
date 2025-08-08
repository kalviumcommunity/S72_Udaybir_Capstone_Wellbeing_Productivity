// Token management utility for secure JWT handling

interface TokenData {
  token: string;
  expiresAt: number;
  user: any;
}

class TokenManager {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'userData';
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  // Store token securely
  setToken(tokenData: TokenData): void {
    try {
      const data = {
        token: tokenData.token,
        expiresAt: tokenData.expiresAt,
        user: tokenData.user
      };
      
      // Store in sessionStorage for better security (cleared on tab close)
      sessionStorage.setItem(this.TOKEN_KEY, data.token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      sessionStorage.setItem('tokenExpiresAt', data.expiresAt.toString());
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  // Get token
  getToken(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  // Get user data
  getUser(): any | null {
    try {
      const userData = sessionStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Check if token is valid and not expired
  isTokenValid(): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;

      const expiresAt = sessionStorage.getItem('tokenExpiresAt');
      if (!expiresAt) return false;

      const expiryTime = parseInt(expiresAt);
      const now = Date.now();

      return now < expiryTime;
    } catch (error) {
      console.error('Failed to check token validity:', error);
      return false;
    }
  }

  // Check if token needs refresh
  needsRefresh(): boolean {
    try {
      const expiresAt = sessionStorage.getItem('tokenExpiresAt');
      if (!expiresAt) return true;

      const expiryTime = parseInt(expiresAt);
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      return timeUntilExpiry <= this.REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Failed to check token refresh need:', error);
      return true;
    }
  }

  // Clear all token data
  clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem('tokenExpiresAt');
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  // Decode JWT token (without verification)
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Get token expiry time
  getTokenExpiry(): number | null {
    try {
      const expiresAt = sessionStorage.getItem('tokenExpiresAt');
      return expiresAt ? parseInt(expiresAt) : null;
    } catch (error) {
      console.error('Failed to get token expiry:', error);
      return null;
    }
  }

  // Get time until token expires (in milliseconds)
  getTimeUntilExpiry(): number {
    try {
      const expiryTime = this.getTokenExpiry();
      if (!expiryTime) return 0;

      const now = Date.now();
      return Math.max(0, expiryTime - now);
    } catch (error) {
      console.error('Failed to get time until expiry:', error);
      return 0;
    }
  }
}

export const tokenManager = new TokenManager();

// Helper functions for backward compatibility
export const getAuthToken = (): string | null => tokenManager.getToken();
export const setAuthToken = (token: string, user: any, expiresAt: number): void => {
  tokenManager.setToken({ token, user, expiresAt });
};
export const clearAuthToken = (): void => tokenManager.clearToken();
export const isTokenValid = (): boolean => tokenManager.isTokenValid(); 