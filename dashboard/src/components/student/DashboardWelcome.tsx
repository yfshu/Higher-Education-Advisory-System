"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Award, Star } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function DashboardWelcome() {
  const { userData } = useUser();
  const firstName = userData?.user?.fullName?.split(" ")[0] || "Student";

  return (
    <section className="backdrop-blur-xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/20 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/20 border border-white/30 dark:border-slate-700/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-2xl">
            Your personalized Malaysian university program recommendations are ready. Let&apos;s continue
            exploring the perfect program that matches your SPM/STPM results and career aspirations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/student/recommendations">
                View New Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <Link href="/student/search">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Programs
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
            >
              <Link href="/student/scholarships">
                <Award className="mr-2 h-4 w-4" />
                Browse Scholarships
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30"
            >
              <Link href="/student/help">
                <Star className="mr-2 h-4 w-4" />
                Get Help
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

