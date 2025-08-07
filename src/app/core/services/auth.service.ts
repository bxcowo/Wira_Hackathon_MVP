import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  MockUser, 
  AuthError,
  UserRole,
  ROLE_PERMISSIONS,
  Permission
} from '../interfaces/auth.interface';

/**
 * AuthService providing complete authentication functionality with mock backend
 * Features: JWT simulation, session persistence, role-based permissions
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  
  // Local storage keys
  private readonly TOKEN_KEY = 'transitai_token';
  private readonly REFRESH_TOKEN_KEY = 'transitai_refresh_token';
  private readonly USER_KEY = 'transitai_user';

  // Signals for reactive state management
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed properties
  readonly canAccess = computed(() => this.isAuthenticatedSignal());
  readonly userDisplayName = computed(() => {
    const user = this.userSignal();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  readonly userRole = computed(() => this.userSignal()?.role || null);
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  // Mock users for testing
  private readonly mockUsers: MockUser[] = [
    {
      id: '1',
      email: 'admin@transitai.pe',
      password: 'admin123',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      role: 'admin',
      organization: 'TransitAI',
      permissions: ROLE_PERMISSIONS.admin,
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2024-08-05')
    },
    {
      id: '2',
      email: 'gobierno@lima.gob.pe',
      password: 'gobierno123',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      role: 'government',
      organization: 'Municipalidad de Lima',
      permissions: ROLE_PERMISSIONS.government,
      createdAt: new Date('2024-02-20'),
      lastLoginAt: new Date('2024-08-04')
    },
    {
      id: '3',
      email: 'operador@transitai.pe',
      password: 'operador123',
      firstName: 'Juan',
      lastName: 'Perez',
      role: 'operator',
      organization: 'Centro de Control de Tránsito',
      permissions: ROLE_PERMISSIONS.operator,
      createdAt: new Date('2024-03-10'),
      lastLoginAt: new Date('2024-08-06')
    },
    {
      id: '4',
      email: 'analista@lima.gob.pe',
      password: 'analista123',
      firstName: 'Ana',
      lastName: 'Silva',
      role: 'analyst',
      organization: 'Gerencia de Transporte Urbano',
      permissions: ROLE_PERMISSIONS.analyst,
      createdAt: new Date('2024-04-05'),
      lastLoginAt: new Date('2024-08-03')
    }
  ];

  /**
   * Initialize authentication - check for existing session
   */
  async initialize(): Promise<void> {
    this.loadingSignal.set(true);
    this.clearError();
    
    try {
      // Check for existing token and user data
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      
      if (token && userData) {
        const user = JSON.parse(userData) as User;
        
        // Simulate token validation
        if (this.isTokenValid(token)) {
          this.setAuthenticatedUser(user, token);
        } else {
          this.clearAuthData();
        }
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.setError('Error al inicializar la sesión');
      this.clearAuthData();
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    this.loadingSignal.set(true);
    this.clearError();
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find user by email
      const mockUser = this.mockUsers.find(u => u.email === credentials.email);
      
      if (!mockUser) {
        throw new Error('INVALID_EMAIL');
      }
      
      if (mockUser.password !== credentials.password) {
        throw new Error('INVALID_PASSWORD');
      }
      
      // Create user object without password
      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        organization: mockUser.organization,
        permissions: mockUser.permissions,
        avatar: mockUser.avatar,
        createdAt: mockUser.createdAt,
        lastLoginAt: new Date()
      };
      
      // Generate mock JWT token
      const token = this.generateMockToken(user);
      const refreshToken = this.generateMockRefreshToken(user);
      
      // Store auth data
      this.setAuthenticatedUser(user, token, refreshToken);
      
      return {
        success: true,
        user,
        token,
        refreshToken,
        expiresIn: 3600, // 1 hour
        message: 'Inicio de sesión exitoso'
      };
      
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError.message);
      
      return {
        success: false,
        error: authError.message
      };
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    this.loadingSignal.set(true);
    
    try {
      // Simulate API call to invalidate session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.clearAuthData();
      
      // Navigate to home page
      await this.router.navigate(['/']);
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Navigate to login page
   */
  handleLoginClick(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.userSignal();
    return user?.permissions?.includes(permission) ?? false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const user = this.userSignal();
    
    if (!refreshToken || !user) {
      return false;
    }
    
    try {
      // Simulate token refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newToken = this.generateMockToken(user);
      localStorage.setItem(this.TOKEN_KEY, newToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Private helper methods

  private setAuthenticatedUser(user: User, token: string, refreshToken?: string): void {
    this.userSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    
    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private clearAuthData(): void {
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private generateMockToken(user: User): string {
    // Generate a mock JWT-like token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = btoa(`signature_for_${user.id}_${Date.now()}`);
    
    return `${header}.${payload}.${signature}`;
  }

  private generateMockRefreshToken(user: User): string {
    return btoa(`refresh_${user.id}_${Date.now()}_${Math.random()}`);
  }

  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  private handleAuthError(error: any): AuthError {
    const errorCode = error.message || error.code || 'UNKNOWN_ERROR';
    
    const errorMap: Record<string, string> = {
      INVALID_EMAIL: 'El correo electrónico no está registrado',
      INVALID_PASSWORD: 'La contraseña es incorrecta',
      NETWORK_ERROR: 'Error de conexión. Intente nuevamente',
      SESSION_EXPIRED: 'Su sesión ha expirado. Inicie sesión nuevamente',
      UNKNOWN_ERROR: 'Error inesperado. Intente nuevamente'
    };
    
    return {
      code: errorCode,
      message: errorMap[errorCode] || errorMap['UNKNOWN_ERROR']
    };
  }

  private setError(message: string): void {
    this.errorSignal.set(message);
  }

  private clearError(): void {
    this.errorSignal.set(null);
  }
}