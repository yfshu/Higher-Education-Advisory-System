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

interface DeleteProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: { id: number; name: string } | null;
  onConfirm: () => void;
}

export function DeleteProgramDialog({
  open,
  onOpenChange,
  program,
  onConfirm,
}: DeleteProgramDialogProps) {
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!program || !userData?.accessToken) {
      alert("Please log in to perform this action.");
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/programs/${program.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete program: ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({}));
      if (result.success) {
        toast.success("Program deleted successfully!");
      }
      
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting program:", error);
      alert(error instanceof Error ? error.message : "Failed to delete program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Program</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{program?.name}"? This action cannot be undone.
            The program will be permanently removed from the database.
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

