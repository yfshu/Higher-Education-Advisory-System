import { Module } from '@nestjs/common';
import { HelpService } from './help.service';
import { HelpController } from './help.controller';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ProgramsModule } from '../programs/programs.module';
import { ScholarshipsModule } from '../scholarships/scholarships.module';

@Module({
  imports: [SupabaseModule, ProgramsModule, ScholarshipsModule],
  providers: [HelpService],
  controllers: [HelpController],
  exports: [HelpService],
})
export class HelpModule {}

