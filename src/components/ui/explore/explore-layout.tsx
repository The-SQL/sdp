"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { BookOpen, Globe, Home, Plus, User } from "lucide-react";
import { useState } from "react";

interface ExploreLayoutProps {
  children: React.ReactNode;
}

export function ExploreLayout({ children }: ExploreLayoutProps) {
  const [activeItem, setActiveItem] = useState("dashboard");


  const navigationItems = [
    { id: "explore", label: "Explore", icon: Home },
    { id: "my-courses", label: "My Courses", icon: BookOpen },
    { id: "create-course", label: "Create Course", icon: Plus },
    { id: "profile", label: "Profile", icon: User },
  ];

 
  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-foreground" />
            <span className="text-xl font-semibold text-foreground">
              OSLearn
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Features</span>
            <span className="text-sm text-muted-foreground">Courses</span>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-white min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeItem === item.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    activeItem === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveItem(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
