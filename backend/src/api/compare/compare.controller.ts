import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompareService } from './compare.service';
import { CompareRequestDto } from './dto/compare-request.dto';
import { AuthGuard } from '../../guards/auth.guard';
import type { Request } from 'express';

@ApiTags('Compare')
@Controller('api/compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Post('ai-explain')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Generate AI explanation comparing two programs' })
  @ApiResponse({ status: 200, description: 'AI explanation generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateAIExplanation(
    @Req() req: Request,
    @Body() body: CompareRequestDto,
  ) {
    try {
      if (!body.programA || !body.programB) {
        throw new HttpException(
          'Both programA and programB are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const summary = await this.compareService.generateComparisonExplanation(
        body.programA,
        body.programB,
      );

      return {
        success: true,
        summary,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to generate AI explanation',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

