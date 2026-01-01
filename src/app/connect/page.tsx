'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useUserActions } from '@/hooks/useUserActions';
import Loading from '@/app/loading';
import type { UserProfile } from '@/context/auth-context';
import { ChevronLeft, Search, UserPlus, Mail, Code, Globe, Trophy, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const AVAILABLE_MEDALLIONS: Record<string, { icon: string; label: string; color: string }> = {
  'genius': { icon: '🧠', label: 'Genius', color: 'from-purple-500 to-pink-500' },
  'speedrun': { icon: '⚡', label: 'Speedrun', color: 'from-yellow-500 to-orange-500' },
  'multitask': { icon: '🎯', label: 'Multitask', color: 'from-blue-500 to-cyan-500' },
  'perfectionist': { icon: '✨', label: 'Perfectionist', color: 'from-pink-500 to-rose-500' },
  'team-player': { icon: '🤝', label: 'Team Player', color: 'from-green-500 to-emerald-500' },
};

export default function ConnectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { getAllUsers, getConnectedUsers, sendConnectionRequest } = useUserActions();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainQuery, setDomainQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Ref to track if we've already loaded
  const hasLoadedRef = useRef(false);

  // Extract unique skills and domains
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    users.forEach(u => {
      u.skills?.forEach(s => skills.add(s));
    });
    return Array.from(skills).sort();
  }, [users]);

  const filteredDomains = useMemo(() => {
    const domains = new Set<string>();
    users.forEach(u => {
      if (u.domain) domains.add(u.domain);
    });
    return Array.from(domains)
      .filter(d => d.toLowerCase().includes(domainQuery.toLowerCase()))
      .sort();
  }, [users, domainQuery]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Don't show current user
      if (u.uid === user?.uid) return false;

      // Search by name or username
      const nameMatch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       u.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by skills
      const skillsMatch = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => u.skills?.includes(skill));

      // Filter by domain
      const domainMatch = !domainQuery || 
                         u.domain?.toLowerCase().includes(domainQuery.toLowerCase());

      return nameMatch && skillsMatch && domainMatch;
    });
  }, [users, searchQuery, selectedSkills, domainQuery, user?.uid]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error('Connect page: Load timeout after 30 seconds');
        setIsLoading(false);
        toast({
          title: 'Connection Failed',
          description: 'Unable to load players. Please refresh the page.',
          variant: 'destructive',
        });
      }
    }, 30000);

    return () => clearTimeout(timeout);
  }, [isLoading, toast]);

  // Load users only once when user becomes available
  useEffect(() => {
    if (!user || hasLoadedRef.current) {
      return;
    }
    
    hasLoadedRef.current = true;
    
    const loadData = async () => {
      console.log('loadUsers: starting');
      setIsLoading(true);
      try {
        console.log('loadUsers: fetching all users');
        const allUsersData = await getAllUsers();
        console.log('loadUsers: got all users:', allUsersData.length);
        
        console.log('loadUsers: fetching connected users');
        const connectedUsers = await getConnectedUsers(user.uid);
        console.log('loadUsers: got connected users:', connectedUsers.length);
        
        setUsers(allUsersData);
        setConnectedUserIds(connectedUsers.map(u => u.uid));
        setSentRequestIds(user.sentRequests || []);
        console.log('loadUsers: complete');
      } catch (error) {
        console.error('loadUsers error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.uid]);

  const handleSendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      const { success, error } = await sendConnectionRequest(user.uid, targetUserId);
      if (success) {
        setSentRequestIds([...sentRequestIds, targetUserId]);
        toast({
          title: 'Request Sent',
          description: 'Connection request sent successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: error || 'Failed to send connection request.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Players</h2>
          <p className="text-muted-foreground text-sm">Fetching available players...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You need to be logged in to connect with other players.</p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto p-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-primary/20"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold font-headline">Connect</h1>
                <p className="text-sm text-muted-foreground">Find and connect with other players</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-primary/20"
              />
            </div>

            {/* Collapsible Filters */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-card border-primary/20 hover:bg-card/80"
              >
                <ChevronDown className={cn("h-4 w-4 mr-2 transition-transform", showFilters && "rotate-180")} />
                Filters {(selectedSkills.length > 0 || domainQuery) && `(${selectedSkills.length + (domainQuery ? 1 : 0)})`}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                {/* Skills Filter */}
                <div className="bg-card rounded-lg p-4 border border-primary/10">
                  <Label className="text-sm font-semibold mb-3 block">Filter by Skills</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allSkills.length > 0 ? (
                      allSkills.map(skill => (
                        <div key={skill} className="flex items-center gap-2">
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={selectedSkills.includes(skill)}
                            onCheckedChange={() => toggleSkillFilter(skill)}
                          />
                          <label
                            htmlFor={`skill-${skill}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {skill}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No skills available</p>
                    )}
                  </div>
                </div>

                {/* Domain Search Filter */}
                <div className="bg-card rounded-lg p-4 border border-primary/10">
                  <Label htmlFor="domain-search" className="text-sm font-semibold mb-3 block">Filter by Domain</Label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="domain-search"
                        placeholder="Search domains..."
                        value={domainQuery}
                        onChange={(e) => setDomainQuery(e.target.value)}
                        className="pl-10 bg-background border-primary/20 text-sm"
                      />
                    </div>
                    {domainQuery && filteredDomains.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filteredDomains.slice(0, 5).map(domain => (
                          <div
                            key={domain}
                            className="text-sm p-2 rounded cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => setDomainQuery(domain)}
                          >
                            {domain}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Players Grid */}
      <div className="container mx-auto p-4 md:px-6 py-8">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No players found matching your filters.</p>
            {(searchQuery || selectedSkills.length > 0 || domainQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSkills([]);
                  setDomainQuery('');
                  setShowFilters(false);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(playerUser => {
              const isConnected = connectedUserIds.includes(playerUser.uid);
              const hasRequestSent = sentRequestIds.includes(playerUser.uid);

              return (
                <Card key={playerUser.uid} className="bg-card hover:bg-card/80 transition-colors group overflow-hidden border border-primary/10 hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className="p-6">
                      {/* Player Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <button
                          onClick={() => router.push(`/profile/${playerUser.username}`)}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={playerUser.photoURL} alt={playerUser.username} />
                            <AvatarFallback>{playerUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => router.push(`/profile/${playerUser.username}`)}
                            className="text-left hover:text-primary transition-colors"
                          >
                            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{playerUser.username}</h3>
                          </button>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{playerUser.email}</span>
                          </div>
                          {playerUser.plan && (
                            <div className="flex items-center gap-2">
                              <Trophy className="h-3 w-3 text-yellow-500" />
                              <Badge variant="outline" className="text-xs capitalize">
                                {playerUser.plan}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {playerUser.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {playerUser.bio}
                        </p>
                      )}

                      {/* Domain */}
                      {playerUser.domain && (
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm">{playerUser.domain}</span>
                        </div>
                      )}

                      {/* Skills */}
                      {playerUser.skills && playerUser.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            <Code className="h-3 w-3" />
                            Skills
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {playerUser.skills.slice(0, 3).map(skill => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {playerUser.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{playerUser.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medallions */}
                      {playerUser.medallions && playerUser.medallions.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            <TooltipProvider>
                              {playerUser.medallions.map(medallion => {
                                const medallionInfo = AVAILABLE_MEDALLIONS[medallion];
                                return (
                                  <Tooltip key={medallion}>
                                    <TooltipTrigger asChild>
                                      <div className="text-2xl cursor-help">
                                        {medallionInfo?.icon || '🏆'}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{medallionInfo?.label || medallion}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </TooltipProvider>
                          </div>
                        </div>
                      )}

                      {/* Connect Button */}
                      <Button
                        onClick={() => handleSendRequest(playerUser.uid)}
                        disabled={isConnected || hasRequestSent}
                        className="w-full mt-4"
                        variant={isConnected ? 'outline' : hasRequestSent ? 'outline' : 'default'}
                      >
                        {isConnected ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Connected
                          </>
                        ) : hasRequestSent ? (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
