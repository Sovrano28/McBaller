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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Shield, Star, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/mock-data';
import React, { useState } from 'react';

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

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
    
    const newUser: Player = {
        id: new Date().toISOString(),
        name: fullName,
        username: fullName.toLowerCase().replace(/\s/g, ''),
        email: email,
        avatar: 'https://picsum.photos/seed/newuser/100/100',
        position: 'Forward',
        stats: { goals: 0, assists: 0, tackles: 0 },
        bio: 'A new player on the McBaller platform!',
        team: 'Unattached',
        height: 180,
        weight: 75,
    };

    login(newUser);
    router.push('/');
     toast({
        title: 'Account Created!',
        description: `Welcome to McBaller, ${newUser.name}!`,
      });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Create your McBaller account to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" name="full-name" placeholder="Lionel Messi" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
             <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
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
                {showPassword ? <EyeOff /> : <Eye />}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>I am a...</Label>
            <RadioGroup
              defaultValue="player"
              name="role"
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="player"
                  id="player"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="player"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <User className="mb-3 h-6 w-6" />
                  Player
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="scout"
                  id="scout"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="scout"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Shield className="mb-3 h-6 w-6" />
                  Scout
                </Label>
              </div>
              <div>
                <RadioGroupItem value="fan" id="fan" className="peer sr-only" />
                <Label
                  htmlFor="fan"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Star className="mb-3 h-6 w-6" />
                  Fan
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
