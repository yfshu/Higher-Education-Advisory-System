import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';
import { LoginRequestDto } from './dto/requests/login-request.dto';
import { RegisterRequestDto } from './dto/requests/register-request.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { RegisterResponseDto } from './dto/responses/register-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user) {
      throw new UnauthorizedException(
        error?.message ?? 'Invalid email or password.',
      );
    }

    // Fetch role from users_details
    const { data: userDetails, error: roleError } = await supabase
      .from('users_details')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (roleError) {
      // Not fatal for login, but surface a useful message if needed
      // You may choose to log this in a real app
    }

    const role = userDetails?.role ?? 'student';

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        role,
      },
      message: 'Login successful.',
    };
  }

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirmation do not match.');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        role: 'student',
      },
    });

    if (error || !data.user) {
      throw new BadRequestException(error?.message ?? 'Registration failed.');
    }

    const userId = data.user.id;

    const userInsert: Database['public']['Tables']['users_details']['Insert'] =
      {
        id: userId,
        email: dto.email,
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone_number: dto.phoneNumber ?? null,
        nationality: dto.nationality ?? null,
        current_location: dto.currentLocation ?? null,
        avatar_url: dto.avatarUrl ?? null,
        career_goal: dto.careerGoal ?? null,
        ic_number: dto.identityType === 'ic' ? dto.identityNumber : null,
        passport_number:
          dto.identityType === 'passport' ? dto.identityNumber : null,
        dob: dto.dob ?? null,
        role: 'student',
      };

    const userDetailsResult = await supabase
      .from('users_details')
      .insert(userInsert);

    if (userDetailsResult.error) {
      throw new InternalServerErrorException(
        userDetailsResult.error.message ?? 'Failed to create user details.',
      );
    }

    const studentInsert: Database['public']['Tables']['students_details']['Insert'] =
      {
        id: userId,
        education_level: null,
        field_of_interest_id: null,
        academic_result: null,
        study_preferences: null,
      };

    const studentResult = await supabase
      .from('students_details')
      .insert(studentInsert);

    if (studentResult.error) {
      throw new InternalServerErrorException(
        studentResult.error.message ?? 'Failed to create student details.',
      );
    }

    return {
      userId,
      email: dto.email,
      message: 'Account created successfully.',
    };
  }

  async logout(accessToken?: string): Promise<LogoutResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }

    const supabase = this.supabaseService.createClientWithToken(accessToken);
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      throw new InternalServerErrorException(
        error.message ?? 'Failed to logout.',
      );
    }

    return { message: 'Logout successful.' };
  }
}
