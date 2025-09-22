import React, { useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function ContentManagement() {
  const [isAddFAQOpen, setIsAddFAQOpen] = useState(false);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });

  const faqs = [
    {
      id: 1,
      question: 'How does the AI recommendation system work?',
      answer: 'Our AI analyzes your academic background, interests, and preferences...',
      category: 'General',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      question: 'How can I improve my recommendation accuracy?',
      answer: 'Complete your profile with detailed information...',
      category: 'Recommendations',
      lastUpdated: '2024-01-10'
    }
  ];

  const systemMessages = [
    {
      id: 1,
      title: 'Welcome Message',
      content: 'Welcome to EduAdvisor! Start your educational journey today.',
      type: 'welcome',
      active: true
    },
    {
      id: 2,
      title: 'Maintenance Notice',
      content: 'System maintenance scheduled for this weekend.',
      type: 'notice',
      active: false
    }
  ];

  return (
    <AdminLayout title="Content Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Content Management</h2>
          <p className="text-gray-600">Manage FAQs, help content, and system messages.</p>
        </div>

        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList className="backdrop-blur-sm bg-white/50 border border-white/20">
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="messages">System Messages</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
              <Dialog open={isAddFAQOpen} onOpenChange={setIsAddFAQOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-xl bg-white/90 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New FAQ</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        value={newFAQ.question}
                        onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
                        placeholder="Enter the question"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Textarea
                        value={newFAQ.answer}
                        onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
                        placeholder="Enter the answer"
                        className="min-h-32"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddFAQOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddFAQOpen(false)}>
                        Add FAQ
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                        </div>
                        <p className="text-gray-600 mb-3">{faq.answer}</p>
                        <div className="text-sm text-gray-500">
                          Category: {faq.category} • Updated: {new Date(faq.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">System Messages</h3>
              <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Message
              </Button>
            </div>

            <div className="space-y-4">
              {systemMessages.map((message) => (
                <Card key={message.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {message.type === 'welcome' ? (
                            <Settings className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          )}
                          <h4 className="font-medium text-gray-900">{message.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            message.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {message.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Policies & Legal</h3>
              <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Policies
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Privacy Policy</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Last updated: January 1, 2024
                  </p>
                  <Button variant="outline" size="sm">Edit Policy</Button>
                </div>
              </Card>

              <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Terms of Service</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Last updated: January 1, 2024
                  </p>
                  <Button variant="outline" size="sm">Edit Terms</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}