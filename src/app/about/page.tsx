import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="cyber-grid">
      <div className="container max-w-4xl py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">About Challenger.io</h1>
          <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
            We believe that the best way to grow as a developer is to be consistently challenged. But finding fresh, interesting problems that match your skill level can be a chore. That's why we created Challenger.io.
          </p>
        </div>

        <div className="py-12">
            <Image
                src="https://placehold.co/800x400.png"
                width={800}
                height={400}
                alt="About Us"
                data-ai-hint="futuristic interface"
                className="overflow-hidden rounded-xl object-cover border-2 border-primary/20 opacity-75 mx-auto"
            />
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div className="space-y-4">
                <h2 className="text-2xl font-headline font-bold text-glow">Our Mission</h2>
                <p className="text-muted-foreground md:text-lg">
                    Our mission is to make skill development fun, engaging, and a little unpredictable. By leveraging generative AI, we provide a limitless supply of coding problems. The "Wheel of Fate" adds an element of surprise, ensuring you're always on your toes.
                </p>
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-headline font-bold text-glow">Built For You</h2>
                <p className="text-muted-foreground md:text-lg">
                    Whether you're a rookie just starting out, a crusader honing your skills, or a veteran looking for a true test, our platform is built for you. We aim to be the ultimate training ground for coders of all levels.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
