import { Controller, Get, Param, Query, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ScholarshipsService } from './scholarships.service';

@ApiTags('Scholarships')
@Controller('api/scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active scholarships' })
  @ApiResponse({ status: 200, description: 'List of scholarships retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'studyLevel', required: false, description: 'Filter by study level: foundation, diploma, degree' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by scholarship type' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location: local, overseas, both' })
  @ApiQuery({ name: 'fieldId', required: false, description: 'Filter by field ID' })
  async getScholarships(
    @Query('studyLevel') studyLevel?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('fieldId') fieldId?: string,
  ) {
    try {
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
}

