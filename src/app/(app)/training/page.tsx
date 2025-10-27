'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trainingPlans } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TrainingPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold">Personalized Training</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Expert recommendations to elevate your football skills.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainingPlans.map((plan) => (
          <Card key={plan.id} className="flex flex-col overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={plan.image.url}
                alt={plan.title}
                fill
                className="object-cover"
                data-ai-hint={plan.image.hint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline">{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                By <strong>{plan.author}</strong>, {plan.authorTitle}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/signup">Start Program</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}