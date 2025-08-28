import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SignedIn, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OSLearn",
  description: "The New Way To Master Any Language",
  icons: {
    icon: "/globe.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full h-[100vh] overflow-y-auto">
        <header className="border-b border-border px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              {/* <ThemeToggle /> */}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
