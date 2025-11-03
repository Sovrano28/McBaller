"use client";

import Image from "next/image";
import { injuryPrevention } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Lock, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InjuryPreventionPage() {
  const { user } = useAuth();
  const canAccess = (requiredTier: string) => {
    if (!user) return false;
    const subscriptionTier =
      "subscriptionTier" in user ? user.subscriptionTier || "free" : "free";
    if (requiredTier === "free") return true;
    if (requiredTier === "pro")
      return subscriptionTier === "pro" || subscriptionTier === "elite";
    if (requiredTier === "elite") return subscriptionTier === "elite";
    return false;
  };

  const types = ["All", "Warm-up", "Stretching", "Strengthening", "Recovery"];

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="mb-3 font-headline text-4xl font-bold">
          Injury Prevention
        </h1>
        <p className="text-lg text-muted-foreground">
          Stay healthy and perform at your peak with science-backed prevention
          strategies
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-8 border-[#DC3545] bg-[#DC3545]/10">
        <AlertCircle className="h-4 w-4 text-[#DC3545]" />
        <AlertTitle>Prevention is Better Than Cure</AlertTitle>
        <AlertDescription>
          Most football injuries can be prevented with proper warm-up,
          conditioning, and recovery protocols. Make these routines part of your
          daily training regimen.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="All" className="mb-8">
        <TabsList className="grid w-full grid-cols-5">
          {types.map(type => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        {types.map(type => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {injuryPrevention
                .filter(protocol => type === "All" || protocol.type === type)
                .map(protocol => {
                  const hasAccess = canAccess(protocol.requiredTier);
                  return (
                    <Card
                      key={protocol.id}
                      className="flex flex-col overflow-hidden"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={protocol.image.url}
                          alt={protocol.title}
                          fill
                          className={`object-cover ${
                            !hasAccess ? "opacity-50" : ""
                          }`}
                          data-ai-hint={protocol.image.hint}
                        />
                        {!hasAccess && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Lock className="h-12 w-12 text-white" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3">
                          <Badge>{protocol.type}</Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="font-headline">
                            {protocol.title}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          {protocol.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{protocol.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{protocol.difficulty}</span>
                          </div>
                        </div>
                        {protocol.position && (
                          <div className="text-sm">
                            <span className="font-medium">Position:</span>{" "}
                            <span className="text-muted-foreground">
                              {protocol.position}
                            </span>
                          </div>
                        )}
                        <Badge variant={hasAccess ? "default" : "secondary"}>
                          {protocol.requiredTier.toUpperCase()}
                        </Badge>
                      </CardContent>
                      <CardContent className="pt-0">
                        {hasAccess ? (
                          <Button className="w-full">View Protocol</Button>
                        ) : (
                          <Link href="/pricing">
                            <Button className="w-full" variant="outline">
                              <Lock className="mr-2 h-4 w-4" />
                              Upgrade to Access
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Common Football Injuries Info */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Common Football Injuries
            </CardTitle>
            <CardDescription>
              Be aware of these frequent injuries and how to prevent them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="mb-1 font-semibold">Hamstring Strains</h4>
                <p className="text-sm text-muted-foreground">
                  Most common in sprinting. Prevent with proper warm-up and
                  strengthening.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">ACL Injuries</h4>
                <p className="text-sm text-muted-foreground">
                  Serious knee injury from sudden direction changes. Strengthen
                  with balance work.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">Ankle Sprains</h4>
                <p className="text-sm text-muted-foreground">
                  From twisting movements. Prevent with ankle strengthening and
                  proper footwear.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">Groin Strains</h4>
                <p className="text-sm text-muted-foreground">
                  Common in kicking. Prevent with hip flexibility and adductor
                  exercises.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Recovery Best Practices
            </CardTitle>
            <CardDescription>
              Essential recovery strategies for Nigerian climate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="mb-1 font-semibold">Hydration</h4>
                <p className="text-sm text-muted-foreground">
                  Drink 3-4 liters of water daily in hot climate. Add
                  electrolytes after training.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">Sleep</h4>
                <p className="text-sm text-muted-foreground">
                  Aim for 8-10 hours. Your body repairs during sleep.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">Cool Down</h4>
                <p className="text-sm text-muted-foreground">
                  Always include 10-15 minutes of light activity and stretching
                  after training.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">Listen to Your Body</h4>
                <p className="text-sm text-muted-foreground">
                  Pain is a warning sign. Rest when needed - don't push through
                  serious discomfort.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
