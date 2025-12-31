import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Request } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthenticatedRequest } from '../../supabase/types/express.d';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(AuthGuard)
@ApiBearerAuth('supabase-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private extractUserId(req: Request): string {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return userId;
  }

  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Get dashboard metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getDashboardMetrics(@Req() req: Request) {
    try {
      const userId = this.extractUserId(req);
      const metrics = await this.adminService.getDashboardMetrics(userId);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch dashboard metrics',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get system alerts (admin only)' })
  @ApiResponse({ status: 200, description: 'System alerts retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getSystemAlerts(
    @Req() req: Request,
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = this.extractUserId(req);
      const alertLimit = limit ? parseInt(limit, 10) : 10;
      const alerts = await this.adminService.getSystemAlerts(userId, alertLimit);
      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch system alerts',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve a system alert (admin only)' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async resolveAlert(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = this.extractUserId(req);
      const alertId = parseInt(id, 10);
      const alert = await this.adminService.resolveAlert(userId, alertId);
      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to resolve alert',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users/recent')
  @ApiOperation({ summary: 'Get recent users (admin only)' })
  @ApiResponse({ status: 200, description: 'Recent users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getRecentUsers(
    @Req() req: Request,
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = this.extractUserId(req);
      const userLimit = limit ? parseInt(limit, 10) : 5;
      const users = await this.adminService.getRecentUsers(userId, userLimit);
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch recent users',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('programs/recent')
  @ApiOperation({ summary: 'Get recent programs (admin only)' })
  @ApiResponse({ status: 200, description: 'Recent programs retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getRecentPrograms(
    @Req() req: Request,
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = this.extractUserId(req);
      const programLimit = limit ? parseInt(limit, 10) : 5;
      const programs = await this.adminService.getRecentPrograms(userId, programLimit);
      return {
        success: true,
        data: programs,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch recent programs',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

