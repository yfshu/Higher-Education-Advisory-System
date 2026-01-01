import { Injectable, Logger, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';
import { ProgramsService } from '../programs/programs.service';
import { ScholarshipsService } from '../scholarships/scholarships.service';
import OpenAI from 'openai';

type HelpSupportRow = Database['public']['Tables']['help_support']['Row'];
type HelpCategory = Database['public']['Enums']['help_category'];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class HelpService {
  private readonly logger = new Logger(HelpService.name);
  private readonly openai: OpenAI | null = null;
  private readonly rateLimitMap = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => ProgramsService))
    private readonly programsService: ProgramsService,
    @Inject(forwardRef(() => ScholarshipsService))
    private readonly scholarshipsService: ScholarshipsService,
  ) {
    // Initialize OpenAI client if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    }
  }

  /**
   * Fetch FAQs from help_support table
   */
  async getFAQs(limit: number = 8, searchQuery?: string): Promise<HelpSupportRow[]> {
    try {
      const db = this.supabaseService.getClient();

      let query = db
        .from('help_support')
        .select('*')
        .eq('category', 'FAQ')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Add search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = `%${searchQuery.trim()}%`;
        query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error fetching FAQs:', error);
        throw new BadRequestException(`Failed to fetch FAQs: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} FAQs`);
      return data || [];
    } catch (error) {
      this.logger.error('Exception in getFAQs:', error);
      throw error;
    }
  }

  /**
   * Check rate limit for a user/IP
   */
  private checkRateLimit(identifier: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(identifier);

    if (!userLimit || now > userLimit.resetAt) {
      // Reset or create new limit
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
  }

  /**
   * Validate message content
   */
  private validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || !message.trim()) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (message.length > 1000) {
      return { valid: false, error: 'Message is too long (max 1000 characters)' };
    }

    return { valid: true };
  }

  /**
   * Check if message is related to academic/system topics or is a polite acknowledgment
   */
  private isAcademicTopic(message: string): boolean {
    const academicKeywords = [
      'education', 'university', 'program', 'scholarship', 'foundation', 'diploma', 'degree',
      'bachelor', 'malaysia', 'malaysian', 'spm', 'stpm', 'application', 'admission',
      'tuition', 'fee', 'course', 'subject', 'career', 'job', 'backtoschool', 'system',
      'profile', 'recommendation', 'match', 'save', 'compare', 'search', 'filter',
      'how to', 'help', 'support', 'guide', 'tutorial', 'feature', 'function'
    ];

    // Gratitude and acknowledgment phrases (should be allowed)
    const acknowledgmentPhrases = [
      'thank', 'thanks', 'appreciate', 'grateful', 'alright', 'okay', 'ok', 'got it',
      'understood', 'sure', 'yes', 'no', 'maybe', 'i see', 'i understand', 'cool',
      'nice', 'great', 'awesome', 'perfect', 'good', 'fine', 'bye', 'goodbye',
      'see you', 'take care', 'have a good day'
    ];

    const lowerMessage = message.toLowerCase().trim();
    
    // Check if it's a simple acknowledgment (allow these)
    if (acknowledgmentPhrases.some(phrase => lowerMessage.includes(phrase))) {
      return true;
    }
    
    // Check if it contains academic keywords
    return academicKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Detect if the query is asking about programs
   */
  private isProgramQuery(message: string): boolean {
    const programKeywords = [
      'program', 'programme', 'course', 'foundation', 'diploma', 'degree', 'bachelor',
      'engineering', 'business', 'medicine', 'computer', 'science', 'arts', 'law',
      'accounting', 'finance', 'marketing', 'management', 'what programs', 'which programs',
      'available programs', 'list programs', 'show programs', 'find programs'
    ];
    const lowerMessage = message.toLowerCase();
    return programKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Detect if the query is asking about scholarships
   */
  private isScholarshipQuery(message: string): boolean {
    const scholarshipKeywords = [
      'scholarship', 'financial aid', 'funding', 'grant', 'bursary', 'what scholarships',
      'which scholarships', 'available scholarships', 'list scholarships', 'show scholarships',
      'find scholarships', 'scholarship opportunities'
    ];
    const lowerMessage = message.toLowerCase();
    return scholarshipKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Fetch relevant programs based on query
   */
  private async fetchRelevantPrograms(message: string): Promise<string> {
    try {
      const allPrograms = await this.programsService.getPrograms();
      
      // Extract keywords from message to filter programs
      const lowerMessage = message.toLowerCase();
      const relevantPrograms = allPrograms
        .filter(program => {
          const programName = (program.name || '').toLowerCase();
          const description = (program.description || '').toLowerCase();
          const level = (program.level || '').toLowerCase();
          const tags = Array.isArray(program.tags) 
            ? program.tags.map(t => String(t).toLowerCase()).join(' ')
            : '';
          
          const searchText = `${programName} ${description} ${level} ${tags}`;
          
          // Check if any word from the message appears in the program
          const messageWords = lowerMessage.split(/\s+/).filter(w => w.length > 3);
          return messageWords.some(word => searchText.includes(word)) || 
                 programName.includes(lowerMessage) ||
                 description.includes(lowerMessage);
        })
        .slice(0, 10); // Limit to top 10 most relevant

      if (relevantPrograms.length === 0) {
        return `I have information about ${allPrograms.length} programs available, but none specifically match what you're looking for. Here's what I know:
- We have ${allPrograms.length} programs available
- Program levels: Foundation, Diploma, and Bachelor's Degree programs
- Various fields of study available

You can search for specific programs on the Search Programs page.`;
      }

      // Format programs for AI context
      const programsInfo = relevantPrograms.map((p, idx) => {
        const university = p.university;
        const location = university 
          ? `${university.city || ''}${university.city && university.state ? ', ' : ''}${university.state || ''}`
          : 'Location not specified';
        const fee = (p as any).tuition_fee_amount 
          ? `RM ${(p as any).tuition_fee_amount.toLocaleString()} ${(p as any).tuition_fee_period || 'per period'}`
          : 'Fee information available on program page';
        const duration = (p as any).duration_months 
          ? `${(p as any).duration_months} months`
          : p.duration || 'Duration varies';

        return `${idx + 1}. **${p.name}** (${p.level || 'N/A'})
   - University: ${university?.name || 'Not specified'}
   - Location: ${location}
   - Duration: ${duration}
   - Tuition: ${fee}
   - Description: ${(p.description || '').substring(0, 150)}${p.description && p.description.length > 150 ? '...' : ''}`;
      }).join('\n\n');

      return `Here are ${relevantPrograms.length} programs that might interest you:\n\n${programsInfo}\n\nYou can view more details about any program by visiting the program detail page.`;
    } catch (error) {
      this.logger.error('Error fetching programs for AI context:', error);
      return 'I can help you find program information. Please try searching on the Programs page for more details.';
    }
  }

  /**
   * Fetch relevant scholarships based on query
   */
  private async fetchRelevantScholarships(message: string): Promise<string> {
    try {
      const allScholarships = await this.scholarshipsService.getScholarships();
      
      // Extract keywords from message to filter scholarships
      const lowerMessage = message.toLowerCase();
      const relevantScholarships = allScholarships
        .filter(scholarship => {
          const name = (scholarship.name || '').toLowerCase();
          const description = (scholarship.description || '').toLowerCase();
          const organization = (scholarship.organization_name || '').toLowerCase();
          const type = (scholarship.type || '').toLowerCase();
          
          const searchText = `${name} ${description} ${organization} ${type}`;
          
          // Check if any word from the message appears in the scholarship
          const messageWords = lowerMessage.split(/\s+/).filter(w => w.length > 3);
          return messageWords.some(word => searchText.includes(word)) || 
                 name.includes(lowerMessage) ||
                 description.includes(lowerMessage);
        })
        .slice(0, 10); // Limit to top 10 most relevant

      if (relevantScholarships.length === 0) {
        return `I know about ${allScholarships.length} scholarships available, but none specifically match what you're looking for. Here's what I can tell you:
- We have ${allScholarships.length} scholarships available
- Various types: Merit-based, Need-based, Academic, and others
- Available for Foundation, Diploma, and Degree programs

You can search for specific scholarships on the Scholarships page.`;
      }

      // Format scholarships for AI context
      const scholarshipsInfo = relevantScholarships.map((s, idx) => {
        const amount = s.amount 
          ? `RM ${s.amount.toLocaleString()}`
          : 'Amount varies';
        const deadline = s.deadline 
          ? new Date(s.deadline).toLocaleDateString()
          : 'Check scholarship page';
        const levels = Array.isArray((s as any).study_levels) && (s as any).study_levels.length > 0
          ? (s as any).study_levels.join(', ')
          : 'All levels';

        return `${idx + 1}. **${s.name}**
   - Organization: ${s.organization_name || 'Not specified'}
   - Type: ${s.type || 'N/A'}
   - Amount: ${amount}
   - Study Levels: ${levels}
   - Deadline: ${deadline}
   - Location: ${s.location || 'Various locations'}
   - Description: ${(s.description || '').substring(0, 150)}${s.description && s.description.length > 150 ? '...' : ''}`;
      }).join('\n\n');

      return `Here are ${relevantScholarships.length} scholarships that might interest you:\n\n${scholarshipsInfo}\n\nYou can view more details and apply for any scholarship by visiting the scholarship detail page.`;
    } catch (error) {
      this.logger.error('Error fetching scholarships for AI context:', error);
      return 'I can help you find scholarship information. Please try searching on the Scholarships page for more details.';
    }
  }

  /**
   * Handle AI chat request
   */
  async handleAIChat(
    message: string,
    history: ChatMessage[],
    userIdentifier: string,
  ): Promise<string> {
    try {
      // Validate message
      const validation = this.validateMessage(message);
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }

      // Check rate limit
      if (!this.checkRateLimit(userIdentifier)) {
        throw new BadRequestException('Rate limit exceeded. Please wait a moment before sending another message.');
      }

      // Check if topic is academic/system related
      if (!this.isAcademicTopic(message)) {
        return "I'm here to help with questions about Malaysian education, university programs, scholarships, and how to use the BackToSchool platform. Could you please ask a question related to these topics?";
      }

      // Check if OpenAI is available
      if (!this.openai) {
        this.logger.error('OpenAI client not initialized');
        return "I'm sorry, the AI assistant is currently unavailable. Please try again later or contact support for assistance.";
      }

      // Fetch relevant information if query is about programs or scholarships
      let databaseContext = '';
      if (this.isProgramQuery(message)) {
        this.logger.log('Detected program query, fetching relevant programs...');
        databaseContext = await this.fetchRelevantPrograms(message);
      } else if (this.isScholarshipQuery(message)) {
        this.logger.log('Detected scholarship query, fetching relevant scholarships...');
        databaseContext = await this.fetchRelevantScholarships(message);
      }

      // Prepare enhanced system prompt with human-like personality
      const systemPrompt = `You are a friendly and knowledgeable academic advisor for the BackToSchool platform, a Malaysian higher education advisory system. You help students navigate their educational journey with warmth, empathy, and expertise.

**Your Personality:**
- Be conversational, warm, and approachable - like talking to a helpful friend who knows a lot about Malaysian education
- Use natural, friendly language (avoid overly formal or robotic responses)
- Show enthusiasm when helping students find the right programs or scholarships
- Be empathetic and understanding of students' concerns and questions
- Occasionally use encouraging phrases like "That's a great question!" or "I'd be happy to help with that!"

**Your Knowledge Base:**
You have comprehensive knowledge about:
- All available university programs in Malaysia (Foundation, Diploma, Bachelor's Degree)
- All available scholarships and financial aid opportunities
- University details, locations, and contact information
- Program details including tuition fees, duration, entry requirements
- Scholarship details including amounts, deadlines, eligibility criteria

**When answering questions:**
1. If the user asks about programs or scholarships, use the information provided in the context naturally - as if it's knowledge you have
2. Reference specific programs/scholarships by name when relevant
3. Provide practical, actionable advice
4. Guide users on how to use BackToSchool features (search, save items, compare, etc.)
5. Never mention "database", "data", "system", or "information from" - just present facts naturally
6. If you don't have specific information, suggest where they can find it on the platform

**Topics you can help with:**
- Malaysian education pathways (SPM, STPM, Foundation, Diploma, Bachelor programs)
- Universities in Malaysia
- Scholarships available in Malaysia
- How to use BackToSchool features (recommendations, saved items, profile, search, etc.)
- Application processes and deadlines
- Entry requirements and qualifications

**Handling Gratitude and Acknowledgments:**
When users say "thank you", "thanks", "alright", "okay", "got it", or similar acknowledgments:
- Respond warmly and naturally (e.g., "You're welcome!", "Happy to help!", "Anytime!", "Glad I could assist!")
- Keep it brief and friendly (1-2 sentences)
- Optionally offer to help with more questions
- Examples: 
  * "You're very welcome! Feel free to ask if you need anything else about Malaysian education or BackToSchool."
  * "Happy to help! Let me know if you have any other questions."
  * "Anytime! I'm here whenever you need assistance with programs, scholarships, or using BackToSchool."

**If asked about unrelated topics:**
Politely but warmly redirect: "I'm here specifically to help with Malaysian education and the BackToSchool platform. Is there something about programs, scholarships, or using our system that I can help you with instead?"

**Response Style:**
- Keep responses conversational but informative
- Use 2-4 sentences per paragraph for readability
- Include specific examples when helpful
- End with a helpful follow-up question or suggestion when appropriate`;

      // Prepare messages for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add context information if available (presented as the AI's knowledge, not as database data)
      if (databaseContext) {
        messages.push({
          role: 'system',
          content: `**Information Available (use this to answer the user's question naturally):**\n\n${databaseContext}\n\nUse this information to provide specific, accurate answers. Reference program/scholarship names, universities, amounts, and other details naturally - as if this is information you know, not data from a database. Never mention "database", "data", or "system" when referring to this information. Just present it naturally as knowledge you have.`,
        });
      }

      // Add conversation history (last 8 messages to maintain context)
      const recentHistory = history.slice(-8);
      recentHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      // Add current user message
      messages.push({
        role: 'user',
        content: message.trim(),
      });

      // Call OpenAI API with enhanced settings for more human-like responses
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.8, // Slightly higher for more natural, varied responses
        max_tokens: 600, // Increased for more detailed, helpful responses
        presence_penalty: 0.3, // Encourage more varied vocabulary
        frequency_penalty: 0.3, // Reduce repetition
      });

      const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

      this.logger.log(`AI chat response generated for user ${userIdentifier}`);
      return reply;
    } catch (error) {
      this.logger.error('Exception in handleAIChat:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Return friendly error message
      return "I'm sorry, I encountered an error processing your request. Please try again or contact support for assistance.";
    }
  }

  /**
   * Get all help support items (FAQs, System Messages, Policies) for admin
   */
  async getAllHelpSupport(category?: string): Promise<any[]> {
    try {
      const db = this.supabaseService.getClient();

      let query = db
        .from('help_support')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category as any); // Type assertion for enum
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error fetching help support items:', error);
        throw new Error(`Failed to fetch help support items: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} help support items`);
      return data || [];
    } catch (error) {
      this.logger.error('Exception in getAllHelpSupport:', error);
      throw error;
    }
  }

  /**
   * Create a new help support item
   */
  async createHelpSupport(helpData: any): Promise<any> {
    try {
      const db = this.supabaseService.getClient();

      // Ensure category defaults to 'FAQ' if not provided
      if (!helpData.category) {
        helpData.category = 'FAQ';
      }

      const { data, error } = await db
        .from('help_support')
        .insert(helpData)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating help support item:', error);
        throw new Error(`Failed to create help support item: ${error.message}`);
      }

      this.logger.log(`Successfully created help support item: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in createHelpSupport:', error);
      throw error;
    }
  }

  /**
   * Update an existing help support item
   */
  async updateHelpSupport(id: number, helpData: any): Promise<any> {
    try {
      const db = this.supabaseService.getClient();

      // Add updated_at timestamp
      helpData.updated_at = new Date().toISOString();

      const { data, error } = await db
        .from('help_support')
        .update(helpData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Help support item with id ${id} not found for update`);
          throw new Error('Help support item not found');
        }
        this.logger.error('Error updating help support item:', error);
        throw new Error(`Failed to update help support item: ${error.message}`);
      }

      this.logger.log(`Successfully updated help support item: ${id}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in updateHelpSupport:', error);
      throw error;
    }
  }

  /**
   * Delete a help support item
   */
  async deleteHelpSupport(id: number): Promise<void> {
    try {
      const db = this.supabaseService.getClient();

      const { error } = await db
        .from('help_support')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Help support item with id ${id} not found for deletion`);
          throw new Error('Help support item not found');
        }
        this.logger.error('Error deleting help support item:', error);
        throw new Error(`Failed to delete help support item: ${error.message}`);
      }

      this.logger.log(`Successfully deleted help support item: ${id}`);
    } catch (error) {
      this.logger.error('Exception in deleteHelpSupport:', error);
      throw error;
    }
  }
}

