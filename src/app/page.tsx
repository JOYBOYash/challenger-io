'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LuckyWheel } from '@/components/lucky-wheel';
import { PlayerSetupCard } from '@/components/player-setup-card';
import { Icons } from '@/components/icons';
import { ArrowRight, Zap, Users, RotateCw, Crown, Shield, User, Trophy, Loader2, BookCopy } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { curateProblem, type CurateProblemOutput } from '@/ai/flows/problem-curation';
import { ProblemDisplay } from '@/components/problem-display';

const TOPICS = ['Data Structures', 'Algorithms', 'System Design', 'JavaScript', 'React', 'SQL'];
const PLAYER_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

const SKILL_LEVELS = {
    Rookie: { icon: <User className="h-5 w-5" />, wheelIcon: <User className="h-10 w-10 text-white" /> },
    Crusader: { icon: <Shield className="h-5 w-5" />, wheelIcon: <Shield className="h-10 w-10 text-white" /> },
    Veteran: { icon: <Crown className="h-5 w-5" />, wheelIcon: <Crown className="h-10 w-10 text-white" /> },
} as const;

type SkillLevel = keyof typeof SKILL_LEVELS;

const WHEEL_SEGMENTS = [
    { id: 'Rookie', content: SKILL_LEVELS.Rookie.wheelIcon },
    { id: 'Crusader', content: SKILL_LEVELS.Crusader.wheelIcon },
    { id: 'Veteran', content: SKILL_LEVELS.Veteran.wheelIcon },
    { id: 'Rookie', content: SKILL_LEVELS.Rookie.wheelIcon },
    { id: 'Crusader', content: SKILL_LEVELS.Crusader.wheelIcon },
    { id: 'Veteran', content: SKILL_LEVELS.Veteran.wheelIcon },
];

export type Player = {
  id: string;
  name: string;
  skillLevel: SkillLevel;
  color: string;
  problem: CurateProblemOutput | null;
  spunDifficulty: SkillLevel | null;
};

export default function Home() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'problem' | 'finished'>('setup');
  const [numPlayers, setNumPlayers] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastWinner, setLastWinner] = useState<SkillLevel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPlayers(
      Array.from({ length: numPlayers }, (_, i) => ({
        id: nanoid(5),
        name: `Player ${i + 1}`,
        skillLevel: 'Rookie',
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        problem: null,
        spunDifficulty: null,
      }))
    );
  }, [numPlayers]);

  const handlePlayerChange = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };
  
  const handleStartGame = () => {
    if (!selectedTopic) {
        toast({
            title: "No Topic Selected",
            description: "Please select a topic for the challenge round.",
            variant: "destructive",
        });
        return;
    }
    setGameState('playing');
    setCurrentPlayerIndex(0);
    setLastWinner(null);
  };

  const handleSpinClick = () => {
    if (isSpinning || isGenerating) return;
    setLastWinner(null);
    setIsSpinning(true);
  };

  const handleSpinEnd = async (spunDifficulty: string) => {
    setIsSpinning(false);
    setLastWinner(spunDifficulty as SkillLevel);
    setIsGenerating(true);

    try {
        const problem = await curateProblem({
            topic: selectedTopic!,
            skillLevel: spunDifficulty,
        });
        
        setPlayers(prev => {
            const newPlayers = [...prev];
            newPlayers[currentPlayerIndex].spunDifficulty = spunDifficulty as SkillLevel;
            newPlayers[currentPlayerIndex].problem = problem;
            return newPlayers;
        });
        
        setGameState('problem');
    } catch (error) {
        console.error("Failed to generate problem", error);
        toast({
            title: "Error Generating Challenge",
            description: "There was an issue creating a problem. Please spin again.",
            variant: "destructive",
        });
        setLastWinner(null);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setGameState('playing');
        setLastWinner(null);
    } else {
        setGameState('finished');
    }
  };
  
  const handleResetGame = () => {
    setGameState('setup');
    setNumPlayers(1);
    setPlayers([]);
    setSelectedTopic(null);
    setCurrentPlayerIndex(0);
    setIsSpinning(false);
    setIsGenerating(false);
    setLastWinner(null);
  };

  const currentPlayer = players[currentPlayerIndex];
  const isSetupValid = selectedTopic !== null;

  if (gameState === 'setup') {
    return (
        <main className="container mx-auto max-w-2xl py-8 px-4 font-body flex flex-col items-center">
            <div className="flex items-center gap-2 font-semibold mb-4">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="font-headline text-3xl font-bold">Challenger.io</span>
            </div>
            <Card className="w-full shadow-2xl border-primary/20">
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
        </main>
    );
  }

  if (gameState === 'problem' && currentPlayer?.problem) {
    return (
        <ProblemDisplay
            problem={currentPlayer.problem}
            onNext={handleNext}
            isLastPlayer={currentPlayerIndex === players.length - 1}
        />
    )
  }

  if (gameState === 'finished') {
    return (
        <main className="container mx-auto max-w-3xl py-8 px-4 font-body flex flex-col items-center text-center">
            <Trophy className="h-24 w-24 text-amber-400 mb-4" />
            <h1 className="text-4xl font-bold font-headline">Round Complete!</h1>
            <p className="text-muted-foreground mb-1">Topic: <span className="font-semibold text-primary">{selectedTopic}</span></p>
            <p className="text-muted-foreground mb-8">Here are the generated challenges:</p>
            <div className="w-full space-y-4">
                {players.map(player => (
                    <Card key={player.id} style={{ borderLeft: `4px solid ${player.color}` }} className="text-left">
                         <CardContent className="p-4 flex flex-col items-start gap-2">
                            <div className="w-full flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg flex items-center gap-2" style={{ color: player.color }}>
                                        {SKILL_LEVELS[player.skillLevel].icon} {player.name}
                                    </p>
                                    <p className="text-muted-foreground">Base Skill: {player.skillLevel}</p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="text-sm text-muted-foreground">Spun Difficulty</p>
                                    <p className="font-bold text-xl flex items-center justify-end gap-2">
                                        {player.spunDifficulty && SKILL_LEVELS[player.spunDifficulty].icon}
                                        {player.spunDifficulty}
                                    </p>
                                </div>
                            </div>
                            {player.problem && (
                                <div className="w-full pt-3 mt-3 border-t">
                                    <p className="font-semibold text-primary">{player.problem.problemTitle}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{player.problem.problemDescription}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Button size="lg" className="mt-8 font-bold" onClick={handleResetGame}>
                <RotateCw className="mr-2" /> Play Again
            </Button>
        </main>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Player {currentPlayerIndex + 1}'s Turn</CardTitle>
                    {currentPlayer && (
                        <CardDescription>
                            Time for <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.name}</span> to spin for a difficulty level!
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
                                        <p className="font-semibold flex items-center gap-2">{p.name} {SKILL_LEVELS[p.skillLevel].icon}</p>
                                        <p className="text-sm text-muted-foreground">Skill: {p.skillLevel}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {p.problem ? (
                                        <span className="font-bold text-primary flex items-center gap-2 justify-end">
                                            {SKILL_LEVELS[p.spunDifficulty!].icon} {p.spunDifficulty}
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
             {isGenerating ? (
                <div className="text-center animate-in fade-in zoom-in-95 flex flex-col items-center gap-4 h-24">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-semibold">Generating your challenge...</p>
                </div>
            ): (
                <div className="h-24 flex items-center justify-center">
                    {lastWinner && !isSpinning && (
                        <div className="text-center animate-in fade-in zoom-in-95">
                            <p className="text-muted-foreground">The wheel has chosen...</p>
                            <h2 className="text-4xl font-bold font-headline text-primary flex items-center gap-3">
                                {SKILL_LEVELS[lastWinner].icon}
                                {lastWinner}
                            </h2>
                        </div>
                    )}
                </div>
            )}
            <LuckyWheel
              segments={WHEEL_SEGMENTS}
              isSpinning={isSpinning}
              onSpinEnd={handleSpinEnd}
            />
            <Button
              size="lg"
              className="font-headline text-xl font-bold w-72 h-16"
              onClick={handleSpinClick}
              disabled={isSpinning || isGenerating}
            >
              {isSpinning || isGenerating ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Zap className="mr-2 h-6 w-6" />}
              {isSpinning ? 'Spinning...' : isGenerating ? 'Generating...' : 'Spin the Wheel'}
            </Button>
             <Button variant="ghost" className="hidden lg:flex" onClick={handleResetGame}>
                <RotateCw className="mr-2" /> Reset Game
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
