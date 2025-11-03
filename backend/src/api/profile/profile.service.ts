import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ProfileResponseDto } from './dto/responses/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getMe(accessToken?: string): Promise<ProfileResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }
    const supabase = this.supabaseService.createClientWithToken(accessToken);

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    const { data: userDetails, error: userErr } = await supabase
      .from('users_details')
      .select(
        'id, email, first_name, last_name, phone_number, nationality, current_location, avatar_url, career_goal',
      )
      .eq('id', userId)
      .maybeSingle();
    if (userErr) {
      throw userErr;
    }

    const { data: studentDetails, error: studentErr } = await supabase
      .from('students_details')
      .select(
        'id, education_level, field_of_interest_id, academic_result, study_preferences',
      )
      .eq('id', userId)
      .maybeSingle();
    if (studentErr) {
      throw studentErr;
    }

    return {
      id: userId,
      email: userDetails?.email ?? '',
      firstName: userDetails?.first_name ?? null,
      lastName: userDetails?.last_name ?? null,
      phoneNumber: userDetails?.phone_number ?? null,
      nationality: userDetails?.nationality ?? null,
      currentLocation: userDetails?.current_location ?? null,
      avatarUrl: userDetails?.avatar_url ?? null,
      careerGoal: userDetails?.career_goal ?? null,
      educationLevel: studentDetails?.education_level ?? null,
      fieldOfInterestId: studentDetails?.field_of_interest_id ?? null,
      academicResult: studentDetails?.academic_result ?? null,
      studyPreferences: studentDetails?.study_preferences ?? null,
    };
  }
}
