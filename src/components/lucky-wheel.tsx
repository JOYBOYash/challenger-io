'use client';

import { useState, useEffect, useMemo } from 'react';
import { Triangle } from 'lucide-react';
import { Icons } from '@/components/icons';

interface LuckyWheelProps {
  segments: { id: string }[];
  isSpinning: boolean;
  onSpinEnd: (segmentId: string) => void;
}

const WHEEL_COLORS = ['#6366F1', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#D946EF'];

export function LuckyWheel({ segments, isSpinning, onSpinEnd }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [shouldSpin, setShouldSpin] = useState(false);
  
  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const conicGradient = useMemo(() => {
    // Return a single color if there's only one segment to avoid gradient issues
    if (segments.length <= 1) {
        return WHEEL_COLORS[0];
    }
    return segments.map((_, i) => {
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      return `${color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
  }, [segments, segmentAngle]);

  useEffect(() => {
    if (isSpinning && !shouldSpin) {
        setShouldSpin(true);
        const winnerIndex = Math.floor(Math.random() * numSegments);
        const targetAngle = 360 - (winnerIndex * segmentAngle) - (segmentAngle / 2);
        
        const fullRotations = Math.floor(Math.random() * 3) + 5;
        // Use a random final angle to make the spin feel more varied
        const finalRotation = (fullRotations * 360) + targetAngle + (Math.random() * segmentAngle * 0.8 - segmentAngle * 0.4);

        setRotation(prev => prev + finalRotation);
    }
  }, [isSpinning, shouldSpin, numSegments, segmentAngle]);


  const handleTransitionEnd = () => {
    if (!isSpinning) return;

    const currentRotation = rotation % 360;
    const normalizedRotation = (currentRotation + 360) % 360;

    const winningAngle = (270 - normalizedRotation + 360) % 360;
    let winnerIndex = Math.floor(winningAngle / segmentAngle);
    
    // Handle potential floating point inaccuracies
    if (winnerIndex >= segments.length) {
        winnerIndex = segments.length - 1;
    }
    
    const winningSegment = segments[winnerIndex];
    if (winningSegment) {
        onSpinEnd(winningSegment.id);
    }
    setShouldSpin(false);
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-white"
        style={{ filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.4))' }}
      >
        <Triangle className="h-10 w-10 fill-white stroke-neutral-700 stroke-[1.5]" style={{ transform: 'rotate(180deg)' }} />
      </div>
      <div
        className="relative aspect-square w-80 md:w-96 rounded-full border-8 border-white bg-white/30 shadow-2xl transition-transform duration-[7000ms] ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.2, 1)',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div 
            className="absolute inset-0 rounded-full"
            style={{background: `conic-gradient(from -90deg, ${conicGradient})`}}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white border-4 border-neutral-300 shadow-inner flex items-center justify-center">
            <Icons.logo className="h-10 w-10 text-primary" />
        </div>
      </div>
    </div>
  );
}
