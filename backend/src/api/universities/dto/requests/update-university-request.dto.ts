import { PartialType } from '@nestjs/mapped-types';
import { CreateUniversityRequestDto } from './create-university-request.dto';

export class UpdateUniversityRequestDto extends PartialType(CreateUniversityRequestDto) {}

