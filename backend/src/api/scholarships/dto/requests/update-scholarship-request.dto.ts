import { PartialType } from '@nestjs/mapped-types';
import { CreateScholarshipRequestDto } from './create-scholarship-request.dto';

export class UpdateScholarshipRequestDto extends PartialType(CreateScholarshipRequestDto) {}

