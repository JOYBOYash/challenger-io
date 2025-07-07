import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter font-headline sm:text-5xl xl:text-6xl/none">
                    Unleash Your Coding Potential
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Challenger.io offers unique, AI-generated coding problems to sharpen your skills. Spin the wheel, get a surprise challenge, and climb the ranks from Rookie to Veteran.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="font-bold">
                    <Link href="/challenge">
                      Start a Challenge
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="programming code"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Why Challenger.io?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is designed to make learning and practicing code fun, engaging, and unpredictable.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium font-headline">AI-Powered Challenges</CardTitle>
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Never face the same boring problem twice. Our AI generates unique challenges based on your chosen topic and skill level.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium font-headline">Multiplayer Fun</CardTitle>
                  <Users className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Challenge your friends or colleagues. Set up a game with multiple players and different skill levels for a competitive twist.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium font-headline">The Wheel of Fate</CardTitle>
                  <Zap className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add an element of surprise. Spin the wheel to get your challenge assigned. Who knows what you'll get?
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
