'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  Clock,
  MapPin,
  CreditCard,
} from 'lucide-react';

import { useAuthModals } from '@/components/auth/AuthModalProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const metrics = [
  { label: 'Programs', value: '1000+' },
  { label: 'Universities', value: '100+' },
  { label: 'Student Satisfaction', value: '98%' },
];

const benefits = [
  {
    title: 'Personalised Match',
    description: 'AI-powered recommendations aligned with your academic background and interests.',
    icon: Target,
  },
  {
    title: 'Scholarship Insights',
    description: 'Discover scholarships that match your financial goals and academic excellence.',
    icon: CreditCard,
  },
  {
    title: 'Guided Journey',
    description: 'Track application deadlines, compare programmes, and stay organised with reminders.',
    icon: Clock,
  },
];

const supportLinks = [
  { label: 'Help Centre', href: '/student/help' },
  { label: 'Explore Programs', href: '/student/search' },
  { label: 'Scholarships', href: '/student/scholarships' },
];

export default function LandingPage() {
  const { openLogin, openRegister } = useAuthModals();

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-semibold text-slate-900">BackToSchool</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              onClick={openLogin}
              className="bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700"
            >
              Sign In
            </Button>
            <Button
              onClick={openRegister}
              className="bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-300" />
              AI-powered university guidance
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Discover Your Ideal University Programme
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-blue-100">
              AI-powered recommendations based on your profile. Compare programmes, track deadlines, and find scholarships—all in one place.
            </p>

            <div className="grid w-full max-w-3xl grid-cols-1 gap-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur md:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-1 text-white">
                  <p className="text-3xl font-semibold">{metric.value}</p>
                  <p className="text-sm uppercase tracking-wide text-blue-100">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-slate-900">
                  Everything you need to make the right choice
                </h2>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Personalised dashboards</p>
                      <p className="text-sm">Monitor application progress and deadlines</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Scholarship recommendations</p>
                      <p className="text-sm">Based on your academic profile and financial goals</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Detailed programme insights</p>
                      <p className="text-sm">Entry requirements, curriculum, and career outcomes</p>
                    </div>
                  </li>
                </ul>
              </div>

              <Card className="border-blue-100 bg-white p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  Need guidance?
                </h3>
                <p className="mb-4 text-sm text-slate-600">
                  Visit the help centre or chat with our advisors for personalised support.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-blue-600" />
                    +60 3-2345-6789
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="h-4 w-4 text-blue-600" />
                    support@backtoschool.my
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-blue-600">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center text-white">
            <h2 className="mb-4 text-3xl font-semibold">Plan your university journey with confidence</h2>
            <p className="mx-auto mb-8 max-w-2xl text-blue-100">
              Join thousands of students who trust BackToSchool to discover the right programmes and unlock scholarship opportunities.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={openRegister}
                size="lg"
                className="bg-white text-blue-700 transition-colors duration-200 hover:bg-blue-50"
              >
                Get Started Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={openLogin}
                className="border border-white/70 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/90 shadow-sm"
              >
                I already have an account
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-semibold">BackToSchool</span>
              </div>
              <p className="text-sm text-slate-300">
                Empowering students to explore, compare, and apply to the best programmes.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <button onClick={openRegister} className="transition-colors hover:text-white">
                    Create Account
                  </button>
                </li>
                <li>
                  <button onClick={openLogin} className="transition-colors hover:text-white">
                    Sign In
                  </button>
                </li>
                <li>
                  <Link href="/student/search" className="transition-colors hover:text-white">
                    Explore Programmes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 text-sm text-slate-400">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Contact</h3>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                support@backtoschool.my
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                +60 3-2345-6789
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                Kuala Lumpur, Malaysia
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 py-6">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-slate-500 md:flex-row">
              <p>&copy; {new Date().getFullYear()} BackToSchool Malaysia. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="#" className="hover:text-white">
                  Privacy
                </Link>
                <Link href="#" className="hover:text-white">
                  Terms
                </Link>
                <Link href="#" className="hover:text-white">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
