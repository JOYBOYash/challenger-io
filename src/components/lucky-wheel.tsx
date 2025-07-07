'use client';

import { useState, useEffect, useMemo } from 'react';
import { Triangle } from 'lucide-react';
import { Icons } from '@/components/icons';

interface LuckyWheelProps {
  segments: { id: string; label: string }[];
  isSpinning: boolean;
  onSpinEnd: (segmentId: string) => void;
}

const WHEEL_COLORS = ['#2E8B57', '#3CB371', '#66CDAA', '#8FBC8F', '#20B2AA', '#008080', '#4682B4', '#5F9EA0'];

export function LuckyWheel({ segments, isSpinning, onSpinEnd }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [shouldSpin, setShouldSpin] = useState(false);
  
  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const conicGradient = useMemo(() => {
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
        const finalRotation = (fullRotations * 360) + targetAngle + (Math.random() * segmentAngle * 0.8 - segmentAngle * 0.4);

        setRotation(prev => prev + finalRotation);
    }
  }, [isSpinning, shouldSpin, numSegments, segmentAngle]);


  const handleTransitionEnd = () => {
    if (!isSpinning) return;

    const currentRotation = rotation % 360;
    const normalizedRotation = (360 - currentRotation) % 360;

    const winningAngle = (normalizedRotation + 90) % 360;
    let winnerIndex = Math.floor(winningAngle / segmentAngle);
    
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
        className="relative aspect-square w-80 md:w-96 rounded-full border-8 border-white bg-white/30 shadow-2xl transition-transform duration-[7000ms]"
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
         {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)` }}
          >
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-bold text-2xl"
              style={{ transform: `rotate(${-90}deg)` }}
            >
            </div>
          </div>
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white border-4 border-neutral-300 shadow-inner flex items-center justify-center">
            <Icons.logo className="h-10 w-10 text-primary" />
        </div>
      </div>
    </div>
  );
}
