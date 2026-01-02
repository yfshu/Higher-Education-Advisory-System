/**
 * Admin API client
 * 
 * Handles all admin-related API calls to the backend
 */

import { apiFetch, apiCall } from '@/lib/auth/apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export interface DashboardMetrics {
  students: {
    total: number;
    recent: number;
  };
  programs: {
    total: number;
  };
  scholarships: {
    total: number;
  };
  recommendations: {
    total: number;
  };
  alerts: {
    open: number;
  };
}

export interface SystemAlert {
  id: number;
  message: string | null;
  type: 'info' | 'warning' | 'error' | null;
  status: 'open' | 'resolved' | null;
  created_at: string | null;
}

export interface RecentUser {
  id: string;
  email: string;
  joined: string;
  status: string;
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

export interface UserDetails extends RecentUser {
  countryCode?: string | null;
  avatarUrl?: string | null;
  studyLevel?: string | null;
  profile?: any;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface RecentProgram {
  id: number;
  title: string;
  university: string;
  added: string;
  applications: number;
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(accessToken: string): Promise<DashboardMetrics> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/dashboard/metrics`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch dashboard metrics');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get system alerts
 */
export async function getSystemAlerts(accessToken: string, limit: number = 10): Promise<SystemAlert[]> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/alerts?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch system alerts');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Resolve a system alert
 */
export async function resolveAlert(accessToken: string, alertId: number): Promise<SystemAlert> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to resolve alert');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get recent users
 */
export async function getRecentUsers(accessToken: string, limit: number = 5): Promise<RecentUser[]> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/users/recent?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recent users');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(accessToken: string, limit: number = 50, offset: number = 0): Promise<{ users: RecentUser[]; total: number }> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/users?limit=${limit}&offset=${offset}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }

  const result = await response.json();
  return {
    users: result.data || [],
    total: result.total || 0,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(accessToken: string, userId: string): Promise<UserDetails> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update user
 */
export async function updateUser(accessToken: string, userId: string, updateData: UpdateUserRequest): Promise<UserDetails> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete user
 */
export async function deleteUser(accessToken: string, userId: string): Promise<void> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
}

/**
 * Get recent programs
 */
export async function getRecentPrograms(accessToken: string, limit: number = 5): Promise<RecentProgram[]> {
  const response = await apiFetch(`${BACKEND_URL}/api/admin/programs/recent?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recent programs');
  }

  const result = await response.json();
  return result.data;
}

