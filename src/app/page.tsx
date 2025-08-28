"use client";

import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkUserExists } from "@/utils/db/client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import { BookOpen, Globe, Play, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { userId, sessionId, isSignedIn, isLoaded } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    if (isLoaded) {
      console.log("USER ID", userId);
      console.log("SESSION ID", sessionId);
      console.log("IS SIGNED IN", isSignedIn);
      console.log("IS LOADED", isLoaded);

      let isCancelled = false;

      const checkAndRedirect = async () => {
        if (userId && sessionId) {
          const userExists = await checkUserExists(userId);
          if (!isCancelled) {
            console.log("USER EXISTS", userExists);
            if (userExists) {
              router.push("/explore"); //TODO: Redirect to dashboard
            }
          }
        }
      };

      if (isSignedIn) {
        checkAndRedirect();
        console.log("Redirecting to /explore...");
      } else {
        setIsPageLoading(false);
      }

      return () => {
        isCancelled = true;
      };
    }
  }, [isSignedIn, isLoaded, sessionId, userId, router]);

  if (isPageLoading) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex items-center p-4 h-16">
        <div className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">OSLearn</span>
        </div>
        <div className="hidden md:flex ml-auto gap-4">
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#courses"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Courses
            </a>
          </nav>
          <div className="flex gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant={"outline"}>Sign in</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              ⭐️ Open Source & Free Forever
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Join a Global Community of Language Learners
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Learn languages together with our open-source platform.
              Accessible, community-driven, and designed for learners worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignUpButton>
                  <Button size="lg" className="text-lg px-8 py-6">
                    <Play className="h-5 w-5 mr-2" />
                    Start Learning Free
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link href="/explore">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <Play className="h-5 w-5 mr-2" />
                    Go to Explore Page
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Learn Languages
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines the best of modern language learning with
              the power of open-source collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>Interactive Lessons</CardTitle>
                <CardDescription>
                  Engaging, adaptive lessons that adjust to your learning pace
                  and style.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Personalized learning paths</li>
                  <li>• Real-time pronunciation feedback</li>
                  <li>• Gamified progress tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Community Forums</CardTitle>
                <CardDescription>
                  Connect with native speakers and fellow learners from around
                  the world.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Language exchange partnerships</li>
                  <li>• Cultural discussion groups</li>
                  <li>• Peer support and motivation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Detailed analytics and insights to monitor your language
                  learning journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Comprehensive skill assessments</li>
                  <li>• Achievement badges and milestones</li>
                  <li>• Weekly progress reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Courses */}
      <section id="courses" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A Preview of Available Courses
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Explore courses of all types. Learn at your own pace, for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <span>***Course explorer preview will go here</span>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Language Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {
                "Join our community today and discover the joy of learning languages together. It's free, it's open, and it's waiting for you."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Get Started Now
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="mt-8 py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>Open source and built with ❤️ by the community</p>
      </footer>
    </div>
  );
}
