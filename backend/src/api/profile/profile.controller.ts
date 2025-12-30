import {
  Controller,
  Get,
  Put,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UpdateProfileRequestDto } from './dto/requests/update-profile-request.dto';
import { UpdateProfileResponseDto } from './dto/responses/update-profile-response.dto';
import { UploadAvatarResponseDto } from './dto/responses/upload-avatar-response.dto';

import { ProfileResponseDto } from './dto/responses/profile-response.dto';

@ApiTags('Profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Profile retrieved successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBearerAuth('supabase-auth')
  async getMe(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    return this.profileService.getMe(token);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Avatar uploaded successfully.',
    type: UploadAvatarResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBearerAuth('supabase-auth')
  uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadAvatarResponseDto> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    return this.profileService.uploadAvatar(token, file);
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update profile (academic, interests, skills only)' })
  @ApiOkResponse({
    description: 'Profile updated successfully.',
    type: UpdateProfileResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBearerAuth('supabase-auth')
  updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<UpdateProfileResponseDto> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    return this.profileService.updateProfile(token, dto);
  }
}
