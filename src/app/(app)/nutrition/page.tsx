'use client';

import Image from 'next/image';
import { nutritionPlans } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NutritionPage() {
  const { user } = useAuth();
  const canAccess = (requiredTier: string) => {
    if (!user) return false;
    if (requiredTier === 'free') return true;
    if (requiredTier === 'pro') return user.subscriptionTier === 'pro' || user.subscriptionTier === 'elite';
    if (requiredTier === 'elite') return user.subscriptionTier === 'elite';
    return false;
  };

  const categories = ['All', 'Pre-match', 'Post-workout', 'Hydration', 'Ramadan', 'General'];

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="mb-3 font-headline text-4xl font-bold">Nutrition Plans</h1>
        <p className="text-lg text-muted-foreground">
          Fuel your performance with meal plans designed for Nigerian footballers using local foods
        </p>
      </div>

      <Tabs defaultValue="All" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {nutritionPlans
                .filter((plan) => category === 'All' || plan.category === category)
                .map((plan) => {
                  const hasAccess = canAccess(plan.requiredTier);
                  return (
                    <Card key={plan.id} className="flex flex-col overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image
                          src={plan.image.url}
                          alt={plan.title}
                          fill
                          className={`object-cover ${!hasAccess ? 'opacity-50' : ''}`}
                          data-ai-hint={plan.image.hint}
                        />
                        {!hasAccess && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Lock className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="font-headline">{plan.title}</CardTitle>
                          <Badge variant={hasAccess ? 'default' : 'secondary'}>
                            {plan.requiredTier.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-3">
                          <div>
                            <p className="mb-2 text-sm font-medium">Meal Plan Includes:</p>
                            <ul className="space-y-1">
                              {plan.meals.slice(0, 3).map((meal, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#008751]" />
                                  <span>{meal.mealType}: {meal.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Features local Nigerian foods
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="pt-0">
                        {hasAccess ? (
                          <Button className="w-full">View Full Plan</Button>
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

      {/* Nigerian Foods Info Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Nigerian Foods in Our Plans</CardTitle>
          <CardDescription>
            All our nutrition plans feature locally available foods that are nutritious and accessible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold">Protein Sources</h3>
              <p className="text-sm text-muted-foreground">
                Fish, Chicken, Beans, Eggs, Moi moi, Groundnuts, Soya
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Carbohydrates</h3>
              <p className="text-sm text-muted-foreground">
                Jollof Rice, Eba, Fufu, Pap, Yam, Plantain, Sweet Potato
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Vitamins & Minerals</h3>
              <p className="text-sm text-muted-foreground">
                Egusi soup, Vegetable soup, Efo riro, Fruits, Palm oil
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

