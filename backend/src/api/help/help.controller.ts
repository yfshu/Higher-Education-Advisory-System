import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HelpService } from './help.service';
import { Request } from 'express';

interface ChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

@ApiTags('Help & Support')
@Controller('api/help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get('faq')
  @ApiOperation({ summary: 'Get FAQs from help_support table' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of FAQs to return (default: 8)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query to filter FAQs by title or content' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getFAQs(
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 8;
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        throw new HttpException('Invalid limit parameter (must be between 1 and 50)', HttpStatus.BAD_REQUEST);
      }

      const faqs = await this.helpService.getFAQs(limitNum, search);
      return {
        success: true,
        data: faqs,
        count: faqs.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch FAQs',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ai')
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  @ApiResponse({ status: 200, description: 'AI response generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (invalid message, rate limit, etc.)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async handleAIChat(@Req() req: Request, @Body() body: ChatRequest) {
    try {
      // Get user identifier (user ID if authenticated, or IP address)
      const authHeader = req.headers.authorization;
      let userIdentifier = req.ip || 'unknown';
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring('Bearer '.length);
        // Try to extract user ID from token (simplified - in production, verify token properly)
        // For now, use IP as identifier
        userIdentifier = req.ip || 'unknown';
      }

      if (!body.message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }

      if (!Array.isArray(body.history)) {
        throw new HttpException('History must be an array', HttpStatus.BAD_REQUEST);
      }

      // Validate history format
      const validHistory = body.history.filter((msg) => 
        msg.role === 'user' || msg.role === 'assistant'
      ).slice(-10); // Limit to last 10 messages

      const reply = await this.helpService.handleAIChat(
        body.message,
        validHistory,
        userIdentifier,
      );

      return {
        success: true,
        reply,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to process AI chat request',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

