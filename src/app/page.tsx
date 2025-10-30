import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLogo } from "@/components/app-logo";
import {
  Dumbbell,
  Apple,
  Shield,
  TrendingUp,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <AppLogo />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2">
            <Star className="h-4 w-4 fill-[#FFB81C] text-[#FFB81C]" />
            <span className="text-sm font-medium">
              Professional Development for Nigerian Footballers
            </span>
          </div>
          <h1 className="mb-6 font-headline text-4xl font-bold leading-tight md:text-6xl">
            Elevate Your Football Career with{" "}
            <span className="text-[#008751]">Professional Training</span>,{" "}
            <span className="text-[#FFB81C]">Nutrition</span> &{" "}
            <span className="text-[#DC3545]">Injury Prevention</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Join Nigeria's premier football development platform. Access expert
            training programs, personalized nutrition plans, and injury
            prevention strategies designed specifically for home-based Nigerian
            players.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/league-stats">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Nigerian League Stats
              </Button>
            </Link>
          </div>

          {/* Stats Counter */}
          <div className="mt-12 grid grid-cols-3 gap-4 rounded-lg border bg-card p-6">
            <div>
              <div className="font-headline text-3xl font-bold text-[#008751]">
                2,500+
              </div>
              <div className="text-sm text-muted-foreground">
                Players Trained
              </div>
            </div>
            <div>
              <div className="font-headline text-3xl font-bold text-[#FFB81C]">
                5,000+
              </div>
              <div className="text-sm text-muted-foreground">
                Programs Completed
              </div>
            </div>
            <div>
              <div className="font-headline text-3xl font-bold text-[#DC3545]">
                10,000+
              </div>
              <div className="text-sm text-muted-foreground">
                Injuries Prevented
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Pillars */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">
              Comprehensive Development Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to take your game to the next level
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Training Programs */}
            <Card className="border-[#008751]/20">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#008751]/10">
                  <Dumbbell className="h-6 w-6 text-[#008751]" />
                </div>
                <CardTitle className="font-headline">
                  Training Programs
                </CardTitle>
                <CardDescription>
                  Position-specific training programs designed for Nigerian
                  climate and conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#008751]" />
                    <span className="text-sm">
                      Technical skills development
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#008751]" />
                    <span className="text-sm">
                      Physical conditioning programs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#008751]" />
                    <span className="text-sm">Tactical awareness training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#008751]" />
                    <span className="text-sm">Goalkeeper-specific drills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Nutrition Plans */}
            <Card className="border-[#FFB81C]/20">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFB81C]/10">
                  <Apple className="h-6 w-6 text-[#FFB81C]" />
                </div>
                <CardTitle className="font-headline">
                  Diet & Nutrition
                </CardTitle>
                <CardDescription>
                  Meal plans using local Nigerian foods to optimize performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#FFB81C]" />
                    <span className="text-sm">Pre-match meal strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#FFB81C]" />
                    <span className="text-sm">
                      Post-workout recovery nutrition
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#FFB81C]" />
                    <span className="text-sm">Hydration for hot climate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#FFB81C]" />
                    <span className="text-sm">Supplements guide</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Injury Prevention */}
            <Card className="border-[#DC3545]/20">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#DC3545]/10">
                  <Shield className="h-6 w-6 text-[#DC3545]" />
                </div>
                <CardTitle className="font-headline">
                  Injury Prevention
                </CardTitle>
                <CardDescription>
                  Stay healthy and perform at your peak throughout the season
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#DC3545]" />
                    <span className="text-sm">Dynamic warm-up routines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#DC3545]" />
                    <span className="text-sm">Position-specific exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#DC3545]" />
                    <span className="text-sm">Recovery protocols</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#DC3545]" />
                    <span className="text-sm">Injury tracking journal</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nigerian League Stats Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">
              Nigerian League Statistics
            </h2>
            <p className="text-lg text-muted-foreground">
              Track and showcase your performance in the NPFL and beyond
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Card>
              <CardContent className="p-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <Trophy className="mx-auto mb-3 h-12 w-12 text-[#FFB81C]" />
                    <h3 className="mb-2 font-headline text-lg font-semibold">
                      Browse Stats
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      View stats from home-based Nigerian players across all
                      NPFL clubs
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="mx-auto mb-3 h-12 w-12 text-[#008751]" />
                    <h3 className="mb-2 font-headline text-lg font-semibold">
                      Upload Your Stats
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track your goals, assists, and performance throughout the
                      season
                    </p>
                  </div>
                  <div className="text-center">
                    <Users className="mx-auto mb-3 h-12 w-12 text-[#0066CC]" />
                    <h3 className="mb-2 font-headline text-lg font-semibold">
                      Get Discovered
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Showcase your achievements to coaches and scouts
                      nationwide
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <Link href="/league-stats">
                    <Button variant="outline" size="lg">
                      Explore League Statistics
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">
              Players Love McBaller
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from Nigerian footballers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  “My finishing improved in 4 weeks.”
                </CardTitle>
                <CardDescription>Striker, Enyimba FC</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The position-specific drills and heat-ready routines fit our
                  league perfectly. I scored 5 in 6 games.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  “Nutrition plans I can actually cook.”
                </CardTitle>
                <CardDescription>Midfielder, Kano Pillars</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Local foods, simple prep, and hydration tips for our climate.
                  Recovery is much better now.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  “Injury-free for a month.”
                </CardTitle>
                <CardDescription>Defender, Shooting Stars</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The hamstring protocol and cool-downs kept me fit through a
                  tight fixture schedule.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-[#008751] py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">
            Ready to Transform Your Football Career?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join thousands of Nigerian footballers who are already improving
            their game
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Start Your Free 14-Day Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-white/70">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <AppLogo />
              <p className="mt-4 text-sm text-muted-foreground">
                Professional development platform for Nigerian footballers
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Training Programs</li>
                <li>Nutrition Plans</li>
                <li>Injury Prevention</li>
                <li>League Statistics</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Twitter</li>
                <li>Instagram</li>
                <li>Facebook</li>
                <li>YouTube</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} McBaller. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
