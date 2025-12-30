import { Module } from '@nestjs/common';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}

