'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase/hooks';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useFirebase();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!auth) {
      toast({
        title: 'Configuration Error',
        description: 'Firebase is not configured correctly. Check the console for more details.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with email:', values.email);
      const result = await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log('Login successful:', result.user.email);
      
      // Wait a moment for auth state to be set before redirecting
      toast({ title: 'Login Successful', description: "Welcome back!" });
      
      // Give the app a moment to process the auth state
      setTimeout(() => {
        router.push('/profile');
      }, 500);
    } catch (error: any) {
      console.error('Login error code:', error.code);
      console.error('Login error:', error);
      
      // Firebase 'auth/invalid-credential' is returned for BOTH wrong password AND non-existent user (for security)
      // We'll inform the user about password since that's the most common case
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        toast({
          title: 'Login Failed',
          description: 'Incorrect email or password. Please check and try again, or sign up if you don\'t have an account.',
          variant: 'destructive'
        });
      } else if (error.code === 'auth/wrong-password') {
        toast({
          title: 'Incorrect Password',
          description: 'The password you entered is incorrect. Please try again.',
          variant: 'destructive'
        });
      } else if (error.code === 'auth/user-disabled') {
        toast({
          title: 'Account Disabled',
          description: 'This account has been disabled. Please contact support.',
          variant: 'destructive'
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          title: 'Too Many Login Attempts',
          description: 'Too many failed login attempts. Please try again later.',
          variant: 'destructive'
        });
      } else if (error.code === 'auth/network-request-failed') {
        toast({
          title: 'Network Error',
          description: 'Please check your internet connection and try again.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Login Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="cyber-grid flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-3xl font-bold font-headline">Login</CardTitle>
            <CardDescription>Access your account to start a new challenge.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
