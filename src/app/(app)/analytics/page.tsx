'use client';

import { BarChart, CartesianGrid, XAxis, Bar, Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { profileViewsData, videoWatchesData } from '@/lib/mock-data';

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--primary))",
  },
  watches: {
    label: "Watches",
    color: "hsl(var(--accent))",
  },
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold">Profile Analytics</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track your reach and engagement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Profile Views (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={profileViewsData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="views"
                  type="monotone"
                  stroke="var(--color-views)"
                  strokeWidth={2}
                  dot={true}
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
            <ChartContainer config={chartConfig} className="h-64 w-full">
             <BarChart data={videoWatchesData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="watches" fill="var(--color-watches)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
