import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';

type SystemAlert = Database['public']['Tables']['system_alerts']['Row'];

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check if user is admin
   * Checks the role from user's app_metadata (set in Supabase Auth)
   */
  private async isAdmin(userId: string): Promise<boolean> {
    try {
      const db = this.supabaseService.getClient();
      
      // Use admin API to get user details
      const { data: { user }, error } = await db.auth.admin.getUserById(userId);

      if (error || !user) {
        this.logger.error('Error fetching user for admin check:', error);
        return false;
      }

      // Check role from app_metadata (primary) or user_metadata (fallback)
      const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role || 'student';
      
      this.logger.log(`Admin check for user ${userId}: role=${role}`);
      return role === 'admin';
    } catch (error) {
      this.logger.error('Exception in isAdmin:', error);
      return false;
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(userId: string) {
    // Verify admin access
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      // Get total students
      const { count: studentCount, error: studentError } = await db
        .from('student_profile')
        .select('*', { count: 'exact', head: true });

      if (studentError) {
        this.logger.error('Error fetching student count:', studentError);
      }

      // Get total programs
      const { count: programCount, error: programError } = await db
        .from('programs')
        .select('*', { count: 'exact', head: true });

      if (programError) {
        this.logger.error('Error fetching program count:', programError);
      }

      // Get total scholarships
      const { count: scholarshipCount, error: scholarshipError } = await db
        .from('scholarships')
        .select('*', { count: 'exact', head: true });

      if (scholarshipError) {
        this.logger.error('Error fetching scholarship count:', scholarshipError);
      }

      // Get open system alerts count
      const { count: alertCount, error: alertError } = await db
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (alertError) {
        this.logger.error('Error fetching alert count:', alertError);
      }

      // Get recommendations count (if recommendation_logs table exists)
      // For now, return 0 as placeholder
      let recommendationCount = 0;
      try {
        // Use type assertion since recommendation_logs might not be in types yet
        const { count: recCount } = await (db as any)
          .from('recommendation_logs')
          .select('*', { count: 'exact', head: true });
        recommendationCount = recCount || 0;
      } catch {
        // Table might not exist, use 0
        recommendationCount = 0;
      }

      // Get recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentStudents, error: recentError } = await db
        .from('student_profile')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        this.logger.error('Error fetching recent students:', recentError);
      }

      return {
        students: {
          total: studentCount || 0,
          recent: recentStudents || 0,
        },
        programs: {
          total: programCount || 0,
        },
        scholarships: {
          total: scholarshipCount || 0,
        },
        recommendations: {
          total: recommendationCount,
        },
        alerts: {
          open: alertCount || 0,
        },
      };
    } catch (error) {
      this.logger.error('Exception in getDashboardMetrics:', error);
      throw error;
    }
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts(userId: string, limit: number = 10) {
    // Verify admin access
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data, error } = await db
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Error fetching system alerts:', error);
        throw new Error(`Failed to fetch system alerts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Exception in getSystemAlerts:', error);
      throw error;
    }
  }

  /**
   * Resolve a system alert
   */
  async resolveAlert(userId: string, alertId: number) {
    // Verify admin access
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data, error } = await db
        .from('system_alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        this.logger.error('Error resolving alert:', error);
        throw new Error(`Failed to resolve alert: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Exception in resolveAlert:', error);
      throw error;
    }
  }

  /**
   * Get recent users
   */
  async getRecentUsers(userId: string, limit: number = 5) {
    // Verify admin access
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      // Get recent users from student_profile
      // Note: We can't directly join auth.users due to RLS, so we'll get user_id and fetch emails separately
      const { data: profiles, error } = await db
        .from('student_profile')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Error fetching recent users:', error);
        throw new Error(`Failed to fetch recent users: ${error.message}`);
      }

      // Map to return format
      // In a real implementation, you might want to fetch emails from auth.users via admin API
      return (profiles || []).map((profile: any) => ({
        id: profile.user_id,
        email: profile.user_id ? `${profile.user_id.substring(0, 8)}...@user.com` : 'N/A',
        joined: profile.created_at,
        status: 'Active',
      }));
    } catch (error) {
      this.logger.error('Exception in getRecentUsers:', error);
      throw error;
    }
  }

  /**
   * Get recent programs
   */
  async getRecentPrograms(userId: string, limit: number = 5) {
    // Verify admin access
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data, error } = await db
        .from('programs')
        .select(`
          id,
          name,
          created_at,
          university:university_id (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Error fetching recent programs:', error);
        throw new Error(`Failed to fetch recent programs: ${error.message}`);
      }

      return (data || []).map((program: any) => ({
        id: program.id,
        title: program.name,
        university: program.university?.name || 'Unknown University',
        added: program.created_at,
        applications: 0, // Placeholder - would need separate table
      }));
    } catch (error) {
      this.logger.error('Exception in getRecentPrograms:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(userId: string, limit: number = 50, offset: number = 0) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      // Get user profiles with pagination
      const { data: profiles, error: profileError, count } = await db
        .from('student_profile')
        .select('user_id, phone_number, country_code, avatar_url, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (profileError) {
        this.logger.error('Error fetching users:', profileError);
        throw new Error(`Failed to fetch users: ${profileError.message}`);
      }

      // Fetch user emails from auth.users using admin API and filter for student role only
      const usersWithEmails = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          try {
            const { data: { user }, error: userError } = await db.auth.admin.getUserById(profile.user_id);
            
            if (userError || !user) {
              this.logger.warn(`Could not fetch user ${profile.user_id}:`, userError);
              return null; // Skip users that can't be fetched
            }

            // Filter: Only include users with role 'student' or no role (default to student)
            const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role || 'student';
            if (role === 'admin') {
              return null; // Skip admin users
            }

            // Check if user is banned - check both banned_at and app_metadata.status
            const isBanned = (user as any).banned_at !== null && (user as any).banned_at !== undefined;
            const statusFromMetadata = (user.app_metadata as any)?.status;
            // Use app_metadata.status as fallback if banned_at is not set
            const isInactive = isBanned || statusFromMetadata === 'inactive';

            // Try to get full name from multiple sources
            let fullName = 'Unknown';
            if (user.user_metadata) {
              fullName = (user.user_metadata.full_name as string) || 
                        (user.user_metadata.name as string) || 
                        (user.user_metadata.fullName as string) ||
                        'Unknown';
            }
            // If still unknown, try to get from email or use email as fallback
            if (fullName === 'Unknown' && user.email) {
              // Extract name from email if possible (e.g., "john.doe@example.com" -> "John Doe")
              const emailParts = user.email.split('@')[0];
              if (emailParts.includes('.')) {
                fullName = emailParts.split('.').map(part => 
                  part.charAt(0).toUpperCase() + part.slice(1)
                ).join(' ');
              } else {
                fullName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
              }
            }

            // Generate signed URL for avatar if it exists (for private bucket)
            let avatarUrl: string | null = null;
            if (profile.avatar_url) {
              // Check if avatar_url is already a full URL (legacy data) or a path
              if (profile.avatar_url.startsWith('http://') || profile.avatar_url.startsWith('https://')) {
                // Already a full URL, use as-is
                avatarUrl = profile.avatar_url;
              } else {
                // It's a path, generate signed URL (expires in 1 hour)
                try {
                  const { data: signedUrlData, error: signedUrlError } = await db.storage
                    .from('profile-avatars')
                    .createSignedUrl(profile.avatar_url, 3600);
                  
                  if (!signedUrlError && signedUrlData) {
                    avatarUrl = signedUrlData.signedUrl;
                  } else {
                    this.logger.warn(`Failed to generate signed URL for avatar ${profile.avatar_url}:`, signedUrlError);
                    // If signed URL generation fails, return null (will show initials)
                  }
                } catch (error) {
                  this.logger.error(`Exception generating signed URL for avatar ${profile.avatar_url}:`, error);
                  // Return null on error (will show initials)
                }
              }
            }

            return {
              id: user.id,
              email: user.email || 'N/A',
              fullName: fullName,
              phoneNumber: profile.phone_number || null,
              avatarUrl: avatarUrl,
              joined: profile.created_at || user.created_at,
              status: isInactive ? 'Inactive' : 'Active',
            };
          } catch (error) {
            this.logger.error(`Error fetching user ${profile.user_id}:`, error);
            return null; // Skip users with errors
          }
        })
      );

      // Filter out null values (admin users or errors)
      const filteredUsers = usersWithEmails.filter((user): user is NonNullable<typeof user> => user !== null);

      return {
        users: filteredUsers,
        total: filteredUsers.length, // Use filtered count
      };
    } catch (error) {
      this.logger.error('Exception in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string, targetUserId: string) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      // Get user profile
      const { data: profile, error: profileError } = await db
        .from('student_profile')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (profileError) {
        this.logger.error('Error fetching user profile:', profileError);
      }

      // Get user from auth
      const { data: { user }, error: userError } = await db.auth.admin.getUserById(targetUserId);

      if (userError || !user) {
        throw new Error(`Failed to fetch user: ${userError?.message || 'User not found'}`);
      }

      // Check if user is banned - check both banned_at and app_metadata.status
      const isBanned = (user as any).banned_at !== null && (user as any).banned_at !== undefined;
      const statusFromMetadata = (user.app_metadata as any)?.status;
      // Use app_metadata.status as fallback if banned_at is not set
      const isInactive = isBanned || statusFromMetadata === 'inactive';

      // Try to get full name from multiple sources
      let fullName = 'Unknown';
      if (user.user_metadata) {
        fullName = (user.user_metadata.full_name as string) || 
                  (user.user_metadata.name as string) || 
                  (user.user_metadata.fullName as string) ||
                  'Unknown';
      }
      // If still unknown, try to get from email or use email as fallback
      if (fullName === 'Unknown' && user.email) {
        // Extract name from email if possible
        const emailParts = user.email.split('@')[0];
        if (emailParts.includes('.')) {
          fullName = emailParts.split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
        } else {
          fullName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
        }
      }

      // Generate signed URL for avatar if it exists (for private bucket)
      let avatarUrl: string | null = null;
      if (profile?.avatar_url) {
        // Check if avatar_url is already a full URL (legacy data) or a path
        if (profile.avatar_url.startsWith('http://') || profile.avatar_url.startsWith('https://')) {
          // Already a full URL, use as-is
          avatarUrl = profile.avatar_url;
        } else {
          // It's a path, generate signed URL (expires in 1 hour)
          try {
            const { data: signedUrlData, error: signedUrlError } = await db.storage
              .from('profile-avatars')
              .createSignedUrl(profile.avatar_url, 3600);
            
            if (!signedUrlError && signedUrlData) {
              avatarUrl = signedUrlData.signedUrl;
            } else {
              this.logger.warn(`Failed to generate signed URL for avatar ${profile.avatar_url}:`, signedUrlError);
              // If signed URL generation fails, return null (will show initials)
            }
          } catch (error) {
            this.logger.error(`Exception generating signed URL for avatar ${profile.avatar_url}:`, error);
            // Return null on error (will show initials)
          }
        }
      }

      return {
        id: user.id,
        email: user.email || 'N/A',
        fullName: fullName,
        phoneNumber: profile?.phone_number || null,
        countryCode: profile?.country_code || null,
        avatarUrl: avatarUrl,
        studyLevel: profile?.study_level || null,
        joined: profile?.created_at || user.created_at,
        status: isInactive ? 'Inactive' : 'Active',
        profile: profile || null,
      };
    } catch (error) {
      this.logger.error('Exception in getUserById:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, targetUserId: string, updateData: any) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      // Get existing user metadata first to preserve it
      const { data: { user: existingUser } } = await db.auth.admin.getUserById(targetUserId);
      const existingMetadata = existingUser?.user_metadata || {};
      
      // Update auth user if email or metadata changed
      const authUpdates: any = {};
      if (updateData.email) {
        authUpdates.email = updateData.email;
      }
      if (updateData.fullName) {
        // Preserve existing metadata and update full_name
        authUpdates.user_metadata = {
          ...existingMetadata,
          full_name: updateData.fullName,
        };
      }
      
      // Handle status change (ban/unban) - this must be done separately
      if (updateData.isActive !== undefined) {
        // Normalize isActive to boolean
        const isActive = updateData.isActive === true || updateData.isActive === 'true' || updateData.isActive === 'active';
        
        this.logger.log(`Updating user ${targetUserId} status to: ${isActive ? 'Active' : 'Inactive'}`);
        
        // Prepare status update with both ban_duration and app_metadata.status
        const statusUpdate: any = {
          app_metadata: {
            ...existingUser?.app_metadata,
            status: isActive ? 'active' : 'inactive',
          },
        };
        
        if (!isActive) {
          // Ban user - set ban_duration to a very long time
          statusUpdate.ban_duration = '876000h'; // ~100 years (effectively permanent)
          this.logger.log(`Banning user ${targetUserId}`);
        } else {
          // Unban user - set ban_duration to 'none'
          statusUpdate.ban_duration = 'none';
          this.logger.log(`Unbanning user ${targetUserId}`);
        }
        
        // Apply status update
        const { data: { user: updatedUser }, error: statusError } = await db.auth.admin.updateUserById(targetUserId, statusUpdate);
        if (statusError) {
          this.logger.error('Error updating user status:', statusError);
          throw new Error(`Failed to update user status: ${statusError.message}`);
        }
        
        // Verify the ban status was applied correctly
        if (updatedUser) {
          const verifyBanned = (updatedUser as any).banned_at !== null && (updatedUser as any).banned_at !== undefined;
          const verifyStatus = (updatedUser.app_metadata as any)?.status;
          this.logger.log(`User ${targetUserId} ban status verified: ${verifyBanned ? 'Banned' : 'Not Banned'}, app_metadata.status: ${verifyStatus}`);
          
          // If we tried to ban but user is not banned, or vice versa, log warning
          if (!isActive && !verifyBanned) {
            this.logger.warn(`Warning: Attempted to ban user ${targetUserId} but user is not banned after update`);
          } else if (isActive && verifyBanned) {
            this.logger.warn(`Warning: Attempted to unban user ${targetUserId} but user is still banned after update`);
          }
        }
        
        this.logger.log(`Successfully updated user ${targetUserId} status`);
      }

      // Only update email and metadata if provided (status is handled separately above)
      if (updateData.email || updateData.fullName) {
        const { error: authError } = await db.auth.admin.updateUserById(targetUserId, authUpdates);
        if (authError) {
          this.logger.error('Error updating auth user:', authError);
          throw new Error(`Failed to update user: ${authError.message}`);
        }
      }

      // Update student profile if phone number changed
      if (updateData.phoneNumber !== undefined) {
        const { error: profileError } = await db
          .from('student_profile')
          .update({ phone_number: updateData.phoneNumber || null })
          .eq('user_id', targetUserId);

        if (profileError) {
          this.logger.error('Error updating profile:', profileError);
          // Don't throw - auth update succeeded
        }
      }

      // Fetch updated user
      return await this.getUserById(userId, targetUserId);
    } catch (error) {
      this.logger.error('Exception in updateUser:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, targetUserId: string) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    // Prevent self-deletion
    if (userId === targetUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    try {
      const db = this.supabaseService.getClient();

      // Delete from auth (this will cascade to related tables if RLS is set up)
      const { error: authError } = await db.auth.admin.deleteUser(targetUserId);

      if (authError) {
        this.logger.error('Error deleting user:', authError);
        throw new Error(`Failed to delete user: ${authError.message}`);
      }

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error('Exception in deleteUser:', error);
      throw error;
    }
  }
}

