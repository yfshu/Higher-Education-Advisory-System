import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ProgramsByFieldRequestDto {
  @ApiProperty({
    example: 'Computer Science & IT',
    description: 'Selected field name from field recommendations',
  })
  @IsString()
  @IsNotEmpty()
  field_name: string;
}

