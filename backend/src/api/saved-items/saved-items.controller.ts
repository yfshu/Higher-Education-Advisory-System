import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SavedItemsService } from './saved-items.service';
import { Database } from '../../supabase/types/supabase.types';
import { SupabaseService } from '../../supabase/supabase.service';
import { Request } from 'express';

type ItemType = Database['public']['Enums']['item_type'];

@ApiTags('Saved Items')
@Controller('api/saved-items')
export class SavedItemsController {
  constructor(
    private readonly savedItemsService: SavedItemsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private async getUserIdAndToken(req: Request): Promise<{ userId: string; token: string }> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;

    if (!token) {
      throw new HttpException('Missing access token', HttpStatus.UNAUTHORIZED);
    }

    const supabase = this.supabaseService.createClientWithToken(token);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    
    if (authError || !auth.user) {
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    return { userId: auth.user.id, token };
  }

  @Post()
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Save an item (program or scholarship)' })
  @ApiResponse({ status: 201, description: 'Item saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveItem(@Req() req: Request, @Body() body: { itemType: ItemType; itemId: number }) {
    try {
      const { userId, token } = await this.getUserIdAndToken(req);

      if (!body.itemType || !body.itemId) {
        throw new HttpException('itemType and itemId are required', HttpStatus.BAD_REQUEST);
      }

      const savedItem = await this.savedItemsService.saveItem(userId, body.itemType, body.itemId, token);
      return {
        success: true,
        data: savedItem,
        message: 'Item saved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to save item',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':itemType/:itemId')
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Unsave an item (program or scholarship)' })
  @ApiParam({ name: 'itemType', enum: ['program', 'scholarship'] })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiResponse({ status: 200, description: 'Item unsaved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unsaveItem(@Req() req: Request, @Param('itemType') itemType: ItemType, @Param('itemId') itemId: string) {
    try {
      const { userId, token } = await this.getUserIdAndToken(req);

      const itemIdNum = parseInt(itemId, 10);
      if (isNaN(itemIdNum)) {
        throw new HttpException('Invalid itemId', HttpStatus.BAD_REQUEST);
      }

      await this.savedItemsService.unsaveItem(userId, itemType, itemIdNum, token);
      return {
        success: true,
        message: 'Item unsaved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to unsave item',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check/:itemType/:itemId')
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Check if an item is saved' })
  @ApiParam({ name: 'itemType', enum: ['program', 'scholarship'] })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiResponse({ status: 200, description: 'Saved state retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkSaved(@Req() req: Request, @Param('itemType') itemType: ItemType, @Param('itemId') itemId: string) {
    try {
      const { userId, token } = await this.getUserIdAndToken(req);

      const itemIdNum = parseInt(itemId, 10);
      if (isNaN(itemIdNum)) {
        throw new HttpException('Invalid itemId', HttpStatus.BAD_REQUEST);
      }

      const isSaved = await this.savedItemsService.isItemSaved(userId, itemType, itemIdNum, token);
      return {
        success: true,
        data: { isSaved },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to check saved state',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Get all saved items for the current user' })
  @ApiQuery({ name: 'itemType', required: false, enum: ['program', 'scholarship'] })
  @ApiResponse({ status: 200, description: 'Saved items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSavedItems(@Req() req: Request, @Query('itemType') itemType?: ItemType) {
    try {
      const { userId, token } = await this.getUserIdAndToken(req);

      const savedItems = await this.savedItemsService.getSavedItems(userId, token, itemType);
      return {
        success: true,
        data: savedItems,
        count: savedItems.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch saved items',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('programs')
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Get saved programs with full program data' })
  @ApiResponse({ status: 200, description: 'Saved programs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSavedPrograms(@Req() req: Request) {
    try {
      const { userId, token } = await this.getUserIdAndToken(req);

      const programs = await this.savedItemsService.getSavedPrograms(userId, token);
      return {
        success: true,
        data: programs,
        count: programs.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch saved programs',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('scholarships')
  @ApiBearerAuth('supabase-auth')
  @ApiOperation({ summary: 'Get saved scholarships with full scholarship data' })
  @ApiResponse({ status: 200, description: 'Saved scholarships retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSavedScholarships(@Req() req: Request) {
    try {
      const { userId, token } = await this.getUserIdAndToken(req);

      const scholarships = await this.savedItemsService.getSavedScholarships(userId, token);
      return {
        success: true,
        data: scholarships,
        count: scholarships.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch saved scholarships',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

