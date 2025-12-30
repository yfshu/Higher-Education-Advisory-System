import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  /**
   * Get a user-scoped client that respects RLS
   */
  private getUserClient(accessToken: string): SupabaseClient<Database> {
    return this.supabaseService.createUserClient(accessToken);
  }

  /**
   * Save an item (program or scholarship)
   */
  async saveItem(userId: string, itemType: ItemType, itemId: number, accessToken: string): Promise<SavedItemRow> {
    try {
      const db = this.getUserClient(accessToken);
      
      // Check if already saved
      const { data: existing } = await db
        .from('saved_items')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        this.logger.log(`Item already saved: ${itemType} ${itemId} for user ${userId}`);
        return existing as SavedItemRow;
      }

      // Insert new saved item
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

      this.logger.log(`Successfully saved ${itemType} ${itemId} for user ${userId}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in saveItem:', error);
      throw error;
    }
  }

  /**
   * Unsave an item (program or scholarship)
   */
  async unsaveItem(userId: string, itemType: ItemType, itemId: number, accessToken: string): Promise<void> {
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
        throw new BadRequestException(`Failed to unsave item: ${error.message}`);
      }

      this.logger.log(`Successfully unsaved ${itemType} ${itemId} for user ${userId}`);
    } catch (error) {
      this.logger.error('Exception in unsaveItem:', error);
      throw error;
    }
  }

  /**
   * Check if an item is saved
   */
  async isItemSaved(userId: string, itemType: ItemType, itemId: number, accessToken: string): Promise<boolean> {
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
        // PGRST116 is "not found" which is expected
        this.logger.error('Error checking saved state:', error);
        throw new BadRequestException(`Failed to check saved state: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      this.logger.error('Exception in isItemSaved:', error);
      throw error;
    }
  }

  /**
   * Fetch saved items for a user
   * If itemType is provided, filter by it
   */
  async getSavedItems(userId: string, accessToken: string, itemType?: ItemType): Promise<SavedItemRow[]> {
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
        throw new BadRequestException(`Failed to fetch saved items: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} saved items for user ${userId}`);
      return data || [];
    } catch (error) {
      this.logger.error('Exception in getSavedItems:', error);
      throw error;
    }
  }

  /**
   * Fetch saved programs with full program data
   */
  async getSavedPrograms(userId: string, accessToken: string): Promise<any[]> {
    try {
      const db = this.getUserClient(accessToken);

      // First, fetch saved_items for programs
      const { data: savedItems, error: savedItemsError } = await db
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', 'program')
        .order('saved_at', { ascending: false });

      if (savedItemsError) {
        this.logger.error('Error fetching saved items:', savedItemsError);
        throw new BadRequestException(`Failed to fetch saved items: ${savedItemsError.message}`);
      }

      if (!savedItems || savedItems.length === 0) {
        this.logger.log(`No saved programs found for user ${userId}`);
        return [];
      }

      // Extract program IDs
      const programIds = savedItems.map((item: any) => item.item_id);

      // Fetch programs with university data
      const { data: programs, error: programsError } = await db
        .from('programs')
        .select(`
          *,
          university:university_id (
            *
          )
        `)
        .in('id', programIds);

      if (programsError) {
        this.logger.error('Error fetching programs:', programsError);
        throw new BadRequestException(`Failed to fetch programs: ${programsError.message}`);
      }

      // Create a map of saved_at times by program ID
      const savedAtMap = new Map<number, string>();
      savedItems.forEach((item: any) => {
        savedAtMap.set(item.item_id, item.saved_at);
      });

      // Combine programs with saved_at information
      const programsWithSavedInfo = (programs || []).map((program: any) => ({
        ...program,
        saved_at: savedAtMap.get(program.id) || null,
        saved_item_id: savedItems.find((item: any) => item.item_id === program.id)?.id || null,
      }));

      this.logger.log(`Successfully fetched ${programsWithSavedInfo.length} saved programs for user ${userId}`);
      return programsWithSavedInfo;
    } catch (error) {
      this.logger.error('Exception in getSavedPrograms:', error);
      throw error;
    }
  }

  /**
   * Fetch saved scholarships with full scholarship data
   */
  async getSavedScholarships(userId: string, accessToken: string): Promise<any[]> {
    try {
      const db = this.getUserClient(accessToken);

      // First, fetch saved_items for scholarships
      const { data: savedItems, error: savedItemsError } = await db
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', 'scholarship')
        .order('saved_at', { ascending: false });

      if (savedItemsError) {
        this.logger.error('Error fetching saved items:', savedItemsError);
        throw new BadRequestException(`Failed to fetch saved items: ${savedItemsError.message}`);
      }

      if (!savedItems || savedItems.length === 0) {
        this.logger.log(`No saved scholarships found for user ${userId}`);
        return [];
      }

      // Extract scholarship IDs
      const scholarshipIds = savedItems.map((item: any) => item.item_id);

      // Fetch scholarships
      const { data: scholarships, error: scholarshipsError } = await db
        .from('scholarships')
        .select('*')
        .in('id', scholarshipIds);

      if (scholarshipsError) {
        this.logger.error('Error fetching scholarships:', scholarshipsError);
        throw new BadRequestException(`Failed to fetch scholarships: ${scholarshipsError.message}`);
      }

      // Create a map of saved_at times by scholarship ID
      const savedAtMap = new Map<number, string>();
      savedItems.forEach((item: any) => {
        savedAtMap.set(item.item_id, item.saved_at);
      });

      // Combine scholarships with saved_at information
      const scholarshipsWithSavedInfo = (scholarships || []).map((scholarship: any) => ({
        ...scholarship,
        saved_at: savedAtMap.get(scholarship.id) || null,
        saved_item_id: savedItems.find((item: any) => item.item_id === scholarship.id)?.id || null,
      }));

      this.logger.log(`Successfully fetched ${scholarshipsWithSavedInfo.length} saved scholarships for user ${userId}`);
      return scholarshipsWithSavedInfo;
    } catch (error) {
      this.logger.error('Exception in getSavedScholarships:', error);
      throw error;
    }
  }
}

