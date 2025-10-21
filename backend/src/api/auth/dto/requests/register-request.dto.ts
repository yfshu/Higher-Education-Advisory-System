export type IdentityType = 'ic' | 'passport';

export class RegisterRequestDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  phoneNumber?: string;
  identityType!: IdentityType;
  identityNumber!: string;
  dob?: string;
  nationality?: string;
  currentLocation?: string;
  avatarUrl?: string;
  password!: string;
  confirmPassword!: string;
  educationLevel?: string;
  currentInstitution?: string;
  fieldOfInterestId?: number;
  academicResult?: string;
  studyPreferences?: string;
  careerGoal?: string;
}
