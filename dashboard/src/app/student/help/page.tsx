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
import { HelpCircle, Search, MessageCircle, Phone, Mail } from "lucide-react";

export default function StudentHelp() {
  const faqs = [
    {
      question: "How does the AI recommendation system work?",
      answer: "Our AI analyzes your SPM/STPM results, interests, and career preferences to match you with suitable Malaysian university programs. The system considers factors like your academic grades, field of interest, location preferences within Malaysia, and career goals in the local job market."
    },
    {
      question: "How can I improve my recommendation accuracy?",
      answer: "Complete your profile with detailed information about your SPM/STPM results, co-curricular activities, interests, and career preferences. Include information about which Malaysian states you prefer to study in and your budget considerations."
    },
    {
      question: "What does the match percentage mean?",
      answer: "The match percentage indicates how well a Malaysian university program aligns with your academic results, interests, and preferences. Higher percentages suggest better compatibility based on our AI analysis of local university requirements and your profile."
    },
    {
      question: "What Malaysian qualifications are accepted?",
      answer: "We accept SPM, STPM, Diploma, Matriculation, A-Levels, IB, and other recognized qualifications. Each university may have specific requirements, which our system takes into account when making recommendations."
    },
    {
      question: "How do I understand university fees in Malaysia?",
      answer: "Malaysian public university fees are typically quoted per semester and range from RM 2,500-5,000 per semester for local students. Private universities may charge higher fees. Our system shows all costs clearly including any additional fees."
    },
    {
      question: "When is the application period for Malaysian universities?",
      answer: "Most Malaysian universities have their main intake in July/August. Some universities also offer January intake. Application deadlines are typically 2-4 months before the intake period. Our system tracks all important deadlines for you."
    }
  ];

  return (
    <StudentLayout title="Help & Support">
      <div className="space-y-6">
        <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">How can we help you?</h2>
              <p className="text-gray-600">Find answers to common questions about Malaysian university applications and our platform</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search for help about Malaysian universities..."
              className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
            />
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col backdrop-blur-sm bg-white/50">
                <MessageCircle className="w-6 h-6 mb-2 text-blue-600" />
                <span className="font-medium">Live Chat</span>
                <span className="text-sm text-gray-500">Available 24/7</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col backdrop-blur-sm bg-white/50">
                <Mail className="w-6 h-6 mb-2 text-green-600" />
                <span className="font-medium">Email Support</span>
                <span className="text-sm text-gray-500">support@backtoschool.my</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col backdrop-blur-sm bg-white/50">
                <Phone className="w-6 h-6 mb-2 text-purple-600" />
                <span className="font-medium">Phone Support</span>
                <span className="text-sm text-gray-500">+603-2123 4567</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
