import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/requests/login-request.dto';
import { RegisterRequestDto } from './dto/requests/register-request.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { RegisterResponseDto } from './dto/responses/register-response.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ description: 'Login successful.', type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Create a new student account' })
  @ApiCreatedResponse({
    description: 'Account created successfully.',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid registration payload.' })
  register(@Body() body: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authService.register(body);
  }
}
