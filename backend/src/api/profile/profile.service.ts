import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';
import { UpdateProfileRequestDto } from './dto/requests/update-profile-request.dto';
import { UpdateProfileResponseDto } from './dto/responses/update-profile-response.dto';
import { UploadAvatarResponseDto } from './dto/responses/upload-avatar-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getMe(accessToken: string | undefined) {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }

    const supabase = this.supabaseService.createClientWithToken(accessToken);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    
    if (authError || !auth.user) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    const userId = auth.user.id;
    const dbClient = this.supabaseService.getClient();

    const { data: profileData, error: profileError } = await dbClient
      .from('student_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw new InternalServerErrorException(
        `Failed to fetch profile: ${profileError.message}`,
      );
    }

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

    const { data: preferencesData, error: preferencesError } = await dbClient
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (preferencesError) {
      throw new InternalServerErrorException(
        `Failed to fetch preferences: ${preferencesError.message}`,
      );
    }

    return {
      user: {
        id: userId,
        email: auth.user.email ?? '',
        role: (auth.user.user_metadata?.role as string) ?? 'student',
        fullName: (auth.user.user_metadata?.full_name as string) ?? undefined,
        phoneNumber: (auth.user.user_metadata?.phone_number as string) ?? undefined,
      },
      profile: profileData
        ? {
            phoneNumber: (profileData.phone_number ?? undefined) as string | undefined,
            countryCode: (profileData.country_code ?? undefined) as string | undefined,
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
    };
  }

  async uploadAvatar(
    accessToken: string | undefined,
    file: Express.Multer.File,
  ): Promise<UploadAvatarResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }

    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG and PNG images are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    // Validate user authentication first
    const authClient = this.supabaseService.createClientWithToken(accessToken);
    const { data: auth } = await authClient.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    // Determine file extension
    const ext = file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' ? 'jpg' : 'png';
    const fileName = `avatars/${userId}.${ext}`;

    // Use service role client for storage and database operations to bypass RLS
    const dbClient = this.supabaseService.getClient();

    // Upload to Supabase Storage using service role client
    // file.buffer is already a Buffer from multer, which Supabase accepts
    const { data: uploadData, error: uploadError } = await dbClient.storage
      .from('profile-avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // Replace existing file
      });

    if (uploadError) {
      throw new InternalServerErrorException(
        `Failed to upload avatar: ${uploadError.message}`,
      );
    }

    // For private buckets, we store the path and generate signed URLs on fetch
    // Store the file path (not full URL) in the database
    const filePath = fileName;

    // Update student_profile with avatar path using service role client to bypass RLS
    const { error: updateError } = await dbClient
      .from('student_profile')
      .update({
        avatar_url: filePath,
        avatar_updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to update profile: ${updateError.message}`,
      );
    }

    // Generate a signed URL for immediate use (expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await dbClient.storage
      .from('profile-avatars')
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (signedUrlError) {
      // If signed URL generation fails, still return success but log the error
      console.error('Failed to generate signed URL:', signedUrlError);
      // Return the path - frontend will need to generate signed URL
      return {
        message: 'Avatar uploaded successfully.',
        avatarUrl: filePath,
      };
    }

    return {
      message: 'Avatar uploaded successfully.',
      avatarUrl: signedUrlData.signedUrl,
    };
  }

  async updateProfile(
    accessToken: string | undefined,
    dto: UpdateProfileRequestDto,
  ): Promise<UpdateProfileResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }

    const supabase = this.supabaseService.createClientWithToken(accessToken);

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    const dbClient = this.supabaseService.getClient();

    // Build update object - only allow editable fields
    // IMPORTANT: Do NOT allow updates to:
    // - phone_number (read-only, set during registration)
    // - country_code (read-only, set during registration)
    // - user_id (immutable)
    const updateData: Database['public']['Tables']['student_profile']['Update'] = {};

    // Academic fields
    if (dto.studyLevel !== undefined) {
      updateData.study_level = dto.studyLevel;
    }
    if (dto.extracurricular !== undefined) {
      updateData.extracurricular = dto.extracurricular;
    }

    // Subject grades
    if (dto.bm !== undefined) updateData.bm = dto.bm as any;
    if (dto.english !== undefined) updateData.english = dto.english as any;
    if (dto.history !== undefined) updateData.history = dto.history as any;
    if (dto.mathematics !== undefined) updateData.mathematics = dto.mathematics as any;
    if (dto.islamicEducationMoralEducation !== undefined) {
      updateData.islamic_education_moral_education = dto.islamicEducationMoralEducation as any;
    }
    if (dto.physics !== undefined) updateData.physics = dto.physics as any;
    if (dto.chemistry !== undefined) updateData.chemistry = dto.chemistry as any;
    if (dto.biology !== undefined) updateData.biology = dto.biology as any;
    if (dto.additionalMathematics !== undefined) {
      updateData.additional_mathematics = dto.additionalMathematics as any;
    }
    if (dto.geography !== undefined) updateData.geography = dto.geography as any;
    if (dto.economics !== undefined) updateData.economics = dto.economics as any;
    if (dto.accounting !== undefined) updateData.accounting = dto.accounting as any;
    if (dto.chinese !== undefined) updateData.chinese = dto.chinese as any;
    if (dto.tamil !== undefined) updateData.tamil = dto.tamil as any;
    if (dto.ict !== undefined) updateData.ict = dto.ict as any;

    // Interests
    if (dto.mathsInterest !== undefined) updateData.maths_interest = dto.mathsInterest;
    if (dto.scienceInterest !== undefined) updateData.science_interest = dto.scienceInterest;
    if (dto.computerInterest !== undefined) updateData.computer_interest = dto.computerInterest;
    if (dto.writingInterest !== undefined) updateData.writing_interest = dto.writingInterest;
    if (dto.artInterest !== undefined) updateData.art_interest = dto.artInterest;
    if (dto.businessInterest !== undefined) updateData.business_interest = dto.businessInterest;
    if (dto.socialInterest !== undefined) updateData.social_interest = dto.socialInterest;

    // Skills
    if (dto.logicalThinking !== undefined) updateData.logical_thinking = dto.logicalThinking;
    if (dto.problemSolving !== undefined) updateData.problem_solving = dto.problemSolving;
    if (dto.creativity !== undefined) updateData.creativity = dto.creativity;
    if (dto.communication !== undefined) updateData.communication = dto.communication;
    if (dto.teamwork !== undefined) updateData.teamwork = dto.teamwork;
    if (dto.leadership !== undefined) updateData.leadership = dto.leadership;
    if (dto.attentionToDetail !== undefined) {
      updateData.attention_to_detail = dto.attentionToDetail;
    }

    // Update updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Extract preferences data if present
    const preferencesUpdate: Database['public']['Tables']['preferences']['Update'] = {};
    if (dto.budgetRange !== undefined) preferencesUpdate.budget_range = dto.budgetRange;
    if (dto.preferredLocation !== undefined)
      preferencesUpdate.preferred_location = dto.preferredLocation;
    if (dto.preferredCountry !== undefined)
      preferencesUpdate.preferred_country = dto.preferredCountry;
    if (dto.studyMode !== undefined) preferencesUpdate.study_mode = dto.studyMode;

    // Update student_profile
    if (Object.keys(updateData).length > 1) {
      // More than just updated_at
      const { error } = await dbClient
        .from('student_profile')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        throw new InternalServerErrorException(
          `Failed to update profile: ${error.message}`,
        );
      }
    }

    // Update preferences if any preferences fields are provided
    if (Object.keys(preferencesUpdate).length > 0) {
      preferencesUpdate.updated_at = new Date().toISOString();

      const { error: preferencesError } = await dbClient
        .from('preferences')
        .update(preferencesUpdate)
        .eq('user_id', userId);

      if (preferencesError) {
        throw new InternalServerErrorException(
          `Failed to update preferences: ${preferencesError.message}`,
        );
      }
    }

    return { message: 'Profile updated successfully.' };
  }
}
