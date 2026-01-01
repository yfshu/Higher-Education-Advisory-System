import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Param, 
  Query, 
  Body,
  HttpException, 
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramRequestDto } from './dto/requests/create-program-request.dto';
import { UpdateProgramRequestDto } from './dto/requests/update-program-request.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { Request } from 'express';
import { AuthenticatedRequest } from '../../supabase/types/express.d';

@ApiTags('Programs')
@Controller('api/programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all programs' })
  @ApiQuery({ name: 'all', required: false, type: Boolean, description: 'Include all statuses (for admin)' })
  @ApiResponse({ status: 200, description: 'List of programs retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPrograms(@Query('all') all?: string) {
    try {
      // If 'all' query param is 'true', fetch all programs regardless of status (for admin)
      const includeAllStatuses = all === 'true';
      const programs = await this.programsService.getPrograms(includeAllStatuses);
      return {
        success: true,
        data: programs,
        count: programs.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch programs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProgramById(@Param('id') id: string) {
    try {
      const programId = parseInt(id, 10);
      if (isNaN(programId)) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid program ID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const program = await this.programsService.getProgramById(programId);
      
      if (!program) {
        throw new HttpException(
          {
            success: false,
            message: 'Program not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: program,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch program',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('level/:level')
  @ApiOperation({ summary: 'Get programs by level' })
  @ApiParam({ 
    name: 'level', 
    enum: ['foundation', 'diploma', 'degree'],
    description: 'Program level' 
  })
  @ApiResponse({ status: 200, description: 'List of programs retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid level' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProgramsByLevel(@Param('level') level: string) {
    try {
      const validLevels = ['foundation', 'diploma', 'degree'];
      if (!validLevels.includes(level)) {
        throw new HttpException(
          {
            success: false,
            message: `Invalid level. Must be one of: ${validLevels.join(', ')}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const programs = await this.programsService.getProgramsByLevel(
        level as 'foundation' | 'diploma' | 'degree',
      );

      return {
        success: true,
        data: programs,
        count: programs.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch programs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('university/:universityId')
  @ApiOperation({ summary: 'Get programs by university ID' })
  @ApiParam({ name: 'universityId', type: 'number', description: 'University ID' })
  @ApiResponse({ status: 200, description: 'List of programs retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid university ID' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProgramsByUniversity(@Param('universityId') universityId: string) {
    try {
      const id = parseInt(universityId, 10);
      if (isNaN(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid university ID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const programs = await this.programsService.getProgramsByUniversity(id);

      return {
        success: true,
        data: programs,
        count: programs.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch programs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Create a new program (admin only)' })
  @ApiResponse({ status: 201, description: 'Program created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProgram(
    @Req() req: Request,
    @Body() createProgramDto: CreateProgramRequestDto,
  ) {
    try {
      // Verify admin access
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const program = await this.programsService.createProgram(createProgramDto);
      return {
        success: true,
        data: program,
        message: 'Program created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create program',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Update an existing program (admin only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProgram(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramRequestDto,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const programId = parseInt(id, 10);
      if (isNaN(programId)) {
        throw new HttpException(
          { success: false, message: 'Invalid program ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const program = await this.programsService.updateProgram(programId, updateProgramDto);
      return {
        success: true,
        data: program,
        message: 'Program updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'Program not found') {
        throw new HttpException(
          { success: false, message: 'Program not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update program',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Delete a program (admin only - permanent delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteProgram(
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

      const programId = parseInt(id, 10);
      if (isNaN(programId)) {
        throw new HttpException(
          { success: false, message: 'Invalid program ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.programsService.deleteProgram(programId);
      return {
        success: true,
        message: 'Program deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'Program not found') {
        throw new HttpException(
          { success: false, message: 'Program not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete program',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

