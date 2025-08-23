"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, User, Plus, MessageSquare, CreditCard, ChevronLeft, ChevronRight, Search } from "lucide-react"

import { SignedIn, UserButton } from "@clerk/nextjs"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Explore Courses", href: "/course", icon: Search },
  { name: "Create Course", href: "/create-course", icon: Plus },
  { name: "Discussion Forums", href: "/forums", icon: MessageSquare },
  { name: "Flashcards", href: "/flashcards", icon: CreditCard },
  { name: "Profile", href: "/profile", icon: User },
]

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const isLanding = pathname ==="/"

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 h-full relative flex flex-col",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">OS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">OSLearn</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-blue-600"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                  collapsed && "justify-center",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-w-0 flex-col">
        {/* Header on all pages EXCEPT landing ("/") */}
        {!isLanding && (
          <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">{/* brand spot if needed */}</div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Features</span>
                <span className="text-sm text-muted-foreground">Courses</span>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
        )}

        {/* 🔧 You were missing this */}
        <div className="flex-1 overflow-y-auto p-6 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
