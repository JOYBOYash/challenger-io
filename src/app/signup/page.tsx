'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/lib/firebase';
import { isUsernameTaken } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20, { message: 'Username must be less than 20 characters.' })
    .refine(async (username) => !(await isUsernameTaken(username)), {
        message: 'This username is already taken.',
    }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '', password: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    const from = searchParams.get('from');
    if (from === 'login-fail') {
        toast({
            title: "Account Not Found",
            description: "No account exists with those login details. Please create a new account.",
            variant: "destructive"
        });
    }
  }, [searchParams, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const { auth, db, error } = initializeFirebase();
    if (error || !auth || !db) {
        toast({
            title: 'Configuration Error',
            description: 'Firebase is not configured correctly. Check the console for more details.',
            variant: 'destructive',
        });
        console.error(error);
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Generate a photoURL from the username
      const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(values.username)}&background=random&color=fff`;

      // Update the user's profile in Firebase Auth
      await updateProfile(user, {
          displayName: values.username,
          photoURL,
      });

      // Create the user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: values.username,
        email: values.email,
        connections: [],
        photoURL: photoURL,
        bio: '',
        domain: '',
        skills: [],
        savedChallenges: [],
        lastAiChallengeTimestamp: 0,
      });
      
      toast({ title: 'Account Created!', description: 'Welcome to Challenger.io!' });
      router.push('/challenge');
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cyber-grid flex-1 flex items-center justify-center p-4">
       <Card className="w-full max-w-sm p-6 shadow-2xl">
        <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-3xl font-bold font-headline">Create Account</CardTitle>
            <CardDescription>Join the arena and start your journey.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Coder Alias" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
       </Card>
    </div>
  );
}
