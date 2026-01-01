"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Building2, Plus, Loader2, MapPin, Globe, Mail, Phone } from "lucide-react";
import { UniversityFormModal } from "@/components/admin/UniversityFormModal";
import { DeleteUniversityDialog } from "@/components/admin/DeleteUniversityDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface University {
  id: number;
  name: string;
  university_type: "public" | "private";
  based_in: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  website_url: string | null;
  email: string | null;
  phone_number: string | null;
  average_fee: number | null;
  logo_url: string | null;
  image_urls: string[] | null;
  created_at: string | null;
}

export default function UniversityManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/universities`);

      if (!response.ok) {
        throw new Error(`Failed to fetch universities: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Parse image_urls if it's a JSON string
        const parsed = result.data.map((uni: any) => ({
          ...uni,
          image_urls: typeof uni.image_urls === 'string' 
            ? JSON.parse(uni.image_urls || '[]') 
            : (Array.isArray(uni.image_urls) ? uni.image_urls : []),
        }));
        setUniversities(parsed);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching universities:", err);
      setError(err instanceof Error ? err.message : "Failed to load universities");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUniversities = filteredUniversities.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getLocation = (uni: University): string => {
    const parts = [uni.city, uni.state, uni.based_in].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const handleEdit = (uni: University) => {
    setSelectedUniversity(uni);
    setFormModalOpen(true);
  };

  const handleDelete = (uni: University) => {
    setSelectedUniversity(uni);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUniversity(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    fetchUniversities();
    setSelectedUniversity(null);
  };

  const handleDeleteSuccess = () => {
    fetchUniversities();
    setSelectedUniversity(null);
  };

  if (loading) {
    return (
      <AdminLayout title="University Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading universities...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="University Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading universities</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="University Management">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Malaysian Universities
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Add, edit, and manage universities from Malaysian institutions.
            </p>
          </div>
          <Button onClick={handleAddNew} className="bg-slate-700 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New University
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search universities by name, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-muted-foreground mt-2">
              Found {filteredUniversities.length} {filteredUniversities.length === 1 ? 'university' : 'universities'} matching "{searchTerm}"
            </p>
          )}
        </Card>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUniversities.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchTerm ? "No universities found matching your search." : "No universities available."}
            </div>
          ) : (
            paginatedUniversities.map((uni) => (
              <Card
                key={uni.id}
                className="p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {uni.university_type === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(uni)}
                        title="Edit university"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(uni)}
                        title="Delete university"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{getLocation(uni)}</span>
                    </div>
                    {uni.website_url && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <a
                          href={uni.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {uni.website_url}
                        </a>
                      </div>
                    )}
                    {uni.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{uni.email}</span>
                      </div>
                    )}
                    {uni.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{uni.phone_number}</span>
                      </div>
                    )}
                    {uni.average_fee && (
                      <div className="text-gray-900 dark:text-gray-100 font-medium">
                        Avg. Fee: RM {uni.average_fee.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {uni.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {uni.description}
                    </p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

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
        {filteredUniversities.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredUniversities.length)} of {filteredUniversities.length} universities
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {universities.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Universities</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {universities.filter((u) => u.university_type === "public").length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Public</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {universities.filter((u) => u.university_type === "private").length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Private</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {universities.filter((u) => u.city).length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">With Location</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Form Modal */}
      <UniversityFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        university={selectedUniversity}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog */}
      <DeleteUniversityDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        university={selectedUniversity ? { id: selectedUniversity.id, name: selectedUniversity.name } : null}
        onConfirm={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}

