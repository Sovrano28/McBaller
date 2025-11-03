'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X, Crown, Zap, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PricingPage() {
  const { user } = useAuth();

  const tiers = [
    {
      name: 'Free',
      price: '₦0',
      period: 'forever',
      description: 'Get started with basic features',
      icon: Star,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      features: [
        'Basic profile creation',
        'Browse Nigerian league stats',
        '3 training program previews',
        'Limited nutrition tips',
        'Basic injury prevention guides',
        'Community feed access',
      ],
      limitations: [
        'No full training programs',
        'No complete nutrition plans',
        'No advanced injury protocols',
        'Limited stats upload',
      ],
      cta: user?.subscriptionTier === 'free' ? 'Current Plan' : 'Downgrade',
      isCurrent: user?.subscriptionTier === 'free',
    },
    {
      name: 'Pro',
      price: '₦5,000',
      period: 'per month',
      description: 'Full access to professional development',
      icon: Zap,
      iconColor: 'text-[#008751]',
      bgColor: 'bg-[#008751]/10',
      badge: '14-DAY FREE TRIAL',
      popular: true,
      features: [
        'Everything in Free, plus:',
        'Full access to all training programs',
        'Complete nutrition plans with recipes',
        'Advanced injury prevention protocols',
        'Unlimited stats upload',
        'Downloadable workout PDFs',
        'Priority support',
        'Progress tracking & analytics',
      ],
      limitations: [],
      cta: user?.subscriptionTier === 'pro' ? 'Current Plan' : 'Start Free Trial',
      isCurrent: user?.subscriptionTier === 'pro',
    },
    {
      name: 'Elite',
      price: '₦12,000',
      period: 'per month',
      description: 'Maximum support for serious athletes',
      icon: Crown,
      iconColor: 'text-[#FFB81C]',
      bgColor: 'bg-[#FFB81C]/10',
      features: [
        'Everything in Pro, plus:',
        '1-on-1 coaching sessions (monthly)',
        'Personalized training plan creation',
        'Custom meal plans from nutritionists',
        'Advanced analytics & insights',
        'Injury tracking journal',
        'Direct messaging with coaches',
        'Early access to new programs',
        'Video analysis consultations',
      ],
      limitations: [],
      cta: user?.subscriptionTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite',
      isCurrent: user?.subscriptionTier === 'elite',
    },
  ];

  const faqs = [
    {
      question: 'How does the 14-day free trial work?',
      answer: 'Sign up for Pro and get full access for 14 days completely free. No credit card required. After the trial, your subscription continues at ₦5,000/month unless you cancel.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! You can cancel your subscription at any time. If you cancel, you\'ll continue to have access until the end of your billing period.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, Paystack, mobile money (Paga, OPay), and debit cards. All payments are processed securely.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee if you\'re not satisfied with Pro or Elite subscriptions. No questions asked.',
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.',
    },
    {
      question: 'Are the training programs suitable for my level?',
      answer: 'Absolutely! We have programs for all levels - from beginners to advanced players. Each program clearly indicates the difficulty level and prerequisites.',
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-12 text-center">
        <h1 className="mb-3 font-headline text-4xl font-bold md:text-5xl">
          Choose Your Path to Excellence
        </h1>
        <p className="text-lg text-muted-foreground">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mb-12 grid gap-8 lg:grid-cols-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card 
              key={tier.name} 
              className={`relative flex flex-col ${tier.popular ? 'border-[#008751] shadow-lg' : ''} ${tier.isCurrent ? 'border-primary' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#008751]">MOST POPULAR</Badge>
                </div>
              )}
              {tier.badge && !tier.isCurrent && (
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="border-[#008751] text-[#008751]">
                    {tier.badge}
                  </Badge>
                </div>
              )}
              {tier.isCurrent && (
                <div className="absolute right-4 top-4">
                  <Badge>ACTIVE</Badge>
                </div>
              )}
              
              <CardHeader>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${tier.bgColor}`}>
                  <Icon className={`h-6 w-6 ${tier.iconColor}`} />
                </div>
                <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="font-headline text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className={`mt-0.5 h-5 w-5 flex-shrink-0 ${tier.iconColor}`} />
                      <span className={`text-sm ${feature.startsWith('Everything') ? 'font-semibold' : ''}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {tier.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <X className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardContent className="pt-0">
                <Button 
                  className="w-full" 
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={tier.isCurrent}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="font-headline">Secure Nigerian Payment Methods</CardTitle>
          <CardDescription>We support multiple payment options for your convenience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008751]/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Bank Transfer</p>
                <p className="text-sm text-muted-foreground">All Nigerian banks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008751]/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Paystack</p>
                <p className="text-sm text-muted-foreground">Cards & online banking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008751]/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path d="M17 2H7C5.89 2 5 2.89 5 4V20C5 21.11 5.89 22 7 22H17C18.11 22 19 21.11 19 20V4C19 2.89 18.11 2 17 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Mobile Money</p>
                <p className="text-sm text-muted-foreground">Paga, OPay</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Frequently Asked Questions</CardTitle>
          <CardDescription>Everything you need to know about our pricing and plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="mt-12 rounded-lg bg-[#008751] p-8 text-center text-white">
        <h2 className="mb-4 font-headline text-3xl font-bold">
          Ready to Elevate Your Game?
        </h2>
        <p className="mb-6 text-lg text-white/90">
          Join thousands of Nigerian footballers already improving with McSportng
        </p>
        <Button size="lg" variant="secondary">
          Start Your 14-Day Free Trial
        </Button>
        <p className="mt-4 text-sm text-white/70">
          No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
}

