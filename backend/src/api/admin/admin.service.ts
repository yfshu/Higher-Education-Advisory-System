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
}

