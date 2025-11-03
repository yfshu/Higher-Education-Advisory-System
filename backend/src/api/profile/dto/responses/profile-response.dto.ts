import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  nationality: string | null;

  @ApiProperty({ nullable: true })
  currentLocation: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true })
  careerGoal: string | null;

  @ApiProperty({ nullable: true })
  educationLevel: string | null;

  @ApiProperty({ nullable: true })
  fieldOfInterestId: number | null;

  @ApiProperty({ nullable: true })
  academicResult: string | null;

  @ApiProperty({ nullable: true })
  studyPreferences: string | null;
}
