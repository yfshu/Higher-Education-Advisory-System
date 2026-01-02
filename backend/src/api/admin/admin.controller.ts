import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAllUsers(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const userId = this.extractUserId(req);
      const userLimit = limit ? parseInt(limit, 10) : 50;
      const userOffset = offset ? parseInt(offset, 10) : 0;
      const result = await this.adminService.getAllUsers(userId, userLimit, userOffset);
      return {
        success: true,
        data: result.users,
        total: result.total,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch users',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getUserById(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = this.extractUserId(req);
      const user = await this.adminService.getUserById(userId, id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch user',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    try {
      const userId = this.extractUserId(req);
      const user = await this.adminService.updateUser(userId, id, updateDto);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update user',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async deleteUser(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = this.extractUserId(req);
      const result = await this.adminService.deleteUser(userId, id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete user',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

