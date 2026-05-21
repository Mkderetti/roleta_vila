import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center bg-[#FA5D16] p-3 sm:p-4 rounded-xl shadow-lg select-none ${className || ''}`}>
      {/* Text Area */}
      <div className="flex flex-col items-center leading-none shrink-0 text-black">
        <div className="flex items-start">
          <span className="text-2xl sm:text-4xl md:text-5xl font-[1000] tracking-tighter italic mr-0.5">
            VILA
          </span>
          <span className="text-[5px] sm:text-[7px] font-bold self-start mt-0.5 border border-black rounded-full w-2 h-2 sm:w-2.5 sm:h-2.5 flex items-center justify-center">
            R
          </span>
        </div>
        <span className="text-[7px] sm:text-[9px] md:text-[11px] font-black tracking-[0.25em] -mt-0.5 sm:-mt-1 uppercase bg-transparent">
          FERRAMENTAS
        </span>
      </div>
    </div>
  );
};


