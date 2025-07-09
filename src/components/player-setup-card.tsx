'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import type { Player } from '@/app/challenge/page';

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
    <div className="cyber-card p-4 w-full" style={{ borderLeft: `4px solid ${player.color}` }}>
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: player.color }}>
                <User className="h-5 w-5 text-white" />
            </div>
            <Input
              type="text"
              value={player.name}
              onChange={handleNameChange}
              placeholder={`Player...`}
              className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 pl-1 bg-transparent"
            />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`skill-level-${player.id}`} className="text-sm font-medium">Skill Level</Label>
          <Select value={player.skillLevel} onValueChange={(val) => handleSkillChange(val as any)}>
            <SelectTrigger id={`skill-level-${player.id}`} className="w-full">
                <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
                {(Object.keys(skillLevels) as SkillLevel[]).map(level => (
                    <SelectItem key={level} value={level}>
                        <div className="flex items-center gap-2">
                            {skillLevels[level].icon}
                            <span>{level}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
