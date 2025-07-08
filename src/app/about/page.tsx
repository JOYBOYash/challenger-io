import Image from 'next/image';

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
                    Our mission is to make skill development fun, engaging, and a little unpredictable. By leveraging generative AI, we provide a limitless supply of coding problems. The "Wheel of Fate" adds an element of surprise, ensuring you're always on your toes.
                </p>
            </div>
            <div>
                 <Image
                    src="https://placehold.co/600x400.png"
                    width={600}
                    height={400}
                    alt="Mission"
                    data-ai-hint="futuristic code"
                    className="overflow-hidden rounded-xl object-cover border-2 border-primary/20 opacity-75"
                />
            </div>
        </div>

         <div className="grid md:grid-cols-2 items-center gap-12 mt-16">
            <div className="md:order-last space-y-4">
                <h2 className="text-3xl font-headline font-bold text-glow">Built For You</h2>
                <p className="text-muted-foreground text-lg">
                    Whether you're a rookie just starting out, a crusader honing your skills, or a veteran looking for a true test, our platform is built for you. We aim to be the ultimate training ground for coders of all levels.
                </p>
            </div>
            <div>
                 <Image
                    src="https://placehold.co/600x400.png"
                    width={600}
                    height={400}
                    alt="Built for you"
                    data-ai-hint="developer community"
                    className="overflow-hidden rounded-xl object-cover border-2 border-primary/20 opacity-75"
                />
            </div>
        </div>
      </div>
    </div>
  );
}
