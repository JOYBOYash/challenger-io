'use client';

import { type CurateProblemOutput } from '@/ai/flows/problem-curation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, BookOpen, Lightbulb, ArrowLeft } from 'lucide-react';

interface ProblemDisplayProps {
  problem: CurateProblemOutput;
  onBack: () => void;
}

export function ProblemDisplay({ problem, onBack }: ProblemDisplayProps) {
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
            <Button onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
        </div>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="text-primary" /> Problem Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{problem.problemDescription}</p>
          </CardContent>
        </Card>
        
        <Card className="cyber-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Code className="text-primary" /> Your Code</CardTitle>
                <CardDescription>Select a language and write your solution below.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                     <Select defaultValue="javascript">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
                <Textarea 
                    placeholder="Write your code here..." 
                    className="min-h-[300px] font-mono bg-muted/30 text-base"
                />
            </CardContent>
        </Card>

        {problem.solution && (
            <Accordion type="single" collapsible className="w-full cyber-card p-0">
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="text-lg font-headline flex items-center gap-2 hover:no-underline px-6">
                        <Lightbulb className="text-primary" />
                        View Optimal Solution
                    </AccordionTrigger>
                    <AccordionContent className="px-6">
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                            <code className="font-mono text-sm">{problem.solution}</code>
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
      </div>
    </main>
  );
}
