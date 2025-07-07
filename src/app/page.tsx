'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { LuckyWheel } from '@/components/lucky-wheel';
import { ProblemDisplay } from '@/components/problem-display';
import { curateProblem, type CurateProblemOutput } from '@/ai/flows/problem-curation';
import { Loader2, Zap } from 'lucide-react';
import { Icons } from '@/components/icons';

const ALL_TOPICS = [
  { id: 'Data Structures', label: 'Data Structures' },
  { id: 'Algorithms', label: 'Algorithms' },
  { id: 'System Design', label: 'System Design' },
  { id: 'JavaScript', label: 'JavaScript' },
  { id: 'React', label: 'React' },
  { id: 'SQL', label: 'SQL' },
];

export default function Home() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Data Structures', 'Algorithms', 'System Design', 'JavaScript']);
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [playerCount, setPlayerCount] = useState('1');
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [curatedProblem, setCuratedProblem] = useState<CurateProblemOutput | null>(null);

  const { toast } = useToast();

  const handleTopicChange = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSpinClick = () => {
    if (selectedTopics.length < 2) {
      toast({
        title: "Not enough topics",
        description: "Please select at least two topics to spin the wheel.",
        variant: "destructive",
      });
      return;
    }
    setIsSpinning(true);
  };
  
  const handleSpinEnd = async (topic: string) => {
    setIsSpinning(false);
    setIsLoadingProblem(true);
    try {
      const problem = await curateProblem({ topic, skillLevel });
      setCuratedProblem(problem);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate a problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProblem(false);
    }
  };
  
  const handlePlayAgain = () => {
    setCuratedProblem(null);
  };

  const wheelTopics = useMemo(() => {
    if (selectedTopics.length < 2) {
      return ['Topic A', 'Topic B'];
    }
    return selectedTopics;
  }, [selectedTopics]);

  if (isLoadingProblem) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h1 className="text-2xl font-headline font-bold">Curating your challenge...</h1>
        <p className="text-muted-foreground">The AI is picking the perfect problem for you.</p>
      </main>
    )
  }

  if (curatedProblem) {
    return (
      <ProblemDisplay
        problem={curatedProblem}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="flex h-16 shrink-0 items-center border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Challenger.io</span>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Game Setup</CardTitle>
                <CardDescription>Configure your challenge session.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label className="font-medium text-base">Topics</Label>
                  <p className="text-sm text-muted-foreground">Select at least two domains for your challenge.</p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {ALL_TOPICS.map(topic => (
                      <div key={topic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic.id}
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={() => handleTopicChange(topic.id)}
                        />
                        <label
                          htmlFor={topic.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {topic.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                   <Label className="font-medium text-base">Skill Level</Label>
                   <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Rookie" id="rookie" />
                        <Label htmlFor="rookie">Rookie</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Intermediate" id="intermediate" />
                        <Label htmlFor="intermediate">Intermediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Veteran" id="veteran" />
                        <Label htmlFor="veteran">Veteran</Label>
                      </div>
                   </RadioGroup>
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="player-count" className="font-medium text-base">Players</Label>
                  <Select value={playerCount} onValueChange={setPlayerCount}>
                    <SelectTrigger id="player-count" className="w-[180px]">
                      <SelectValue placeholder="Select players" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Player</SelectItem>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col items-center justify-center gap-8 py-8 lg:py-0">
            <LuckyWheel
              topics={wheelTopics}
              isSpinning={isSpinning}
              onSpinEnd={handleSpinEnd}
            />
            <Button
              size="lg"
              className="font-headline text-lg font-bold w-64 h-14"
              onClick={handleSpinClick}
              disabled={isSpinning || selectedTopics.length < 2}
            >
              <Zap className="mr-2 h-5 w-5" />
              Spin the Wheel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
