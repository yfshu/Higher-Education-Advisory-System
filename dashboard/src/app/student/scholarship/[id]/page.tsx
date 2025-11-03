"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Clock,
  Award,
  FileText,
  Phone,
  Mail,
  Globe
} from "lucide-react";

export default function ScholarshipDetail() {
  const params = useParams<{ id: string }>();
  const scholarshipId = params?.id ?? "1";
  const [isSaved, setIsSaved] = useState(false);

  // Mock scholarship data - in real app, fetch based on id
  const scholarship = {
    id: scholarshipId,
    title: 'MARA Excellence Scholarship',
    organization: 'Majlis Amanah Rakyat (MARA)',
    type: 'Merit-based',
    amount: 'Up to RM 150,000',
    level: 'Bachelor\'s Degree',
    field: 'Engineering',
    location: 'Malaysia & Overseas',
    deadline: '2024-03-15',
    applicants: '2,500+',
    description: 'The MARA Excellence Scholarship is a prestigious full scholarship program designed to support outstanding SPM graduates in pursuing engineering degrees at top universities worldwide. This comprehensive scholarship covers all educational expenses and provides additional support for living costs.',
    detailedDescription: 'Established in 1966, the MARA Excellence Scholarship has been instrumental in developing Malaysia\'s engineering talent. The program focuses on nurturing future leaders in engineering fields who will contribute to Malaysia\'s technological advancement and economic growth. Recipients are expected to return to Malaysia upon completion of their studies to serve the nation.',
    requirements: [
      'SPM with minimum 8A+ grades',
      'Malaysian citizenship',
      'Family income below RM 5,000 per month',
      'Age below 19 years old',
      'Excellent co-curricular activities record',
      'Strong leadership qualities',
      'Good command of English and Bahasa Malaysia'
    ],
    benefits: [
      'Full tuition fees coverage',
      'Monthly living allowance (RM 2,000 - RM 3,500)',
      'Return airfare (for overseas studies)',
      'Medical insurance coverage',
      'Book and equipment allowances',
      'Thesis/research project funding',
      'Professional development opportunities'
    ],
    eligiblePrograms: [
      'Mechanical Engineering',
      'Electrical Engineering', 
      'Civil Engineering',
      'Chemical Engineering',
      'Computer Engineering',
      'Aerospace Engineering',
      'Biomedical Engineering'
    ],
    partnerUniversities: [
      'University of Cambridge (UK)',
      'Imperial College London (UK)',
      'National University of Singapore',
      'University of Melbourne (Australia)',
      'Universiti Teknologi Malaysia',
      'Universiti Malaya',
      'Universiti Putra Malaysia'
    ],
    selectionProcess: [
      {
        step: 1,
        title: 'Online Application',
        description: 'Submit application form with required documents',
        duration: '2 weeks'
      },
      {
        step: 2,
        title: 'Document Verification',
        description: 'MARA verifies all submitted documents and qualifications',
        duration: '3 weeks'
      },
      {
        step: 3,
        title: 'Written Assessment',
        description: 'Aptitude test and essay writing in English and Bahasa Malaysia',
        duration: '1 day'
      },
      {
        step: 4,
        title: 'Panel Interview',
        description: 'Face-to-face interview with MARA scholarship committee',
        duration: '1 day'
      },
      {
        step: 5,
        title: 'Final Selection',
        description: 'Successful candidates notified and scholarship offer extended',
        duration: '2 weeks'
      }
    ],
    contact: {
      website: 'https://www.mara.gov.my',
      email: 'scholarship@mara.gov.my',
      phone: '+603-2617 1000',
      address: 'Level 15, Menara MARA, 168 Jalan Ampang, 50450 Kuala Lumpur'
    },
    rating: 4.8,
    reviews: 124,
    successRate: 85,
    averageProcessingTime: '8-10 weeks'
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <StudentLayout title="Scholarship Details">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Link
          href="/student/scholarships"
          className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scholarship Search
        </Link>

        {/* Header Card */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-semibold text-foreground">{scholarship.title}</h1>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {scholarship.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">{scholarship.organization}</span>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">{scholarship.description}</p>
              </div>
              <div className="flex gap-2 ml-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSave}
                  className="backdrop-blur-sm bg-white/50 border-white/30"
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 mr-2 text-yellow-600" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/50 border-white/30">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Scholarship Amount</p>
                    <p className="font-semibold text-foreground">{scholarship.amount}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Application Deadline</p>
                    <p className="font-semibold text-foreground">{new Date(scholarship.deadline).toLocaleDateString()}</p>
                    <p className="text-xs text-red-600">{daysUntilDeadline} days left</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applicants</p>
                    <p className="font-semibold text-foreground">{scholarship.applicants}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold text-foreground">{scholarship.rating}/5.0</p>
                    <p className="text-xs text-muted-foreground">{scholarship.reviews} reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline Alert */}
            {daysUntilDeadline <= 30 && (
              <div className="backdrop-blur-sm bg-orange-50/50 border border-orange-200/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Application Deadline Approaching</p>
                    <p className="text-sm text-orange-700">
                      Only {daysUntilDeadline} days left to submit your application. Do not miss this opportunity!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Detailed Information Tabs */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm border-b border-white/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="process">Selection Process</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">About This Scholarship</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{scholarship.detailedDescription}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Study Level</h4>
                    <Badge variant="outline" className="mb-4">{scholarship.level}</Badge>
                    
                    <h4 className="font-medium text-foreground mb-3">Field of Study</h4>
                    <Badge variant="outline" className="mb-4">{scholarship.field}</Badge>
                    
                    <h4 className="font-medium text-foreground mb-3">Study Location</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{scholarship.location}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Success Rate</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <Progress value={scholarship.successRate} className="flex-1" />
                      <span className="text-sm font-medium text-foreground">{scholarship.successRate}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Application success rate</p>
                    
                    <h4 className="font-medium text-foreground mb-3">Processing Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{scholarship.averageProcessingTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-foreground mb-3">Eligible Engineering Programs</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {scholarship.eligiblePrograms.map((program, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">{program}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-foreground mb-3">Partner Universities</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {scholarship.partnerUniversities.map((university, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="text-muted-foreground">{university}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Eligibility Requirements</h3>
              <div className="space-y-3">
                {scholarship.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{requirement}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 backdrop-blur-sm bg-blue-50/40 border border-blue-200/30 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All requirements must be met to be eligible for this scholarship. 
                  Ensure you have all necessary documents before starting your application.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Scholarship Benefits</h3>
              <div className="space-y-3">
                {scholarship.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="process" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Selection Process</h3>
              <div className="space-y-4">
                {scholarship.selectionProcess.map((step, index) => (
                  <div key={index} className="flex gap-4 p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                      <p className="text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {step.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Website</p>
                      <a 
                        href={scholarship.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {scholarship.contact.website}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a 
                        href={`mailto:${scholarship.contact.email}`}
                        className="text-green-600 hover:text-green-700"
                      >
                        {scholarship.contact.email}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a 
                        href={`tel:${scholarship.contact.phone}`}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {scholarship.contact.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-muted-foreground">{scholarship.contact.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 backdrop-blur-sm bg-gray-50/40 border border-gray-200/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Office Hours:</strong> Monday - Friday, 8:30 AM - 5:00 PM (GMT+8)<br />
                  <strong>Response Time:</strong> Scholarship inquiries are typically responded to within 2-3 business days.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Action Buttons */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Apply?</h3>
                <p className="text-muted-foreground">Visit the official website to start your application process.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="backdrop-blur-sm bg-white/50 border-white/30">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Guide
                </Button>
                <Button 
                  onClick={() => window.open(scholarship.contact.website, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Visit Official Website
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
