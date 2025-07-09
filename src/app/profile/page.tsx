'use client';

import { useState } from 'react';
import { useAuth, type UserProfile } from '@/context/auth-context';
import Loading from '@/app/loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserProfile, removeChallenge } from '@/app/actions/user';
import { Edit, Save, Trash2, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProblemDisplay } from '@/components/problem-display';
import type { Problem } from '@/ai/flows/problem-curation';

const profileSchema = z.object({
    bio: z.string().max(250, "Bio can't be more than 250 characters.").optional(),
    domain: z.string().max(50, "Domain can't be more than 50 characters.").optional(),
    skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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

    const handleEditToggle = () => {
        if (isEditing) {
            form.reset({
                bio: user?.bio || '',
                domain: user?.domain || '',
                skills: user?.skills?.join(', ') || '',
            });
        }
        setIsEditing(!isEditing);
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
                           <Button variant="outline" className="mt-4 w-full" disabled>Change Picture</Button>
                           <p className="text-xs text-muted-foreground mt-2">Feature coming soon</p>
                        </div>
                        <div className="w-full">
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-3xl font-bold font-headline">{user.username}</h1>
                                    <Button type={isEditing ? 'submit' : 'button'} onClick={handleEditToggle}>
                                        {isEditing ? <><Save className="mr-2" /> Save</> : <><Edit className="mr-2" /> Edit Profile</>}
                                    </Button>
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

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-headline mb-6">Saved Challenges</h2>
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
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full"><Eye className="mr-2"/> View</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                                                <DialogHeader>
                                                    <DialogTitle>{problem.problemTitle}</DialogTitle>
                                                </DialogHeader>
                                                <div className="overflow-y-auto">
                                                    <ProblemDisplay problem={problem} onBack={() => {}} />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="destructive" size="icon" onClick={() => handleRemoveChallenge(problem)}>
                                            <Trash2 />
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
                </div>
            </div>
        </div>
    );
}
