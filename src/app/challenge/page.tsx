'use client';
import { useState, useEffect, type SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LuckyWheel } from '@/components/lucky-wheel';
import { PlayerSetupCard } from '@/components/player-setup-card';
import { Icons } from '@/components/icons';
import { ArrowRight, Zap, Users, RotateCw, Crown, Shield, User, Trophy, BookCopy, Code, CodeXml, Braces } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { curateProblem, type CurateProblemOutput } from '@/ai/flows/problem-curation';

const TOPICS = ['Data Structures', 'Algorithms', 'System Design', 'JavaScript', 'React', 'SQL'];
const PLAYER_COLORS = ['#50C878', '#20B2AA', '#66CDAA', '#2E8B57'];

const SKILL_LEVELS = {
    Rookie: { name: 'Rookie', icon: <User className="h-5 w-5" />, wheelIcon: <Code className="h-8 w-8 text-white" /> },
    Crusader: { name: 'Crusader', icon: <Shield className="h-5 w-5" />, wheelIcon: <CodeXml className="h-8 w-8 text-white" /> },
    Veteran: { name: 'Veteran', icon: <Crown className="h-5 w-5" />, wheelIcon: <Braces className="h-8 w-8 text-white" /> },
} as const;

type SkillLevel = keyof typeof SKILL_LEVELS;

export type GameQuestion = {
    id: string;
    problem: CurateProblemOutput;
    forPlayerSkill: SkillLevel;
    icon: React.ReactNode;
    displayNumber: number;
};

export type Player = {
  id: string;
  name: string;
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

export default function ChallengePage() {
  const [gameState, setGameState] = useState<'setup' | 'generating' | 'playing' | 'finished'>('setup');
  const [numPlayers, setNumPlayers] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastSpunQuestion, setLastSpunQuestion] = useState<GameQuestion | null>(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setPlayers(
      Array.from({ length: numPlayers }, (_, i) => ({
        id: nanoid(5),
        name: `Player ${i + 1}`,
        skillLevel: 'Rookie',
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        problem: null,
      }))
    );
  }, [numPlayers]);

  const unassignedQuestions = questions.filter(q => !players.some(p => p.problem?.id === q.id));

  useEffect(() => {
    // If there's only one player left to spin, automatically assign the last question.
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


  const handlePlayerChange = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };
  
  const handleStartGame = async () => {
    if (!selectedTopic) {
        toast({
            title: "No Topic Selected",
            description: "Please select a topic for the challenge round.",
            variant: "destructive",
        });
        return;
    }
    setGameState('generating');
    try {
        const promises = players.map((player, index) => curateProblem({
            topic: selectedTopic,
            skillLevel: player.skillLevel
        }).then(problem => ({
            id: nanoid(),
            problem: problem,
            forPlayerSkill: player.skillLevel,
            icon: SKILL_LEVELS[player.skillLevel].wheelIcon,
            displayNumber: index + 1,
        })));
        
        const gameQuestions = await Promise.all(promises);

        setQuestions(gameQuestions);
        setCurrentPlayerIndex(0);
        setLastSpunQuestion(null);
        setGameState('playing');

    } catch (error) {
        console.error("Failed to generate problems", error);
        toast({
            title: "Error Generating Challenges",
            description: "There was an issue creating the problems. Please try again.",
            variant: "destructive",
        });
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
    setNumPlayers(1);
    setSelectedTopic(null);
    setQuestions([]);
    setCurrentPlayerIndex(0);
    setIsSpinning(false);
    setLastSpunQuestion(null);
    setIsAutoAssigning(false);
  };

  const currentPlayer = players[currentPlayerIndex];
  const isSetupValid = selectedTopic !== null;
  const wheelSegments = unassignedQuestions.map(q => ({ id: q.id, label: String(q.displayNumber) }));


  if (gameState === 'setup') {
    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 font-body flex flex-col items-center">
            <div className="flex items-center gap-2 font-semibold mb-4">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="font-headline text-3xl font-bold">Challenger.io</span>
            </div>
            <Card className="w-full cyber-card">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">Game Setup</CardTitle>
                    <CardDescription>Configure your challenge session.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="player-count" className="font-medium text-base flex items-center gap-2"><Users /> Players</Label>
                            <Select value={String(numPlayers)} onValueChange={(val) => setNumPlayers(Number(val))}>
                                <SelectTrigger id="player-count" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n} Player{n > 1 ? 's' : ''}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3">
                             <Label htmlFor="topic" className="font-medium text-base flex items-center gap-2"><BookCopy /> Topic</Label>
                             <Select value={selectedTopic || ''} onValueChange={setSelectedTopic}>
                                <SelectTrigger id="topic" className="w-full">
                                    <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOPICS.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {players.map(player => (
                            <PlayerSetupCard key={player.id} player={player} onPlayerChange={handlePlayerChange} skillLevels={SKILL_LEVELS} />
                        ))}
                    </div>
                    <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame} disabled={!isSetupValid}>
                        Start Game <ArrowRight className="ml-2" />
                    </Button>
                </CardContent>
            </Card>
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
        <h1 className="text-2xl font-headline text-glow">Generating Challenges...</h1>
        <p className="text-muted-foreground">The AI is crafting unique problems for your team.</p>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
        <div className="container mx-auto max-w-3xl py-8 px-4 font-body flex flex-col items-center text-center">
            <Trophy className="h-24 w-24 text-primary mb-4" style={{filter: `drop-shadow(0 0 15px hsl(var(--primary)))`}} />
            <h1 className="text-4xl font-bold font-headline text-glow">Round Complete!</h1>
            <p className="text-muted-foreground mb-1">Topic: <span className="font-semibold text-primary">{selectedTopic}</span></p>
            <p className="text-muted-foreground mb-8">Here are the assigned challenges:</p>
            <div className="w-full space-y-4">
                {players.map(player => (
                    <Card key={player.id} className="cyber-card text-left border-l-4" style={{ borderLeftColor: player.color }}>
                         <CardContent className="p-4 flex flex-col items-start gap-2">
                            <div className="w-full flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg flex items-center gap-2" style={{ color: player.color }}>
                                        {SKILL_LEVELS[player.skillLevel].icon} {player.name}
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
                            {player.problem && (
                                <div className="w-full pt-3 mt-3 border-t">
                                    <p className="font-semibold text-primary">Challenge #{player.problem.displayNumber}: {player.problem.problem.problemTitle}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{player.problem.problem.problemDescription}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Button size="lg" className="mt-8 font-bold" onClick={handleResetGame}>
                <RotateCw className="mr-2" /> Play Again
            </Button>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body cyber-grid">
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <Card className="cyber-card">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Player {currentPlayerIndex + 1}'s Turn</CardTitle>
                    {currentPlayer && (
                        <CardDescription>
                            Time for <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.name}</span> to spin for a challenge!
                            <br/>
                            Topic for this round is <span className="font-bold text-primary">{selectedTopic}</span>.
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {players.map((p, index) => (
                           <li key={p.id} className={cn("flex items-center justify-between p-3 rounded-lg transition-all", index === currentPlayerIndex ? 'bg-primary/10' : '')}>
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-lg" style={{ color: p.color }}>{index + 1}</div>
                                    <div>
                                        <p className="font-semibold flex items-center gap-2">{p.name}</p>
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
                </CardContent>
            </Card>
             <Button size="lg" className="w-full font-bold text-lg lg:hidden" onClick={handleResetGame}>
                <RotateCw className="mr-2" /> Reset Game
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 py-8 lg:py-0">
             <div className="min-h-24 flex items-center justify-center">
                {lastSpunQuestion && (
                    <Card className="cyber-card text-center animate-in fade-in zoom-in-95 w-full">
                        <CardHeader>
                            <CardDescription>
                                {isAutoAssigning ? 'Last challenge automatically assigned to ' : `Challenge #${lastSpunQuestion.displayNumber} Assigned to `}
                                <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.name}</span>!
                            </CardDescription>
                            <CardTitle className="font-headline text-primary">{lastSpunQuestion.problem.problemTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Button onClick={handleNextPlayer}>
                                <span>{currentPlayerIndex === players.length - 1 ? 'Finish & View Results' : 'Next Player'}</span>
                                <ArrowRight />
                            </Button>
                        </CardContent>
                    </Card>
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
