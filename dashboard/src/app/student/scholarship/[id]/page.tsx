"use client";

import { useState, useEffect } from "react";
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
import { useSavedItems } from "@/hooks/useSavedItems";

interface Scholarship {
  id: number;
  name: string;
  organization_name: string | null;
  type: string | null;
  level: string | null;
  amount: number | null;
  location: string | null;
  deadline: string | null;
  description: string | null;
  study_levels: string[] | null;
  application_url: string | null;
  processing_time_weeks: number | null;
  applicant_count: number | null;
  rating: number | null;
  review_count: number | null;
  success_rate: number | null;
  eligibility_requirements: string[] | null;
  benefits_json: string[] | null;
  selection_process: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }> | null;
  partner_universities: Array<{
    name: string;
    country: string;
  }> | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
}

export default function ScholarshipDetail() {
  const params = useParams<{ id: string }>();
  const scholarshipId = params?.id ?? "1";
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isItemSaved, toggleSave } = useSavedItems();
  
  const isSaved = scholarship ? isItemSaved('scholarship', scholarship.id) : false;

  // Fetch scholarship data from backend
  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/scholarships/${scholarshipId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Scholarship not found');
          }
          throw new Error(`Failed to fetch scholarship: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('✅ Scholarship data fetched:', result.data);
          setScholarship(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Error fetching scholarship:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    };

    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId]);

  // Helper functions
  const formatAmount = (amount: number | null): string => {
    if (!amount) return 'Not specified';
    if (amount >= 100000) {
      return `Up to RM ${(amount / 1000).toFixed(0)}k`;
    }
    return `RM ${amount.toLocaleString()}`;
  };

  const formatApplicants = (count: number | null): string => {
    if (!count) return 'N/A';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  const getLevelDisplay = (studyLevels: string[] | null): string => {
    if (!studyLevels || studyLevels.length === 0) return 'Not specified';
    const levelMap: Record<string, string> = {
      'foundation': 'Foundation',
      'diploma': 'Diploma',
      'degree': 'Bachelor\'s Degree'
    };
    const levels = studyLevels.map(level => levelMap[level] || level).join(', ');
    return levels;
  };

  const formatProcessingTime = (weeks: number | null): string => {
    if (!weeks) return 'Not specified';
    if (weeks === 1) return '1 week';
    return `${weeks} weeks`;
  };

  if (loading) {
    return (
      <StudentLayout title="Scholarship Details">
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading scholarship details...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <StudentLayout title="Scholarship Details">
        <div className="space-y-6">
          <Link
            href="/student/scholarships"
            className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scholarship Search
          </Link>
          <Card className="backdrop-blur-xl bg-red-50/40 border-red-200/20 shadow-lg p-6">
            <p className="text-red-700">Error: {error || 'Scholarship not found'}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  const daysUntilDeadline = scholarship.deadline 
    ? Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // toggleSave is now provided by useSavedItems hook

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
                  <h1 className="text-3xl font-semibold text-foreground">{scholarship.name}</h1>
                  {scholarship.type && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {scholarship.type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">{scholarship.organization_name || 'Not specified'}</span>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">{scholarship.description || 'No description available.'}</p>
              </div>
              <div className="flex gap-2 ml-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (scholarship) {
                      await toggleSave('scholarship', scholarship.id);
                    }
                  }}
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
                    <p className="font-semibold text-foreground">{formatAmount(scholarship.amount)}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Application Deadline</p>
                    <p className="font-semibold text-foreground">
                      {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Not specified'}
                    </p>
                    {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                      <p className="text-xs text-red-600">{daysUntilDeadline} days left</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applicants</p>
                    <p className="font-semibold text-foreground">{formatApplicants(scholarship.applicant_count)}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold text-foreground">
                      {scholarship.rating ? `${scholarship.rating.toFixed(1)}/5.0` : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">{scholarship.review_count || 0} reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline Alert */}
            {daysUntilDeadline !== null && daysUntilDeadline > 0 && daysUntilDeadline <= 30 && (
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
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {scholarship.description || 'No detailed description available.'}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Study Level</h4>
                    <Badge variant="outline" className="mb-4">{getLevelDisplay(scholarship.study_levels)}</Badge>
                    
                    <h4 className="font-medium text-foreground mb-3">Study Location</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{scholarship.location || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div>
                    {scholarship.success_rate !== null && (
                      <>
                        <h4 className="font-medium text-foreground mb-3">Success Rate</h4>
                        <div className="flex items-center gap-3 mb-2">
                          <Progress value={scholarship.success_rate} className="flex-1" />
                          <span className="text-sm font-medium text-foreground">{scholarship.success_rate}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Application success rate</p>
                      </>
                    )}
                    
                    <h4 className="font-medium text-foreground mb-3">Processing Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatProcessingTime(scholarship.processing_time_weeks)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {scholarship.partner_universities && scholarship.partner_universities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Partner Universities</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {scholarship.partner_universities.map((university, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span className="text-muted-foreground">{university.name} ({university.country})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Eligibility Requirements</h3>
              {scholarship.eligibility_requirements && scholarship.eligibility_requirements.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {scholarship.eligibility_requirements.map((requirement, index) => (
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
                </>
              ) : (
                <p className="text-muted-foreground">No eligibility requirements specified.</p>
              )}
            </TabsContent>

            <TabsContent value="benefits" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Scholarship Benefits</h3>
              {scholarship.benefits_json && scholarship.benefits_json.length > 0 ? (
                <div className="space-y-3">
                  {scholarship.benefits_json.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No benefits specified.</p>
              )}
            </TabsContent>

            <TabsContent value="process" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Selection Process</h3>
              {scholarship.selection_process && scholarship.selection_process.length > 0 ? (
                <div className="space-y-4">
                  {scholarship.selection_process.map((step, index) => (
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
              ) : (
                <p className="text-muted-foreground">No selection process information available.</p>
              )}
            </TabsContent>

            <TabsContent value="contact" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {scholarship.website_url && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Website</p>
                        <a 
                          href={scholarship.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {scholarship.website_url}
                        </a>
                      </div>
                    </div>
                  )}
                  {scholarship.contact_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a 
                          href={`mailto:${scholarship.contact_email}`}
                          className="text-green-600 hover:text-green-700"
                        >
                          {scholarship.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {scholarship.contact_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Phone</p>
                        <a 
                          href={`tel:${scholarship.contact_phone}`}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          {scholarship.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {(!scholarship.website_url && !scholarship.contact_email && !scholarship.contact_phone) && (
                <p className="text-muted-foreground">No contact information available.</p>
              )}
              
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
                {scholarship.application_url ? (
                  <Button 
                    onClick={() => window.open(scholarship.application_url || undefined, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : scholarship.website_url ? (
                  <Button 
                    onClick={() => window.open(scholarship.website_url || undefined, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Visit Official Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
