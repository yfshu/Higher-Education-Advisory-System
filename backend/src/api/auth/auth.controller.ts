import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/requests/login-request.dto';
import { RegisterCompleteRequestDto as RegisterRequestDto } from './dto/requests/register-complete-request.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { RegisterResponseDto } from './dto/responses/register-response.dto';
import { Request } from 'express';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';
import { ForgotPasswordRequestDto } from './dto/requests/forgot-password-request.dto';
import { ForgotPasswordResponseDto } from './dto/responses/forgot-password-response.dto';
import { UpdatePasswordRequestDto } from './dto/requests/update-password-request.dto';
import { UpdatePasswordResponseDto } from './dto/responses/update-password-response.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Login successful.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new student account' })
  @ApiCreatedResponse({
    description: 'Registration completed successfully.',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid registration data.' })
  register(@Body() body: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authService.register(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session (global)' })
  @ApiOkResponse({
    description: 'Logout successful.',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBearerAuth('supabase-auth')
  logout(@Req() req: Request): Promise<LogoutResponseDto> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    return this.authService.logout(token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a password reset email' })
  @ApiOkResponse({
    description: 'Reset email sent.',
    type: ForgotPasswordResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid email.' })
  forgotPassword(
    @Body() body: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(body);
  }

  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password using current session' })
  @ApiOkResponse({
    description: 'Password updated.',
    type: UpdatePasswordResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBearerAuth('supabase-auth')
  updatePassword(
    @Req() req: Request,
    @Body() body: UpdatePasswordRequestDto,
  ): Promise<UpdatePasswordResponseDto> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    return this.authService.updatePassword(token, body);
  }

  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if email already exists' })
  @ApiOkResponse({
    description: 'Email check completed.',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid email.' })
  async checkEmail(@Query('email') email: string): Promise<{ exists: boolean; message: string }> {
    if (!email) {
      throw new BadRequestException('Email query parameter is required.');
    }
    return this.authService.checkEmailExists(email);
  }

  @Get('reverse-geocode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reverse geocode coordinates to location' })
  @ApiOkResponse({
    description: 'Location retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid coordinates.' })
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Promise<{ location: string; state?: string; country?: string }> {
    if (!lat || !lon) {
      throw new BadRequestException('Latitude and longitude are required.');
    }
    return this.authService.reverseGeocode(parseFloat(lat), parseFloat(lon));
  }
}
