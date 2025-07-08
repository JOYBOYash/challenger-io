import { Button } from '@/components/ui/button';
import { ArrowRight, Orbit, Network, Terminal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen cyber-grid">
      <main className="flex-1">
        <section className="relative w-full h-[80vh] flex items-center justify-center text-center overflow-hidden">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Hero Background"
            data-ai-hint="cyberpunk code city"
            fill
            sizes="100vw"
            className="absolute inset-0 z-0 object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
          <div className="container relative z-20 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                From Rookie to Veteran
              </div>
              <h1 className="text-5xl font-bold tracking-tighter font-headline sm:text-7xl xl:text-8xl/none text-glow">
                Enter the Coding Arena
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Face off against AI-generated challenges. Spin the wheel of fate, test your skills, and dominate the leaderboard. Your evolution starts now.
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

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">Why Challenger.io?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Engineered for unpredictability. Designed for growth.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                            <Terminal className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-headline">Infinite Problems</h3>
                            <p className="text-muted-foreground">
                              Our AI engine generates a limitless stream of unique coding challenges. Never face the same problem twice.
                            </p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                            <Network className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-headline">Dynamic Difficulty</h3>
                            <p className="text-muted-foreground">
                              From Rookie to Veteran, problems are tailored to each player's skill level, ensuring a meaningful challenge every time.
                            </p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                            <Orbit className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-headline">Wheel of Fate</h3>
                            <p className="text-muted-foreground">
                              Embrace the chaos. Spin the wheel to receive your randomly assigned challenge. A true test of adaptability.
                            </p>
                        </div>
                    </div>
                </div>
                <Image
                    src="https://placehold.co/800x600.png"
                    data-ai-hint="abstract code"
                    width={800}
                    height={600}
                    alt="Feature"
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full border-2 border-primary/20 opacity-75"
                />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
