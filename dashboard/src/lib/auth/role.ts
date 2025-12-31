/**
 * Role detection and parsing utilities
 *
 * Follows the same pattern as backend: parse app_metadata properly
 * and check role consistently.
 */

export type UserRole = "admin" | "student";

export interface ParsedAppMetadata {
  provider?: string;
  role?: UserRole;
}

export interface ParsedUserMetadata {
  role?: UserRole;
  [key: string]: unknown;
}

/**
 * Parse app_metadata safely
 */
export function parseAppMetadata(meta: unknown): ParsedAppMetadata {
  if (meta && typeof meta === "object") {
    const obj = meta as Record<string, unknown>;
    const roleValue = typeof obj.role === "string" ? obj.role : undefined;
    return {
      provider: typeof obj.provider === "string" ? obj.provider : undefined,
      role:
        typeof roleValue === "string" &&
        (roleValue === "admin" || roleValue === "student")
          ? (roleValue as UserRole)
          : undefined,
    };
  }
  return {};
}

/**
 * Parse user_metadata safely
 */
export function parseUserMetadata(meta: unknown): ParsedUserMetadata {
  if (meta && typeof meta === "object") {
    const obj = meta as Record<string, unknown>;
    const roleValue = typeof obj.role === "string" ? obj.role : undefined;
    const result: ParsedUserMetadata = { ...obj };
    result.role =
      typeof roleValue === "string" &&
      (roleValue === "admin" || roleValue === "student")
        ? (roleValue as UserRole)
        : undefined;
    return result;
  }
  return {};
}

/**
 * Get user role from Supabase user object
 *
 * Priority:
 * 1. app_metadata.role (set by Supabase Admin API)
 * 2. user_metadata.role (fallback)
 * 3. Default to 'student'
 */
export function getUserRole(
  user: { app_metadata?: unknown; user_metadata?: unknown } | null | undefined
): UserRole {
  if (!user) {
    console.log('🔍 [getUserRole] No user provided, returning "student"');
    return "student";
  }

  // Parse metadata properly
  const appMeta = parseAppMetadata(user.app_metadata);
  const userMeta = parseUserMetadata(user.user_metadata);

  console.log("🔍 [getUserRole] Parsed metadata:", {
    app_metadata_role: appMeta.role,
    user_metadata_role: userMeta.role,
  });

  // Priority: app_metadata.role > user_metadata.role > default 'student'
  const role = appMeta.role || userMeta.role || "student";

  console.log("🔍 [getUserRole] Final role:", role);
  return role;
}

/**
 * Check if user is admin
 */
export function isAdmin(
  user: { app_metadata?: unknown; user_metadata?: unknown } | null | undefined
): boolean {
  return getUserRole(user) === "admin";
}

/**
 * Check if user is student
 */
export function isStudent(
  user: { app_metadata?: unknown; user_metadata?: unknown } | null | undefined
): boolean {
  return getUserRole(user) === "student";
}
