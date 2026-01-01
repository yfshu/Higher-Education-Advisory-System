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

interface DeleteUniversityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university: { id: number; name: string } | null;
  onConfirm: () => void;
}

export function DeleteUniversityDialog({
  open,
  onOpenChange,
  university,
  onConfirm,
}: DeleteUniversityDialogProps) {
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!university || !userData?.accessToken) {
      alert("Please log in to perform this action.");
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/universities/${university.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete university");
      }

      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting university:", error);
      alert(error instanceof Error ? error.message : "Failed to delete university");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete University</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{university?.name}"? This action cannot be undone.
            <br />
            <br />
            <strong className="text-red-600 dark:text-red-400">
              Warning: This will also delete ALL programs linked to this university.
            </strong>
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
              "Delete University"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

