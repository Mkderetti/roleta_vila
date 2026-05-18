import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center bg-[#FA5D16] p-6 rounded-md shadow-xl ${className}`}>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Stylized V Logo Mark */}
        <div className="relative w-12 h-12 md:w-20 md:h-20 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Main Black V Body */}
            <path
              d="M10 20 L35 20 L50 80 L65 20 L90 20 L50 95 Z"
              fill="black"
            />
            {/* White Inset Triangle on Left */}
            <path
              d="M18 20 L42 20 L30 55 Z"
              fill="white"
            />
          </svg>
        </div>
        
        {/* Text Area */}
        <div className="flex flex-col items-start leading-none shrink-0 text-black">
          <div className="flex items-start">
            <span className="text-4xl md:text-7xl font-[1000] tracking-tighter italic mr-1">
              VILA
            </span>
            <span className="text-[8px] md:text-xs font-bold self-start mt-2 border border-black rounded-full w-3 h-3 flex items-center justify-center">R</span>
          </div>
          <span className="text-[10px] md:text-lg font-black tracking-[0.25em] -mt-1 md:-mt-2 uppercase bg-transparent">
            FERRAMENTAS
          </span>
        </div>
      </div>
    </div>
  );
};
