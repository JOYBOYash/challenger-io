'use client';

import { useState, useEffect, useMemo } from 'react';
import { Triangle } from 'lucide-react';

interface LuckyWheelProps {
  topics: string[];
  isSpinning: boolean;
  onSpinEnd: (topic: string) => void;
}

const WHEEL_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#D946EF'];

export function LuckyWheel({ topics, isSpinning, onSpinEnd }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [shouldSpin, setShouldSpin] = useState(false);
  
  const numTopics = topics.length;
  const segmentAngle = 360 / numTopics;

  const conicGradient = useMemo(() => {
    return topics.map((_, i) => {
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      return `${color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
  }, [topics, segmentAngle]);

  useEffect(() => {
    if (isSpinning && !shouldSpin) {
        setShouldSpin(true);
        const winnerIndex = Math.floor(Math.random() * numTopics);
        const targetAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
        
        const fullRotations = Math.floor(Math.random() * 3) + 5;
        const finalRotation = (fullRotations * 360) + targetAngle;

        setRotation(prev => prev + finalRotation);
    }
  }, [isSpinning, shouldSpin, numTopics, segmentAngle]);

  const handleTransitionEnd = () => {
    if (!isSpinning) return;

    const currentAngle = rotation % 360;
    const normalizedAngle = (360 - currentAngle + 90 + segmentAngle/2) % 360;
    const winnerIndex = Math.floor(normalizedAngle / segmentAngle);
    
    const winningTopic = topics[winnerIndex];
    if (winningTopic) {
        onSpinEnd(winningTopic);
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
          transitionTimingFunction: `cubic-bezier(0.25, 1, 0.5, 1)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div 
            className="absolute inset-0 rounded-full"
            style={{background: `conic-gradient(from -90deg, ${conicGradient})`}}
        ></div>
        {topics.map((topic, i) => (
          <div
            key={i}
            className="absolute top-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 origin-bottom-center flex items-center justify-center"
            style={{ transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)` }}
          >
            <span
              className="text-white font-headline font-bold text-sm tracking-wider uppercase -translate-y-12 rotate-[-90deg] md:text-base md:-translate-y-16"
            >
              {topic}
            </span>
          </div>
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-neutral-300 shadow-inner"></div>
      </div>
    </div>
  );
}
