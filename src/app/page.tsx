import { Button } from '@/components/ui/button'; 
import { ArrowRight, Zap, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import hero from '@/public/hero3.png'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen cyber-grid">
      <main className="flex-1">
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
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>

          {/* Main Hero Content */}
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

        {/* Feature section remains unchanged */}

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
      </main>
    </div>
  );
}
