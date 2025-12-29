
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { isUsernameTaken } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PRO_USER_EMAILS } from '@/context/auth-context';
import { useFirebase } from '@/firebase/hooks';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

// We create a separate schema for client-side validation that doesn't call the async refine.
const clientSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20, { message: 'Username must be less than 20 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const serverSchema = clientSchema.refine(async (data) => {
    return !(await isUsernameTaken(data.username));
}, {
    message: 'This username is already taken.',
    path: ['username'],
});


export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { auth, db } = useFirebase();
  
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: { username: '', email: '', password: '' },
    mode: 'onChange',
  });


  const onSubmit = async (values: z.infer<typeof clientSchema>) => {
    setIsLoading(true);

    if (!auth || !db) {
        toast({
            title: 'Configuration Error',
            description: 'Firebase is not configured correctly. Check the console for more details.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    // Server-side validation
    const serverValidation = await serverSchema.safeParseAsync(values);
    if (!serverValidation.success) {
        const error = serverValidation.error.flatten().fieldErrors.username?.[0];
        if (error) {
            form.setError('username', { type: 'manual', message: error });
        }
        setIsLoading(false);
        return;
    }


    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(values.username)}&background=random&color=fff`;

      await updateProfile(user, {
          displayName: values.username,
          photoURL,
      });

      const isPro = PRO_USER_EMAILS.includes(values.email);

      const userDocRef = doc(db, 'users', user.uid);
      const newUserProfileData = {
        uid: user.uid,
        username: values.username,
        email: values.email,
        plan: isPro ? 'pro' : 'free',
        connections: [],
        pendingConnections: [],
        sentRequests: [],
        photoURL: photoURL,
        bio: '',
        domain: '',
        skills: [],
        savedChallenges: [],
        lastAiChallengeTimestamp: 0,
        medallions: [],
      };

      // Set the document. This is allowed by our 'create' rule.
      await setDoc(userDocRef, newUserProfileData);
      
      toast({ title: 'Account Created!', description: 'Welcome to Challenger.io!' });
      router.push('/profile');

    } catch (error: any) {
      setIsLoading(false);
      if (error.code === 'auth/email-already-in-use') {
         toast({
          title: 'Sign Up Failed',
          description: 'This email is already in use. Please log in instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign Up Failed',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
        // This is a good place to log more detailed errors for debugging.
        console.error("Signup Error:", error);
        // We can also re-throw the error if we want it to be caught by a higher-level boundary.
        // For instance, the FirebaseErrorListener could catch this if we wrap it.
        const permissionError = new FirestorePermissionError({
            path: `users/${auth.currentUser?.uid || 'unknown'}`,
            operation: 'create',
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
      }
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
