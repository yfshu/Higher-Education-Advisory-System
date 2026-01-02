"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { DeleteContentDialog } from "@/components/admin/DeleteContentDialog";
import { apiCall } from "@/lib/auth/apiClient";

interface HelpSupportItem {
  id: number;
  title: string;
  content: string;
  category: 'FAQ';
  created_at: string | null;
  updated_at: string | null;
}

export default function ContentManagement() {
  const { userData } = useUser();
  const [faqs, setFaqs] = useState<HelpSupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HelpSupportItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HelpSupportItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'FAQ' as 'FAQ',
  });

  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const result = await apiCall<{ success: boolean; data: HelpSupportItem[] }>(
        `${backendUrl}/api/help/content?category=FAQ&t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        }
      );

      if (result.error) {
        if (result.error.code === 'SESSION_EXPIRED') {
          // Session expiry is handled by SessionExpiredHandler
          return;
        }
        setError(result.error.message);
        return;
      }

      if (result.data?.success && result.data.data) {
        setFaqs(result.data.data);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError(err instanceof Error ? err.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };

      const url = editingItem 
        ? `${backendUrl}/api/help/content/${editingItem.id}`
        : `${backendUrl}/api/help/content`;
      
      const result = await apiCall<{ success: boolean; data: HelpSupportItem }>(
        url,
        {
          method: editingItem ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (result.error) {
        if (result.error.code === 'SESSION_EXPIRED') {
          // Session expiry is handled by SessionExpiredHandler
          return;
        }
        throw new Error(result.error.message || "Failed to save FAQ");
      }

      toast.success(editingItem ? "FAQ updated successfully!" : "FAQ created successfully!");
      resetForm();
      setIsAddDialogOpen(false);
      setEditingItem(null);
      setCurrentPage(1); // Reset to first page after add/edit
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'FAQ',
    });
  };

  const handleEdit = (item: HelpSupportItem) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
    });
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (item: HelpSupportItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedItem(null);
    setDeleteDialogOpen(false);
    // Adjust current page if needed after deletion
    const remainingItems = faqs.length - 1;
    const maxPage = Math.ceil(remainingItems / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
    setTimeout(() => {
      handleRefresh();
    }, 300);
  };

  // Pagination logic
  const totalPages = Math.ceil(faqs.length / itemsPerPage);
  const paginatedFaqs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return faqs.slice(startIndex, endIndex);
  }, [faqs, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AdminLayout title="Content Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Content Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading content</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage Frequently Asked Questions (FAQs).</p>
          </div>
          <Dialog 
            open={isAddDialogOpen} 
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingItem(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  resetForm();
                  setFormData(prev => ({ ...prev, category: 'FAQ' }));
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter the question"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Answer *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Enter the answer"
                    className="min-h-32"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingItem ? 'Update FAQ' : 'Add FAQ'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-muted-foreground">Loading FAQs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : paginatedFaqs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No FAQs found. Click "Add FAQ" to create one.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedFaqs.map((faq) => (
                  <Card key={faq.id} className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{faq.title}</h4>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">{faq.content}</p>
                          <div className="text-sm text-gray-500">
                            Updated: {faq.updated_at ? new Date(faq.updated_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(faq)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(faq)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {/* Results count */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, faqs.length)} of {faqs.length} FAQs
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteContentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={selectedItem}
        onConfirm={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}
