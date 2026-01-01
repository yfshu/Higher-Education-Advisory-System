import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FieldsController],
})
export class FieldsModule {}

