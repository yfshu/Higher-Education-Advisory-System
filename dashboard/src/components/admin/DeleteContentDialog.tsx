"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface DeleteContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: number; title: string; category: string } | null;
  onConfirm: () => void;
}

export function DeleteContentDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: DeleteContentDialogProps) {
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item || !userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/help/content/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete content: ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({}));
      if (result.success) {
        toast.success("Content deleted successfully!");
      }
      
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Content</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{item?.title}"? This action cannot be undone.
            The content will be permanently removed from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

