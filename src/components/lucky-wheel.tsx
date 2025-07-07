'use client';

import { useState, useEffect, useMemo } from 'react';
import { Triangle } from 'lucide-react';

interface LuckyWheelProps {
  topics: string[];
  isSpinning: boolean;
  onSpinEnd: (topic: string) => void;
}

const WHEEL_COLORS = [
  '#663399', 
  '#008080',
  '#58429A',
  '#2C6D6D',
  '#8A5DBA',
  '#4AA3A3',
  '#47267A',
  '#004D4D',
];

export function LuckyWheel({ topics, isSpinning, onSpinEnd }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  
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
    if (isSpinning) {
      const spin = () => {
        const randomIndex = Math.floor(Math.random() * numTopics);
        const randomAngleInSegment = Math.random() * (segmentAngle * 0.8) + (segmentAngle * 0.1);
        const targetAngle = randomIndex * segmentAngle + randomAngleInSegment;
        
        const fullRotations = Math.floor(Math.random() * 2) + 5;
        const finalRotation = rotation - (rotation % 360) + (360 * fullRotations) - targetAngle;

        setRotation(finalRotation);
      };
      spin();
    }
  }, [isSpinning, numTopics, segmentAngle, rotation]);

  const handleTransitionEnd = () => {
    if (!isSpinning) return;
    const actualRotation = rotation % 360;
    const winningAngle = (360 - actualRotation) % 360;
    const winnerIndex = Math.floor(winningAngle / segmentAngle);
    
    if (topics[winnerIndex]) {
        onSpinEnd(topics[winnerIndex]);
    }
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-white"
        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
      >
        <Triangle className="h-8 w-8 fill-white stroke-neutral-700" style={{ transform: 'rotate(180deg)' }} />
      </div>
      <div
        className="relative aspect-square w-80 md:w-96 rounded-full border-8 border-white bg-white/30 shadow-2xl transition-transform duration-[5000ms] ease-out-quad"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div 
            className="absolute inset-0 rounded-full"
            style={{background: `conic-gradient(from 90deg, ${conicGradient})`}}
        ></div>
        {topics.map((topic, i) => (
          <div
            key={i}
            className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 origin-bottom-left flex items-center justify-center"
            style={{ transform: `rotate(${i * segmentAngle}deg)` }}
          >
             <div className="h-full w-px bg-white/20"></div>
          </div>
        ))}
         {topics.map((topic, i) => (
          <div
            key={i}
            className="absolute top-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 origin-bottom-left flex items-center justify-center"
            style={{ transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)` }}
          >
            <span
              className="text-white font-headline font-bold text-sm"
              style={{ transform: `translateY(-60%) rotate(-90deg)` }}
            >
              {topic}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
