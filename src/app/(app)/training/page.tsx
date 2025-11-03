"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { trainingPlans } from "@/lib/mock-data";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dumbbell, Lock, Timer, TrendingUp, Filter } from "lucide-react";

export default function TrainingPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<
    "All" | "Goalkeeper" | "Defender" | "Midfielder" | "Forward"
  >("All");
  const [difficulty, setDifficulty] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced"
  >("All");
  const [duration, setDuration] = useState<
    "All" | "2-week" | "4-week" | "6-week" | "8-week" | "12-week"
  >("All");

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

  const categories = [
    "All",
    "Technical",
    "Physical",
    "Tactical",
    "Goalkeeper",
  ] as const;

  const filtered = useMemo(() => {
    return trainingPlans.filter(plan => {
      const matchesQuery =
        plan.title.toLowerCase().includes(query.toLowerCase()) ||
        plan.description.toLowerCase().includes(query.toLowerCase());
      const matchesPos =
        position === "All" || plan.position === position || !plan.position;
      const matchesDiff =
        difficulty === "All" || plan.difficulty === difficulty;
      const matchesDur = duration === "All" || plan.duration === duration;
      return matchesQuery && matchesPos && matchesDiff && matchesDur;
    });
  }, [query, position, difficulty, duration]);

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="mb-3 font-headline text-4xl font-bold">
          Training Programs
        </h1>
        <p className="text-lg text-muted-foreground">
          Position-specific programs designed for Nigerian climate and
          conditions
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Input
                placeholder="Search programs..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-9"
              />
              <Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={position} onValueChange={(v: any) => setPosition(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Positions</SelectItem>
                <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="Defender">Defender</SelectItem>
                <SelectItem value="Midfielder">Midfielder</SelectItem>
                <SelectItem value="Forward">Forward</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={difficulty}
              onValueChange={(v: any) => setDifficulty(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={duration} onValueChange={(v: any) => setDuration(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Any Duration</SelectItem>
                <SelectItem value="2-week">2-week</SelectItem>
                <SelectItem value="4-week">4-week</SelectItem>
                <SelectItem value="6-week">6-week</SelectItem>
                <SelectItem value="8-week">8-week</SelectItem>
                <SelectItem value="12-week">12-week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Tabs defaultValue="All" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter(
                  plan => category === "All" || plan.category === category
                )
                .map(plan => {
                  const hasAccess = canAccess(plan.requiredTier);
                  return (
                    <Card
                      key={plan.id}
                      className="flex flex-col overflow-hidden"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={plan.image.url}
                          alt={plan.title}
                          fill
                          className={`object-cover ${
                            !hasAccess ? "opacity-60" : ""
                          }`}
                          data-ai-hint={plan.image.hint}
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <Badge variant="secondary">{plan.category}</Badge>
                          {plan.position && <Badge>{plan.position}</Badge>}
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="font-headline">
                            {plan.title}
                          </CardTitle>
                          <Badge variant={hasAccess ? "default" : "secondary"}>
                            {plan.requiredTier.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            <span>{plan.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{plan.difficulty}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="pt-0">
                        {hasAccess || plan.isFree ? (
                          <Link href={`/training/${plan.id}`}>
                            <Button className="w-full">
                              <Dumbbell className="mr-2 h-4 w-4" />
                              View Program
                            </Button>
                          </Link>
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
    </div>
  );
}
