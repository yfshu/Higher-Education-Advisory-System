import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';
import { SupabaseClient } from '@supabase/supabase-js';

type SavedItemRow = Database['public']['Tables']['saved_items']['Row'];
type SavedItemInsert = Database['public']['Tables']['saved_items']['Insert'];
type ItemType = Database['public']['Enums']['item_type'];

@Injectable()
export class SavedItemsService {
  private readonly logger = new Logger(SavedItemsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private getUserClient(accessToken: string): SupabaseClient<Database> {
    return this.supabaseService.createUserClient(accessToken);
  }

  async saveItem(
    userId: string,
    itemType: ItemType,
    itemId: number,
    accessToken: string,
  ): Promise<SavedItemRow> {
    try {
      const db = this.getUserClient(accessToken);

      const { data: existing } = await db
        .from('saved_items')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        this.logger.log(
          `Item already saved: ${itemType} ${itemId} for user ${userId}`,
        );
        return existing as SavedItemRow;
      }

      const insertData: SavedItemInsert = {
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        saved_at: new Date().toISOString(),
      };

      const { data, error } = await db
        .from('saved_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        this.logger.error('Error saving item:', error);
        throw new BadRequestException(`Failed to save item: ${error.message}`);
      }

      this.logger.log(
        `Successfully saved ${itemType} ${itemId} for user ${userId}`,
      );
      return data;
    } catch (error) {
      this.logger.error('Exception in saveItem:', error);
      throw error;
    }
  }

  async unsaveItem(
    userId: string,
    itemType: ItemType,
    itemId: number,
    accessToken: string,
  ): Promise<void> {
    try {
      const db = this.getUserClient(accessToken);

      const { error } = await db
        .from('saved_items')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        this.logger.error('Error unsaving item:', error);
        throw new BadRequestException(
          `Failed to unsave item: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully unsaved ${itemType} ${itemId} for user ${userId}`,
      );
    } catch (error) {
      this.logger.error('Exception in unsaveItem:', error);
      throw error;
    }
  }

  async isItemSaved(
    userId: string,
    itemType: ItemType,
    itemId: number,
    accessToken: string,
  ): Promise<boolean> {
    try {
      const db = this.getUserClient(accessToken);

      const { data, error } = await db
        .from('saved_items')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error('Error checking saved state:', error);
        throw new BadRequestException(
          `Failed to check saved state: ${error.message}`,
        );
      }

      return !!data;
    } catch (error) {
      this.logger.error('Exception in isItemSaved:', error);
      throw error;
    }
  }

  async getSavedItems(
    userId: string,
    accessToken: string,
    itemType?: ItemType,
  ): Promise<SavedItemRow[]> {
    try {
      const db = this.getUserClient(accessToken);

      let query = db
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (itemType) {
        query = query.eq('item_type', itemType);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error fetching saved items:', error);
        throw new BadRequestException(
          `Failed to fetch saved items: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully fetched ${data?.length || 0} saved items for user ${userId}`,
      );
      return data || [];
    } catch (error) {
      this.logger.error('Exception in getSavedItems:', error);
      throw error;
    }
  }

  async getSavedPrograms(userId: string, accessToken: string): Promise<any[]> {
    try {
      const db = this.getUserClient(accessToken);

      const { data: savedItems, error: savedItemsError } = await db
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', 'program')
        .order('saved_at', { ascending: false });

      if (savedItemsError) {
        this.logger.error('Error fetching saved items:', savedItemsError);
        throw new BadRequestException(
          `Failed to fetch saved items: ${savedItemsError.message}`,
        );
      }

      if (!savedItems || savedItems.length === 0) {
        this.logger.log(`No saved programs found for user ${userId}`);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      const programIds = savedItems.map((item: any) => item.item_id);

      const { data: programs, error: programsError } = await db
        .from('programs')
        .select(
          `
          *,
          university:university_id (
            *
          )
        `,
        )
        .in('id', programIds);

      if (programsError) {
        this.logger.error('Error fetching programs:', programsError);
        throw new BadRequestException(
          `Failed to fetch programs: ${programsError.message}`,
        );
      }

      const savedAtMap = new Map<number, string>();
      savedItems.forEach((item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        savedAtMap.set(item.item_id, item.saved_at);
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const programsWithSavedInfo = (programs || []).map((program: any) => ({
        ...program,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        saved_at: savedAtMap.get(program.id) || null,
        saved_item_id:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          savedItems.find((item: any) => item.item_id === program.id)?.id ||
          null,
      }));

      this.logger.log(
        `Successfully fetched ${programsWithSavedInfo.length} saved programs for user ${userId}`,
      );
      return programsWithSavedInfo;
    } catch (error) {
      this.logger.error('Exception in getSavedPrograms:', error);
      throw error;
    }
  }

  async getSavedScholarships(
    userId: string,
    accessToken: string,
  ): Promise<any[]> {
    try {
      const db = this.getUserClient(accessToken);

      const { data: savedItems, error: savedItemsError } = await db
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', 'scholarship')
        .order('saved_at', { ascending: false });

      if (savedItemsError) {
        this.logger.error('Error fetching saved items:', savedItemsError);
        throw new BadRequestException(
          `Failed to fetch saved items: ${savedItemsError.message}`,
        );
      }

      if (!savedItems || savedItems.length === 0) {
        this.logger.log(`No saved scholarships found for user ${userId}`);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      const scholarshipIds = savedItems.map((item: any) => item.item_id);

      const { data: scholarships, error: scholarshipsError } = await db
        .from('scholarships')
        .select('*')
        .in('id', scholarshipIds);

      if (scholarshipsError) {
        this.logger.error('Error fetching scholarships:', scholarshipsError);
        throw new BadRequestException(
          `Failed to fetch scholarships: ${scholarshipsError.message}`,
        );
      }

      const savedAtMap = new Map<number, string>();
      savedItems.forEach((item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        savedAtMap.set(item.item_id, item.saved_at);
      });

      const scholarshipsWithSavedInfo = (scholarships || []).map(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (scholarship: any) => ({
          ...scholarship,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          saved_at: savedAtMap.get(scholarship.id) || null,
          saved_item_id:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            savedItems.find((item: any) => item.item_id === scholarship.id)
              ?.id || null,
        }),
      );

      this.logger.log(
        `Successfully fetched ${scholarshipsWithSavedInfo.length} saved scholarships for user ${userId}`,
      );
      return scholarshipsWithSavedInfo;
    } catch (error) {
      this.logger.error('Exception in getSavedScholarships:', error);
      throw error;
    }
  }
}
