import React, { useState } from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Target,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera
} from 'lucide-react';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+44 7123 456789',
    dateOfBirth: '2000-05-15',
    nationality: 'British',
    currentEducation: 'A-Levels',
    institution: 'London College',
    fieldOfInterest: 'Computer Science',
    academicResults: 'A*AA (Mathematics A*, Physics A, Computer Science A)',
    careerGoals: 'Software Developer at a tech company',
    studyPreferences: 'Prefer universities in major cities with strong industry connections',
    languages: ['English (Native)', 'Spanish (Intermediate)'],
    location: 'London, UK'
  });

  const completionPercentage = 85;

  const handleSave = () => {
    setIsEditing(false);
    // Handle profile save
    console.log('Saving profile:', profile);
  };

  const profileSections = [
    {
      title: 'Personal Information',
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'email' },
        { key: 'phone', label: 'Phone Number', type: 'tel' },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'nationality', label: 'Nationality', type: 'text' },
        { key: 'location', label: 'Current Location', type: 'text' }
      ]
    },
    {
      title: 'Academic Background',
      fields: [
        { key: 'currentEducation', label: 'Current Education Level', type: 'select', options: ['A-Levels', 'Bachelor\'s Degree', 'Master\'s Degree', 'High School', 'Other'] },
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

  return (
    <StudentLayout title="My Profile">
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

        {/* Profile Sections */}
        {profileSections.map((section) => (
          <Card key={section.title} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      {field.label}
                    </Label>
                    {isEditing ? (
                      field.type === 'select' ? (
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
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          value={profile[field.key as keyof typeof profile] as string}
                          onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                          className="backdrop-blur-sm bg-white/50 border-white/30 min-h-20"
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
                          {profile[field.key as keyof typeof profile] as string || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {/* Languages & Skills */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
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
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-lg font-semibold text-gray-900">24</p>
                <p className="text-sm text-gray-600">Programs Viewed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-lg font-semibold text-gray-900">8</p>
                <p className="text-sm text-gray-600">Programs Saved</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-lg font-semibold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Recommendations</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}