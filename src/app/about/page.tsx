import Image from 'next/image';
import { Users, Zap, Trophy } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="cyber-grid flex-1">
      <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">About Challenger.io</h1>
          <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
            We believe that the best way to grow as a developer is to be consistently challenged. But finding fresh, interesting problems that match your skill level can be a chore. That's why we created Challenger.io.
          </p>
        </div>

        <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
            <div className="space-y-4">
                <h2 className="text-3xl font-headline font-bold text-glow">Our Mission</h2>
                <p className="text-muted-foreground text-lg">
                    Our mission is to make skill development fun, engaging, and a little unpredictable. By leveraging generative AI and classic competitive problems, we provide a limitless supply of coding challenges. The "Wheel of Fate" adds an element of surprise, ensuring you're always on your toes.
                </p>
            </div>
            <div className="cyber-card p-0 overflow-hidden">
                 <Image
                    src="https://placehold.co/600x400.png"
                    width={600}
                    height={400}
                    alt="Mission"
                    data-ai-hint="futuristic code"
                    className="object-cover"
                />
            </div>
        </div>
        
         <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
            <div className="md:order-last space-y-4">
                <h2 className="text-3xl font-headline font-bold text-glow">Two Arenas, One Goal</h2>
                 <p className="text-muted-foreground text-lg">
                    We offer two distinct modes to sharpen your skills. The <strong className="text-primary/90">AI Mode</strong> (<Zap className="inline h-5 w-5"/>) throws novel, creative problems at you, while the <strong className="text-primary/90">Classic Mode</strong> (<Trophy className="inline h-5 w-5"/>) test your fundamentals with problems inspired by legendary competitive platforms.
                </p>
            </div>
            <div className="cyber-card p-0 overflow-hidden">
                 <Image
                    src="https://placehold.co/600x400.png"
                    width={600}
                    height={400}
                    alt="Built for you"
                    data-ai-hint="developer community"
                    className="object-cover"
                />
            </div>
        </div>

         <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
            <div className="space-y-4">
                <h2 className="text-3xl font-headline font-bold text-glow">Connect & Compete</h2>
                <p className="text-muted-foreground text-lg">
                    Challenger.io is more than just a training ground; it's a community. Find and connect with other developers, invite them to friendly competitions, and grow your skills together.
                </p>
            </div>
            <div className="cyber-card p-0 overflow-hidden">
                 <Image
                    src="https://placehold.co/600x400.png"
                    width={600}
                    height={400}
                    alt="Mission"
                    data-ai-hint="social connection"
                    className="object-cover"
                />
            </div>
        </div>
      </div>
    </div>
  );
}
