/**
 * API Client with Automatic Token Refresh and Session Expiry Handling
 * 
 * This utility wraps fetch() to:
 * 1. Automatically refresh tokens before API calls
 * 2. Handle 401/SESSION_EXPIRED errors gracefully
 * 3. Show session expired modal when needed
 */

import { getValidAccessToken } from './tokenRefresh';
import { supabase } from '../supabaseClient';

export interface ApiError {
  message: string;
  code?: string;
}

/**
 * Check if error response indicates session expiry
 */
function isSessionExpired(response: Response, errorData: any): boolean {
  if (response.status === 401) {
    return true;
  }
  
  if (errorData?.message === 'SESSION_EXPIRED') {
    return true;
  }
  
  if (errorData?.message?.toLowerCase().includes('expired')) {
    return true;
  }
  
  if (errorData?.message?.toLowerCase().includes('invalid token')) {
    return true;
  }
  
  return false;
}

/**
 * Handle session expiry by dispatching a custom event
 * Components can listen to this event to show the modal
 */
function handleSessionExpiry(redirectPath?: string) {
  // Dispatch custom event for session expiry
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('session-expired', {
      detail: { redirectPath },
    });
    window.dispatchEvent(event);
  }
}

/**
 * Enhanced fetch with automatic token refresh and session expiry handling
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get valid access token (refreshes if needed)
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    // No valid token, trigger session expiry
    handleSessionExpiry();
    throw new Error('No valid session');
  }

  // Add authorization header
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Check for session expiry
  if (response.status === 401) {
    try {
      // NestJS returns error as string or object
      const errorData = await response.json().catch(() => {
        // If JSON parsing fails, try to get text
        return response.text().then(text => text || 'SESSION_EXPIRED').catch(() => 'SESSION_EXPIRED');
      });
      
      if (isSessionExpired(response, errorData)) {
        // Clear invalid session
        await supabase.auth.signOut();
        
        // Get redirect path from current URL or options
        const redirectPath = typeof window !== 'undefined' 
          ? window.location.pathname 
          : undefined;
        
        handleSessionExpiry(redirectPath);
        
        throw new Error('SESSION_EXPIRED');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      // If parsing fails, still treat as session expiry
      await supabase.auth.signOut();
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
  }

  return response;
}

/**
 * Wrapper for JSON API calls with error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T; error: null } | { data: null; error: ApiError }> {
  try {
    const response = await apiFetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`,
      }));
      
      return {
        data: null,
        error: {
          message: errorData.message || 'Request failed',
          code: errorData.code,
        },
      };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
      return {
        data: null,
        error: {
          message: 'SESSION_EXPIRED',
          code: 'SESSION_EXPIRED',
        },
      };
    }
    
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

