'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from 'lucide-react';
import type { Player } from '@/app/page';

type SkillLevel = 'Rookie' | 'Crusader' | 'Veteran';

interface PlayerSetupCardProps {
  player: Player;
  onPlayerChange: (player: Player) => void;
  skillLevels: Record<SkillLevel, { icon: React.ReactNode }>;
}

export function PlayerSetupCard({ player, onPlayerChange, skillLevels }: PlayerSetupCardProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPlayerChange({ ...player, name: e.target.value });
  };

  const handleSkillChange = (skillLevel: SkillLevel) => {
    onPlayerChange({ ...player, skillLevel });
  };

  return (
    <Card className="w-full" style={{ borderLeft: `4px solid ${player.color}` }}>
      <CardContent className="p-4 grid gap-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: player.color }}>
                <User className="h-5 w-5 text-white" />
            </div>
            <Input
              type="text"
              value={player.name}
              onChange={handleNameChange}
              placeholder={`Player...`}
              className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 pl-1"
            />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Skill Level</Label>
          <RadioGroup value={player.skillLevel} onValueChange={(val) => handleSkillChange(val as any)} className="flex gap-2">
            {(Object.keys(skillLevels) as SkillLevel[]).map(level => (
                 <div className="flex-1" key={level}>
                    <RadioGroupItem value={level} id={`${level}-${player.id}`} className="peer sr-only" />
                    <Label htmlFor={`${level}-${player.id}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 h-full hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        {skillLevels[level].icon}
                        {level}
                    </Label>
                </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
