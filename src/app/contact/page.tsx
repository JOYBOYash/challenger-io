'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search, Check, Hourglass, Eye } from 'lucide-react';
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
                        {results.map((foundUser) => (
                             <Card key={foundUser.uid}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={foundUser.photoURL} alt={foundUser.username} />
                                            <AvatarFallback>{foundUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-lg">{foundUser.username}</p>
                                            <p className="text-sm text-muted-foreground">{foundUser.domain || 'Developer'}</p>
                                        </div>
                                    </div>
                                    <Button asChild>
                                        <Link href={`/profile/${foundUser.username}`}>
                                            <Eye className="mr-2 h-4 w-4" /> View Profile
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
