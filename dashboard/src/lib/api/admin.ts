/**
 * Admin API client
 * 
 * Handles all admin-related API calls to the backend
 */

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
  const response = await fetch(`${BACKEND_URL}/api/admin/dashboard/metrics`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
  const response = await fetch(`${BACKEND_URL}/api/admin/alerts?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
  const response = await fetch(`${BACKEND_URL}/api/admin/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
  const response = await fetch(`${BACKEND_URL}/api/admin/users/recent?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
 * Get recent programs
 */
export async function getRecentPrograms(accessToken: string, limit: number = 5): Promise<RecentProgram[]> {
  const response = await fetch(`${BACKEND_URL}/api/admin/programs/recent?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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

