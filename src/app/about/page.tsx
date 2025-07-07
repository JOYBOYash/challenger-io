import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="cyber-grid">
      <div className="container max-w-4xl py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-glow">About Challenger.io</h1>
            <p className="text-muted-foreground md:text-lg">
              We believe that the best way to grow as a developer is to be consistently challenged. But finding fresh, interesting problems that match your skill level can be a chore. That's why we created Challenger.io.
            </p>
            <p className="text-muted-foreground md:text-lg">
              Our mission is to make skill development fun, engaging, and a little unpredictable. By leveraging generative AI, we provide a limitless supply of coding problems. The "Wheel of Fate" adds an element of surprise, ensuring you're always on your toes.
            </p>
            <p className="text-muted-foreground md:text-lg">
              Whether you're a rookie just starting out, a crusader honing your skills, or a veteran looking for a true test, our platform is built for you.
            </p>
          </div>
          <div className="flex items-center justify-center">
              <Image
                  src="https://placehold.co/500x500.png"
                  width={500}
                  height={500}
                  alt="About Us"
                  data-ai-hint="futuristic interface"
                  className="overflow-hidden rounded-xl object-cover border-2 border-primary/20 opacity-75"
              />
          </div>
        </div>
      </div>
    </div>
  );
}
