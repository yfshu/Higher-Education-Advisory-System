"use client";

import { useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  GraduationCap,
  Target,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Settings,
  Lock,
  Bell,
  Eye,
  Trash2,
  History,
} from "lucide-react";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Ahmad',
    lastName: 'Rahman',
    email: 'ahmad.rahman@email.com',
    phone: '+60 12-345-6789',
    identityType: 'ic', // 'ic' or 'passport'
    icNumber: '000515-12-1234',
    passportNumber: '',
    dateOfBirth: '2000-05-15',
    nationality: 'Malaysian',
    currentEducation: 'SPM',
    institution: 'SMK Kuala Lumpur',
    fieldOfInterest: 'Computer Science',
    academicResults: 'SPM: 8A+ 1A (Mathematics A+, Physics A+, Chemistry A+, Biology A+, English A+, Bahasa Malaysia A+, History A+, Moral A+, Additional Mathematics A)',
    careerGoals: 'Software Developer at a Malaysian tech company',
    studyPreferences: 'Prefer universities in Klang Valley or major cities with strong industry connections and internship opportunities',
    languages: ['Bahasa Malaysia (Native)', 'English (Fluent)', 'Mandarin (Basic)'],
    location: 'Kuala Lumpur, Malaysia'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    recommendations: true,
    deadlines: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: false,
    shareData: true
  });

  const completionPercentage = 85;

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving profile:', profile);
  };

  const formatICNumber = (value: string) => {
    // Format IC number as user types: XXXXXX-XX-XXXX
    let cleaned = value.replace(/\D/g, ''); // Remove non-digits
    if (cleaned.length >= 6) {
      cleaned = cleaned.substring(0, 6) + '-' + cleaned.substring(6);
    }
    if (cleaned.length >= 9) {
      cleaned = cleaned.substring(0, 9) + '-' + cleaned.substring(9, 13);
    }
    return cleaned;
  };

  const formatPassportNumber = (value: string) => {
    // Format passport number (uppercase letters and numbers)
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const profileSections = [
    {
      title: 'Personal Information',
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'email' },
        { key: 'phone', label: 'Phone Number', type: 'tel' },
        { key: 'identityType', label: 'Identity Type', type: 'select', options: ['ic', 'passport'], labels: ['Malaysian IC Number', 'Passport Number'] },
        { key: 'identityNumber', label: profile.identityType === 'ic' ? 'IC Number' : 'Passport Number', type: 'identity' },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'nationality', label: 'Nationality', type: 'text' },
        { key: 'location', label: 'Current Location', type: 'text' }
      ]
    },
    {
      title: 'Academic Background',
      fields: [
        { key: 'currentEducation', label: 'Current Education Level', type: 'select', options: ['SPM', 'STPM', 'A-Levels', 'Foundation', 'Diploma', 'Bachelor\'s Degree', 'Other'] },
        { key: 'institution', label: 'Current Institution', type: 'text' },
        { key: 'academicResults', label: 'Academic Results/Grades', type: 'textarea' }
      ]
    },
    {
      title: 'Preferences & Goals',
      fields: [
        { key: 'fieldOfInterest', label: 'Field of Interest', type: 'select', options: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science', 'Other'] },
        { key: 'careerGoals', label: 'Career Goals', type: 'textarea' },
        { key: 'studyPreferences', label: 'Study Preferences', type: 'textarea' }
      ]
    }
  ];

  const recommendationHistory = [
    {
      date: '2024-01-15',
      count: 5,
      topMatch: 'Computer Science - University Malaya - 95%',
      status: 'viewed'
    },
    {
      date: '2024-01-10',
      count: 8,
      topMatch: 'Software Engineering - Universiti Teknologi Malaysia - 92%',
      status: 'partially_viewed'
    },
    {
      date: '2024-01-05',
      count: 6,
      topMatch: 'Information Technology - Universiti Putra Malaysia - 88%',
      status: 'viewed'
    }
  ];

  return (
    <StudentLayout title="Profile & Settings">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl text-white font-semibold">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 bg-white shadow-lg hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{profile.location}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {/* Profile Completion */}
            <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Profile Completion</span>
                <span className="text-sm text-gray-600">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="mb-2" />
              <p className="text-sm text-gray-600">
                Complete your profile to get better program recommendations.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabbed Content */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm border-b border-white/20">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6 space-y-6">
              {/* Profile Sections */}
              {profileSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          {field.label}
                        </Label>
                        {isEditing ? (
                          field.type === 'select' ? (
                            field.key === 'identityType' ? (
                              <Select 
                                value={profile[field.key as keyof typeof profile] as string}
                                onValueChange={(value) => setProfile({...profile, [field.key]: value})}
                              >
                                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option, index) => (
                                    <SelectItem key={option} value={option}>
                                      {field.labels?.[index] || option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select 
                                value={profile[field.key as keyof typeof profile] as string}
                                onValueChange={(value) => setProfile({...profile, [field.key]: value})}
                              >
                                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              value={profile[field.key as keyof typeof profile] as string}
                              onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                              className="backdrop-blur-sm bg-white/50 border-white/30 min-h-20"
                            />
                          ) : field.type === 'identity' ? (
                            <Input
                              type="text"
                              value={profile.identityType === 'ic' ? profile.icNumber : profile.passportNumber}
                              onChange={(e) => {
                                if (profile.identityType === 'ic') {
                                  const formattedValue = formatICNumber(e.target.value);
                                  setProfile({...profile, icNumber: formattedValue});
                                } else {
                                  const formattedValue = formatPassportNumber(e.target.value);
                                  setProfile({...profile, passportNumber: formattedValue});
                                }
                              }}
                              placeholder={profile.identityType === 'ic' ? '123456-12-1234' : 'A12345678'}
                              maxLength={profile.identityType === 'ic' ? 14 : 15}
                              className="backdrop-blur-sm bg-white/50 border-white/30"
                            />
                          ) : (
                            <Input
                              type={field.type}
                              value={profile[field.key as keyof typeof profile] as string}
                              onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                              className="backdrop-blur-sm bg-white/50 border-white/30"
                            />
                          )
                        ) : (
                          <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                            <span className="text-gray-900">
                              {field.type === 'identity' 
                                ? (profile.identityType === 'ic' ? profile.icNumber : profile.passportNumber) || 'Not specified'
                                : field.key === 'identityType'
                                ? (profile.identityType === 'ic' ? 'Malaysian IC Number' : 'Passport Number')
                                : profile[field.key as keyof typeof profile] as string || 'Not specified'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Languages & Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages & Skills</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {language}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm" className="h-6 text-xs">
                          + Add Language
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">24</p>
                      <p className="text-sm text-gray-600">Programs Viewed</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">8</p>
                      <p className="text-sm text-gray-600">Programs Saved</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">12</p>
                      <p className="text-sm text-gray-600">Recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6 space-y-6">
              {/* Security */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="Enter current password" className="backdrop-blur-sm bg-white/50 border-white/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" placeholder="Enter new password" className="backdrop-blur-sm bg-white/50 border-white/30" />
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                      <div>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <p className="text-sm text-gray-500">
                          {key === 'email' && 'Receive updates via email'}
                          {key === 'push' && 'Browser push notifications'}
                          {key === 'recommendations' && 'New program recommendations'}
                          {key === 'deadlines' && 'Application deadline reminders'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, [key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy
                </h3>
                <div className="space-y-4">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                      <div>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <p className="text-sm text-gray-500">
                          {key === 'profileVisible' && 'Make profile visible to universities'}
                          {key === 'shareData' && 'Allow anonymous data sharing for improvements'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setPrivacy({...privacy, [key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="backdrop-blur-sm bg-red-50/40 border border-red-200/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-6 space-y-6">
              <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Recommendation History</h3>
                    <p className="text-gray-600">Track your AI recommendations over time</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {recommendationHistory.map((rec, index) => (
                  <div key={index} className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {new Date(rec.date).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary">{rec.count} programs</Badge>
                        </div>
                        <p className="text-gray-600">Top match: {rec.topMatch}</p>
                      </div>
                      <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/50">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </StudentLayout>
  );
}
