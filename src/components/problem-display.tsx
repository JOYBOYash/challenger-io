'use client';
import { useState } from 'react';
import { type Problem } from '@/ai/flows/problem-curation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Lightbulb, ArrowLeft } from 'lucide-react';

interface ProblemDisplayProps {
  problem: Problem;
  onBack?: () => void;
}

export function ProblemDisplay({ problem, onBack }: ProblemDisplayProps) {
  const [solutionsVisible, setSolutionsVisible] = useState(false);
  const getBadgeVariant = (difficulty: string) => {
    switch(difficulty?.toLowerCase()) {
        case 'rookie': return 'default';
        case 'crusader': return 'secondary';
        case 'veteran': return 'destructive';
        default: return 'outline';
    }
  }
    
  return (
    <main className="container mx-auto max-w-4xl py-8 px-4 font-body">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary">{problem.problemTitle}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{problem.topic}</Badge>
                    <Badge variant={getBadgeVariant(problem.difficulty)}>{problem.difficulty}</Badge>
                </div>
            </div>
            {onBack && (
                <Button onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}
        </div>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="text-primary" /> Problem Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{problem.problemDescription}</p>
          </CardContent>
        </Card>
        
        {solutionsVisible ? (
            <Card className="cyber-card animate-in fade-in">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="text-primary" /> Optimal Solutions</CardTitle>
                    <CardDescription>Here are the optimal solutions in various languages.</CardDescription>
                </CardHeader>
                <CardContent>
                    {problem.solutions ? (
                        <Tabs defaultValue="javascript" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                <TabsTrigger value="python">Python</TabsTrigger>
                                <TabsTrigger value="java">Java</TabsTrigger>
                                <TabsTrigger value="csharp">C#</TabsTrigger>
                                <TabsTrigger value="go">Go</TabsTrigger>
                            </TabsList>
                            <TabsContent value="javascript">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-4">
                                <code className="font-mono text-sm">{problem.solutions.javascript}</code>
                                </pre>
                            </TabsContent>
                            <TabsContent value="python">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-4">
                                <code className="font-mono text-sm">{problem.solutions.python}</code>
                                </pre>
                            </TabsContent>
                            <TabsContent value="java">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-4">
                                <code className="font-mono text-sm">{problem.solutions.java}</code>
                                </pre>
                            </TabsContent>
                            <TabsContent value="csharp">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-4">
                                <code className="font-mono text-sm">{problem.solutions.csharp}</code>
                                </pre>
                            </TabsContent>
                            <TabsContent value="go">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-4">
                                <code className="font-mono text-sm">{problem.solutions.go}</code>
                                </pre>
                            </TabsContent>
                        </Tabs>
                    ) : (
                         <p className="text-muted-foreground">Solutions are not available for this problem.</p>
                    )}
                </CardContent>
            </Card>
        ) : (
            problem.solutions && (
                <div className="text-center">
                    <Button size="lg" onClick={() => setSolutionsVisible(true)}>
                        <Lightbulb className="mr-2" /> View Optimal Solutions
                    </Button>
                </div>
             )
        )}
      </div>
    </main>
  );
}
