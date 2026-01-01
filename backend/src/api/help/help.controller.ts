import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HelpService } from './help.service';
import { Request } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthenticatedRequest } from '../../supabase/types/express.d';

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

  @Get('content')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Get all help support content (admin only)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category: FAQ, System Message, Policy' })
  @ApiResponse({ status: 200, description: 'List of help support items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllHelpSupport(
    @Req() req: Request,
    @Query('category') category?: string,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const items = await this.helpService.getAllHelpSupport(category);
      return {
        success: true,
        data: items,
        count: items.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch help support items',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('content')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Create a new help support item (admin only)' })
  @ApiResponse({ status: 201, description: 'Help support item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createHelpSupport(
    @Req() req: Request,
    @Body() body: any,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const item = await this.helpService.createHelpSupport(body);
      return {
        success: true,
        data: item,
        message: 'Help support item created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create help support item',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('content/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Update an existing help support item (admin only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Help support item ID' })
  @ApiResponse({ status: 200, description: 'Help support item updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Help support item not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateHelpSupport(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const item = await this.helpService.updateHelpSupport(id, body);
      return {
        success: true,
        data: item,
        message: 'Help support item updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'Help support item not found') {
        throw new HttpException(
          { success: false, message: 'Help support item not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update help support item',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('content/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Delete a help support item (admin only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Help support item ID' })
  @ApiResponse({ status: 200, description: 'Help support item deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Help support item not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteHelpSupport(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'User not authenticated' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.helpService.deleteHelpSupport(id);
      return {
        success: true,
        message: 'Help support item deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message === 'Help support item not found') {
        throw new HttpException(
          { success: false, message: 'Help support item not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete help support item',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

