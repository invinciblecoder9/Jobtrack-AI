"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, HeartHandshake, Rocket, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Auto-redirect only if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              JobTrack AI
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b shadow-lg">
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 mb-8">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">
              AI-Powered Job Hunting Just Got 10× Smarter
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
            Stop Applying.
            <br />
            Start Winning.
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            AI analyzes every job description, tailors your resume perfectly,
            <br />
            and turns rejections into comebacks.
            <span className="font-semibold text-purple-600">Zero effort. Maximum results.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-10 py-7 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl transform hover:scale-105 transition">
              <Link href="/signup">Start Free — No Card Needed</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-10 py-7 text-lg">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>

          <p className="mt-8 text-gray-500">10,000+ job hunters already landed their dream role</p>
        </div>
      </section>

      {/* Features Grid
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Job Hunters Love Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Rocket, title: "AI Resume Tailoring", desc: "Paste any JD → get perfect resume in seconds." },
              { icon: HeartHandshake, title: "Rejection = Growth", desc: "Paste rejection email → AI tells you exactly what to fix." },
              { icon: Zap, title: "Kanban Magic", desc: "Drag & drop like Trello. Never lose track." },
            ].map((f, i) => (
              <Card key={i} className="p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border-gray-100 dark:border-gray-800">
                <f.icon className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Ready to Land Your Dream Job?
        </h2>
        <Button asChild size="lg" className="px-12 py-8 text-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform">
          <Link href="/signup">Start Free Now</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-gray-500 text-sm">
        © 2025 JobTrack AI • Built with love for job hunters
      </footer>
    </>
  );
}