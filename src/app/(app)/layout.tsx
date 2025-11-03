"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  BarChart2,
  Dumbbell,
  Apple,
  Shield,
  TrendingUp,
  Upload,
  CreditCard,
  Home,
  LogOut,
  User,
  Settings,
  Search,
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
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
    // e.g., /training should highlight when on /training/[id]
    // But /stats/upload should only match exactly /stats/upload
    const routesThatMatchNested = [
      "/training",
      "/nutrition",
      "/injury-prevention",
      "/league-stats",
      "/analytics",
      "/pricing",
      "/dashboard",
    ];
    if (routesThatMatchNested.includes(normalizedPath)) {
      // Check if pathname starts with this path followed by '/'
      // This handles cases like /training/123 highlighting "Training"
      if (normalizedPathname.startsWith(normalizedPath + "/")) {
        return true;
      }
    }

    return false;
  };

  // Debug: uncomment to see active states
  // console.log('Current pathname:', pathname);
  // navItems.forEach(item => {
  //   console.log(`${item.label}: ${isActive(item.href)}`);
  // });
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Check if user is on free tier (default to 'free' if undefined)
  const subscriptionTier =
    user && "subscriptionTier" in user
      ? user.subscriptionTier || "free"
      : "free";
  const isFreeUser = subscriptionTier === "free";

  // Check if trial is active
  const trialUsed = user && "trialUsed" in user ? user.trialUsed : false;
  const subscriptionExpiry =
    user && "subscriptionExpiry" in user ? user.subscriptionExpiry : undefined;
  const isTrialActive =
    subscriptionTier === "pro" &&
    !trialUsed &&
    subscriptionExpiry &&
    new Date(subscriptionExpiry) > new Date();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home, _id: "1" },
    { href: "/training", label: "Training", icon: Dumbbell, _id: "2" },
    { href: "/nutrition", label: "Nutrition", icon: Apple, _id: "3" },
    {
      href: "/injury-prevention",
      label: "Injury Prevention",
      icon: Shield,
      _id: "4",
    },
    {
      href: "/league-stats",
      label: "League Stats",
      icon: TrendingUp,
      _id: "5",
    },
    { href: "/stats/upload", label: "My Stats", icon: Upload, _id: "6" },
    { href: "/analytics", label: "Analytics", icon: BarChart2, _id: "7" },
    { href: "/pricing", label: "Subscription", icon: CreditCard, _id: "8" },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          {/* Free User Upgrade Banner */}
          {isFreeUser && (
            <div className="mx-3 mb-4 rounded-lg border border-[#FFB81C] bg-[#FFB81C]/10 p-3">
              <p className="mb-2 text-xs font-medium">Upgrade to Pro</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Unlock full training library
              </p>
              <Link href="/pricing">
                <Button size="sm" className="w-full text-xs">
                  Start 14-Day Trial
                </Button>
              </Link>
            </div>
          )}

          {/* Trial Active Banner */}
          {isTrialActive && (
            <div className="mx-3 mb-4 rounded-lg border border-[#008751] bg-[#008751]/10 p-3">
              <p className="text-xs font-medium text-[#008751]">
                Pro Trial Active 🎉
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {subscriptionExpiry
                  ? Math.ceil(
                      (new Date(subscriptionExpiry).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}{" "}
                days remaining
              </p>
            </div>
          )}

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
        {user && user.role === "player" && "username" in user && (
          <SidebarFooter>
            <Link href={`/profile/${user.username}`}>
              <SidebarMenuButton tooltip="Profile">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="truncate">{user.name}</span>
                {subscriptionTier !== "free" && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {subscriptionTier.toUpperCase()}
                  </Badge>
                )}
              </SidebarMenuButton>
            </Link>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search programs, stats, players..."
              className="w-full rounded-lg bg-card pl-8 md:w-[280px] lg:w-[320px]"
            />
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={"avatar" in user ? user.avatar : undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {(user.name || user.email || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name || user.email}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                    {user.role === "player" && (
                      <Badge variant="outline" className="mt-1 w-fit text-xs">
                        {subscriptionTier.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "player" && "username" in user && (
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "player" && (
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
