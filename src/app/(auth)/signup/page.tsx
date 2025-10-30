'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/mock-data';
import { nigerianStates, npflClubs } from '@/lib/mock-data';
import React, { useState } from 'react';

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [position, setPosition] = useState<'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'>('Forward');
  const [state, setState] = useState('');
  const [currentClub, setCurrentClub] = useState('');
  const [preferredFoot, setPreferredFoot] = useState<'Left' | 'Right' | 'Both'>('Right');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const dateOfBirth = formData.get('date-of-birth') as string;
    const password = formData.get('password') as string;
    const height = formData.get('height') as string;
    const weight = formData.get('weight') as string;

    if (!acceptedTerms) {
      toast({
        variant: 'destructive',
        title: 'Terms Required',
        description: 'You must accept the terms and conditions to continue.',
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description:
          'Password must be at least 8 characters long and include uppercase and lowercase letters, a number, and a symbol.',
      });
      return;
    }

    // Calculate trial expiry (14 days from now)
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);
    
    const newUser: Player = {
      id: Date.now().toString(),
      name: fullName,
      username: fullName.toLowerCase().replace(/\s/g, '_'),
      email: email,
      phone: phone,
      avatar: `https://picsum.photos/seed/${fullName.split(' ')[0]}/100/100`,
      dateOfBirth: dateOfBirth,
      state: state,
      currentLocation: state,
      position: position,
      currentClub: currentClub || 'Currently Clubless',
      preferredFoot: preferredFoot,
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined,
      stats: { goals: 0, assists: 0, tackles: 0 },
      leagueStats: [],
      bio: `Passionate Nigerian footballer from ${state}. Ready to take my game to the next level!`,
      subscriptionTier: 'pro', // Start with Pro trial
      subscriptionExpiry: trialExpiry.toISOString(),
      trialUsed: false,
      trainingCompleted: [],
      badges: [],
      joinedAt: new Date().toISOString(),
    };
    
    // Save user to a separate list in local storage
    const users = JSON.parse(localStorage.getItem('mcballer-users') || '[]');
    users.push(newUser);
    localStorage.setItem('mcballer-users', JSON.stringify(users));

    login(newUser);
    router.push('/dashboard');
    toast({
      title: 'Welcome to McBaller!',
      description: `Your 14-day Pro trial has started. Let's elevate your game, ${newUser.name}!`,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Start Your Free Trial</CardTitle>
        <CardDescription>
          Join Nigeria's premier football development platform. 14-day Pro trial included!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Basic Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name *</Label>
              <Input id="full-name" name="full-name" placeholder="Chukwuemeka Okonkwo" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-of-birth">Date of Birth *</Label>
              <Input id="date-of-birth" name="date-of-birth" type="date" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="player@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                defaultValue="+234"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must include uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Football Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="state">State of Origin *</Label>
              <Select value={state} onValueChange={setState} required>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {nigerianStates.map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Playing Position *</Label>
              <Select value={position} onValueChange={(value: any) => setPosition(value)} required>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="Defender">Defender</SelectItem>
                  <SelectItem value="Midfielder">Midfielder</SelectItem>
                  <SelectItem value="Forward">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="current-club">Current Club</Label>
              <Select value={currentClub} onValueChange={setCurrentClub}>
                <SelectTrigger id="current-club">
                  <SelectValue placeholder="Select club or leave empty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Currently Clubless">Currently Clubless</SelectItem>
                  {npflClubs.map((club) => (
                    <SelectItem key={club} value={club}>
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferred-foot">Preferred Foot</Label>
              <Select value={preferredFoot} onValueChange={(value: any) => setPreferredFoot(value)}>
                <SelectTrigger id="preferred-foot">
                  <SelectValue placeholder="Select foot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right">Right</SelectItem>
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Physical Attributes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="180"
                min="140"
                max="220"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="75"
                min="40"
                max="120"
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-[#008751] underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#008751] underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Start 14-Day Free Trial
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>No credit card required • Cancel anytime</p>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#008751] underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
