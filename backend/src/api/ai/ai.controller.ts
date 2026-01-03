import { Controller, Post, Get, UseGuards, Req, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AuthGuard } from '../../guards/auth.guard';
import { FinalRecommendationResponseDto } from './dto/final-recommendation-response.dto';
import { FieldRecommendationResponseDto } from './dto/field-recommendation-response.dto';
import { ProgramsByFieldRequestDto } from './dto/programs-by-field-request.dto';
import { Request } from 'express';

@ApiTags('AI Recommendations')
@Controller('api/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('recommend/fields')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get field-level recommendations (STEP 1)',
    description: 'Returns ranked field categories based on student profile. This is the first step - user must select a field before getting programs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Field recommendations generated successfully',
    type: FieldRecommendationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getFieldRecommendations(@Req() req: Request): Promise<FieldRecommendationResponseDto> {
    try {
      const userId = (req as any).user?.id;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!userId || !accessToken) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      return await this.aiService.getFieldRecommendations(userId, accessToken);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate field recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('recommend/programs-by-field')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get top 3 programs for selected field (STEP 2)',
    description: 'Returns top 3 most suitable programs for a selected field using OpenAI analysis. Field must be selected from field recommendations first.',
  })
  @ApiResponse({
    status: 200,
    description: 'Program recommendations generated successfully',
    type: FinalRecommendationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getProgramsByField(
    @Req() req: Request,
    @Body() body: ProgramsByFieldRequestDto,
  ): Promise<FinalRecommendationResponseDto> {
    try {
      const userId = (req as any).user?.id;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!userId || !accessToken) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      if (!body.field_name) {
        throw new HttpException('Field name is required', HttpStatus.BAD_REQUEST);
      }

      return await this.aiService.getProgramsByField(userId, accessToken, body.field_name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate program recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('recommendations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[DEPRECATED] Get AI-based program recommendations',
    description: 'Legacy endpoint - use /recommend/fields and /recommend/programs-by-field instead',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
    type: FinalRecommendationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getRecommendations(@Req() req: Request): Promise<FinalRecommendationResponseDto> {
    try {
      const userId = (req as any).user?.id;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!userId || !accessToken) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      return await this.aiService.getRecommendations(userId, accessToken);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recommendations/history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get AI recommendation history',
    description: 'Returns the history of AI-generated field and program recommendations for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendation history retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async getRecommendationHistory(
    @Req() req: Request,
    @Query('type') type?: 'field' | 'program',
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const limitNum = limit ? parseInt(limit, 10) : 50;
      const history = await this.aiService.getRecommendationHistory(userId, type, limitNum);

      return {
        success: true,
        data: history,
        count: history.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch recommendation history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

