'use client';
import {
  GraduationCap,
  BookOpen,
  Users,
  Target,
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Lock,
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { useState } from 'react';

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityType: 'ic',
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

  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
  };

  const openSignUpModal = () => {
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-gray-700/10 border-b border-gray-500/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-400 drop-shadow-lg filter" />
              <span className="text-xl font-semibold text-white drop-shadow-lg" style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
              }}>BackToSchool</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                className="bg-blue-600/90 hover:bg-blue-700/90 text-white border border-blue-400/30 shadow-xl backdrop-blur-sm transition-all duration-200"
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
                onClick={openLoginModal}
              >
                Sign In
              </Button>
              <Button 
                className="bg-blue-600/90 hover:bg-blue-700/90 text-white border border-blue-400/30 shadow-xl backdrop-blur-sm transition-all duration-200" 
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
                onClick={openSignUpModal}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {/* Login Dialog */}
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogContent className="backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center flex items-center justify-center gap-2 text-2xl">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      Welcome Back!
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                      Sign in to continue exploring Malaysian universities and programs.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <Input
                              id="email"
                              type="email"
                              value={loginData.email}
                              onChange={(e) => handleLoginChange('email', e.target.value)}
                              placeholder="Enter your email"
                              className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={loginData.password}
                              onChange={(e) => handleLoginChange('password', e.target.value)}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 backdrop-blur-sm bg-white/50 border-white/30"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300" />
                            <span className="text-gray-600">Remember me</span>
                          </label>
                          <a href="#" className="text-blue-600 hover:text-blue-700">Forgot password?</a>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={loading}
                        >
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Registration Dialog */}
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center flex items-center justify-center gap-2 text-2xl">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      Create Your Account
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                      Start exploring Malaysian universities and programs today.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                      <form onSubmit={e => e.preventDefault()} className="space-y-6">
                        {/* Personal Information Section */}
                        <Card className="backdrop-blur-sm bg-white/30 border-white/20 p-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Personal Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleRegisterChange('firstName', e.target.value)}
                                placeholder="Enter first name"
                                className="backdrop-blur-sm bg-white/50 border-white/30"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleRegisterChange('lastName', e.target.value)}
                                placeholder="Enter last name"
                                className="backdrop-blur-sm bg-white/50 border-white/30"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <div className="relative">
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => handleRegisterChange('email', e.target.value)}
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
                                  onChange={(e) => handleRegisterChange('phone', e.target.value)}
                                  placeholder="+60 12-345-6789"
                                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Identity Type Selection */}
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label>Identity Type</Label>
                              <Select value={formData.identityType} onValueChange={(value) => handleRegisterChange('identityType', value)}>
                                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ic">Malaysian IC Number</SelectItem>
                                  <SelectItem value="passport">Passport Number</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={formData.identityType === 'ic' ? 'icNumber' : 'passportNumber'}>
                                {formData.identityType === 'ic' ? 'IC Number' : 'Passport Number'}
                              </Label>
                              <div className="relative">
                                <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                {formData.identityType === 'ic' ? (
                                  <Input
                                    id="icNumber"
                                    type="text"
                                    value={formData.icNumber}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\\D/g, '');
                                      if (value.length >= 6) {
                                        value = value.substring(0, 6) + '-' + value.substring(6);
                                      }
                                      if (value.length >= 9) {
                                        value = value.substring(0, 9) + '-' + value.substring(9, 13);
                                      }
                                      handleRegisterChange('icNumber', value);
                                    }}
                                    placeholder="123456-12-1234"
                                    maxLength={14}
                                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                                    required
                                  />
                                ) : (
                                  <Input
                                    id="passportNumber"
                                    type="text"
                                    value={formData.passportNumber}
                                    onChange={(e) => {
                                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                      handleRegisterChange('passportNumber', value);
                                    }}
                                    placeholder="A12345678"
                                    maxLength={15}
                                    className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                                    required
                                  />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {formData.identityType === 'ic' 
                                  ? 'Enter your Malaysian IC number (12 digits)'
                                  : 'Enter your passport number (letters and numbers)'
                                }
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* Password Section */}
                        <Card className="backdrop-blur-sm bg-white/30 border-white/20 p-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Account Security
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <Input
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  value={formData.password}
                                  onChange={(e) => handleRegisterChange('password', e.target.value)}
                                  placeholder="Create password"
                                  className="pl-10 pr-10 backdrop-blur-sm bg-white/50 border-white/30"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <Input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={formData.confirmPassword}
                                  onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                                  placeholder="Confirm password"
                                  className="pl-10 pr-10 backdrop-blur-sm bg-white/50 border-white/30"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Academic Information Section */}
                        <Card className="backdrop-blur-sm bg-white/30 border-white/20 p-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Academic Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Current Education Level</Label>
                              <Select onValueChange={(value) => handleRegisterChange('educationLevel', value)}>
                                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                                  <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spm">SPM (Sijil Pelajaran Malaysia)</SelectItem>
                                  <SelectItem value="stpm">STPM (Sijil Tinggi Persekolahan Malaysia)</SelectItem>
                                  <SelectItem value="a-levels">A-Levels</SelectItem>
                                  <SelectItem value="foundation">Foundation</SelectItem>
                                  <SelectItem value="diploma">Diploma</SelectItem>
                                  <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                                  <SelectItem value="master">Master&apos;s Degree</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Field of Interest</Label>
                              <Select onValueChange={(value) => handleRegisterChange('fieldOfInterest', value)}>
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
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="academicResults">Academic Results</Label>
                              {(formData.educationLevel === 'spm' || formData.educationLevel === 'stpm') ? (
                                <div>
                                  <Select onValueChange={(value) => handleRegisterChange('numberOfAs', value)}>
                                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                                      <SelectValue placeholder={`Select number of A's in ${formData.educationLevel.toUpperCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0 A&apos;s</SelectItem>
                                      <SelectItem value="1">1 A</SelectItem>
                                      <SelectItem value="2">2 A&apos;s</SelectItem>
                                      <SelectItem value="3">3 A&apos;s</SelectItem>
                                      <SelectItem value="4">4 A&apos;s</SelectItem>
                                      <SelectItem value="5">5 A&apos;s</SelectItem>
                                      <SelectItem value="6">6 A&apos;s</SelectItem>
                                      <SelectItem value="7">7 A&apos;s</SelectItem>
                                      <SelectItem value="8">8 A&apos;s</SelectItem>
                                      <SelectItem value="9">9 A&apos;s</SelectItem>
                                      <SelectItem value="10">10+ A&apos;s</SelectItem>
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
                                    onChange={(e) => handleRegisterChange('academicResults', e.target.value)}
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
                                    onChange={(e) => handleRegisterChange('cgpa', e.target.value)}
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
                                    onChange={(e) => handleRegisterChange('academicResults', e.target.value)}
                                    placeholder="Describe your academic results"
                                    className="backdrop-blur-sm bg-white/50 border-white/30"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="space-y-2 mt-4">
                            <Label htmlFor="preferences">Study Preferences</Label>
                            <Textarea
                              id="preferences"
                              value={formData.preferences}
                              onChange={(e) => handleRegisterChange('preferences', e.target.value)}
                              placeholder="Tell us about your study preferences, preferred location (Klang Valley, Penang, Johor, etc.), career goals, university type preferences, etc."
                              className="backdrop-blur-sm bg-white/50 border-white/30 min-h-20"
                            />
                          </div>
                        </Card>

                        <div className="flex items-start space-x-2">
                          <input type="checkbox" className="rounded border-gray-300 mt-1" required />
                          <span className="text-sm text-gray-600">
                            I agree to the{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700">
                              Privacy Policy
                            </a>
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
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your Ideal
            <span className="block text-blue-600 mt-2">University Program in Malaysia</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Explore university programs across Malaysia with personalized AI-powered recommendations. 
            Find programs that match your SPM/STPM results, interests, and career aspirations.
          </p>

          {/* Key Features - Enhanced Design */}
          <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personalized Match</h3>
              <p className="text-gray-600">AI-powered recommendations</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">150+ Universities</h3>
              <p className="text-gray-600">Comprehensive database</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Free Access</h3>
              <p className="text-gray-600">No hidden costs</p>
            </div>
          </div>

          {/* Stats - Enhanced Design */}
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-3">5,000+</div>
              <div className="text-gray-600 font-medium text-lg">Programs</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-3">150+</div>
              <div className="text-gray-600 font-medium text-lg">Malaysian Universities</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-3">98%</div>
              <div className="text-gray-600 font-medium text-lg">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose BackToSchool Malaysia?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the perfect university program in Malaysia with our intelligent recommendation system 
              tailored for Malaysian students and education standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Smart Program Matching
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized program suggestions based on your SPM/STPM results, interests, and career goals in Malaysia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Complete Program Database
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Explore detailed information about programs from public and private universities across Malaysia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Local Education Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access insights about Malaysian higher education trends and make informed program choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover your ideal university program in Malaysia in just four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Share your SPM/STPM results, interests, and preferred study locations in Malaysia.'
              },
              {
                step: '2',
                title: 'Get Smart Recommendations',
                description: 'Our AI analyzes your profile and suggests suitable programs from Malaysian universities.'
              },
              {
                step: '3',
                title: 'Explore & Compare',
                description: 'Browse program details, entry requirements, fees, and campus information.'
              },
              {
                step: '4',
                title: 'Save & Plan',
                description: 'Save your favorite programs and track your exploration journey.'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-semibold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Your University Journey Starts Here
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of Malaysian students who have discovered their ideal university programs. 
              Get personalized recommendations tailored to your SPM/STPM results and career goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
              <p className="text-blue-100">
                Our AI analyzes your academic background to recommend the perfect programs for you.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Support</h3>
              <p className="text-blue-100">
                Connect with fellow students and get insights from those who&apos;ve been there.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Career Focused</h3>
              <p className="text-blue-100">
                Find programs that align with your career aspirations and industry demands.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-blue-100 mb-6">Ready to discover your ideal university program?</p>
            <div className="flex justify-center gap-4">
              <span className="text-white/80">Already have an account?</span>
              <button 
                onClick={openLoginModal}
                className="text-white hover:text-blue-200 underline font-medium transition-colors"
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-semibold">BackToSchool</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Empowering Malaysian students to discover and explore the best university programs across Malaysia.
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white text-xs font-semibold">f</span>
                </div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer">
                  <span className="text-white text-xs font-semibold">X</span>
                </div>
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer">
                  <span className="text-white text-xs font-semibold">in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={openSignUpModal} className="text-gray-300 hover:text-white transition-colors">Get Started</button></li>
                <li><button onClick={openLoginModal} className="text-gray-300 hover:text-white transition-colors">Login Portal</button></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Explore Programs</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@backtoschool.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+60 3-2345-6789</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                &copy; 2025 BackToSchool Malaysia. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}