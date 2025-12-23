"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function DashboardWelcome() {
  const { userData } = useUser();
  const firstName = userData?.user?.fullName?.split(" ")[0] || "Student";

  return (
    <section className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Selamat datang kembali, {firstName}! 👋
      </h2>
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
  );
}

