'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LuckyWheel } from '@/components/lucky-wheel';
import { PlayerSetupCard } from '@/components/player-setup-card';
import { Icons } from '@/components/icons';
import { ArrowRight, Zap, Users, RotateCw, Crown, Shield, User, Trophy } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';

const TOPICS = ['Data Structures', 'Algorithms', 'System Design', 'JavaScript', 'React', 'SQL'];
const PLAYER_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

export type Player = {
  id: string;
  name: string;
  skillLevel: 'Rookie' | 'Crusader' | 'Veteran';
  assignedTopic: string | null;
  color: string;
};

const SKILL_ICONS = {
  Rookie: <User className="h-5 w-5" />,
  Crusader: <Shield className="h-5 w-5" />,
  Veteran: <Crown className="h-5 w-5" />,
};

export default function Home() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [numPlayers, setNumPlayers] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWinnerTopic, setLastWinnerTopic] = useState<string | null>(null);

  useEffect(() => {
    setPlayers(
      Array.from({ length: numPlayers }, (_, i) => ({
        id: nanoid(5),
        name: `Player ${i + 1}`,
        skillLevel: 'Rookie',
        assignedTopic: null,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      }))
    );
  }, [numPlayers]);

  const handlePlayerChange = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };
  
  const handleStartGame = () => {
    setGameState('playing');
    setCurrentPlayerIndex(0);
  };

  const handleSpinClick = () => {
    if (isSpinning) return;
    setLastWinnerTopic(null);
    setIsSpinning(true);
  };

  const handleSpinEnd = (topic: string) => {
    setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[currentPlayerIndex].assignedTopic = topic;
        return newPlayers;
    });
    setLastWinnerTopic(topic);
    setIsSpinning(false);
    
    setTimeout(() => {
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            setGameState('finished');
        }
    }, 1000);
  };
  
  const handleResetGame = () => {
    setGameState('setup');
    setNumPlayers(1);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setIsSpinning(false);
    setLastWinnerTopic(null);
  };

  const currentPlayer = players[currentPlayerIndex];

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
                    <div className="grid gap-3">
                        <Label htmlFor="player-count" className="font-medium text-base flex items-center gap-2"><Users /> Number of Players</Label>
                        <Select value={String(numPlayers)} onValueChange={(val) => setNumPlayers(Number(val))}>
                            <SelectTrigger id="player-count" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Player</SelectItem>
                                <SelectItem value="2">2 Players</SelectItem>
                                <SelectItem value="3">3 Players</SelectItem>
                                <SelectItem value="4">4 Players</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {players.map(player => (
                            <PlayerSetupCard key={player.id} player={player} onPlayerChange={handlePlayerChange} />
                        ))}
                    </div>
                    <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame}>
                        Start Game <ArrowRight className="ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
  }

  if (gameState === 'finished') {
    return (
        <main className="container mx-auto max-w-2xl py-8 px-4 font-body flex flex-col items-center text-center">
            <Trophy className="h-24 w-24 text-amber-400 mb-4" />
            <h1 className="text-4xl font-bold font-headline">Round Complete!</h1>
            <p className="text-muted-foreground mb-8">Here are the assigned challenges:</p>
            <div className="w-full space-y-4">
                {players.map(player => (
                    <Card key={player.id} style={{ borderLeft: `4px solid ${player.color}` }} className="text-left">
                         <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg flex items-center gap-2" style={{ color: player.color }}>
                                    {SKILL_ICONS[player.skillLevel]} {player.name}
                                </p>
                                <p className="text-muted-foreground">Skill: {player.skillLevel}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Topic</p>
                                <p className="font-bold text-xl">{player.assignedTopic}</p>
                            </div>
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
                    <CardTitle className="font-headline text-2xl">Player Turn</CardTitle>
                    {currentPlayer && <CardDescription>Spin the wheel for <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.name}</span>!</CardDescription>}
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {players.map((p, index) => (
                           <li key={p.id} className={cn("flex items-center justify-between p-3 rounded-lg transition-all", index === currentPlayerIndex ? 'bg-primary/10' : '')}>
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-lg" style={{ color: p.color }}>{index + 1}</div>
                                    <div>
                                        <p className="font-semibold flex items-center gap-2">{p.name} {SKILL_ICONS[p.skillLevel]}</p>
                                        <p className="text-sm text-muted-foreground">{p.skillLevel}</p>
                                    </div>
                                </div>
                                <div>
                                    {p.assignedTopic ? (
                                        <span className="font-bold text-primary">{p.assignedTopic}</span>
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
             {lastWinnerTopic && (
                <div className="text-center animate-in fade-in zoom-in-95">
                    <p className="text-muted-foreground">The wheel has chosen...</p>
                    <h2 className="text-4xl font-bold font-headline text-primary">{lastWinnerTopic}</h2>
                </div>
            )}
            <LuckyWheel
              topics={TOPICS}
              isSpinning={isSpinning}
              onSpinEnd={handleSpinEnd}
            />
            <Button
              size="lg"
              className="font-headline text-xl font-bold w-72 h-16"
              onClick={handleSpinClick}
              disabled={isSpinning}
            >
              <Zap className="mr-2 h-6 w-6" />
              {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
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
