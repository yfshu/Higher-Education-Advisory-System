import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/requests/login-request.dto';
import { RegisterRequestDto } from './dto/requests/register-request.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { RegisterResponseDto } from './dto/responses/register-response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authService.register(body);
  }
}
