/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useRef, useEffect } from "react";
import { LucideProps } from "lucide-react";
import { playTickSound } from "../utils/audio.ts";

interface Segment {
  label: string;
  color: string;
  Icon: React.FC<LucideProps>;
}

interface WheelProps {
  segments: Segment[];
  rotation: number;
  isSpinning: boolean;
  onSpinComplete?: (rotation: number) => void;
}

export const Wheel: React.FC<WheelProps> = ({ segments, rotation, isSpinning, onSpinComplete }) => {
  const size = 500;
  const center = size / 2;
  const radius = center - 60; // Slightly smaller radius to fit rings inside
  const sliceCount = segments.length;
  const sliceAngle = 360 / sliceCount;

  const wheelRef = useRef<HTMLDivElement>(null);
  const lastSegmentRef = useRef<number>(-1);

  useEffect(() => {
    if (!isSpinning) {
      lastSegmentRef.current = -1;
      return;
    }

    const element = wheelRef.current;
    if (!element) return;

    let active = true;

    const checkRotation = () => {
      if (!active) return;

      const transform = element.style.transform || "";
      let angle = 0;

      // Extract degree from 'rotate(123deg)' or 'rotateZ(123deg)'
      const match = transform.match(/rotate(?:Z)?\(([\d.-]+)deg\)/);
      if (match) {
        angle = parseFloat(match[1]);
      } else {
        // Fallback to computed matrix if inline style is not available or represents matrix
        try {
          const st = window.getComputedStyle(element, null);
          const tr = st.getPropertyValue("transform");
          if (tr && tr !== "none") {
            const values = tr.split("(")[1].split(")")[0].split(",");
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            const angleRad = Math.atan2(b, a);
            let angleDeg = angleRad * (180 / Math.PI);
            if (angleDeg < 0) angleDeg += 360;
            angle = angleDeg;
          }
        } catch (e) {
          // ignore
        }
      }

      // Keep angle positive and capped between [0, 360) for clean relative segment checking
      const normalizedAngle = ((angle % 360) + 360) % 360;
      
      // Offset by half of a slice (sliceAngle / 2) so ticks align perfectly with the border boundary crossings
      const adjustedSliceAngle = 360 / segments.length;
      const currentSegment = Math.floor((normalizedAngle + adjustedSliceAngle / 2) / adjustedSliceAngle) % segments.length;

      if (lastSegmentRef.current !== -1 && currentSegment !== lastSegmentRef.current) {
        playTickSound();
      }
      lastSegmentRef.current = currentSegment;

      requestAnimationFrame(checkRotation);
    };

    const handle = requestAnimationFrame(checkRotation);

    return () => {
      active = false;
      cancelAnimationFrame(handle);
    };
  }, [isSpinning, rotation, segments.length]);

  return (
    <div className="relative flex items-center justify-center w-full h-full max-w-[min(80vw,33dvh,340px)] max-h-[min(80vw,33dvh,340px)] aspect-square mx-auto">
      {/* Red Arrow Pointer */}
      <div className="absolute top-0 z-40 -mt-6 sm:-mt-8 flex flex-col items-center">
        <motion.div 
          animate={isSpinning ? { y: [0, 6, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.15 }}
          className="relative drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]"
        >
          <div className="w-8 h-12 sm:w-11 sm:h-16 bg-[#ef4444]" 
               style={{ clipPath: 'polygon(50% 100%, 0 40%, 20% 40%, 20% 0, 80% 0, 80% 40%, 100% 40%)' }} />
        </motion.div>
      </div>

      {/* The Wheel with SVG-based decorations for perfect scaling */}
      <motion.div
        ref={wheelRef}
        className="w-full h-full relative z-20"
        animate={{ rotate: rotation }}
        onAnimationComplete={() => {
          if (isSpinning) {
            onSpinComplete?.(rotation);
          }
        }}
        transition={{
          duration: 6,
          ease: [0.2, 0.8, 0.2, 1] // Fast start, very slow finish for dramatic effect but shorter total time
        }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Outer Ring Shadow */}
          <circle cx={center} cy={center} r={center - 5} fill="#000" fillOpacity="0.3" />
          
          {/* Gold Outer Ring Decoration */}
          <circle cx={center} cy={center} r={center - 20} fill="#fbbf24" stroke="#d97706" strokeWidth="10" />
          <circle cx={center} cy={center} r={center - 35} fill="none" stroke="#fef3c7" strokeWidth="2" opacity="0.5" />

          {/* Wheel Segments Container */}
          <g transform={`rotate(0, ${center}, ${center})`}>
            {segments.map((seg, i) => {
              const startAngle = i * sliceAngle - 90 - (sliceAngle / 2);
              const endAngle = (i + 1) * sliceAngle - 90 - (sliceAngle / 2);
              
              const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `
                M ${center} ${center}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;

              const midAngle = (startAngle + endAngle) / 2;
              const iconRadius = radius * 0.65;
              const iconX = center + iconRadius * Math.cos((midAngle * Math.PI) / 180);
              const iconY = center + iconRadius * Math.sin((midAngle * Math.PI) / 180);

              return (
                <g key={i}>
                  <path
                    d={pathData}
                    fill={seg.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  
                  <g transform={`translate(${iconX - 25}, ${iconY - 25}) rotate(${midAngle + 90}, 25, 25)`}>
                    <seg.Icon size={50} color="white" strokeWidth={1} className="drop-shadow-lg" />
                  </g>
                </g>
              );
            })}
          </g>
          
          {/* Central Hub */}
          <circle cx={center} cy={center} r="50" fill="white" className="drop-shadow-lg" />
          <circle cx={center} cy={center} r="40" fill="white" stroke="#fbbf24" strokeWidth="8" />
          <circle cx={center} cy={center} r="20" fill="#ef4444" />
          <circle cx={center} cy={center} r="12" fill="white" opacity="0.2" />
        </svg>
      </motion.div>
    </div>
  );
};
