
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search, Check, Hourglass, Eye, Users, Gem, Star, Zap, Trophy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { searchUsers, getSuggestedUsers, sendConnectionRequest } from '@/app/actions/user';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AVAILABLE_MEDALLIONS } from '@/app/profile/page';
import Loading from '@/app/loading';
import { cn } from '@/lib/utils';
import hero from '@/public/hero3.png';
import mission from "@/public/rocket2.png";
import arena from "@/public/2vs.png";
import connect from "@/public/3shake.png";

// --- Components from merged pages ---

// Debounce hook from contact/page.tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// UserCard from contact/page.tsx
const UserCard = ({ userProfile, onLimitReached }: { userProfile: UserProfile, onLimitReached: (message: string) => void }) => {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    if (!currentUser) return null;

    const isConnected = currentUser.connections?.includes(userProfile.uid);
    const requestSent = currentUser.sentRequests?.includes(userProfile.uid);
    const requestReceived = currentUser.pendingConnections?.includes(userProfile.uid);

    const handleConnectClick = async () => {
        const { success, message, reason } = await sendConnectionRequest(currentUser.uid, userProfile.uid);
        if (success) {
            toast({ title: 'Request Sent!' });
        } else if (reason === 'limit_reached') {
            onLimitReached(message || 'Connection limit reached.');
        } else {
            toast({ title: 'Error', description: message || 'Could not send request.', variant: 'destructive' });
        }
    };

    const renderButton = () => {
        if (isConnected) {
            return <Button variant="secondary" size="sm" disabled><Users className="mr-2 h-4 w-4" /> Connected</Button>;
        }
        if (requestSent) {
            return <Button variant="secondary" size="sm" disabled><Hourglass className="mr-2 h-4 w-4" /> Sent</Button>;
        }
        if (requestReceived) {
            return <Button size="sm" onClick={() => router.push(`/profile/${userProfile.username}`)}>Respond</Button>;
        }
        return <Button size="sm" onClick={handleConnectClick}><UserPlus className="mr-2 h-4 w-4" /> Connect</Button>;
    };

    return (
        <Card className={cn(userProfile.plan === 'pro' && "border-amber-500/50 bg-amber-950/20 hover:bg-amber-950/40")}>
            <CardContent className="p-4 flex items-center justify-between relative">
                 {userProfile.plan === 'pro' && (
                    <div className="absolute top-2 right-2">
                        <Gem className="h-5 w-5 text-amber-500" />
                    </div>
                )}
                <Link href={`/profile/${userProfile.username}`} className="flex items-center gap-4 group">
                    <Avatar>
                        <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                        <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                           <p className="font-semibold text-lg group-hover:text-primary">{userProfile.username}</p>
                           {userProfile.medallions?.map(mId => {
                                const m = AVAILABLE_MEDALLIONS.find(med => med.id === mId);
                                return m ? (
                                    <Tooltip key={m.id}>
                                        <TooltipTrigger asChild>
                                            <Image src={`https://placehold.co/24x24.png`} width={24} height={24} alt={m.name} data-ai-hint={`${m.id} icon`} />
                                        </TooltipTrigger>
                                        <TooltipContent><p>{m.name}</p></TooltipContent>
                                    </Tooltip>
                                ) : null;
                            })}
                        </div>
                        <p className="text-sm text-muted-foreground">{userProfile.domain || 'Developer'}</p>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    {currentUser && renderButton()}
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/profile/${userProfile.username}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// Pricing Tiers from pricing/page.tsx
const TIERS_DATA = [
  {
    name: 'Free',
    id: 'free',
    price: '$0',
    priceSuffix: '/ month',
    description: 'For individuals starting their journey in the coding arena.',
    features: [
      { text: '1 AI Mode Challenge per day', icon: <Zap className="h-5 w-5 text-primary" /> },
      { text: 'Unlimited Classic Mode Challenges', icon: <Trophy className="h-5 w-5 text-primary" /> },
      { text: 'Up to 10 Connections', icon: <Users className="h-5 w-5 text-primary" /> },
    ],
    buttonText: 'Current Plan',
  },
  {
    name: 'Pro',
    id: 'pro',
    price: '$9.99',
    priceSuffix: '/ month',
    description: 'For dedicated developers who want to push their limits.',
    features: [
      { text: 'Unlimited AI Mode Challenges', icon: <Zap className="h-5 w-5 text-amber-500" /> },
      { text: 'Unlimited Classic Mode Challenges', icon: <Trophy className="h-5 w-5 text-amber-500" /> },
      { text: 'Up to 50 Connections', icon: <Users className="h-5 w-5 text-amber-500" /> },
    ],
    buttonText: 'Current Plan',
    upgradeButtonText: 'Upgrade to Pro',
    isPopular: true,
  },
];

// --- Main Homepage Component ---

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State from contact/page.tsx
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitDialogMessage, setLimitDialogMessage] = useState('');

  // Effects from contact/page.tsx
  useEffect(() => {
    const handleSearch = async () => {
        if (debouncedSearchTerm.trim().length > 1 && user) {
            setIsSearching(true);
            const users = await searchUsers(user.uid, debouncedSearchTerm);
            setResults(users);
            setIsSearching(false);
        } else {
            setResults([]);
        }
    };
    handleSearch();
  }, [debouncedSearchTerm, user]);

  useEffect(() => {
    const fetchSuggestions = async () => {
        if (user) {
            setIsLoadingSuggestions(true);
            const suggestedUsers = await getSuggestedUsers(user);
            setSuggestions(suggestedUsers);
            setIsLoadingSuggestions(false);
        } else {
            setIsLoadingSuggestions(false);
        }
    };
    fetchSuggestions();
  }, [user]);
  
  const handleLimitReached = (message: string) => {
      setLimitDialogMessage(message);
      setShowLimitDialog(true);
  }

  // Logic from pricing/page.tsx
  const currentPlanId = user?.plan || 'free';

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen cyber-grid">
        <main className="flex-1">
          {/* --- Hero Section --- */}
          <section className="relative w-full h-[80vh] flex items-center justify-center text-center overflow-hidden">
             <Image
              src={hero}
              alt="Abstract data stream background"
              data-ai-hint="abstract data stream"
              layout="fill"
              objectFit="cover"
              className="absolute inset-0 w-full h-full opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            <div className="relative container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  From Rookie to Veteran
                </div>
                <h1 className="text-5xl font-bold tracking-tighter font-headline sm:text-7xl xl:text-8xl/none text-glow">
                  Enter the Coding Arena
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Face unique AI-generated problems or timeless classics from the competitive scene. Connect with developers, challenge your friends, and dominate the leaderboard.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                  <Button asChild size="lg" className="font-bold group">
                    <Link href="/challenge">
                      Launch Challenge
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* --- Features Section --- */}
          <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">An Arena Built For Growth</h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Engineered for unpredictability. Designed for community.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-3 lg:gap-12">
                  <div className="cyber-card flex flex-col justify-center space-y-4 h-full">
                      <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-full mt-1">
                              <Zap className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold font-headline">AI Mode</h3>
                              <p className="text-muted-foreground">
                                Test your creativity against a limitless stream of unique, AI-generated coding challenges. A true test of adaptability.
                              </p>
                          </div>
                      </div>
                  </div>
                   <div className="cyber-card flex flex-col justify-center space-y-4 h-full">
                      <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-full mt-1">
                              <Trophy className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold font-headline">Classic Mode</h3>
                              <p className="text-muted-foreground">
                                Prove your mastery by solving problems inspired by legendary competitive programming platforms.
                              </p>
                          </div>
                      </div>
                  </div>
                   <div className="cyber-card flex flex-col justify-center space-y-4 h-full">
                      <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-full mt-1">
                              <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold font-headline">Connect & Compete</h3>
                              <p className="text-muted-foreground">
                                Find and connect with other developers. Invite your friends to a challenge and see who comes out on top.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </section>

          {/* --- About Section (from about/page.tsx) --- */}
          <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
              <div className="container mx-auto max-w-5xl px-4 md:px-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">About Challenger.io</h2>
                  <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                    We believe that the best way to grow as a developer is to be consistently challenged. But finding fresh, interesting problems that match your skill level can be a chore. That's why we created Challenger.io.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
                    <div className="space-y-4">
                        <h3 className="text-3xl font-headline font-bold text-glow">Our Mission</h3>
                        <p className="text-muted-foreground text-lg">
                            Our mission is to make skill development fun, engaging, and a little unpredictable. By leveraging generative AI and classic competitive problems, we provide a limitless supply of coding challenges. The "Wheel of Fate" adds an element of surprise, ensuring you're always on your toes.
                        </p>
                    </div>
                    <div className="cyber-card p-0 overflow-hidden">
                         <Image
                            src={mission}
                            width={600}
                            height={400}
                            alt="Mission"
                            data-ai-hint="futuristic code"
                            className="object-cover hue-rotate-[55deg]"
                        />
                    </div>
                </div>
                
                 <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
                    <div className="md:order-last space-y-4">
                        <h3 className="text-3xl font-headline font-bold text-glow">Two Arenas, One Goal</h3>
                         <p className="text-muted-foreground text-lg">
                            We offer two distinct modes to sharpen your skills. The <strong className="text-primary/90">AI Mode</strong> (<Zap className="inline h-5 w-5"/>) throws novel, creative problems at you, while the <strong className="text-primary/90">Classic Mode</strong> (<Trophy className="inline h-5 w-5"/>) test your fundamentals with problems inspired by legendary competitive platforms.
                        </p>
                    </div>
                    <div className="cyber-card p-0 overflow-hidden">
                         <Image
                            src={arena}
                            width={600}
                            height={400}
                            alt="Built for you"
                            data-ai-hint="developer community"
                            className="object-cover hue-rotate-[55deg]"
                        />
                    </div>
                </div>

                 <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
                    <div className="space-y-4">
                        <h3 className="text-3xl font-headline font-bold text-glow">Connect & Compete</h3>
                        <p className="text-muted-foreground text-lg">
                            Challenger.io is more than just a training ground; it's a community. Find and connect with other developers, invite them to friendly competitions, and grow your skills together.
                        </p>
                    </div>
                    <div className="cyber-card p-0 overflow-hidden">
                         <Image
                            src={connect}
                            width={600}
                            height={400}
                            alt="Mission"
                            data-ai-hint="social connection"
                            className="object-cover hue-rotate-[55deg]"
                        />
                    </div>
                </div>
              </div>
          </section>

          {/* --- Pricing Section (from pricing/page.tsx) --- */}
          <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
              <div className="container mx-auto max-w-5xl px-4 md:px-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">Choose Your Arena</h2>
                  <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
                    Select the plan that best fits your training regimen. Upgrade anytime to unlock your full potential.
                  </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  {TIERS_DATA.map((tier) => {
                    const isCurrent = tier.id === currentPlanId;
                    return (
                        <div
                        key={tier.name}
                        className={cn(
                            'cyber-card p-8 flex flex-col relative',
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
                            {user ? (
                                isCurrent ? (
                                    <Button
                                        className="w-full text-lg font-bold"
                                        variant="secondary"
                                        disabled
                                    >
                                    {tier.buttonText}
                                    </Button>
                                ) : (
                                    tier.upgradeButtonText && (
                                        <Button className="w-full text-lg font-bold" disabled>
                                            {tier.upgradeButtonText}
                                        </Button>
                                    )
                                )
                            ) : (
                                <Button asChild className="w-full text-lg font-bold">
                                    <Link href="/signup">Sign Up to Start</Link>
                                </Button>
                            )}
                        </div>
                        </div>
                  )})}
                </div>
              </div>
          </section>

          {/* --- Connect Section (from contact/page.tsx) --- */}
          <section id="connect" className="w-full py-12 md:py-24 lg:py-32 bg-background">
              <div className="container mx-auto max-w-4xl px-4 md:px-6">
                  <div className="text-center space-y-4">
                      <h2 className="font-headline text-3xl font-bold text-glow sm:text-5xl">Find Challengers</h2>
                      <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                          Search for other developers on the platform or browse our suggestions to find your next competitor.
                      </p>
                  </div>

                  <div className="mt-12 max-w-2xl mx-auto">
                      {user ? (
                        <>
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                  placeholder="Search by username..."
                                  className="pl-10 text-lg"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>

                          <div className="mt-8 space-y-4">
                              {isSearching && <p className="text-center text-muted-foreground">Searching...</p>}
                              {!isSearching && results.length > 0 && (
                                  results.map((foundUser) => <UserCard key={foundUser.uid} userProfile={foundUser} onLimitReached={handleLimitReached} />)
                              )}
                              {!isSearching && results.length === 0 && searchTerm && (
                                  <p className="text-center text-muted-foreground">No users found.</p>
                              )}
                          </div>

                          {!searchTerm && (
                               <div className="mt-16">
                                  <div className="flex items-center gap-3 mb-6">
                                      <Users className="h-6 w-6 text-primary" />
                                      <h3 className="text-2xl font-headline font-bold">People You May Like</h3>
                                  </div>
                                  <div className="space-y-4">
                                      {isLoadingSuggestions && <p className="text-center text-muted-foreground">Finding recommendations...</p>}
                                      {!isLoadingSuggestions && suggestions.length === 0 && (
                                           <p className="text-center text-muted-foreground">
                                              No suggestions right now. Add some skills to your profile to get better recommendations!
                                          </p>
                                      )}
                                      {suggestions.map((suggestedUser) => (
                                          <UserCard key={suggestedUser.uid} userProfile={suggestedUser} onLimitReached={handleLimitReached} />
                                      ))}
                                  </div>
                              </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center cyber-card p-8">
                            <h3 className="text-xl font-bold font-headline">Want to Connect?</h3>
                            <p className="text-muted-foreground mt-2 mb-4">Log in or create an account to find other developers, connect with them, and start challenging your friends.</p>
                            <Button asChild>
                                <Link href="/login">Login to Connect</Link>
                            </Button>
                        </div>
                      )}
                  </div>
              </div>
               <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2"><Gem className="text-amber-500" /> Upgrade to Pro</AlertDialogTitle>
                      <AlertDialogDescription>
                          {limitDialogMessage}
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                      <AlertDialogAction onClick={() => router.push('/#pricing')}>
                          View Plans
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
