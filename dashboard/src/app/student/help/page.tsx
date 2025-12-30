"use client";

import { useState, useEffect, useRef } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  Search, 
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface FAQ {
  id: number;
  title: string;
  content: string | null;
  category: string | null;
  created_at: string | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function StudentHelp() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch FAQs on mount and when search changes
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const url = new URL(`${backendUrl}/api/help/faq`);
        url.searchParams.set('limit', '8');
        if (searchQuery.trim()) {
          url.searchParams.set('search', searchQuery.trim());
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(`Failed to fetch FAQs: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setFaqs(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [searchQuery]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatError(null);

    // Add user message to chat
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/help/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages.slice(-8), // Send last 8 messages for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get AI response: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.reply) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: result.reply };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setChatError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if there was an error
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.title.toLowerCase().includes(query) ||
      (faq.content && faq.content.toLowerCase().includes(query))
    );
  });

  return (
    <StudentLayout title="Help & Support">
      <div className="space-y-6">
        {/* Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">How can we help you?</h2>
              <p className="text-muted-foreground">Find answers to common questions about Malaysian university applications and our platform</p>
            </div>
          </div>
        </div>

        {/* Tabs for FAQ and AI Chat */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2 backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg p-1 h-12">
            <TabsTrigger 
              value="faq" 
              className="flex items-center gap-2 h-10 rounded-lg backdrop-blur-sm bg-white/20 border border-transparent hover:bg-white/40 hover:border-blue-200/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-2 h-10 rounded-lg backdrop-blur-sm bg-white/20 border border-transparent hover:bg-white/40 hover:border-purple-200/50 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-600 data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6 mt-6">
            {/* Search Bar */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search FAQs about Malaysian universities, programs, scholarships..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>
              </div>
            </Card>

            {/* FAQs List */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Frequently Asked Questions
                  {searchQuery && <span className="text-sm text-muted-foreground ml-2">({filteredFAQs.length} results)</span>}
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-muted-foreground">Loading FAQs...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-600 py-4">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                ) : filteredFAQs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No FAQs found{searchQuery && ` matching "${searchQuery}"`}.</p>
                    <p className="text-sm mt-2">Try a different search term or check back later.</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible>
                    {filteredFAQs.map((faq) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <AccordionTrigger>{faq.title}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {faq.content || 'No content available.'}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6 mt-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">AI Academic Assistant</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask questions about Malaysian education, programs, scholarships, and how to use BackToSchool
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm h-96 overflow-y-auto p-4 mb-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="text-muted-foreground">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Start a conversation</p>
                        <p className="text-sm mt-1">Ask me about Malaysian universities, programs, scholarships, or how to use BackToSchool!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/60 backdrop-blur-sm text-foreground border border-white/30'
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Error Message */}
                {chatError && (
                  <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50/50 border border-red-200/30 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4" />
                    <span>{chatError}</span>
                  </div>
                )}

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about Malaysian education, programs, scholarships, or how to use BackToSchool..."
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                    disabled={chatLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                  >
                    {chatLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Ask about Malaysian universities, Foundation/Diploma/Degree programs, scholarships, or BackToSchool features
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
