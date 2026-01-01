import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('Fields')
@Controller('api/fields')
export class FieldsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all fields of interest' })
  @ApiResponse({ status: 200, description: 'List of fields retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFields() {
    try {
      const db = this.supabaseService.getClient();
      
      const { data, error } = await db
        .from('field_of_interest')
        .select('id, name, description')
        .order('name', { ascending: true });

      if (error) {
        throw new HttpException(
          {
            success: false,
            message: `Failed to fetch fields: ${error.message}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        data: data || [],
        count: data?.length || 0,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch fields',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

