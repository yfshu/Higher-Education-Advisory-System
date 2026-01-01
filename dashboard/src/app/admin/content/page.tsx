"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { DeleteContentDialog } from "@/components/admin/DeleteContentDialog";

interface HelpSupportItem {
  id: number;
  title: string;
  content: string;
  category: 'FAQ' | 'System Message' | 'Policy';
  created_at: string | null;
  updated_at: string | null;
}

export default function ContentManagement() {
  const { userData } = useUser();
  const [faqs, setFaqs] = useState<HelpSupportItem[]>([]);
  const [systemMessages, setSystemMessages] = useState<HelpSupportItem[]>([]);
  const [policies, setPolicies] = useState<HelpSupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HelpSupportItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HelpSupportItem | null>(null);
  const [activeTab, setActiveTab] = useState('faqs');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'FAQ' as 'FAQ' | 'System Message' | 'Policy',
  });

  const handleRefresh = useCallback(async () => {
    if (!userData?.accessToken) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const [faqsRes, messagesRes, policiesRes] = await Promise.all([
        fetch(`${backendUrl}/api/help/content?category=FAQ&t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        }),
        fetch(`${backendUrl}/api/help/content?category=System Message&t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        }),
        fetch(`${backendUrl}/api/help/content?category=Policy&t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        }),
      ]);

      const [faqsResult, messagesResult, policiesResult] = await Promise.all([
        faqsRes.json(),
        messagesRes.json(),
        policiesRes.json(),
      ]);

      if (faqsResult.success && faqsResult.data) {
        setFaqs(faqsResult.data);
      }
      if (messagesResult.success && messagesResult.data) {
        setSystemMessages(messagesResult.data);
      }
      if (policiesResult.success && policiesResult.data) {
        setPolicies(policiesResult.data);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [userData?.accessToken]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };

      let response;
      if (editingItem) {
        response = await fetch(`${backendUrl}/api/help/content/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/api/help/content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save content");
      }

      toast.success(editingItem ? "Content updated successfully!" : "Content created successfully!");
      resetForm();
      setIsAddDialogOpen(false);
      setEditingItem(null);
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save content");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: activeTab === 'faqs' ? 'FAQ' : activeTab === 'messages' ? 'System Message' : 'Policy',
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
    setTimeout(() => {
      handleRefresh();
    }, 300);
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'faqs': return faqs;
      case 'messages': return systemMessages;
      case 'policies': return policies;
      default: return [];
    }
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
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage FAQs, help content, and system messages.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-white/20">
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="messages">System Messages</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h3>
              <Dialog open={isAddDialogOpen && (!editingItem || editingItem.category === 'FAQ')} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  setEditingItem(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-slate-700 hover:bg-slate-800 text-white"
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

            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No FAQs found. Click "Add FAQ" to create one.
                </div>
              ) : (
                faqs.map((faq) => (
                  <Card key={faq.id} className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{faq.title}</h4>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{faq.content}</p>
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Messages</h3>
              <Dialog open={isAddDialogOpen && (!editingItem || editingItem.category === 'System Message')} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  setEditingItem(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                    onClick={() => {
                      resetForm();
                      setFormData(prev => ({ ...prev, category: 'System Message' }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit System Message' : 'Add New System Message'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Enter message title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content *</Label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Enter message content"
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
                          editingItem ? 'Update Message' : 'Add Message'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {systemMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No system messages found. Click "Add Message" to create one.
                </div>
              ) : (
                systemMessages.map((message) => (
                  <Card key={message.id} className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-green-600" />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{message.title}</h4>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{message.content}</p>
                          <div className="text-sm text-gray-500 mt-2">
                            Updated: {message.updated_at ? new Date(message.updated_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(message)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(message)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Policies & Legal</h3>
              <Dialog open={isAddDialogOpen && (!editingItem || editingItem.category === 'Policy')} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  setEditingItem(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                    onClick={() => {
                      resetForm();
                      setFormData(prev => ({ ...prev, category: 'Policy' }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Policy' : 'Add New Policy'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Policy Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Privacy Policy"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Policy Content *</Label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Enter policy content"
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
                          editingItem ? 'Update Policy' : 'Add Policy'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {policies.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No policies found. Click "Add Policy" to create one.
                </div>
              ) : (
                policies.map((policy) => (
                  <Card key={policy.id} className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{policy.title}</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {policy.content}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        Last updated: {policy.updated_at ? new Date(policy.updated_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(policy)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(policy)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
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
