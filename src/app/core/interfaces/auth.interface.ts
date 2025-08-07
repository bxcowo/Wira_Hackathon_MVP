/**
 * Authentication interfaces for TransitAI application
 * Defines types for users, login credentials, and auth responses
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization: string;
  permissions: string[];
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export type UserRole = 
  | 'admin'           // System administrator
  | 'government'      // Government official
  | 'operator'        // Traffic operator
  | 'analyst'         // Data analyst
  | 'viewer';         // Read-only access

export interface MockUser extends User {
  password: string; // Only for mock authentication
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// Permission constants for role-based access control
export const PERMISSIONS = {
  // Dashboard access
  VIEW_DASHBOARD: 'view:dashboard',
  
  // Traffic monitoring
  VIEW_TRAFFIC: 'view:traffic',
  MANAGE_CAMERAS: 'manage:cameras',
  CONFIGURE_ALERTS: 'configure:alerts',
  
  // Reports and analytics
  VIEW_REPORTS: 'view:reports',
  EXPORT_DATA: 'export:data',
  
  // User management
  MANAGE_USERS: 'manage:users',
  VIEW_USERS: 'view:users',
  
  // System administration
  SYSTEM_CONFIG: 'system:config',
  VIEW_LOGS: 'view:logs'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TRAFFIC,
    PERMISSIONS.MANAGE_CAMERAS,
    PERMISSIONS.CONFIGURE_ALERTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.VIEW_LOGS
  ],
  government: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TRAFFIC,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_USERS
  ],
  operator: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TRAFFIC,
    PERMISSIONS.MANAGE_CAMERAS,
    PERMISSIONS.CONFIGURE_ALERTS,
    PERMISSIONS.VIEW_REPORTS
  ],
  analyst: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TRAFFIC,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  viewer: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TRAFFIC,
    PERMISSIONS.VIEW_REPORTS
  ]
};