
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth, type UserProfile } from '@/context/auth-context';
import Loading from '@/app/loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { findUserByUsername, sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest } from '@/app/actions/user';
import { UserPlus, Check, Hourglass, UserX, Users, Gem } from 'lucide-react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function PublicProfilePage() {
    const params = useParams();
    const username = Array.isArray(params.username) ? params.username[0] : params.username;
    const { user: currentUser, loading: authLoading } = useAuth();
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLimitDialog, setShowLimitDialog] = useState(false);
    const [limitDialogMessage, setLimitDialogMessage] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (!username) return;
            setLoading(true);
            const foundUser = await findUserByUsername(username);
            if (!foundUser) {
                notFound();
                return;
            }
            setProfileUser(foundUser);
            setLoading(false);
        };
        fetchUser();
    }, [username, notFound]);

    useEffect(() => {
        if (!authLoading && currentUser?.username === username) {
            router.push('/profile');
        }
    }, [authLoading, currentUser, username, router]);


    if (authLoading || loading) return <Loading />;
    if (!profileUser) return notFound();
     if (currentUser?.username === username) {
        return <Loading/>;
    }


    const isConnected = currentUser?.connections?.includes(profileUser.uid);
    const requestSent = currentUser?.sentRequests?.includes(profileUser.uid);
    const requestReceived = currentUser?.pendingConnections?.includes(profileUser.uid);

    let buttonState: 'connect' | 'connected' | 'request_sent' | 'request_received' = 'connect';
    if (isConnected) buttonState = 'connected';
    else if (requestSent) buttonState = 'request_sent';
    else if (requestReceived) buttonState = 'request_received';
    
    const handleSendRequest = async () => {
        if (!currentUser) return;
        const { success, message, reason } = await sendConnectionRequest(currentUser.uid, profileUser.uid);
        if (success) {
            toast({ title: "Request Sent!" });
        } else if (reason === 'limit_reached') {
            setLimitDialogMessage(message || 'You have reached your connection limit.');
            setShowLimitDialog(true);
        } else {
            toast({ title: "Error", description: message, variant: 'destructive' });
        }
    };
    
    const handleAccept = async () => {
        if (!currentUser) return;
        const { success } = await acceptConnectionRequest(currentUser.uid, profileUser.uid);
        if (success) {
            toast({ title: 'Connection Accepted' });
        } else {
            toast({ title: 'Error accepting request', variant: 'destructive' });
        }
    };
    
    const handleDecline = async () => {
        if (!currentUser) return;
        const { success } = await declineConnectionRequest(currentUser.uid, profileUser.uid);
        if (success) {
            toast({ title: 'Connection Declined' });
        } else {
            toast({ title: 'Error declining request', variant: 'destructive' });
        }
    };

    const renderConnectButton = () => {
        switch(buttonState) {
            case 'connected':
                return <Button disabled variant="secondary"><Users className="mr-2" /> Connected</Button>;
            case 'request_sent':
                return <Button disabled variant="secondary"><Hourglass className="mr-2" /> Request Sent</Button>;
            case 'request_received':
                return (
                    <div className="flex gap-2">
                        <Button onClick={handleAccept}><Check className="mr-2" /> Accept</Button>
                        <Button variant="outline" onClick={handleDecline}><UserX className="mr-2" /> Decline</Button>
                    </div>
                );
            case 'connect':
                return <Button onClick={handleSendRequest}><UserPlus className="mr-2" /> Connect</Button>;
            default:
                return null;
        }
    }


    return (
        <div className="cyber-grid flex-1">
            <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-20">
                <Card className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="flex flex-col items-center w-full md:w-48 shrink-0">
                           <Avatar className="h-32 w-32 border-4 border-primary/50">
                                <AvatarImage src={profileUser.photoURL} alt={profileUser.username} />
                                <AvatarFallback className="text-4xl">{profileUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                        </div>
                        <div className="w-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold font-headline">{profileUser.username}</h1>
                                        {profileUser.plan === 'pro' && (
                                            <Gem className="h-6 w-6 text-amber-500" />
                                        )}
                                        {profileUser.medallions && profileUser.medallions.map(m => <Image key={m} src={`https://placehold.co/24x24.png`} width={24} height={24} alt={m} data-ai-hint="emblem badge" />)}
                                    </div>
                                    <p className="text-muted-foreground mb-6">{profileUser.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {currentUser && renderConnectButton()}
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-lg font-semibold">Domain</p>
                                    <p className="text-lg">{profileUser.domain || <span className="text-muted-foreground">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">Bio</p>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{profileUser.bio || 'No bio yet.'}</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">Skills</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {profileUser.skills && profileUser.skills.length > 0 ? (
                                            profileUser.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)
                                        ) : (
                                            <p className="text-muted-foreground">No skills listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
             <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><Gem className="text-amber-500" /> Upgrade to Pro</AlertDialogTitle>
                    <AlertDialogDescription>
                        {limitDialogMessage}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push('/pricing')}>
                        View Plans
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
