import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { trainingPlans } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Timer, TrendingUp, ListChecks } from "lucide-react";

export default function TrainingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const program = trainingPlans.find(p => p.id === params.id);
  if (!program) return notFound();

  return (
    <div className="container mx-auto">
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src={program.image.url}
              alt={program.title}
              fill
              className="object-cover"
              data-ai-hint={program.image.hint}
            />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="font-headline text-3xl">
                {program.title}
              </CardTitle>
              <Badge>{program.requiredTier.toUpperCase()}</Badge>
            </div>
            <CardDescription>{program.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                <span>{program.category}</span>
              </div>
              {program.position && (
                <Badge variant="secondary">{program.position}</Badge>
              )}
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{program.difficulty}</span>
              </div>
            </div>

            {program.prerequisites && program.prerequisites.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Prerequisites</p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {program.prerequisites.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {program.equipment && program.equipment.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Equipment Needed</p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {program.equipment.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button>Start Program</Button>
              <Button variant="outline" asChild>
                <Link href="#">Download PDF</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            <CardTitle className="font-headline">Weekly Breakdown</CardTitle>
          </div>
          <CardDescription>
            Detailed day-by-day sessions coming soon. For now, follow the
            program overview and exercises provided.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <p className="font-medium">Week {i + 1}</p>
              <p className="text-sm text-muted-foreground">
                Warm-up • Main Work • Cool-down
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Back CTA */}
      <div className="mt-8 text-center">
        <Link href="/training">
          <Button variant="outline">Back to Programs</Button>
        </Link>
      </div>
    </div>
  );
}
