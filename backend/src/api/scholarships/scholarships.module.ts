import { Module } from '@nestjs/common';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService],
  exports: [ScholarshipsService],
})
export class ScholarshipsModule {}

