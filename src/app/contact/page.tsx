'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search, Check, Hourglass, Eye, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { searchUsers, getSuggestedUsers } from '@/app/actions/user';

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

const UserCard = ({ userProfile }: { userProfile: UserProfile }) => {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                        <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{userProfile.username}</p>
                        <p className="text-sm text-muted-foreground">{userProfile.domain || 'Developer'}</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href={`/profile/${userProfile.username}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};


export default function ConnectPage() {
    const { user, loading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<UserProfile[]>([]);
    const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (user) {
                setIsLoadingSuggestions(true);
                const suggestedUsers = await getSuggestedUsers(user);
                setSuggestions(suggestedUsers);
                setIsLoadingSuggestions(false);
            }
        };
        fetchSuggestions();
    }, [user]);


    if (loading) return null;
    if (!user) return <p className="text-center mt-10">Please log in to find challengers.</p>;

    return (
        <div className="cyber-grid flex-1">
            <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-20">
                <div className="text-center space-y-4">
                    <h1 className="font-headline text-4xl font-bold text-glow sm:text-5xl">Find Challengers</h1>
                    <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                        Search for other developers on the platform or browse our suggestions to find your next competitor.
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
                        {!isSearching && results.length > 0 && (
                            results.map((foundUser) => <UserCard key={foundUser.uid} userProfile={foundUser} />)
                        )}
                        {!isSearching && results.length === 0 && searchTerm && (
                            <p className="text-center text-muted-foreground">No users found.</p>
                        )}
                    </div>

                    {!searchTerm && (
                         <div className="mt-16">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-headline font-bold">People You May Like</h2>
                            </div>
                            <div className="space-y-4">
                                {isLoadingSuggestions && <p className="text-center text-muted-foreground">Finding recommendations...</p>}
                                {!isLoadingSuggestions && suggestions.length === 0 && (
                                     <p className="text-center text-muted-foreground">
                                        No suggestions right now. Add some skills to your profile to get better recommendations!
                                    </p>
                                )}
                                {suggestions.map((suggestedUser) => (
                                    <UserCard key={suggestedUser.uid} userProfile={suggestedUser} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
