import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UniversitiesService } from './universities.service';

@ApiTags('Universities')
@Controller('api/universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all universities' })
  @ApiResponse({ status: 200, description: 'List of universities retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUniversities() {
    try {
      const universities = await this.universitiesService.getUniversities();
      return {
        success: true,
        data: universities,
        count: universities.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch universities',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get university by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'University ID' })
  @ApiResponse({ status: 200, description: 'University retrieved successfully' })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUniversityById(@Param('id') id: string) {
    try {
      const universityId = parseInt(id, 10);
      if (isNaN(universityId)) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid university ID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const university = await this.universitiesService.getUniversityById(universityId);
      
      if (!university) {
        throw new HttpException(
          {
            success: false,
            message: 'University not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: university,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch university',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

