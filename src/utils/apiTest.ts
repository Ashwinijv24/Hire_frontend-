/**
 * API Test Utility
 * Use this to test API connectivity and debug issues
 */

// Get API URL from environment or use Render backend
const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // If running on localhost, use Render backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://hireconnect-9nxv.onrender.com';
  }
  
  // Default to Render backend
  return 'https://hireconnect-9nxv.onrender.com';
})();

export const ApiTest = {
  /**
   * Test if backend is reachable
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/register/`, {
        method: 'OPTIONS',
      });
      return response.ok || response.status === 405; // 405 is OK for OPTIONS
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  /**
   * Test registration endpoint
   */
  async testRegistration(username: string, email: string, password: string): Promise<any> {
    try {
      console.log(`Testing registration at ${API_BASE_URL}/accounts/api/register/`);
      
      const response = await fetch(`${API_BASE_URL}/accounts/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          is_employer: false,
        }),
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      return {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error('Registration test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Test login endpoint
   */
  async testLogin(username: string, password: string): Promise<any> {
    try {
      console.log(`Testing login at ${API_BASE_URL}/accounts/api/login/`);
      
      const response = await fetch(`${API_BASE_URL}/accounts/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      return {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error('Login test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get API base URL
   */
  getApiUrl(): string {
    return API_BASE_URL;
  },

  /**
   * Log environment info
   */
  logEnvironmentInfo(): void {
    console.log('=== HireConnect API Test ===');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Frontend URL:', window.location.origin);
    console.log('Environment:', import.meta.env.MODE);
    console.log('Dev:', import.meta.env.DEV);
    console.log('Prod:', import.meta.env.PROD);
  },
};

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).ApiTest = ApiTest;
}
