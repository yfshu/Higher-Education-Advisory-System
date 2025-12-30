import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';

@ApiTags('Programs')
@Controller('api/programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active programs' })
  @ApiResponse({ status: 200, description: 'List of programs retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPrograms() {
    try {
      const programs = await this.programsService.getPrograms();
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
}

