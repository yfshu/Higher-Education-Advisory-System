"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Award,
  Loader2,
  X,
  FileText,
  GraduationCap,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { DeleteScholarshipDialog } from "@/components/admin/DeleteScholarshipDialog";

interface Scholarship {
  id: number;
  name: string;
  provider: string | null;
  amount: number | null;
  type: 'Merit-based' | 'Need-based' | 'Academic' | 'Other' | null;
  location: string | null;
  deadline: string | null;
    status: 'active' | 'expired' | 'draft' | null;
  description: string | null;
  level: string | null;
  field_id: number | null;
  success_rate: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  processing_time_weeks: number | null;
  applicant_count: number | null;
  rating: number | null;
  review_count: number | null;
  eligibility_requirements: any;
  benefits_json: any;
  benefits: any; // Legacy field
  selection_process: any;
  partner_universities: any;
  application_url: string | null;
}

interface FieldOfInterest {
  id: number;
  name: string;
  description?: string | null;
}

export default function ScholarshipManagement() {
  const { userData } = useUser();
  const [fields, setFields] = useState<FieldOfInterest[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    amount: '',
    type: 'Merit-based' as 'Merit-based' | 'Need-based' | 'Academic' | 'Other',
    location: '',
    deadline: '',
    description: '',
    status: 'active' as 'active' | 'expired' | 'draft',
    level: '',
    field_id: '',
    success_rate: '',
    contact_email: '',
    contact_phone: '',
    processing_time_weeks: '',
    applicant_count: '',
    rating: '',
    review_count: '',
    application_url: '',
  });

  // Structured form builders for eligibility + json fields
  const [eligibilityPairs, setEligibilityPairs] = useState<Array<{key: string, value: string}>>([]);
  const [benefitsPairs, setBenefitsPairs] = useState<Array<{key: string, value: string}>>([]);
  const [selectionSteps, setSelectionSteps] = useState<Array<{ title: string; description: string; duration: string }>>([]);
  const [partnerUniversities, setPartnerUniversities] = useState<Array<{ name: string; country: string }>>([]);

  // Fetch fields of interest for dropdown
  useEffect(() => {
    const fetchFields = async () => {
      if (!isAddDialogOpen) return;
      try {
        setFieldsLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const res = await fetch(`${backendUrl}/api/fields`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load fields");
        const data = await res.json();
        setFields(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load Field of Interest list");
      } finally {
        setFieldsLoading(false);
      }
    };
    fetchFields();
  }, [isAddDialogOpen]);

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
      const response = await fetch(`${backendUrl}/api/scholarships?all=true&t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scholarships: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log(`✅ Fetched ${result.data.length} scholarships (count: ${result.count})`);
        setScholarships(result.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setError(err instanceof Error ? err.message : "Failed to load scholarships");
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }, [userData?.accessToken]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scholarship.status === filterStatus;
    const matchesType = filterType === 'all' || scholarship.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScholarships = filteredScholarships.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      // Basic validation
      if (!formData.name.trim()) {
        toast.error("Scholarship Name is required.");
        return;
      }
      if (!formData.level.trim()) {
        toast.error("Level is required.");
        return;
      }
      if (!formData.field_id || isNaN(Number(formData.field_id))) {
        toast.error("Field of Interest is required.");
        return;
      }
      if (!formData.contact_email.trim()) {
        toast.error("Contact Email is required.");
        return;
      }
      if (!formData.contact_phone.trim()) {
        toast.error("Contact Phone is required.");
        return;
      }
      const successRateNum = Number(formData.success_rate);
      if (formData.success_rate === '' || isNaN(successRateNum) || successRateNum < 0 || successRateNum > 100) {
        toast.error("Success Rate must be between 0 and 100.");
        return;
      }
      const ratingNum = Number(formData.rating);
      if (formData.rating === '' || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
        toast.error("Rating must be between 0.0 and 5.0.");
        return;
      }
      const reviewCountNum = Number(formData.review_count);
      if (formData.review_count === '' || isNaN(reviewCountNum) || reviewCountNum < 0) {
        toast.error("Review Count is required (0 or more).");
        return;
      }
      const applicantCountNum = Number(formData.applicant_count);
      if (formData.applicant_count === '' || isNaN(applicantCountNum) || applicantCountNum < 0) {
        toast.error("Applicant Count is required (0 or more).");
        return;
      }
      const processingWeeksNum = Number(formData.processing_time_weeks);
      if (formData.processing_time_weeks === '' || isNaN(processingWeeksNum) || processingWeeksNum < 0) {
        toast.error("Processing Time (weeks) is required (0 or more).");
        return;
      }
      if (eligibilityPairs.length === 0 || !eligibilityPairs.some(p => p.key.trim() && p.value.trim())) {
        toast.error("Please add at least 1 Eligibility Requirement.");
        return;
      }
      if (benefitsPairs.length === 0 || !benefitsPairs.some(p => p.key.trim() && p.value.trim())) {
        toast.error("Please add at least 1 Benefit.");
        return;
      }
      if (selectionSteps.length === 0 || !selectionSteps.some(s => s.title.trim())) {
        toast.error("Please add at least 1 Selection Process step.");
        return;
      }
      if (partnerUniversities.length === 0 || !partnerUniversities.some(p => p.name.trim())) {
        toast.error("Please add at least 1 Partner University.");
        return;
      }

      // Prepare payload
      const payload: any = {
        name: formData.name,
        provider: formData.provider || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        type: formData.type || null,
        location: formData.location || null,
        deadline: formData.deadline || null,
        description: formData.description || null,
        status: formData.status || 'active',
        application_url: formData.application_url || null,
        level: formData.level || null,
        field_id: Number(formData.field_id),
        success_rate: successRateNum,
        contact_email: formData.contact_email.trim(),
        contact_phone: formData.contact_phone.trim(),
        processing_time_weeks: processingWeeksNum,
        applicant_count: applicantCountNum,
        rating: ratingNum,
        review_count: reviewCountNum,
      };

      // Convert structured eligibility pairs to JSON object
      if (eligibilityPairs.length > 0) {
        const eligibilityObj: any = {};
        eligibilityPairs.forEach(pair => {
          if (pair.key.trim() && pair.value.trim()) {
            eligibilityObj[pair.key.trim()] = pair.value.trim();
          }
        });
        payload.eligibility_requirements = Object.keys(eligibilityObj).length > 0 ? eligibilityObj : null;
      } else {
        payload.eligibility_requirements = null;
      }

      // Convert structured benefits pairs to JSON object
      if (benefitsPairs.length > 0) {
        const benefitsObj: any = {};
        benefitsPairs.forEach(pair => {
          if (pair.key.trim() && pair.value.trim()) {
            benefitsObj[pair.key.trim()] = pair.value.trim();
          }
        });
        payload.benefits_json = Object.keys(benefitsObj).length > 0 ? benefitsObj : null;
      } else {
        payload.benefits_json = null;
      }

      payload.selection_process = selectionSteps
        .filter(s => s.title.trim())
        .map((s, idx) => ({
          step: idx + 1,
          title: s.title.trim(),
          description: s.description?.trim() || "",
          duration: s.duration?.trim() || "",
        }));

      payload.partner_universities = partnerUniversities
        .filter(p => p.name.trim())
        .map(p => ({ name: p.name.trim(), country: p.country?.trim() || "" }));

      let response;
      if (editingScholarship) {
        response = await fetch(`${backendUrl}/api/scholarships/${editingScholarship.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/api/scholarships`, {
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
        throw new Error(errorData.message || "Failed to save scholarship");
      }

      toast.success(editingScholarship ? "Scholarship updated successfully!" : "Scholarship created successfully!");
      resetForm();
      setIsAddDialogOpen(false);
      setEditingScholarship(null);
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error("Error saving scholarship:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save scholarship");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      amount: '',
      type: 'Merit-based',
      location: '',
      deadline: '',
      description: '',
      status: 'active',
      level: '',
      field_id: '',
      success_rate: '',
      contact_email: '',
      contact_phone: '',
      processing_time_weeks: '',
      applicant_count: '',
      rating: '',
      review_count: '',
      application_url: '',
    });
    setEligibilityPairs([]);
    setBenefitsPairs([]);
    setSelectionSteps([]);
    setPartnerUniversities([]);
  };

  const handleEdit = (scholarship: Scholarship) => {
    console.log('🔍 Editing scholarship:', scholarship);
    
    setFormData({
      name: scholarship.name || '',
      provider: scholarship.provider || '',
      amount: scholarship.amount?.toString() || '',
      type: scholarship.type || 'Merit-based',
      location: scholarship.location || '',
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '', // Format date for input
      description: scholarship.description || '',
      status: scholarship.status || 'active',
      level: scholarship.level || '',
      field_id: scholarship.field_id?.toString() || '',
      success_rate: scholarship.success_rate?.toString() || '',
      contact_email: scholarship.contact_email || '',
      contact_phone: scholarship.contact_phone || '',
      processing_time_weeks: scholarship.processing_time_weeks?.toString() || '',
      applicant_count: scholarship.applicant_count?.toString() || '',
      rating: scholarship.rating?.toString() || '',
      review_count: scholarship.review_count?.toString() || '',
      application_url: scholarship.application_url || '',
    });

    // Parse eligibility_requirements into structured pairs
    try {
      let eligibilityData = scholarship.eligibility_requirements;
      console.log('🔍 Raw eligibility_requirements:', eligibilityData);
      
      if (typeof eligibilityData === 'string') {
        try {
          eligibilityData = JSON.parse(eligibilityData);
        } catch {
          // If it's a plain string, wrap it
          eligibilityData = { requirements: eligibilityData };
        }
      }
      
      if (eligibilityData && typeof eligibilityData === 'object' && !Array.isArray(eligibilityData)) {
        const pairs = Object.entries(eligibilityData).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        console.log('🔍 Parsed eligibility pairs:', pairs);
        setEligibilityPairs(pairs.length > 0 ? pairs : []);
      } else if (Array.isArray(eligibilityData)) {
        // Handle array format
        const pairs = eligibilityData.map((item, idx) => ({
          key: `requirement_${idx + 1}`,
          value: String(item)
        }));
        setEligibilityPairs(pairs.length > 0 ? pairs : []);
      } else {
        setEligibilityPairs([]);
      }
    } catch (err) {
      console.error('Error parsing eligibility_requirements:', err);
      setEligibilityPairs([]);
    }

    // Parse benefits_json into structured pairs
    try {
      let benefitsData = scholarship.benefits_json || scholarship.benefits;
      console.log('🔍 Raw benefits_json:', benefitsData);
      
      if (typeof benefitsData === 'string') {
        try {
          benefitsData = JSON.parse(benefitsData);
        } catch {
          // If it's a plain string, wrap it
          benefitsData = { benefits: benefitsData };
        }
      }
      
      if (benefitsData && typeof benefitsData === 'object' && !Array.isArray(benefitsData)) {
        const pairs = Object.entries(benefitsData).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        console.log('🔍 Parsed benefits pairs:', pairs);
        setBenefitsPairs(pairs.length > 0 ? pairs : []);
      } else if (Array.isArray(benefitsData)) {
        // Handle array format
        const pairs = benefitsData.map((item, idx) => ({
          key: `benefit_${idx + 1}`,
          value: String(item)
        }));
        setBenefitsPairs(pairs.length > 0 ? pairs : []);
      } else {
        setBenefitsPairs([]);
      }
    } catch (err) {
      console.error('Error parsing benefits_json:', err);
      setBenefitsPairs([]);
    }

    // Parse selection_process
    try {
      const raw = scholarship.selection_process;
      console.log('🔍 Raw selection_process:', raw);
      
      if (Array.isArray(raw)) {
        const steps = raw.map((s: any, idx: number) => ({
          title: String(s?.title || s?.name || `Step ${idx + 1}` || ""),
          description: String(s?.description || s?.desc || ""),
          duration: String(s?.duration || ""),
        }));
        console.log('🔍 Parsed selection steps:', steps);
        setSelectionSteps(steps.length > 0 ? steps : []);
      } else if (raw && typeof raw === 'object') {
        // Handle object format
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) {
            setSelectionSteps(parsed.map((s: any, idx: number) => ({
              title: String(s?.title || s?.name || `Step ${idx + 1}` || ""),
              description: String(s?.description || s?.desc || ""),
              duration: String(s?.duration || ""),
            })));
          } else {
            setSelectionSteps([]);
          }
        } catch {
          setSelectionSteps([]);
        }
      } else {
        setSelectionSteps([]);
      }
    } catch (err) {
      console.error('Error parsing selection_process:', err);
      setSelectionSteps([]);
    }

    // Parse partner_universities
    try {
      const raw = scholarship.partner_universities;
      console.log('🔍 Raw partner_universities:', raw);
      
      if (Array.isArray(raw)) {
        const partners = raw.map((p: any) => ({
          name: String(p?.name || ""),
          country: String(p?.country || ""),
        }));
        console.log('🔍 Parsed partner universities:', partners);
        setPartnerUniversities(partners.length > 0 ? partners : []);
      } else if (raw && typeof raw === 'object') {
        // Handle object format
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) {
            setPartnerUniversities(parsed.map((p: any) => ({
              name: String(p?.name || ""),
              country: String(p?.country || ""),
            })));
          } else {
            setPartnerUniversities([]);
          }
        } catch {
          setPartnerUniversities([]);
        }
      } else {
        setPartnerUniversities([]);
      }
    } catch (err) {
      console.error('Error parsing partner_universities:', err);
      setPartnerUniversities([]);
    }

    setEditingScholarship(scholarship);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedScholarship(null);
    setDeleteDialogOpen(false);
    setTimeout(() => {
      handleRefresh();
    }, 300);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case 'Merit-based': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Need-based': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Academic': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Scholarship Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading scholarships...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Scholarship Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading scholarships</p>
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
    <AdminLayout title="Scholarship Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Scholarship Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage scholarship programs and opportunities</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Scholarship
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[1400px] w-[95vw] sm:!max-w-[1400px] sm:w-[90vw] md:!max-w-[1400px] lg:!max-w-[1400px] lg:w-[1400px] max-h-[95vh] flex flex-col overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
              <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                      {editingScholarship ? 'Update scholarship information' : 'Create a new scholarship opportunity'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto py-4 px-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Basic Information */}
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-blue-200 dark:border-blue-800">
                          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Scholarship Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Malaysia Excellence Scholarship"
                              required
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="provider" className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider</Label>
                            <Input
                              id="provider"
                              value={formData.provider}
                              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                              placeholder="e.g., Ministry of Education Malaysia"
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Award Amount (RM)</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={formData.amount}
                              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                              placeholder="e.g., 50000"
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Scholarship Type</Label>
                              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                                <SelectTrigger className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Merit-based">Merit-based</SelectItem>
                                  <SelectItem value="Need-based">Need-based</SelectItem>
                                  <SelectItem value="Academic">Academic</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                                <SelectTrigger className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Level <span className="text-red-500">*</span></Label>
                              <Select value={formData.level || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value === "none" ? "" : value }))}>
                                <SelectTrigger className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Select</SelectItem>
                                  <SelectItem value="foundation">Foundation</SelectItem>
                                  <SelectItem value="diploma">Diploma</SelectItem>
                                  <SelectItem value="degree">Degree</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Field of Interest <span className="text-red-500">*</span></Label>
                              <Select
                                value={formData.field_id || "none"}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, field_id: value === "none" ? "" : value }))}
                              >
                                <SelectTrigger className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md">
                                  <SelectValue placeholder={fieldsLoading ? "Loading..." : "Select field"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Select</SelectItem>
                                  {fields.map((f) => (
                                    <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate (%) <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={formData.success_rate}
                                onChange={(e) => setFormData(prev => ({ ...prev, success_rate: e.target.value }))}
                                placeholder="0 - 100"
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating (0.0 - 5.0) <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                step="0.1"
                                min={0}
                                max={5}
                                value={formData.rating}
                                onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value })) }
                                placeholder="e.g., 4.5"
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Time (weeks) <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                min={0}
                                value={formData.processing_time_weeks}
                                onChange={(e) => setFormData(prev => ({ ...prev, processing_time_weeks: e.target.value }))}
                                placeholder="e.g., 4"
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Applicant Count <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                min={0}
                                value={formData.applicant_count}
                                onChange={(e) => setFormData(prev => ({ ...prev, applicant_count: e.target.value }))}
                                placeholder="e.g., 120"
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Review Count <span className="text-red-500">*</span></Label>
                            <Input
                              type="number"
                              min={0}
                              value={formData.review_count}
                              onChange={(e) => setFormData(prev => ({ ...prev, review_count: e.target.value }))}
                              placeholder="e.g., 35"
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Application Details, Eligibility Requirements & Benefits */}
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-green-200 dark:border-green-800">
                          <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Application Details</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email <span className="text-red-500">*</span></Label>
                              <Input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                                placeholder="e.g., contact@provider.com"
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone <span className="text-red-500">*</span></Label>
                              <Input
                                value={formData.contact_phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                                placeholder="e.g., +60 12-345 6789"
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g., Malaysia, Overseas, Both"
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Deadline</Label>
                            <Input
                              id="deadline"
                              type="date"
                              value={formData.deadline}
                              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="application_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">Application URL</Label>
                            <Input
                              id="application_url"
                              type="url"
                              value={formData.application_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, application_url: e.target.value }))}
                              placeholder="https://example.com/apply"
                              className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Eligibility Requirements</h3>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEligibilityPairs([...eligibilityPairs, { key: '', value: '' }])}
                            className="h-8 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Field
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {eligibilityPairs.length === 0 && (
                            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                              <p>No eligibility requirements added yet.</p>
                              <p className="text-xs mt-1">Click "Add Field" to add requirements.</p>
                            </div>
                          )}
                          {eligibilityPairs.length > 0 && (
                            eligibilityPairs.map((pair, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <Input
                                  placeholder="Key (e.g., academic, income)"
                                  value={pair.key}
                                  onChange={(e) => {
                                    const updated = [...eligibilityPairs];
                                    updated[idx].key = e.target.value;
                                    setEligibilityPairs(updated);
                                  }}
                                  className="flex-1 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                                />
                                <Input
                                  placeholder="Value (e.g., SPM: 5 credits)"
                                  value={pair.value}
                                  onChange={(e) => {
                                    const updated = [...eligibilityPairs];
                                    updated[idx].value = e.target.value;
                                    setEligibilityPairs(updated);
                                  }}
                                  className="flex-1 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = eligibilityPairs.filter((_, i) => i !== idx);
                                    setEligibilityPairs(updated.length > 0 ? updated : []);
                                  }}
                                  className="h-10 w-10 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2.5">
                            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Benefits</h3>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setBenefitsPairs([...benefitsPairs, { key: '', value: '' }])}
                            className="h-8 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Field
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {benefitsPairs.length === 0 && (
                            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                              <p>No benefits added yet.</p>
                              <p className="text-xs mt-1">Click "Add Field" to add benefits.</p>
                            </div>
                          )}
                          {benefitsPairs.length > 0 && (
                            benefitsPairs.map((pair, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <Input
                                  placeholder="Key (e.g., tuition, living)"
                                  value={pair.key}
                                  onChange={(e) => {
                                    const updated = [...benefitsPairs];
                                    updated[idx].key = e.target.value;
                                    setBenefitsPairs(updated);
                                  }}
                                  className="flex-1 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                                />
                                <Input
                                  placeholder="Value (e.g., Full coverage)"
                                  value={pair.value}
                                  onChange={(e) => {
                                    const updated = [...benefitsPairs];
                                    updated[idx].value = e.target.value;
                                    setBenefitsPairs(updated);
                                  }}
                                  className="flex-1 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = benefitsPairs.filter((_, i) => i !== idx);
                                    setBenefitsPairs(updated.length > 0 ? updated : []);
                                  }}
                                  className="h-10 w-10 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Selection Process, Partner Universities & Description */}
                    <div className="space-y-5">

                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-teal-200 dark:border-teal-800">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Selection Process</h3>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectionSteps([...selectionSteps, { title: "", description: "", duration: "" }])}
                            className="h-8 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Step
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {selectionSteps.length === 0 && (
                            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                              No steps added yet.
                            </div>
                          )}
                          {selectionSteps.length > 0 && selectionSteps.map((s, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">Step {idx + 1}</div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectionSteps(selectionSteps.filter((_, i) => i !== idx))}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Title (e.g., Online application)"
                                value={s.title}
                                onChange={(e) => {
                                  const updated = [...selectionSteps];
                                  updated[idx].title = e.target.value;
                                  setSelectionSteps(updated);
                                }}
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                              <Input
                                placeholder="Duration (e.g., 1-2 weeks)"
                                value={s.duration}
                                onChange={(e) => {
                                  const updated = [...selectionSteps];
                                  updated[idx].duration = e.target.value;
                                  setSelectionSteps(updated);
                                }}
                                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                              <Textarea
                                placeholder="Description"
                                value={s.description}
                                onChange={(e) => {
                                  const updated = [...selectionSteps];
                                  updated[idx].description = e.target.value;
                                  setSelectionSteps(updated);
                                }}
                                rows={3}
                                className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-cyan-200 dark:border-cyan-800">
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Partner Universities</h3>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPartnerUniversities([...partnerUniversities, { name: "", country: "" }])}
                            className="h-8 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {partnerUniversities.length === 0 && (
                            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                              No partner universities added yet.
                            </div>
                          )}
                          {partnerUniversities.length > 0 && partnerUniversities.map((p, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <Input
                                placeholder="University name"
                                value={p.name}
                                onChange={(e) => {
                                  const updated = [...partnerUniversities];
                                  updated[idx].name = e.target.value;
                                  setPartnerUniversities(updated);
                                }}
                                className="flex-1 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                              <Input
                                placeholder="Country"
                                value={p.country}
                                onChange={(e) => {
                                  const updated = [...partnerUniversities];
                                  updated[idx].country = e.target.value;
                                  setPartnerUniversities(updated);
                                }}
                                className="w-40 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPartnerUniversities(partnerUniversities.filter((_, i) => i !== idx))}
                                className="h-10 w-10 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Description</h3>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detailed scholarship description"
                            rows={10}
                            className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex justify-end gap-3 w-full">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingScholarship(null);
                        resetForm();
                      }}
                      disabled={submitting}
                      className="h-10 px-6"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10 px-6" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingScholarship ? 'Update Scholarship' : 'Add Scholarship'
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-slate-900/80 dark:to-blue-950/40 border-2 border-blue-300/50 dark:border-blue-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Total Scholarships</CardTitle>
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{scholarships.length}</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-amber-50/80 dark:from-slate-900/80 dark:to-amber-950/40 border-2 border-amber-300/50 dark:border-amber-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-400 dark:hover:border-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Active Scholarships</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{scholarships.filter(s => s.status === 'active').length}</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-slate-900/80 dark:to-emerald-950/40 border-2 border-emerald-300/50 dark:border-emerald-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Total Value</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                RM {scholarships.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-purple-50/60 dark:from-slate-900/80 dark:to-purple-950/40 border-2 border-purple-300/50 dark:border-purple-600/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-slate-200">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Merit-based">Merit-based</SelectItem>
                  <SelectItem value="Need-based">Need-based</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Scholarships Table */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-950/60 border-2 border-slate-300/50 dark:border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-slate-200">Scholarship Programs ({filteredScholarships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-slate-300/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Scholarship Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Provider</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Deadline</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedScholarships.map((scholarship) => (
                    <TableRow key={scholarship.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-medium text-slate-700 dark:text-slate-200">{scholarship.name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{scholarship.provider || '-'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                        {scholarship.amount ? `RM ${scholarship.amount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(scholarship.type)}>
                          {scholarship.type || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-GB') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(scholarship.status)}>
                          {scholarship.status || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(scholarship)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(scholarship)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {paginatedScholarships.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No scholarships found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
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
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Results Info */}
        {filteredScholarships.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredScholarships.length)} of {filteredScholarships.length} scholarships
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <DeleteScholarshipDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        scholarship={selectedScholarship ? { id: selectedScholarship.id, name: selectedScholarship.name } : null}
        onConfirm={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}
