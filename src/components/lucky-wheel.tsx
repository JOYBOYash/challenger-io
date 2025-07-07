'use client';

import { useState, useEffect, useMemo } from 'react';
import { Triangle } from 'lucide-react';

interface LuckyWheelProps {
  segments: { id: string; content: React.ReactNode }[];
  isSpinning: boolean;
  onSpinEnd: (segmentId: string) => void;
}

const WHEEL_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function LuckyWheel({ segments, isSpinning, onSpinEnd }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [shouldSpin, setShouldSpin] = useState(false);
  
  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const conicGradient = useMemo(() => {
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
        // Correctly center the pointer on the middle of the winning segment
        const targetAngle = 360 - (winnerIndex * segmentAngle) - (segmentAngle / 2);
        
        const fullRotations = Math.floor(Math.random() * 3) + 5;
        const finalRotation = (fullRotations * 360) + targetAngle;

        // Use a functional update to ensure we're always rotating from the current position
        setRotation(prev => prev + finalRotation);
    }
  }, [isSpinning, shouldSpin, numSegments, segmentAngle]);


  const handleTransitionEnd = () => {
    // Only trigger onSpinEnd if the wheel was meant to be spinning
    if (!isSpinning) return;

    const currentRotation = rotation % 360;
    // Normalize rotation to avoid floating point issues and ensure it's within [0, 360)
    const normalizedRotation = (currentRotation + 360) % 360;

    // The winning angle is what's under the pointer (at the top, 270deg or -90deg in CSS conic-gradient space)
    // We adjust for the initial -90deg rotation of the gradient
    const winningAngle = (270 - normalizedRotation + 360) % 360;
    const winnerIndex = Math.floor(winningAngle / segmentAngle);
    
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
        className="relative aspect-square w-80 md:w-96 rounded-full border-8 border-white bg-white/30 shadow-2xl transition-transform duration-[6000ms] ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          // Using a more suitable timing function for a spin
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div 
            className="absolute inset-0 rounded-full"
            // Start gradient from the top (-90deg)
            style={{background: `conic-gradient(from -90deg, ${conicGradient})`}}
        ></div>
        {segments.map((segment, i) => (
          <div
            key={i}
            className="absolute top-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 origin-bottom-center flex items-center justify-center"
            style={{ transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)` }}
          >
            <div className="rotate-[-90deg] -translate-y-16">
                {segment.content}
            </div>
          </div>
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-neutral-300 shadow-inner"></div>
      </div>
    </div>
  );
}
