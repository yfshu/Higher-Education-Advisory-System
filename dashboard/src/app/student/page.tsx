import Link from "next/link";

import StudentLayout from "@/components/layout/StudentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

const recentRecommendations = [
  {
    id: 1,
    title: "Computer Science",
    university: "University of Malaya",
    location: "Kuala Lumpur, Malaysia",
    matchPercentage: 95,
    deadline: "2024-03-15",
    type: "Bachelor",
  },
  {
    id: 2,
    title: "Software Engineering",
    university: "Universiti Teknologi Malaysia",
    location: "Johor Bahru, Malaysia",
    matchPercentage: 88,
    deadline: "2024-02-28",
    type: "Bachelor",
  },
  {
    id: 3,
    title: "Information Technology",
    university: "Universiti Putra Malaysia",
    location: "Serdang, Malaysia",
    matchPercentage: 92,
    deadline: "2024-04-01",
    type: "Bachelor",
  },
];

const savedPrograms = [
  { title: "AI & Machine Learning", university: "Universiti Malaya", saved: "2 days ago" },
  {
    title: "Cybersecurity",
    university: "Universiti Kebangsaan Malaysia",
    saved: "1 week ago",
  },
  { title: "Web Development", university: "Multimedia University", saved: "2 weeks ago" },
];

const deadlineFormatter = new Intl.DateTimeFormat("en-MY", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function StudentDashboardPage() {
  return (
    <StudentLayout title="Dashboard">
      <div className="space-y-8">
        <section className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Selamat datang kembali, Ahmad! 👋</h2>
          <p className="text-muted-foreground mb-6">
            Your personalized Malaysian university program recommendations are ready. Let&apos;s continue
            exploring the perfect program that matches your SPM/STPM results and career aspirations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
            >
              <Link href="/student/recommendations">
                View New Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="backdrop-blur-sm bg-white/50 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Link href="/student/search">Explore Programs</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
                <p className="text-2xl font-semibold text-foreground">85%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={85} className="mt-3 bg-blue-200/40" />
          </Card>

          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Programs Viewed</p>
                <p className="text-2xl font-semibold text-foreground">24</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              +12 this week
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saved Items</p>
                <p className="text-2xl font-semibold text-foreground">11</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Programs &amp; scholarships</p>
          </Card>

          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Days Until Deadline</p>
                <p className="text-2xl font-semibold text-foreground">23</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-orange-600">Next deadline approaching</p>
          </Card>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="border-b border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Latest Recommendations</h3>
                <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Link href="/student/recommendations">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentRecommendations.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-start gap-4 rounded-lg border border-white/20 bg-white/30 p-4 backdrop-blur-sm"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{program.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {program.matchPercentage}% match
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">{program.university}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {program.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {deadlineFormatter.format(new Date(program.deadline))}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {program.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="backdrop-blur-sm bg-white/50"
                    >
                      <Link href={`/student/program/${program.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="border-b border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Saved Items</h3>
                <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Link href="/student/saved">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {savedPrograms.map((program) => (
                  <div
                    key={`${program.title}-${program.university}`}
                    className="flex items-center gap-4 rounded-lg border border-white/20 bg-white/30 p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{program.title}</h4>
                      <p className="text-sm text-muted-foreground">{program.university}</p>
                      <p className="text-xs text-muted-foreground">Saved {program.saved}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 p-6 shadow-lg">
          <h3 className="mb-4 font-semibold text-foreground">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50"
            >
              <Link href="/student/profile">
                <Target className="mr-2 h-4 w-4" />
                Complete Profile
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50"
            >
              <Link href="/student/search">
                <BookOpen className="mr-2 h-4 w-4" />
                Search Programs
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50"
            >
              <Link href="/student/help">
                <Star className="mr-2 h-4 w-4" />
                Get Help
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
