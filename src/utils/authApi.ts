const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  is_employer: boolean;
  is_candidate: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class AuthAPI {
  static async register(username: string, email: string, password: string, isEmployer: boolean = false): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          is_employer: isEmployer,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Backend returned invalid response. Status: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Registration failed: ${response.statusText}`);
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    }
  }

  static async login(username: string, password: string): Promise<AuthResponse> {
    try {
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Backend returned invalid response. Status: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    }
  }

  static async logout(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/accounts/api/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static async getCurrentUser(): Promise<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/current-user/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  static getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/health/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
