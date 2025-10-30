"use client";

import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { profileViewsData, videoWatchesData } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  // Mock derived metrics (can be connected to real data later)
  const trainingCompletion = 72; // percent
  const programsStarted = 8;
  const programsCompleted = 5;
  const injuryFreeDays = 34;

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold">Profile Analytics</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track your reach, progress, and performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Training Completion</CardTitle>
            <CardDescription>Overall progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-headline text-3xl font-bold text-[#008751]">
              {trainingCompletion}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Programs</CardTitle>
            <CardDescription>Started vs completed</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-3">
            <div className="font-headline text-3xl font-bold">
              {programsStarted}
            </div>
            <Badge variant="secondary">{programsCompleted} completed</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Injury-free Days</CardTitle>
            <CardDescription>Past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-headline text-3xl font-bold text-[#FFB81C]">
              {injuryFreeDays}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nutrition Adherence</CardTitle>
            <CardDescription>Plan compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-headline text-3xl font-bold text-[#0066CC]">
              68%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Profile Views (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                views: { label: "Views", color: "hsl(var(--primary))" },
              }}
              className="h-64 w-full"
            >
              <LineChart
                data={profileViewsData}
                margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="views"
                  type="monotone"
                  stroke="var(--color-views)"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Video Watches</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                watches: { label: "Watches", color: "hsl(var(--accent))" },
              }}
              className="h-64 w-full"
            >
              <BarChart
                data={videoWatchesData}
                margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="watches" fill="var(--color-watches)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Placeholder */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Recommended Next Steps
            </CardTitle>
            <CardDescription>Based on recent activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Complete week 5 of "Speed & Agility for Nigerian Climate"</p>
            <p>• Start "Hydration for Heat" nutrition plan</p>
            <p>• Add stats for last weekend's match</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Milestones</CardTitle>
            <CardDescription>Keep the streak going</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 5 programs completed</p>
            <p>• 30 days injury-free</p>
            <p>• 10 goals this season</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
