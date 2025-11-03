"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  Home,
  Users,
  UsersRound,
  FileText,
  Receipt,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
  Building2,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import type { OrgAuthData } from "@/lib/auth-types";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => {
    // Normalize paths (remove trailing slashes)
    const normalizedPathname = pathname.replace(/\/$/, "") || "/";
    const normalizedPath = path.replace(/\/$/, "") || "/";

    // Exact match
    if (normalizedPathname === normalizedPath) {
      return true;
    }

    // For certain routes, allow matching nested paths
    const routesThatMatchNested = [
      "/org/dashboard",
      "/org/players",
      "/org/teams",
      "/org/contracts",
      "/org/billing",
      "/org/analytics",
      "/org/settings",
    ];
    if (routesThatMatchNested.includes(normalizedPath)) {
      // Check if pathname starts with this path followed by '/'
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

  // Type guard for org user
  const orgUser = user && user.role !== "player" ? (user as OrgAuthData) : null;

  const navItems = [
    { href: "/org/dashboard", label: "Dashboard", icon: Home },
    { href: "/org/players", label: "Players", icon: Users },
    { href: "/org/teams", label: "Teams", icon: UsersRound },
    { href: "/org/contracts", label: "Contracts", icon: FileText },
    { href: "/org/billing/invoices", label: "Invoices", icon: Receipt },
    { href: "/org/billing/payments", label: "Payments", icon: CreditCard },
    { href: "/org/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/org/settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 w-full rounded-md px-2 py-2 text-sm transition-all duration-200 ${
                        active
                          ? "!bg-primary !text-primary-foreground font-semibold shadow-md"
                          : "text-sidebar-foreground hover:!bg-accent hover:!text-accent-foreground"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${
                          active
                            ? "!text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        } transition-colors`}
                      />
                      <span
                        className={
                          active
                            ? "!text-primary-foreground font-medium"
                            : "font-normal"
                        }
                      >
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        {orgUser && (
          <SidebarFooter>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-start">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        <Building2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {orgUser.organizationName || "Organization"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {orgUser.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/org/settings">
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
