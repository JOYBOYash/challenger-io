'use client';
import { useState, useEffect, type SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LuckyWheel } from '@/components/lucky-wheel';
import { ProblemDisplay } from '@/components/problem-display';
import { Icons } from '@/components/icons';
import { ArrowRight, Zap, Users, RotateCw, Crown, Shield, User, Trophy, BookCopy, Code, CodeXml, Braces, ChevronLeft, X, UserPlus, Search, Bookmark, ExternalLink, Timer, Gem } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { curateProblems, type Problem } from '@/ai/flows/problem-curation';
import { fetchPlatformProblems } from '@/ai/flows/platformInspiredProblemCuration';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { getConnectedUsers, saveChallenge, updateUserProfile } from '@/app/actions/user';
import Loading from '@/app/loading';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';


const PLAYER_COLORS = ['#50C878', '#20B2AA', '#66CDAA', '#2E8B57'];

const SKILL_LEVELS = {
    Rookie: { name: 'Rookie', icon: <User className="h-5 w-5" />, wheelIcon: <Code className="h-8 w-8 text-white" /> },
    Crusader: { name: 'Crusader', icon: <Shield className="h-5 w-5" />, wheelIcon: <CodeXml className="h-8 w-8 text-white" /> },
    Veteran: { name: 'Veteran', icon: <Crown className="h-5 w-5" />, wheelIcon: <Braces className="h-8 w-8 text-white" /> },
} as const;

type SkillLevel = keyof typeof SKILL_LEVELS;

export type GameQuestion = {
    id: string;
    problem: Problem;
    forPlayerSkill: SkillLevel;
    icon: React.ReactNode;
    displayNumber: number;
};

export type Player = {
  profile: UserProfile;
  skillLevel: SkillLevel;
  color: string;
  problem: GameQuestion | null;
};

// Custom inline SVG for loading animation
const AnimatedLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      className="animate-loader-fill"
      style={{ strokeDasharray: 63, strokeDashoffset: 63, animationDelay: '0s' } as React.CSSProperties}
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
    />
    <path
      className="animate-loader-fill"
      style={{ strokeDasharray: 10, strokeDashoffset: 10, animationDelay: '0.4s' } as React.CSSProperties}
      d="m9.09 9.91 1.63.54c.22.07.36.29.3.5l-.54 1.63c-.07.22-.29.36-.5.3l-1.63-.54c-.22-.07-.36-.29-.3-.5l.54-1.63c.07-.22.29-.36.5-.3z"
    />
    <path
      className="animate-loader-fill"
      style={{ strokeDasharray: 20, strokeDashoffset: 20, animationDelay: '0.2s' } as React.CSSProperties}
      d="M12 22c-3.314 0-6-2.686-6-6"
    />
  </svg>
);

const ChallengeHeader = () => (
    <header className="w-full">
        <div className="container mx-auto flex items-center justify-between p-4 md:px-6">
            <div className="flex items-center gap-2 font-semibold">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="font-headline text-2xl font-bold hidden sm:inline">Challenger.io</span>
            </div>
            <Button asChild variant="outline" className="bg-card/80">
                <Link href="/">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Exit Challenge
                </Link>
            </Button>
        </div>
    </header>
);

export default function ChallengePage() {
  const { user, loading, firebaseUser } = useAuth();
  const router = useRouter();
  const [gameState, setGameState] = useState<'setup' | 'generating' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [isFetchingConnections, setIsFetchingConnections] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [problemSource, setProblemSource] = useState<'ai' | 'classic'>('ai');
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastSpunQuestion, setLastSpunQuestion] = useState<GameQuestion | null>(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [viewedProblem, setViewedProblem] = useState<GameQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && players.length === 0) {
        setPlayers([{
            profile: user,
            skillLevel: 'Rookie',
            color: PLAYER_COLORS[0],
            problem: null,
        }]);
    }
  }, [user, loading, router, players.length]);
  
  useEffect(() => {
    if (user) {
        setIsFetchingConnections(true);
        getConnectedUsers(user.uid)
            .then(setConnections)
            .finally(() => setIsFetchingConnections(false));
    }
  }, [user]);

  const unassignedQuestions = questions.filter(q => !players.some(p => p.problem?.id === q.id));

  useEffect(() => {
    if (gameState === 'playing' && unassignedQuestions.length === 1 && !lastSpunQuestion && !isSpinning) {
      const lastQuestion = unassignedQuestions[0];
      
      setIsAutoAssigning(true);
      const timer = setTimeout(() => {
        setLastSpunQuestion(lastQuestion);
        setPlayers(prev => {
            const newPlayers = [...prev];
            if(newPlayers[currentPlayerIndex] && !newPlayers[currentPlayerIndex].problem) {
               newPlayers[currentPlayerIndex].problem = lastQuestion;
            }
            return newPlayers;
        });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [gameState, questions, players, lastSpunQuestion, currentPlayerIndex, isSpinning, unassignedQuestions]);

    const isAiDisabled = user?.plan === 'free' && user.lastAiChallengeTimestamp && (new Date().getTime() - user.lastAiChallengeTimestamp) < (24 * 60 * 60 * 1000);
    const aiCredits = user?.plan === 'pro' ? Infinity : (isAiDisabled ? 0 : 1);


    useEffect(() => {
        if (isAiDisabled && user?.lastAiChallengeTimestamp) {
            const interval = setInterval(() => {
                const twentyFourHours = 24 * 60 * 60 * 1000;
                const now = new Date().getTime();
                const timePassed = now - user.lastAiChallengeTimestamp!;
                const timeRemaining = twentyFourHours - timePassed;
                
                if (timeRemaining <= 0) {
                    setTimeLeft('');
                    clearInterval(interval);
                } else {
                    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isAiDisabled, user?.lastAiChallengeTimestamp]);

  const handleSkillChange = (playerId: string, skillLevel: SkillLevel) => {
    setPlayers(players.map(p => p.profile.uid === playerId ? { ...p, skillLevel } : p));
  };

  const handleAddPlayer = (friend: UserProfile) => {
    if (players.length >= 4) {
        toast({ title: 'Maximum Players Reached', description: 'You can only have up to 4 players.', variant: 'destructive' });
        return;
    }
    if (players.some(p => p.profile.uid === friend.uid)) {
        toast({ title: 'Player Already Added', description: 'This user is already in the challenge.', variant: 'destructive' });
        return;
    }

    const newPlayer: Player = {
        profile: friend,
        skillLevel: 'Rookie',
        color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
        problem: null
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (uid: string) => {
    setPlayers(players.filter(p => p.profile.uid !== uid));
  }
  
  const handleStartGame = async () => {
    if (!selectedTopic) {
        toast({ title: "No Topic Selected", description: "Please select a topic for the challenge round.", variant: "destructive" });
        return;
    }
     if (!user) return;

    setGameState('generating');

    try {
        const playerInputs = players.map(player => ({ skillLevel: player.skillLevel }));
        let problems: Problem[];

        if (problemSource === 'ai') {
             if(isAiDisabled) {
                toast({ title: 'Daily Limit Reached', description: 'Your next AI challenge credit will be available soon.', variant: 'destructive' });
                setGameState('setup');
                return;
             }
            
            const result = await curateProblems({
                topic: selectedTopic,
                players: playerInputs,
            });
            problems = result.problems;
            
            // Update timestamp after successful generation for free users
            if (user.plan === 'free') {
                await updateUserProfile(user.uid, { lastAiChallengeTimestamp: new Date().getTime() });
            }

        } else { // 'classic' mode
            const result = await fetchPlatformProblems({
                topic: selectedTopic,
                players: playerInputs,
            });
            problems = result.problems;
        }

        if (problems.length !== players.length) {
            throw new Error("Did not return the correct number of problems for all players.");
        }

        const gameQuestions = problems.map((problem, index) => {
            const player = players[index];
            return {
                id: nanoid(),
                problem: problem,
                forPlayerSkill: player.skillLevel,
                icon: SKILL_LEVELS[player.skillLevel].wheelIcon,
                displayNumber: index + 1,
            };
        });
        
        setQuestions(gameQuestions);
        setCurrentPlayerIndex(0);
        setLastSpunQuestion(null);
        setGameState('playing');

    } catch (error) {
        console.error("Failed to generate problems", error);
        toast({ title: "Error Generating Challenges", description: "There was an issue creating the problems. Please try again.", variant: "destructive" });
        setGameState('setup');
    }
  };

  const handleSpinClick = () => {
    if (isSpinning || lastSpunQuestion || isAutoAssigning) return;
    setIsSpinning(true);
  };

  const handleSpinEnd = async (questionId: string) => {
    const winningQuestion = questions.find(q => q.id === questionId);
    if (winningQuestion) {
        setLastSpunQuestion(winningQuestion);
        setPlayers(prev => {
            const newPlayers = [...prev];
            newPlayers[currentPlayerIndex].problem = winningQuestion;
            return newPlayers;
        });
    }
    setIsSpinning(false);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setLastSpunQuestion(null);
        setIsAutoAssigning(false);
    } else {
        setGameState('finished');
    }
  };
  
  const handleResetGame = () => {
    setGameState('setup');
    setPlayers(user ? [{ profile: user, skillLevel: 'Rookie', color: PLAYER_COLORS[0], problem: null }] : []);
    setSelectedTopic(null);
    setQuestions([]);
    setCurrentPlayerIndex(0);
    setIsSpinning(false);
    setLastSpunQuestion(null);
    setIsAutoAssigning(false);
    setViewedProblem(null);
  };

  const handleSaveChallenge = async (problem: Problem) => {
    if (!user) return;
    const { success } = await saveChallenge(user.uid, problem);
    if (success) {
        toast({ title: "Challenge Saved!", description: "View it on your profile." });
    } else {
        toast({ title: "Error", description: "Could not save the challenge.", variant: "destructive" });
    }
  }

  if (loading || !user) {
    return <Loading />;
  }

  const currentPlayer = players[currentPlayerIndex];
  const isSetupValid = selectedTopic !== null;
  const wheelSegments = unassignedQuestions.map(q => ({ id: q.id, label: String(q.displayNumber) }));
  const availableFriends = connections.filter(friend => !players.some(p => p.profile.uid === friend.uid));


  if (gameState === 'setup') {
    return (
      <div className="flex flex-col min-h-screen cyber-grid">
        <ChallengeHeader />
        <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-20">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Challenge Setup</h1>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Configure your session. Invite your connections, choose a topic, and set each player's skill level.
              </p>
            </div>

            <div className="cyber-card p-8">
                {isAiDisabled && (
                    <Card className="mb-6 bg-destructive/10 border-destructive/30">
                        <CardContent className="p-4 text-center">
                            <p className="font-semibold text-destructive-foreground">You are on cooldown for AI Mode.</p>
                            <p className="text-sm text-destructive-foreground/80">
                                Your next free challenge is available in:
                            </p>
                             <p className="font-bold text-lg text-destructive-foreground mt-1 flex items-center justify-center gap-2">
                                <Timer className="h-5 w-5" /> {timeLeft}
                            </p>
                             <Button variant="link" asChild className="text-destructive-foreground/90"><Link href="/pricing">Upgrade to Pro for unlimited use.</Link></Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="grid gap-3">
                         <Label htmlFor="topic" className="font-medium text-lg flex items-center gap-2"><BookCopy className="text-primary"/> Challenge Topic</Label>
                         <Select value={selectedTopic || ''} onValueChange={setSelectedTopic}>
                            <SelectTrigger id="topic" className="w-full">
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {['Data Structures', 'Algorithms', 'System Design', 'JavaScript', 'React', 'SQL'].map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-3">
                        <Label className="font-medium text-lg flex items-center gap-2"><Trophy className="text-primary"/> Challenge Mode</Label>
                        <RadioGroup
                            defaultValue="ai"
                            value={problemSource}
                            onValueChange={(value: 'ai' | 'classic') => setProblemSource(value)}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                            <RadioGroupItem value="ai" id="ai" className="peer sr-only" disabled={isAiDisabled} />
                            <Label
                                htmlFor="ai"
                                className={cn(
                                    "flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary relative",
                                    isAiDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                )}
                            >
                                {aiCredits === Infinity ? (
                                    <Badge variant="default" className="absolute -top-2 -right-2 bg-purple-600"><Gem className="h-3 w-3 mr-1"/> Unlimited</Badge>
                                ) : (
                                    <Badge variant={aiCredits > 0 ? "default" : "destructive"} className="absolute -top-2 -right-2">{aiCredits} Credit{aiCredits !== 1 && 's'}</Badge>
                                )}
                                <Zap className="mb-3 h-6 w-6" />
                                AI Mode
                            </Label>
                            </div>
                            <div>
                            <RadioGroupItem value="classic" id="classic" className="peer sr-only" />
                            <Label
                                htmlFor="classic"
                                className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <Trophy className="mb-3 h-6 w-6" />
                                Classic Mode
                            </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                
                <div className="mb-8">
                    <h3 className="font-headline text-2xl mb-4">Player Configuration</h3>
                    <div className="mb-6 p-4 border rounded-lg">
                        <Label htmlFor="player-invite" className="font-medium text-lg flex items-center gap-2"><UserPlus className="text-primary"/> Invite Connections</Label>
                        <p className="text-muted-foreground text-sm mb-4">Add your connected friends to the challenge.</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    disabled={players.length >= 4 || isFetchingConnections}
                                >
                                    {isFetchingConnections ? 'Loading connections...' : (availableFriends.length > 0 ? 'Select a friend to add' : 'No available friends')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                                <div className="flex flex-col gap-1">
                                    {availableFriends.length > 0 ? (
                                        availableFriends.map(friend => (
                                            <Button
                                                key={friend.uid}
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => handleAddPlayer(friend)}
                                            >
                                                {friend.username}
                                            </Button>
                                        ))
                                    ) : (
                                        <p className="p-2 text-sm text-muted-foreground">
                                          {isFetchingConnections ? 'Loading...' : 'No friends to invite. Go to the Connect page to add some!'}
                                        </p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {players.map(player => (
                           <div key={player.profile.uid} className="cyber-card p-4 w-full flex items-center justify-between" style={{ borderLeft: `4px solid ${player.color}` }}>
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: player.color }}>
                                     <User className="h-5 w-5 text-white" />
                                 </div>
                                 <div>
                                    <p className="text-lg font-semibold">{player.profile.username}</p>
                                    <p className="text-sm text-muted-foreground">{player.profile.uid === user.uid ? '(You)' : ''}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Select value={player.skillLevel} onValueChange={(val) => handleSkillChange(player.profile.uid, val as any)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(SKILL_LEVELS) as SkillLevel[]).map(level => (
                                            <SelectItem key={level} value={level}>
                                                <div className="flex items-center gap-2">
                                                    {SKILL_LEVELS[level].icon}
                                                    <span>{level}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {player.profile.uid !== user.uid && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(player.profile.uid)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                             </div>
                           </div>
                        ))}
                    </div>
                </div>

                <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame} disabled={!isSetupValid || (problemSource === 'ai' && isAiDisabled)}>
                    Start Challenge <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    </div>
    );
  }

  if (gameState === 'generating') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background font-body gap-4 cyber-grid">
        <AnimatedLogo 
          className="h-24 w-24 text-primary animate-loader-shake"
          style={{filter: `drop-shadow(0 0 15px hsl(var(--primary)))`}} 
        />
        <h1 className="text-2xl font-headline">Generating Challenges...</h1>
        <p className="text-muted-foreground">The AI is crafting unique problems for your team.</p>
      </div>
    );
  }

  if (gameState === 'finished') {
    if (viewedProblem) {
        return (
            <div className="flex flex-col min-h-screen cyber-grid">
                <ChallengeHeader />
                <ProblemDisplay 
                    problem={viewedProblem.problem}
                    onBack={() => setViewedProblem(null)}
                />
            </div>
        )
    }
    const savedChallengeTitles = user.savedChallenges?.map(c => c.problemTitle) || [];

    return (
        <div className="flex flex-col min-h-screen">
            <ChallengeHeader />
            <div className="container mx-auto max-w-5xl py-8 px-4 font-body flex flex-col items-center text-center flex-1">
                <Trophy className="h-24 w-24 text-primary mb-4" style={{filter: `drop-shadow(0 0 15px hsl(var(--primary)))`}} />
                <h1 className="text-4xl font-bold font-headline">Challenge Dashboard</h1>
                <p className="text-muted-foreground mb-1">Topic: <span className="font-semibold text-primary">{selectedTopic}</span></p>
                <p className="text-muted-foreground mb-8">View your assigned problems below.</p>
                <div className="w-full grid md:grid-cols-2 gap-6">
                    {players.map(player => {
                        const isSaved = player.problem ? savedChallengeTitles.includes(player.problem.problem.problemTitle) : false;
                        const problem = player.problem?.problem;
                        return (
                        <div key={player.profile.uid} className="cyber-card text-left flex flex-col" style={{ borderLeftColor: player.color, borderLeftWidth: '4px' }}>
                             <div className="flex flex-col items-start gap-2 flex-1">
                                <div className="w-full flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg flex items-center gap-2" style={{ color: player.color }}>
                                            {SKILL_LEVELS[player.skillLevel].icon} {player.profile.username}
                                        </p>
                                        <p className="text-muted-foreground">Base Skill: {player.skillLevel}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                         <p className="font-bold text-xl flex items-center justify-end gap-2 text-primary">
                                            {player.problem && SKILL_LEVELS[player.problem.forPlayerSkill].icon}
                                            {player.problem?.problem.difficulty}
                                        </p>
                                    </div>
                                </div>
                                {problem && (
                                    <div className="w-full pt-3 mt-3 border-t flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="font-semibold text-primary">Challenge #{player.problem.displayNumber}: {problem.problemTitle}</p>
                                            {problem.problemDescription && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{problem.problemDescription}</p>}
                                        </div>
                                        <div className="flex gap-2 w-full mt-4">
                                            {problem.url ? (
                                                <Button asChild className="w-full">
                                                    <a href={problem.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-4 w-4"/> View on Platform
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button className="w-full" onClick={() => setViewedProblem(player.problem)}>
                                                    View Challenge <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            )}
                                            <Button 
                                                size="icon" 
                                                variant={isSaved ? "secondary" : "outline"}
                                                onClick={() => !isSaved && handleSaveChallenge(problem)}
                                                disabled={isSaved}
                                            >
                                                <Bookmark className={cn(isSaved && "fill-primary")} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
                <Button size="lg" className="mt-8 font-bold" onClick={handleResetGame}>
                    <RotateCw className="mr-2" /> Play Again
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body cyber-grid">
      <ChallengeHeader />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="cyber-card">
                <h2 className="font-headline text-2xl">Player {currentPlayerIndex + 1}'s Turn</h2>
                {currentPlayer && (
                    <p className="text-muted-foreground">
                        Time for <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.profile.username}</span> to spin for a challenge!
                        <br/>
                        Topic for this round is <span className="font-bold text-primary">{selectedTopic}</span>.
                    </p>
                )}
                <ul className="space-y-3 mt-6">
                    {players.map((p, index) => (
                       <li key={p.profile.uid} className={cn("flex items-center justify-between p-3 rounded-lg transition-all", index === currentPlayerIndex ? 'bg-primary/10' : '')}>
                            <div className="flex items-center gap-3">
                                <div className="font-bold text-lg" style={{ color: p.color }}>{index + 1}</div>
                                <div>
                                    <p className="font-semibold flex items-center gap-2">{p.profile.username}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">{SKILL_LEVELS[p.skillLevel].icon} {p.skillLevel}</p>
                                 </div>
                            </div>
                            <div className="text-right">
                                {p.problem ? (
                                    <span className="font-semibold text-primary flex items-center gap-2 justify-end">
                                        #{p.problem.displayNumber} - {p.problem.problem.difficulty}
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Waiting...</span>
                                )}
                            </div>
                       </li>
                    ))}
                </ul>
            </div>
             <Button size="lg" className="w-full font-bold text-lg lg:hidden" onClick={handleResetGame}>
                <RotateCw className="mr-2" /> Reset Game
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 py-8 lg:py-0">
             <div className="flex min-h-[6rem] items-center justify-center">
                {lastSpunQuestion && (
                    <div className="cyber-card text-center animate-in fade-in zoom-in-95 w-full">
                        <p className="text-muted-foreground">
                            {isAutoAssigning ? 'Last challenge automatically assigned to ' : `Challenge #${lastSpunQuestion.displayNumber} Assigned to `}
                            <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.profile.username}</span>!
                        </p>
                        <h3 className="font-headline text-primary text-xl mt-1">{lastSpunQuestion.problem.problemTitle}</h3>
                       <Button onClick={handleNextPlayer} className="mt-4">
                            <span>{currentPlayerIndex === players.length - 1 ? 'Finish & View Results' : 'Next Player'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            
            <LuckyWheel
              key={currentPlayerIndex}
              segments={wheelSegments}
              isSpinning={isSpinning}
              onSpinEnd={handleSpinEnd}
            />

            <Button
              size="lg"
              className="font-headline text-xl font-bold w-72 h-16"
              onClick={handleSpinClick}
              disabled={isSpinning || !!lastSpunQuestion || isAutoAssigning}
            >
              {isSpinning || isAutoAssigning ? <AnimatedLogo className="mr-2 h-6 w-6 animate-loader-shake" /> : <Zap className="mr-2 h-6 w-6" />}
              {isAutoAssigning ? 'Assigning...' : (isSpinning ? 'Spinning...' : 'Spin for a Challenge')}
            </Button>

             <Button variant="ghost" className="hidden lg:flex" onClick={handleResetGame}>
                <RotateCw className="mr-2" /> Reset Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
