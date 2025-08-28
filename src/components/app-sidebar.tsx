import {
  CreditCard,
  Globe,
  Home,
  MessageSquare,
  Plus,
  Search,
  User,
} from "lucide-react";

import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Explore Courses", href: "/courses", icon: Search },
  { name: "Create Course", href: "/create-course", icon: Plus },
  { name: "Discussion Forums", href: "/forums", icon: MessageSquare },
  { name: "Flashcards", href: "/flashcards", icon: CreditCard },
  { name: "Profile", href: "/profile", icon: User },
];

function AppSideBar() {
  const pathname = usePathname();
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="text-center text-xl font-medium pt-4">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">OSLearn</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_LINKS.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    className="truncate font-medium text-base py-6"
                  >
                    <Link href={link.href} className="flex items-center gap-2">
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSideBar;
