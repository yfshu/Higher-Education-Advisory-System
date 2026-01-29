import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private async isAdmin(userId: string): Promise<boolean> {
    try {
      const db = this.supabaseService.getClient();

      const {
        data: { user },
        error,
      } = await db.auth.admin.getUserById(userId);

      if (error || !user) {
        this.logger.error('Error fetching user for admin check:', error);
        return false;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const role =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (user.app_metadata as any)?.role ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (user.user_metadata as any)?.role ||
        'student';

      this.logger.log(`Admin check for user ${userId}: role=${role}`);
      return role === 'admin';
    } catch (error) {
      this.logger.error('Exception in isAdmin:', error);
      return false;
    }
  }

  async getDashboardMetrics(userId: string) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { count: studentCount, error: studentError } = await db
        .from('student_profile')
        .select('*', { count: 'exact', head: true });

      if (studentError) {
        this.logger.error('Error fetching student count:', studentError);
      }

      const { count: programCount, error: programError } = await db
        .from('programs')
        .select('*', { count: 'exact', head: true });

      if (programError) {
        this.logger.error('Error fetching program count:', programError);
      }

      const { count: scholarshipCount, error: scholarshipError } = await db
        .from('scholarships')
        .select('*', { count: 'exact', head: true });

      if (scholarshipError) {
        this.logger.error(
          'Error fetching scholarship count:',
          scholarshipError,
        );
      }

      const { count: alertCount, error: alertError } = await db
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (alertError) {
        this.logger.error('Error fetching alert count:', alertError);
      }

      let recommendationCount = 0;
      try {
        // Count how many times program recommendations have been generated.
        // We store recommendations in `ai_recommendations` and each "run" creates many rows
        // (one per recommended program), so we count only the top-ranked row per session.
        const { count: recCount, error: recError } = await db
          .from('ai_recommendations')
          .select('*', { count: 'exact', head: true })
          .eq('recommendation_type', 'program')
          .eq('final_rank', 1);

        if (recError) {
          this.logger.error(
            'Error fetching recommendations count from ai_recommendations:',
            recError,
          );
        }

        recommendationCount = recCount || 0;
      } catch {
        // Backward compatibility: if `ai_recommendations` is missing, fall back to legacy table.
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const { count: recCount } = await (db as any)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .from('recommendation_logs')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .select('*', { count: 'exact', head: true });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          recommendationCount = recCount || 0;
        } catch {
          recommendationCount = 0;
        }
      }

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

  async getSystemAlerts(userId: string, limit: number = 10) {
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

  async resolveAlert(userId: string, alertId: number) {
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

  async getRecentUsers(userId: string, limit: number = 5) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data: profiles, error } = await db
        .from('student_profile')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Error fetching recent users:', error);
        throw new Error(`Failed to fetch recent users: ${error.message}`);
      }

      const usersWithEmails = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        (profiles || []).map(async (profile: any) => {
          try {
            const {
              data: { user },
              error: userError,
            } = await db.auth.admin.getUserById(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
              profile.user_id as string,
            );

            if (userError || !user) {
              this.logger.warn(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                `Could not fetch user ${profile.user_id}:`,
                userError,
              );
              return null;
            }

            let fullName = 'Unknown';
            if (user.user_metadata) {
              fullName =
                (user.user_metadata.full_name as string) ||
                (user.user_metadata.name as string) ||
                (user.user_metadata.fullName as string) ||
                'Unknown';
            }

            if (fullName === 'Unknown' && user.email) {
              const emailParts = user.email.split('@')[0];
              if (emailParts.includes('.')) {
                fullName = emailParts
                  .split('.')
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ');
              } else {
                fullName =
                  emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
              }
            }

            return {
              id: user.id,
              email: user.email || 'N/A',
              fullName: fullName,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              joined: profile.created_at || user.created_at,
              status: 'Active',
            };
          } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.logger.error(`Error fetching user ${profile.user_id}:`, error);
            return null;
          }
        }),
      );

      const filteredUsers = usersWithEmails.filter(
        (user): user is NonNullable<typeof user> => user !== null,
      );

      return filteredUsers;
    } catch (error) {
      this.logger.error('Exception in getRecentUsers:', error);
      throw error;
    }
  }

  async getRecentPrograms(userId: string, limit: number = 5) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data, error } = await db
        .from('programs')
        .select(
          `
          id,
          name,
          created_at,
          university:university_id (
            name
          )
        `,
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Error fetching recent programs:', error);
        throw new Error(`Failed to fetch recent programs: ${error.message}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return (data || []).map((program: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: program.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        title: program.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        university: program.university?.name || 'Unknown University',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        added: program.created_at,
      }));
    } catch (error) {
      this.logger.error('Exception in getRecentPrograms:', error);
      throw error;
    }
  }

  async getAllUsers(userId: string, limit: number = 50, offset: number = 0) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data: profiles, error: profileError } = await db
        .from('student_profile')
        .select('user_id, phone_number, country_code, avatar_url, created_at', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (profileError) {
        this.logger.error('Error fetching users:', profileError);
        throw new Error(`Failed to fetch users: ${profileError.message}`);
      }

      const usersWithEmails = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          try {
            const {
              data: { user },
              error: userError,
            } = await db.auth.admin.getUserById(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
              profile.user_id as string,
            );

            if (userError || !user) {
              this.logger.warn(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                `Could not fetch user ${userId}:`,
                userError,
              );
              return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const role =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (user.app_metadata as any)?.role ||
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (user.user_metadata as any)?.role ||
              'student';
            if (role === 'admin') {
              return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const isBanned =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (user as any).banned_at !== null &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (user as any).banned_at !== undefined;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const statusFromMetadata = (user.app_metadata as any)?.status;

            const isInactive = isBanned || statusFromMetadata === 'inactive';

            let fullName = 'Unknown';
            if (user.user_metadata) {
              fullName =
                (user.user_metadata.full_name as string) ||
                (user.user_metadata.name as string) ||
                (user.user_metadata.fullName as string) ||
                'Unknown';
            }

            if (fullName === 'Unknown' && user.email) {
              const emailParts = user.email.split('@')[0];
              if (emailParts.includes('.')) {
                fullName = emailParts
                  .split('.')
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ');
              } else {
                fullName =
                  emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
              }
            }

            let avatarUrl: string | null = null;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (profile.avatar_url) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                profile.avatar_url.startsWith('http://') ||
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                profile.avatar_url.startsWith('https://')
              ) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                avatarUrl = profile.avatar_url;
              } else {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                  const { data: signedUrlData, error: signedUrlError } =
                    await db.storage
                      .from('profile-avatars')
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                      .createSignedUrl(profile.avatar_url as string, 3600);

                  if (!signedUrlError && signedUrlData) {
                    avatarUrl = signedUrlData.signedUrl;
                  } else {
                    this.logger.warn(
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      `Failed to generate signed URL for avatar ${profile.avatar_url}:`,
                      signedUrlError,
                    );
                  }
                } catch (error) {
                  this.logger.error(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `Exception generating signed URL for avatar ${profile.avatar_url}:`,
                    error,
                  );
                }
              }
            }

            return {
              id: user.id,
              email: user.email || 'N/A',
              fullName: fullName,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              phoneNumber: profile.phone_number || null,
              avatarUrl: avatarUrl,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              joined: profile.created_at || user.created_at,
              status: isInactive ? 'Inactive' : 'Active',
            };
          } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.logger.error(`Error fetching user ${profile.user_id}:`, error);
            return null;
          }
        }),
      );

      const filteredUsers = usersWithEmails.filter(
        (user): user is NonNullable<typeof user> => user !== null,
      );

      return {
        users: filteredUsers,
        total: filteredUsers.length,
      };
    } catch (error) {
      this.logger.error('Exception in getAllUsers:', error);
      throw error;
    }
  }

  async getUserById(userId: string, targetUserId: string) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const { data: profile, error: profileError } = await db
        .from('student_profile')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (profileError) {
        this.logger.error('Error fetching user profile:', profileError);
      }

      const {
        data: { user },
        error: userError,
      } = await db.auth.admin.getUserById(targetUserId);

      if (userError || !user) {
        throw new Error(
          `Failed to fetch user: ${userError?.message || 'User not found'}`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const isBanned =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (user as any).banned_at !== null &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (user as any).banned_at !== undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const statusFromMetadata = (user.app_metadata as any)?.status;

      const isInactive = isBanned || statusFromMetadata === 'inactive';

      let fullName = 'Unknown';
      if (user.user_metadata) {
        fullName =
          (user.user_metadata.full_name as string) ||
          (user.user_metadata.name as string) ||
          (user.user_metadata.fullName as string) ||
          'Unknown';
      }

      if (fullName === 'Unknown' && user.email) {
        const emailParts = user.email.split('@')[0];
        if (emailParts.includes('.')) {
          fullName = emailParts
            .split('.')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        } else {
          fullName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
        }
      }

      let avatarUrl: string | null = null;
      if (profile?.avatar_url) {
        if (
          profile.avatar_url.startsWith('http://') ||
          profile.avatar_url.startsWith('https://')
        ) {
          avatarUrl = profile.avatar_url;
        } else {
          try {
            const { data: signedUrlData, error: signedUrlError } =
              await db.storage
                .from('profile-avatars')
                .createSignedUrl(profile.avatar_url, 3600);

            if (!signedUrlError && signedUrlData) {
              avatarUrl = signedUrlData.signedUrl;
            } else {
              this.logger.warn(
                `Failed to generate signed URL for avatar ${profile.avatar_url}:`,
                signedUrlError,
              );
            }
          } catch (error) {
            this.logger.error(
              `Exception generating signed URL for avatar ${profile.avatar_url}:`,
              error,
            );
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

  async updateUser(userId: string, targetUserId: string, updateData: any) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const db = this.supabaseService.getClient();

      const {
        data: { user: existingUser },
      } = await db.auth.admin.getUserById(targetUserId);
      const existingMetadata = existingUser?.user_metadata || {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authUpdates: any = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (updateData.email) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        authUpdates.email = updateData.email;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (updateData.fullName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        authUpdates.user_metadata = {
          ...existingMetadata,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          full_name: updateData.fullName,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (updateData.isActive !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const isActive =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          updateData.isActive === true ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          updateData.isActive === 'true' ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          updateData.isActive === 'active';

        this.logger.log(
          `Updating user ${targetUserId} status to: ${isActive ? 'Active' : 'Inactive'}`,
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusUpdate: any = {
          app_metadata: {
            ...existingUser?.app_metadata,
            status: isActive ? 'active' : 'inactive',
          },
        };

        if (!isActive) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          statusUpdate.ban_duration = '876000h';
          this.logger.log(`Banning user ${targetUserId}`);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          statusUpdate.ban_duration = 'none';
          this.logger.log(`Unbanning user ${targetUserId}`);
        }

        const {
          data: { user: updatedUser },
          error: statusError,
        } = await db.auth.admin.updateUserById(targetUserId, statusUpdate);
        if (statusError) {
          this.logger.error('Error updating user status:', statusError);
          throw new Error(
            `Failed to update user status: ${statusError.message}`,
          );
        }

        if (updatedUser) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const verifyBanned =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (updatedUser as any).banned_at !== null &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (updatedUser as any).banned_at !== undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const verifyStatus = (updatedUser.app_metadata as any)?.status;
          this.logger.log(
            `User ${targetUserId} ban status verified: ${verifyBanned ? 'Banned' : 'Not Banned'}, app_metadata.status: ${verifyStatus}`,
          );

          if (!isActive && !verifyBanned) {
            this.logger.warn(
              `Warning: Attempted to ban user ${targetUserId} but user is not banned after update`,
            );
          } else if (isActive && verifyBanned) {
            this.logger.warn(
              `Warning: Attempted to unban user ${targetUserId} but user is still banned after update`,
            );
          }
        }

        this.logger.log(`Successfully updated user ${targetUserId} status`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (updateData.email || updateData.fullName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const { error: authError } = await db.auth.admin.updateUserById(
          targetUserId,
          authUpdates,
        );
        if (authError) {
          this.logger.error('Error updating auth user:', authError);
          throw new Error(`Failed to update user: ${authError.message}`);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (updateData.phoneNumber !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const { error: profileError } = await db
          .from('student_profile')
          .update({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            phone_number:
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (updateData.phoneNumber as string | null) || null,
          })
          .eq('user_id', targetUserId);

        if (profileError) {
          this.logger.error('Error updating profile:', profileError);
        }
      }

      return await this.getUserById(userId, targetUserId);
    } catch (error) {
      this.logger.error('Exception in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(userId: string, targetUserId: string) {
    const isUserAdmin = await this.isAdmin(userId);
    if (!isUserAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    if (userId === targetUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    try {
      const db = this.supabaseService.getClient();

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
