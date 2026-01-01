import { Controller, Get, Post, Put, Delete, Param, Query, Body, Req, HttpException, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ScholarshipsService } from './scholarships.service';
import { CreateScholarshipRequestDto } from './dto/requests/create-scholarship-request.dto';
import { UpdateScholarshipRequestDto } from './dto/requests/update-scholarship-request.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { Request } from 'express';
import { AuthenticatedRequest } from '../../supabase/types/express.d';

@ApiTags('Scholarships')
@Controller('api/scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all scholarships' })
  @ApiResponse({ status: 200, description: 'List of scholarships retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'studyLevel', required: false, description: 'Filter by study level: foundation, diploma, degree' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by scholarship type' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location: local, overseas, both' })
  @ApiQuery({ name: 'fieldId', required: false, description: 'Filter by field ID' })
  @ApiQuery({ name: 'all', required: false, type: Boolean, description: 'Include all statuses (for admin)' })
  async getScholarships(
    @Query('studyLevel') studyLevel?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('fieldId') fieldId?: string,
    @Query('all') all?: string,
  ) {
    try {
      const includeAllStatuses = all === 'true';
      
      if (includeAllStatuses) {
        // Admin: fetch all scholarships
        const scholarships = await this.scholarshipsService.getAllScholarships(true);
        return {
          success: true,
          data: scholarships,
          count: scholarships.length,
        };
      }

      // Public: apply filters and fetch only active
      const filters: any = {};
      
      if (studyLevel) {
        filters.studyLevel = studyLevel;
      }
      
      if (type) {
        filters.type = type;
      }
      
      if (location) {
        filters.location = location;
      }
      
      if (fieldId) {
        filters.fieldId = parseInt(fieldId, 10);
        if (isNaN(filters.fieldId)) {
          throw new HttpException(
            {
              success: false,
              message: 'Invalid fieldId parameter',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const scholarships = await this.scholarshipsService.getScholarships(filters);
      return {
        success: true,
        data: scholarships,
        count: scholarships.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch scholarships',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scholarship by ID' })
  @ApiResponse({ status: 200, description: 'Scholarship retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Scholarship not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'Scholarship ID' })
  async getScholarshipById(@Param('id', ParseIntPipe) id: number) {
    try {
      const scholarship = await this.scholarshipsService.getScholarshipById(id);
      
      if (!scholarship) {
        throw new HttpException(
          {
            success: false,
            message: 'Scholarship not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: scholarship,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch scholarship',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('level/:level')
  @ApiOperation({ summary: 'Get scholarships by study level' })
  @ApiResponse({ status: 200, description: 'List of scholarships retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'level', description: 'Study level: foundation, diploma, or degree' })
  async getScholarshipsByLevel(@Param('level') level: string) {
    try {
      const validLevels = ['foundation', 'diploma', 'degree'];
      if (!validLevels.includes(level.toLowerCase())) {
        throw new HttpException(
          {
            success: false,
            message: `Invalid level. Must be one of: ${validLevels.join(', ')}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const scholarships = await this.scholarshipsService.getScholarshipsByLevel(
        level.toLowerCase() as 'foundation' | 'diploma' | 'degree',
      );
      
      return {
        success: true,
        data: scholarships,
        count: scholarships.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch scholarships',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Create a new scholarship (admin only)' })
  @ApiResponse({ status: 201, description: 'Scholarship created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createScholarship(
    @Req() req: Request,
    @Body() createScholarshipDto: CreateScholarshipRequestDto,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const scholarship = await this.scholarshipsService.createScholarship(createScholarshipDto);
      return {
        success: true,
        data: scholarship,
        message: 'Scholarship created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create scholarship',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Update an existing scholarship (admin only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Scholarship ID' })
  @ApiResponse({ status: 200, description: 'Scholarship updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Scholarship not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateScholarship(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateScholarshipDto: UpdateScholarshipRequestDto,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const scholarshipId = parseInt(id, 10);
      if (isNaN(scholarshipId)) {
        throw new HttpException(
          { success: false, message: 'Invalid scholarship ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const scholarship = await this.scholarshipsService.updateScholarship(scholarshipId, updateScholarshipDto);
      return {
        success: true,
        data: scholarship,
        message: 'Scholarship updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'Scholarship not found') {
        throw new HttpException(
          { success: false, message: 'Scholarship not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update scholarship',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Delete a scholarship (admin only - permanent delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Scholarship ID' })
  @ApiResponse({ status: 200, description: 'Scholarship deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Scholarship not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteScholarship(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const scholarshipId = parseInt(id, 10);
      if (isNaN(scholarshipId)) {
        throw new HttpException(
          { success: false, message: 'Invalid scholarship ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.scholarshipsService.deleteScholarship(scholarshipId);
      return {
        success: true,
        message: 'Scholarship deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'Scholarship not found') {
        throw new HttpException(
          { success: false, message: 'Scholarship not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete scholarship',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

