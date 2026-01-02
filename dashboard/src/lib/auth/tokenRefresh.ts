/**
 * Token Refresh Utility
 * 
 * Ensures tokens are refreshed before API calls to prevent expired token errors.
 */

import { supabase } from '../supabaseClient';

export interface RefreshResult {
  success: boolean;
  accessToken: string | null;
  error: string | null;
}

/**
 * Refresh the current session token if needed
 * Returns the access token or null if refresh failed
 */
export async function refreshTokenIfNeeded(): Promise<RefreshResult> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        success: false,
        accessToken: null,
        error: 'No active session',
      };
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60; // 5 minutes in seconds

      // If token expires within 5 minutes, refresh it
      if (expiresIn < fiveMinutes) {
        console.log('[TokenRefresh] Token expiring soon, refreshing...');
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          console.error('[TokenRefresh] Failed to refresh session:', refreshError);
          return {
            success: false,
            accessToken: null,
            error: refreshError?.message || 'Failed to refresh session',
          };
        }

        return {
          success: true,
          accessToken: refreshedSession.access_token,
          error: null,
        };
      }
    }

    // Token is still valid
    return {
      success: true,
      accessToken: session.access_token,
      error: null,
    };
  } catch (error) {
    console.error('[TokenRefresh] Error refreshing token:', error);
    return {
      success: false,
      accessToken: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a valid access token, refreshing if necessary
 * This should be called before making any protected API call
 */
export async function getValidAccessToken(): Promise<string | null> {
  const result = await refreshTokenIfNeeded();
  return result.accessToken;
}

