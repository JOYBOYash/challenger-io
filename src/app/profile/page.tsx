'use client';

import { useState, useEffect } from 'react';
import { useAuth, type UserProfile } from '@/context/auth-context';
import Loading from '@/app/loading';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserProfile, removeChallenge, getUsersByIds, acceptConnectionRequest, declineConnectionRequest } from '@/app/actions/user';
import { Edit, Save, Trash2, X, Eye, ExternalLink, User, Users, UserPlus, Check, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProblemDisplay } from '@/components/problem-display';
import type { Problem } from '@/ai/flows/problem-curation';

const profileSchema = z.object({
    bio: z.string().max(250, "Bio can't be more than 250 characters.").optional(),
    domain: z.string().max(50, "Domain can't be more than 50 characters.").optional(),
    skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ConnectionsList = ({ uids }: { uids: string[] }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (uids.length > 0) {
            setIsLoading(true);
            getUsersByIds(uids).then(setUsers).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [uids]);

    if (isLoading) return <div className="text-muted-foreground text-center py-4">Loading connections...</div>;
    if (users.length === 0) return <div className="text-muted-foreground text-center py-4">No users to display.</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map(user => (
                <Link href={`/profile/${user.username}`} key={user.uid} className="block">
                    <Card className="p-4 flex items-center gap-4 hover:bg-accent transition-colors">
                        <Avatar>
                            <AvatarImage src={user.photoURL} alt={user.username} />
                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.domain}</p>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

const PendingRequestsList = ({ uids }: { uids: string[] }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (uids.length > 0) {
            setIsLoading(true);
            getUsersByIds(uids).then(setUsers).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [uids]);
    
    const handleAccept = async (requesterId: string) => {
        if (!user) return;
        const { success } = await acceptConnectionRequest(user.uid, requesterId);
        if (success) {
            toast({ title: 'Connection Accepted' });
        } else {
            toast({ title: 'Error accepting request', variant: 'destructive' });
        }
    };
    
    const handleDecline = async (requesterId: string) => {
        if (!user) return;
        const { success } = await declineConnectionRequest(user.uid, requesterId);
        if (success) {
            toast({ title: 'Connection Declined' });
        } else {
            toast({ title: 'Error declining request', variant: 'destructive' });
        }
    };

    if (isLoading) return <div className="text-muted-foreground text-center py-4">Loading requests...</div>;
    if (users.length === 0) return <div className="text-muted-foreground text-center py-4">No pending requests.</div>;
    
    return (
        <div className="space-y-4">
            {users.map(requester => (
                <Card key={requester.uid} className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={requester.photoURL} alt={requester.username} />
                            <AvatarFallback>{requester.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{requester.username}</p>
                            <p className="text-sm text-muted-foreground">{requester.domain}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" onClick={() => handleAccept(requester.uid)}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDecline(requester.uid)}><X className="h-4 w-4" /></Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};


export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        values: {
            bio: user?.bio || '',
            domain: user?.domain || '',
            skills: user?.skills?.join(', ') || '',
        }
    });
    
    useEffect(() => {
        if (user) {
            form.reset({
                bio: user.bio || '',
                domain: user.domain || '',
                skills: user.skills?.join(', ') || '',
            });
        }
    }, [user, form]);

    const handleCancelEdit = () => {
        form.reset({
            bio: user?.bio || '',
            domain: user?.domain || '',
            skills: user?.skills?.join(', ') || '',
        });
        setIsEditing(false);
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        const profileDataToUpdate: Partial<UserProfile> = {
            ...data,
            skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        };
        
        const { success } = await updateUserProfile(user.uid, profileDataToUpdate);
        
        if (success) {
            toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
            setIsEditing(false);
        } else {
            toast({ title: 'Update Failed', description: 'Could not update your profile.', variant: 'destructive' });
        }
    };

    const handleRemoveChallenge = async (problem: Problem) => {
        if (!user) return;
        const { success } = await removeChallenge(user.uid, problem);
        if (success) {
            toast({ title: 'Challenge Removed', description: 'The challenge has been removed from your saved list.' });
        } else {
            toast({ title: 'Error', description: 'Could not remove the challenge.', variant: 'destructive' });
        }
    }

    if (loading) return <Loading />;
    if (!user) return <p className="text-center mt-10">Please log in to view your profile.</p>;

    return (
        <div className="cyber-grid flex-1">
            <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-20">
                <Card className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="flex flex-col items-center w-full md:w-48 shrink-0">
                           <Avatar className="h-32 w-32 border-4 border-primary/50">
                                <AvatarImage src={user.photoURL} alt={user.username} />
                                <AvatarFallback className="text-4xl">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                        </div>
                        <div className="w-full">
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-3xl font-bold font-headline">{user.username}</h1>
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                                    <X className="mr-2 h-4 w-4" /> Cancel
                                                </Button>
                                                <Button type="submit">
                                                    <Save className="mr-2 h-4 w-4" /> Save
                                                </Button>
                                            </>
                                        ) : (
                                            <Button type="button" onClick={() => setIsEditing(true)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted-foreground mb-6">{user.email}</p>

                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="domain" className="text-lg font-semibold">Domain</Label>
                                        {isEditing ? (
                                            <Input id="domain" {...form.register('domain')} placeholder="e.g., Frontend, AI, Data Science" />
                                        ) : (
                                            <p className="text-lg">{user.domain || <span className="text-muted-foreground">Not set</span>}</p>
                                        )}
                                        {form.formState.errors.domain && <p className="text-destructive text-sm mt-1">{form.formState.errors.domain.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="bio" className="text-lg font-semibold">Bio</Label>
                                         {isEditing ? (
                                            <Textarea id="bio" {...form.register('bio')} placeholder="Tell us about yourself..." />
                                        ) : (
                                            <p className="text-muted-foreground whitespace-pre-wrap">{user.bio || 'No bio yet.'}</p>
                                        )}
                                        {form.formState.errors.bio && <p className="text-destructive text-sm mt-1">{form.formState.errors.bio.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="skills" className="text-lg font-semibold">Skills</Label>
                                        {isEditing ? (
                                            <>
                                                <Input id="skills" {...form.register('skills')} placeholder="e.g., React, Python, SQL" />
                                                <p className="text-xs text-muted-foreground mt-1">Enter skills separated by commas.</p>
                                            </>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {user.skills && user.skills.length > 0 ? (
                                                    user.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)
                                                ) : (
                                                    <p className="text-muted-foreground">No skills listed.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </Card>

                <Tabs defaultValue="challenges" className="mt-12">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
                        <TabsTrigger value="challenges">Saved Challenges ({user.savedChallenges?.length || 0})</TabsTrigger>
                        <TabsTrigger value="connections">Connections ({user.connections?.length || 0})</TabsTrigger>
                        <TabsTrigger value="pending">Pending ({user.pendingConnections?.length || 0})</TabsTrigger>
                        <TabsTrigger value="sent">Sent ({user.sentRequests?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="challenges" className="mt-6">
                        {user.savedChallenges && user.savedChallenges.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.savedChallenges.map((problem) => (
                                    <Card key={problem.problemTitle} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle>{problem.problemTitle}</CardTitle>
                                            <CardDescription>{problem.topic} - <span className="font-medium text-primary">{problem.difficulty}</span></CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-muted-foreground line-clamp-3">{problem.problemDescription}</p>
                                        </CardContent>
                                        <div className="p-4 pt-0 flex gap-2">
                                            {problem.url ? (
                                                <Button asChild className="w-full">
                                                    <a href={problem.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-4 w-4"/> View on Platform
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="w-full"><Eye className="mr-2 h-4 w-4"/> View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                                                        <DialogHeader>
                                                            <DialogTitle>{problem.problemTitle}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="overflow-y-auto">
                                                            <ProblemDisplay problem={problem} />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                            <Button variant="destructive" size="icon" onClick={() => handleRemoveChallenge(problem)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">You haven't saved any challenges yet.</p>
                                <p className="text-sm text-muted-foreground">Go to the Challenge page to find and save some!</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="connections" className="mt-6">
                         <ConnectionsList uids={user.connections || []} />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-6">
                        <PendingRequestsList uids={user.pendingConnections || []} />
                    </TabsContent>
                    <TabsContent value="sent" className="mt-6">
                         <ConnectionsList uids={user.sentRequests || []} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
