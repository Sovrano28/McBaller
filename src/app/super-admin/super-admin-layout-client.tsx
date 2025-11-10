"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  Shield,
  Home,
  Building2,
  Users,
  UserRound,
  DollarSign,
  Receipt,
  CreditCard,
  Flag,
  BarChart3,
  FileSearch,
  UserPlus,
  Settings,
  Package,
  Activity,
  CheckCircle2,
  LogOut,
  Crown,
  MessageSquare,
  UsersRound,
  UserCog,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import type { SuperAdminAuthData } from "@/lib/auth-types";

export function SuperAdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => {
    const normalizedPathname = pathname.replace(/\/$/, "") || "/";
    const normalizedPath = path.replace(/\/$/, "") || "/";

    if (normalizedPathname === normalizedPath) {
      return true;
    }

    const routesThatMatchNested = [
      "/super-admin/dashboard",
      "/super-admin/organizations",
      "/super-admin/users",
      "/super-admin/teams",
      "/super-admin/agents",
      "/super-admin/players",
      "/super-admin/financial",
      "/super-admin/communications",
      "/super-admin/moderation",
      "/super-admin/compliance",
      "/super-admin/analytics",
      "/super-admin/monitoring",
      "/super-admin/audit",
      "/super-admin/impersonate",
      "/super-admin/settings",
      "/super-admin/bulk-operations",
    ];
    if (routesThatMatchNested.includes(normalizedPath)) {
      if (normalizedPathname.startsWith(normalizedPath + "/")) {
        return true;
      }
    }

    return false;
  };
  
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const superAdminUser = user && user.role === "super_admin" ? (user as SuperAdminAuthData) : null;

  const navItems = [
    // Core Dashboard
    { href: "/super-admin/dashboard", label: "Dashboard", icon: Home, category: "core" },
    
    // Entity Management (Hierarchical: Users → Organizations → Teams → Agents → Players)
    { href: "/super-admin/users", label: "Users", icon: Users, category: "entities" },
    { href: "/super-admin/organizations", label: "Organizations", icon: Building2, category: "entities" },
    { href: "/super-admin/teams", label: "Teams", icon: UsersRound, category: "entities" },
    { href: "/super-admin/agents", label: "Agents", icon: UserCog, category: "entities" },
    { href: "/super-admin/players", label: "Players", icon: UserRound, category: "entities" },
    
    // Financial
    { href: "/super-admin/financial/invoices", label: "Invoices", icon: Receipt, category: "financial" },
    { href: "/super-admin/financial/subscriptions", label: "Subscriptions", icon: CreditCard, category: "financial" },
    
    // Communications
    { href: "/super-admin/communications", label: "Communications Hub", icon: MessageSquare, category: "communications" },
    { href: "/super-admin/communications/templates", label: "Message Templates", icon: FileSearch, category: "communications" },
    
    // Moderation
    { href: "/super-admin/moderation/content", label: "Content Moderation", icon: Flag, category: "moderation" },
    { href: "/super-admin/moderation/stats", label: "Stats Verification", icon: CheckCircle2, category: "moderation" },
    
    // Compliance & Analytics
    { href: "/super-admin/compliance", label: "Compliance", icon: Shield, category: "compliance" },
    { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3, category: "analytics" },
    { href: "/super-admin/monitoring", label: "Activity Monitor", icon: Activity, category: "analytics" },
    
    // Advanced
    { href: "/super-admin/audit", label: "Audit Logs", icon: FileSearch, category: "advanced" },
    { href: "/super-admin/impersonate", label: "Impersonate User", icon: UserPlus, category: "advanced" },
    { href: "/super-admin/bulk-operations", label: "Bulk Operations", icon: Package, category: "advanced" },
    { href: "/super-admin/settings", label: "System Settings", icon: Settings, category: "advanced" },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <AppLogo />
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-600 text-white">
              <Crown className="h-3 w-3" />
              <span className="text-xs font-semibold">SUPER ADMIN</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item, index) => {
              const active = isActive(item.href);
              const prevItem = navItems[index - 1];
              const showSeparator = prevItem && prevItem.category !== item.category;
              
              return (
                <React.Fragment key={item.href}>
                  {showSeparator && (
                    <div className="px-2 py-1">
                      <div className="h-px bg-border" />
                    </div>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 w-full rounded-md px-2 py-2 text-sm transition-all duration-200 ${
                          active
                            ? "!bg-purple-600 !text-white font-semibold shadow-md"
                            : "text-sidebar-foreground hover:!bg-accent hover:!text-accent-foreground"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            active
                              ? "!text-white"
                              : "text-muted-foreground group-hover:text-foreground"
                          } transition-colors`}
                        />
                        <span
                          className={
                            active
                              ? "!text-white font-medium"
                              : "font-normal"
                          }
                        >
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </React.Fragment>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        {superAdminUser && (
          <SidebarFooter>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-start">
                    <Avatar className="h-6 w-6 bg-purple-600">
                      <AvatarFallback className="bg-purple-600">
                        <Shield className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        Super Admin
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {superAdminUser.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Super Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/super-admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <SidebarTrigger />
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
              <Shield className="h-3 w-3" />
              <span>SUPER ADMIN MODE</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

