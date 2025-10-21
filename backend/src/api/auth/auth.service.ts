import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { LoginRequestDto } from './dto/requests/login-request.dto';
import { RegisterRequestDto } from './dto/requests/register-request.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { RegisterResponseDto } from './dto/responses/register-response.dto';
import { Database } from 'src/supabase/types/supabase.types';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(
        error?.message ?? 'Invalid email or password.',
      );
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        role: (data.user.user_metadata?.role as string | undefined) ?? null,
      },
    };
  }

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirmation do not match.');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          first_name: dto.firstName,
          last_name: dto.lastName,
        },
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
      throw new InternalServerErrorException('Failed to persist user details.');
    }

    const educationLevels: Database['public']['Enums']['education_level'][] = [
      'SPM',
      'STPM',
      'A-Levels',
      'Foundation',
      'Diploma',
      'Bachelor',
      'Master',
      'Other',
    ];

    const educationLevel =
      dto.educationLevel &&
      educationLevels.includes(
        dto.educationLevel as Database['public']['Enums']['education_level'],
      )
        ? (dto.educationLevel as Database['public']['Enums']['education_level'])
        : null;

    const fieldId =
      typeof dto.fieldOfInterestId === 'number'
        ? dto.fieldOfInterestId
        : dto.fieldOfInterestId
          ? Number(dto.fieldOfInterestId)
          : undefined;

    const studentInsert = {
      id: userId,
      education_level: educationLevel,
      field_of_interest_id: fieldId,
      academic_result: dto.academicResult ?? null,
      study_preferences: dto.studyPreferences ?? null,
    } satisfies Database['public']['Tables']['students_details']['Insert'];

    const studentInsertResult = await supabase
      .from('students_details')
      .insert(studentInsert);

    if (studentInsertResult.error) {
      throw new InternalServerErrorException(
        'Failed to persist student details.',
      );
    }

    return {
      userId,
      email: dto.email,
      message:
        'Account created successfully. Please check your email for a verification link before signing in.',
    };
  }
}
