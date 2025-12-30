import { Module } from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { SavedItemsController } from './saved-items.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [SavedItemsService],
  controllers: [SavedItemsController],
  exports: [SavedItemsService],
})
export class SavedItemsModule {}

