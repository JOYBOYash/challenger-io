'use client';

import { useState, useEffect } from 'react';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Search, Check, Hourglass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { searchUsers, sendConnectionRequest } from '@/app/actions/user';

// Debounce hook to prevent excessive API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ConnectPage() {
    const { user, loading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { toast } = useToast();

    useEffect(() => {
        const handleSearch = async () => {
            if (debouncedSearchTerm.trim().length > 1 && user) {
                setIsSearching(true);
                const users = await searchUsers(user.uid, debouncedSearchTerm);
                setResults(users);
                setIsSearching(false);
            } else {
                setResults([]);
            }
        };
        handleSearch();
    }, [debouncedSearchTerm, user]);

    const handleSendRequest = async (targetUserId: string) => {
        if (!user) return;
        
        const { success } = await sendConnectionRequest(user.uid, targetUserId);

        if (success) {
            toast({
                title: "Request Sent!",
                description: "Your connection request has been sent.",
            });
            // The user object from useAuth is reactive, so UI will update automatically.
        } else {
            toast({
                title: "Error",
                description: "Could not send request. Please try again.",
                variant: 'destructive',
            });
        }
    }

    if (loading) return null;
    if (!user) return <p className="text-center mt-10">Please log in to find challengers.</p>;

    return (
        <div className="cyber-grid flex-1">
            <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-20">
                <div className="text-center space-y-4">
                    <h1 className="font-headline text-4xl font-bold text-glow sm:text-5xl">Find Challengers</h1>
                    <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                        Search for other developers on the platform to connect with them and start a challenge.
                    </p>
                </div>

                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by username..."
                            className="pl-10 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="mt-8 space-y-4">
                        {isSearching && <p className="text-center text-muted-foreground">Searching...</p>}
                        {!isSearching && results.length === 0 && searchTerm && (
                            <p className="text-center text-muted-foreground">No users found.</p>
                        )}
                        {results.map((foundUser) => {
                            const isConnected = user.connections?.includes(foundUser.uid);
                            const requestSent = user.sentRequests?.includes(foundUser.uid);
                            const requestReceived = user.pendingConnections?.includes(foundUser.uid);

                            let buttonState: 'connect' | 'connected' | 'request_sent' | 'request_received' = 'connect';
                            if (isConnected) buttonState = 'connected';
                            else if (requestSent) buttonState = 'request_sent';
                            else if (requestReceived) buttonState = 'request_received';
                            
                            return (
                                <Card key={foundUser.uid}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback>{foundUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-lg">{foundUser.username}</p>
                                                <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => buttonState === 'connect' && handleSendRequest(foundUser.uid)}
                                            disabled={buttonState !== 'connect'}
                                            variant={buttonState === 'connect' ? 'default' : 'secondary'}
                                        >
                                            {buttonState === 'connected' && <Check className="mr-2" />}
                                            {buttonState === 'request_sent' && <Hourglass className="mr-2" />}
                                            {buttonState === 'request_received' && <UserPlus className="mr-2" />}
                                            {buttonState === 'connect' && <UserPlus className="mr-2" />}

                                            {buttonState === 'connected' ? 'Connected' :
                                             buttonState === 'request_sent' ? 'Request Sent' :
                                             buttonState === 'request_received' ? 'Respond on Profile' :
                                             'Connect'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
