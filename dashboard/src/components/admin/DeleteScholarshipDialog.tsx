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

interface DeleteScholarshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scholarship: { id: number; name: string } | null;
  onConfirm: () => void;
}

export function DeleteScholarshipDialog({
  open,
  onOpenChange,
  scholarship,
  onConfirm,
}: DeleteScholarshipDialogProps) {
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!scholarship || !userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/scholarships/${scholarship.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete scholarship: ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({}));
      if (result.success) {
        toast.success("Scholarship deleted successfully!");
      }
      
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete scholarship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Scholarship</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{scholarship?.name}"? This action cannot be undone.
            The scholarship will be permanently removed from the database.
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

