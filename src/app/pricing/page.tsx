import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Star, Users, Zap, Trophy, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    priceSuffix: '/ month',
    description: 'For individuals starting their journey in the coding arena.',
    features: [
      { text: '1 AI Mode Challenge per day', icon: <Zap className="h-5 w-5 text-primary" /> },
      { text: 'Unlimited Classic Mode Challenges', icon: <Trophy className="h-5 w-5 text-primary" /> },
      { text: 'Up to 10 Connections', icon: <Users className="h-5 w-5 text-primary" /> },
    ],
    buttonText: 'You are on this plan',
    buttonVariant: 'secondary' as const,
    isCurrent: true,
  },
  {
    name: 'Pro',
    price: '$9.99',
    priceSuffix: '/ month',
    description: 'For dedicated developers who want to push their limits.',
    features: [
      { text: 'Unlimited AI Mode Challenges', icon: <Zap className="h-5 w-5 text-purple-500" /> },
      { text: 'Powered by faster, premium AI models', icon: <Gem className="h-5 w-5 text-purple-500" /> },
      { text: 'Unlimited Classic Mode Challenges', icon: <Trophy className="h-5 w-5 text-purple-500" /> },
      { text: 'Up to 50 Connections', icon: <Users className="h-5 w-5 text-purple-500" /> },
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    isCurrent: false,
    isPopular: true,
  },
];


export default function PricingPage() {
  return (
    <div className="cyber-grid flex-1">
      <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">Choose Your Arena</h1>
          <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
            Select the plan that best fits your training regimen. Upgrade anytime to unlock your full potential.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'cyber-card p-8 flex flex-col',
                tier.isPopular ? 'border-primary shadow-2xl shadow-primary/10' : 'border-primary/20'
              )}
            >
              {tier.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4" /> Most Popular
                    </div>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-2xl font-bold font-headline text-primary">{tier.name}</h3>
                <p className="mt-4 text-muted-foreground">{tier.description}</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  <span className="text-lg text-muted-foreground">{tier.priceSuffix}</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <div className="shrink-0">{feature.icon}</div>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  className="w-full text-lg font-bold"
                  variant={tier.buttonVariant}
                  disabled={tier.isCurrent}
                >
                  <Link href="/">{tier.buttonText}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
