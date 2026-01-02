import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';
import { LoginRequestDto } from './dto/requests/login-request.dto';
import { RegisterCompleteRequestDto as RegisterRequestDto } from './dto/requests/register-complete-request.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { RegisterResponseDto } from './dto/responses/register-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';
import { ForgotPasswordRequestDto } from './dto/requests/forgot-password-request.dto';
import { ForgotPasswordResponseDto } from './dto/responses/forgot-password-response.dto';
import { UpdatePasswordRequestDto } from './dto/requests/update-password-request.dto';
import { UpdatePasswordResponseDto } from './dto/responses/update-password-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const authClient = this.supabaseService.getAuthClient();
    const dbClient = this.supabaseService.getClient();
    
    // First, check if user exists and is banned/inactive BEFORE attempting login
    // This allows us to give a better error message
    try {
      const { data: { users }, error: listError } = await dbClient.auth.admin.listUsers();
      
      if (!listError && users && users.length > 0) {
        const user = users.find((u: any) => u.email?.toLowerCase() === dto.email.toLowerCase());
        
        if (user) {
          // Check if user is banned/inactive
          const isBanned = (user as any).banned_at !== null && (user as any).banned_at !== undefined;
          const statusFromMetadata = (user.app_metadata as any)?.status;
          const isInactive = isBanned || statusFromMetadata === 'inactive';
          
          if (isInactive) {
            throw new UnauthorizedException('Your account is inactive. Please contact support for assistance.');
          }
        }
      }
    } catch (error) {
      // If it's our custom inactive error, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Otherwise, continue with normal login flow (user might not exist, etc.)
    }
    
    // Attempt login
    const { data, error } = await authClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user) {
      // Check for specific password-related errors
      const errorMessage = error?.message?.toLowerCase() || '';
      
      // Check if error is due to banned/inactive account
      if (
        errorMessage.includes('banned') ||
        errorMessage.includes('inactive') ||
        errorMessage.includes('disabled')
      ) {
        throw new UnauthorizedException('Your account is inactive. Please contact support for assistance.');
      }
      
      // Common Supabase password error messages
      if (
        errorMessage.includes('invalid login credentials') ||
        errorMessage.includes('invalid password') ||
        errorMessage.includes('wrong password') ||
        errorMessage.includes('incorrect password') ||
        errorMessage.includes('email not confirmed') ||
        error?.status === 400
      ) {
        throw new UnauthorizedException('Password is wrong or invalid. Please check your password and try again.');
      }
      
      // Email not found
      if (
        errorMessage.includes('user not found')
      ) {
        throw new UnauthorizedException('Email not found. Please check your email address.');
      }
      
      // Generic fallback
      throw new UnauthorizedException(
        error?.message ?? 'Invalid email or password.',
      );
    }
    const userId = data.user.id;
    // Read role from app_metadata (set by Supabase Admin API), fallback to user_metadata, then default to 'student'
    const role = (data.user.app_metadata?.role as string) ?? (data.user.user_metadata?.role as string) ?? 'student';
    const fullName = (data.user.user_metadata?.full_name as string) ?? '';
    const phoneNumber = (data.user.user_metadata?.phone_number as string) ?? '';

    const { data: profileData } = await dbClient
      .from('student_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: preferencesData } = await dbClient
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Generate signed URL for avatar if it exists (for private bucket)
    let avatarUrl: string | undefined = undefined;
    if (profileData?.avatar_url) {
      // Check if avatar_url is already a full URL (legacy data) or a path
      if (profileData.avatar_url.startsWith('http://') || profileData.avatar_url.startsWith('https://')) {
        // Already a full URL, use as-is
        avatarUrl = profileData.avatar_url;
      } else {
        // It's a path, generate signed URL (expires in 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await dbClient.storage
          .from('profile-avatars')
          .createSignedUrl(profileData.avatar_url, 3600);
        
        if (!signedUrlError && signedUrlData) {
          avatarUrl = signedUrlData.signedUrl;
        } else {
          console.error('Failed to generate signed URL for avatar:', signedUrlError);
          // If signed URL generation fails, return undefined (will show initials)
        }
      }
    }

    return {
      user: {
        id: userId,
        email: data.user.email ?? '',
        role,
        fullName,
        phoneNumber,
      },
      profile: profileData
        ? {
            phoneNumber: (profileData.phone_number ?? undefined) as
              | string
              | undefined,
            countryCode: (profileData.country_code ?? undefined) as
              | string
              | undefined,
            avatarUrl: avatarUrl,
            studyLevel: profileData.study_level,
            extracurricular: profileData.extracurricular,
            bm: profileData.bm ?? undefined,
            english: profileData.english ?? undefined,
            history: profileData.history ?? undefined,
            mathematics: profileData.mathematics ?? undefined,
            islamicEducationMoralEducation:
              profileData.islamic_education_moral_education ?? undefined,
            physics: profileData.physics ?? undefined,
            chemistry: profileData.chemistry ?? undefined,
            biology: profileData.biology ?? undefined,
            additionalMathematics:
              profileData.additional_mathematics ?? undefined,
            geography: profileData.geography ?? undefined,
            economics: profileData.economics ?? undefined,
            accounting: profileData.accounting ?? undefined,
            chinese: profileData.chinese ?? undefined,
            tamil: profileData.tamil ?? undefined,
            ict: profileData.ict ?? undefined,
            mathsInterest: profileData.maths_interest ?? undefined,
            scienceInterest: profileData.science_interest ?? undefined,
            computerInterest: profileData.computer_interest ?? undefined,
            writingInterest: profileData.writing_interest ?? undefined,
            artInterest: profileData.art_interest ?? undefined,
            businessInterest: profileData.business_interest ?? undefined,
            socialInterest: profileData.social_interest ?? undefined,
            logicalThinking: profileData.logical_thinking ?? undefined,
            problemSolving: profileData.problem_solving ?? undefined,
            creativity: profileData.creativity ?? undefined,
            communication: profileData.communication ?? undefined,
            teamwork: profileData.teamwork ?? undefined,
            leadership: profileData.leadership ?? undefined,
            attentionToDetail: profileData.attention_to_detail ?? undefined,
          }
        : undefined,
      preferences: preferencesData
        ? {
            budgetRange: preferencesData.budget_range ?? undefined,
            preferredLocation: preferencesData.preferred_location ?? undefined,
            preferredCountry: preferencesData.preferred_country ?? undefined,
            studyMode: preferencesData.study_mode ?? undefined,
          }
        : undefined,
      message: 'Login successful.',
      accessToken: data.session?.access_token ?? '',
      refreshToken: data.session?.refresh_token ?? '',
      expiresIn: data.session?.expires_in ?? 0,
    };
  }

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirmation do not match.');
    }

    const emailLower = dto.email.toLowerCase();
    const passwordLower = dto.password.toLowerCase();
    if (passwordLower.includes(emailLower)) {
      throw new BadRequestException(
        'Password cannot contain your email address.',
      );
    }

    // Sanitize phone number to E.164 format (remove spaces, dashes, parentheses)
    const sanitizedPhone = dto.phoneNumber.replace(/[\s\-()]/g, '');

    // Validate and parse phone number using libphonenumber-js
    let parsedPhone: PhoneNumber;
    try {
      parsedPhone = parsePhoneNumber(sanitizedPhone);
    } catch {
      throw new BadRequestException(
        'Invalid phone number format. Please provide a valid phone number with country code.',
      );
    }

    if (!parsedPhone || !parsedPhone.isValid()) {
      throw new BadRequestException(
        'Invalid phone number. Please provide a valid phone number with country code.',
      );
    }

    // Extract country code correctly (e.g., +60 from +60123456789)
    const countryCode = parsedPhone.countryCallingCode
      ? `+${parsedPhone.countryCallingCode}`
      : null;

    // Use the parsed phone number's E.164 format for consistency
    const normalizedPhone: string = parsedPhone.number;

    const authClient = this.supabaseService.getAuthClient();
    const dbClient = this.supabaseService.getClient();

    try {
      const { data: authData, error: authError } = await authClient.auth.signUp(
        {
          email: dto.email,
          password: dto.password,
          options: {
            emailRedirectTo:
              process.env.EMAIL_CONFIRM_REDIRECT ??
              `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/confirm`,
            data: {
              role: 'student',
              full_name: dto.fullName,
              phone_number: normalizedPhone,
              country_code: countryCode,
            },
          },
        },
      );

      if (authError || !authData.user) {
        throw new BadRequestException(
          authError?.message ?? 'Failed to create user account.',
        );
      }

      const userId = authData.user.id;

      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const profileInsert: Database['public']['Tables']['student_profile']['Insert'] =
        {
          user_id: userId,
          phone_number: normalizedPhone,
          country_code: countryCode,
          study_level: dto.studyLevel,
          extracurricular: dto.extracurricular,
          bm: dto.bm as any,
          english: dto.english as any,
          history: dto.history as any,
          mathematics: dto.mathematics as any,
          islamic_education_moral_education:
            dto.islamicEducationMoralEducation as any,
          physics: dto.physics as any,
          chemistry: dto.chemistry as any,
          biology: dto.biology as any,
          additional_mathematics: dto.additionalMathematics as any,
          geography: dto.geography as any,
          economics: dto.economics as any,
          accounting: dto.accounting as any,
          chinese: dto.chinese as any,
          tamil: dto.tamil as any,
          ict: dto.ict as any,
          maths_interest: dto.mathsInterest,
          science_interest: dto.scienceInterest,
          computer_interest: dto.computerInterest,
          writing_interest: dto.writingInterest,
          art_interest: dto.artInterest,
          business_interest: dto.businessInterest,
          social_interest: dto.socialInterest,
          logical_thinking: dto.logicalThinking,
          problem_solving: dto.problemSolving,
          creativity: dto.creativity,
          communication: dto.communication,
          teamwork: dto.teamwork,
          leadership: dto.leadership,
          attention_to_detail: dto.attentionToDetail,
        };
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      const { error: profileError } = await dbClient
        .from('student_profile')
        .insert(profileInsert);

      if (profileError) {
        throw new InternalServerErrorException(
          profileError.message ?? 'Failed to create student profile.',
        );
      }

      const preferencesInsert: Database['public']['Tables']['preferences']['Insert'] =
        {
          user_id: userId,
          budget_range: dto.budgetRange,
          preferred_location: dto.preferredLocation,
          preferred_country: dto.preferredCountry ?? null,
          study_mode: dto.studyMode ?? null,
        };

      const { error: preferencesError } = await dbClient
        .from('preferences')
        .insert(preferencesInsert);

      if (preferencesError) {
        await dbClient.from('student_profile').delete().eq('user_id', userId);
        throw new InternalServerErrorException(
          preferencesError.message ?? 'Failed to create preferences.',
        );
      }

      return {
        userId,
        email: dto.email,
        message:
          'Registration completed successfully! Please check your email to verify your account.',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during registration.',
      );
    }
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

  async forgotPassword(
    dto: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    const authClient = this.supabaseService.getAuthClient();
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const redirectTo = dto.redirectTo ?? `${baseUrl}/auth/reset-password`;

    const { error } = await authClient.auth.resetPasswordForEmail(dto.email, {
      redirectTo,
    });

    if (error) {
      throw new BadRequestException(
        error.message ?? 'Failed to send password reset email.',
      );
    }

    return { message: 'Password reset email sent.' };
  }

  async updatePassword(
    accessToken: string | undefined,
    dto: UpdatePasswordRequestDto,
  ): Promise<UpdatePasswordResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }

    const supabase = this.supabaseService.createClientWithToken(accessToken);
    const { error } = await supabase.auth.updateUser({
      password: dto.password,
    });

    if (error) {
      throw new BadRequestException(
        error.message ?? 'Failed to update password.',
      );
    }

    return { message: 'Password updated successfully.' };
  }
}
