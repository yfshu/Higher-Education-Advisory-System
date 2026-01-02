import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

type ItemType = 'program' | 'scholarship';

interface UseSavedItemsReturn {
  savedItems: Map<string, boolean>; // key: `${itemType}:${itemId}`
  isLoading: boolean;
  isItemSaved: (itemType: ItemType, itemId: number) => boolean;
  toggleSave: (itemType: ItemType, itemId: number) => Promise<boolean>;
  refreshSavedItems: () => Promise<void>;
}

/**
 * Hook to manage saved items (programs and scholarships)
 * Fetches saved items on mount and provides methods to check/save/unsave
 */
export function useSavedItems(): UseSavedItemsReturn {
  const [savedItems, setSavedItems] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const getAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const getKey = (itemType: ItemType, itemId: number): string => {
    return `${itemType}:${itemId}`;
  };

  const fetchSavedItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) {
        setSavedItems(new Map());
        setIsLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/saved-items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch saved items:', response.statusText);
        setSavedItems(new Map());
        return;
      }

      const result = await response.json();
      if (result.success) {
        // Create a map with composite keys: `${itemType}:${itemId}`
        const savedMap = new Map<string, boolean>();
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((item: { item_type: ItemType; item_id: number }) => {
            const key = getKey(item.item_type, item.item_id);
            savedMap.set(key, true);
          });
        }
        console.log('🔍 useSavedItems: Fetched saved items:', {
          success: result.success,
          dataLength: result.data?.length || 0,
          items: result.data || [],
          mapKeys: Array.from(savedMap.keys()),
          scholarshipCount: Array.from(savedMap.keys()).filter(k => k.startsWith('scholarship:')).length
        });
        setSavedItems(savedMap);
      } else {
        // If unsuccessful, set empty map
        console.log('🔍 useSavedItems: Unsuccessful response:', result);
        setSavedItems(new Map());
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
      setSavedItems(new Map());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedItems();
  }, [fetchSavedItems]);

  const isItemSaved = useCallback((itemType: ItemType, itemId: number): boolean => {
    const key = getKey(itemType, itemId);
    return savedItems.get(key) === true;
  }, [savedItems]);

  const toggleSave = useCallback(async (itemType: ItemType, itemId: number): Promise<boolean> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('No access token available');
        return false;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const key = getKey(itemType, itemId);
      const isCurrentlySaved = savedItems.get(key) === true;

      if (isCurrentlySaved) {
        // Unsave
        const response = await fetch(`${backendUrl}/api/saved-items/${itemType}/${itemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setSavedItems((prev) => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
          });
          return false; // Now unsaved
        }
      } else {
        // Save
        const response = await fetch(`${backendUrl}/api/saved-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemType, itemId }),
        });

        if (response.ok) {
          setSavedItems((prev) => {
            const newMap = new Map(prev);
            newMap.set(key, true);
            return newMap;
          });
          return true; // Now saved
        }
      }

      return isCurrentlySaved;
    } catch (error) {
      console.error('Error toggling save:', error);
      const key = getKey(itemType, itemId);
      return savedItems.get(key) === true;
    }
  }, [savedItems]);

  const refreshSavedItems = useCallback(async () => {
    await fetchSavedItems();
  }, [fetchSavedItems]);

  return {
    savedItems,
    isLoading,
    isItemSaved,
    toggleSave,
    refreshSavedItems,
  };
}

