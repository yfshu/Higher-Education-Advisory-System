import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { GraduationCap, User, Mail, Lock, ArrowLeft, Phone, CreditCard } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityType: 'ic', // 'ic' or 'passport'
    icNumber: '',
    passportNumber: '',
    password: '',
    confirmPassword: '',
    educationLevel: '',
    fieldOfInterest: '',
    academicResults: '',
    numberOfAs: '',
    cgpa: '',
    preferences: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      login('student', {
        id: '1',
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email
      });
      navigate('/student/dashboard');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Start exploring Malaysian universities and programs today</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="backdrop-blur-sm bg-white/50 border-white/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+60 12-345-6789"
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                />
              </div>
            </div>

            {/* Identity Type Selection */}
            <div className="space-y-2">
              <Label>Identity Type</Label>
              <Select value={formData.identityType} onValueChange={(value) => handleChange('identityType', value)}>
                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ic">Malaysian IC Number</SelectItem>
                  <SelectItem value="passport">Passport Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Identity Number Input */}
            {formData.identityType === 'ic' ? (
              <div className="space-y-2">
                <Label htmlFor="icNumber">IC Number</Label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id="icNumber"
                    type="text"
                    value={formData.icNumber}
                    onChange={(e) => {
                      // Format IC number as user types: XXXXXX-XX-XXXX
                      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      if (value.length >= 6) {
                        value = value.substring(0, 6) + '-' + value.substring(6);
                      }
                      if (value.length >= 9) {
                        value = value.substring(0, 9) + '-' + value.substring(9, 13);
                      }
                      handleChange('icNumber', value);
                    }}
                    placeholder="123456-12-1234"
                    maxLength={14}
                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Enter your Malaysian IC number (12 digits)</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id="passportNumber"
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => {
                      // Format passport number (uppercase letters and numbers)
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      handleChange('passportNumber', value);
                    }}
                    placeholder="A12345678"
                    maxLength={15}
                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Enter your passport number (letters and numbers)</p>
              </div>
            )}

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Create password"
                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4 border-t border-white/20 pt-6">
              <h3 className="font-medium text-gray-900">Academic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Education Level</Label>
                  <Select onValueChange={(value) => handleChange('educationLevel', value)}>
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spm">SPM (Sijil Pelajaran Malaysia)</SelectItem>
                      <SelectItem value="stpm">STPM (Sijil Tinggi Persekolahan Malaysia)</SelectItem>
                      <SelectItem value="a-levels">A-Levels</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Field of Interest</Label>
                  <Select onValueChange={(value) => handleChange('fieldOfInterest', value)}>
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science & IT</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business & Management</SelectItem>
                      <SelectItem value="medicine">Medicine & Health Sciences</SelectItem>
                      <SelectItem value="science">Pure Sciences</SelectItem>
                      <SelectItem value="arts">Arts & Humanities</SelectItem>
                      <SelectItem value="social">Social Sciences</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="law">Law</SelectItem>
                      <SelectItem value="architecture">Architecture & Built Environment</SelectItem>
                      <SelectItem value="accounting">Accounting & Finance</SelectItem>
                      <SelectItem value="mass-comm">Mass Communication</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditional Academic Results Input */}
              {formData.educationLevel && (
                <div className="space-y-2">
                  <Label htmlFor="academicResults">Academic Results</Label>
                  {(formData.educationLevel === 'spm' || formData.educationLevel === 'stpm') ? (
                    <div>
                      <Select onValueChange={(value) => handleChange('numberOfAs', value)}>
                        <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue placeholder={`Select number of A's in ${formData.educationLevel.toUpperCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 A's</SelectItem>
                          <SelectItem value="1">1 A</SelectItem>
                          <SelectItem value="2">2 A's</SelectItem>
                          <SelectItem value="3">3 A's</SelectItem>
                          <SelectItem value="4">4 A's</SelectItem>
                          <SelectItem value="5">5 A's</SelectItem>
                          <SelectItem value="6">6 A's</SelectItem>
                          <SelectItem value="7">7 A's</SelectItem>
                          <SelectItem value="8">8 A's</SelectItem>
                          <SelectItem value="9">9 A's</SelectItem>
                          <SelectItem value="10">10+ A's</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.educationLevel === 'spm' ? 'Number of A+ and A grades in SPM' : 'Number of A grades in STPM'}
                      </p>
                    </div>
                  ) : formData.educationLevel === 'a-levels' ? (
                    <div>
                      <Input
                        id="academicResults"
                        type="text"
                        value={formData.academicResults}
                        onChange={(e) => handleChange('academicResults', e.target.value)}
                        placeholder="e.g., A*AA, AAB, ABC"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your A-Level grades (e.g., A*AA)</p>
                    </div>
                  ) : (formData.educationLevel === 'foundation' || formData.educationLevel === 'diploma' || formData.educationLevel === 'bachelor' || formData.educationLevel === 'master') ? (
                    <div>
                      <Input
                        id="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={formData.cgpa}
                        onChange={(e) => handleChange('cgpa', e.target.value)}
                        placeholder="e.g., 3.75"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your CGPA (0.00 - 4.00)</p>
                    </div>
                  ) : (
                    <div>
                      <Input
                        id="academicResults"
                        type="text"
                        value={formData.academicResults}
                        onChange={(e) => handleChange('academicResults', e.target.value)}
                        placeholder="Describe your academic results"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="preferences">Study Preferences</Label>
                <Textarea
                  id="preferences"
                  value={formData.preferences}
                  onChange={(e) => handleChange('preferences', e.target.value)}
                  placeholder="Tell us about your study preferences, preferred location (Klang Valley, Penang, Johor, etc.), career goals, university type preferences, etc."
                  className="backdrop-blur-sm bg-white/50 border-white/30 min-h-20"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input type="checkbox" className="rounded border-gray-300 mt-1" required />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}