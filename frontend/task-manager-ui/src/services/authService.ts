import axios from 'axios';

// Use environment variable for API base URL
// In Vite, env variables must be prefixed with VITE_ to be accessible in client code
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/auth`;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
}

class AuthService {
  private tokenKey = 'jwt_token';
  private userKey = 'user_data';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login`, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setUser({
        userId: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      });
    }
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/register`, userData);
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setUser({
        userId: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      });
    }
    return response.data;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeader(): { Authorization: string } | null {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }
}

export const authService = new AuthService();
