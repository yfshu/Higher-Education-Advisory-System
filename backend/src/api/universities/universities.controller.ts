import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Param, 
  Body,
  HttpException, 
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UniversitiesService } from './universities.service';
import { CreateUniversityRequestDto } from './dto/requests/create-university-request.dto';
import { UpdateUniversityRequestDto } from './dto/requests/update-university-request.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { Request } from 'express';
import { AuthenticatedRequest } from '../../supabase/types/express.d';

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

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Create a new university (admin only)' })
  @ApiResponse({ status: 201, description: 'University created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createUniversity(
    @Req() req: Request,
    @Body() createUniversityDto: CreateUniversityRequestDto,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const university = await this.universitiesService.createUniversity(createUniversityDto);
      return {
        success: true,
        data: university,
        message: 'University created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create university',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Update an existing university (admin only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'University ID' })
  @ApiResponse({ status: 200, description: 'University updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUniversity(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUniversityDto: UpdateUniversityRequestDto,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const universityId = parseInt(id, 10);
      if (isNaN(universityId)) {
        throw new HttpException(
          { success: false, message: 'Invalid university ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const university = await this.universitiesService.updateUniversity(universityId, updateUniversityDto);
      return {
        success: true,
        data: university,
        message: 'University updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'University not found') {
        throw new HttpException(
          { success: false, message: 'University not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update university',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Delete a university and all linked programs (admin only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'University ID' })
  @ApiResponse({ status: 200, description: 'University and linked programs deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUniversity(
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

      const universityId = parseInt(id, 10);
      if (isNaN(universityId)) {
        throw new HttpException(
          { success: false, message: 'Invalid university ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.universitiesService.deleteUniversity(universityId);
      return {
        success: true,
        message: 'University and all linked programs deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'University not found') {
        throw new HttpException(
          { success: false, message: 'University not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete university',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

