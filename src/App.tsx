/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hammer, LucideProps, Wrench, Scissors, Axe, Check, RotateCcw, PocketKnife } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Wheel } from "./components/Wheel.tsx";
import { Logo } from "./components/Logo.tsx";
import { playClickSound, playWinSound, playLossSound } from "./utils/audio.ts";

// Custom Pliers icon matching the Lucide design language
const Pliers = ({ size = 24, width, height, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || size}
    height={height || size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <g transform="translate(12, 12.5) scale(1.4) translate(-12, -12.5)">
      {/* Left jaw */}
      <path d="M10 11V6a2 2 0 0 1 2-2" vectorEffect="non-scaling-stroke" />
      {/* Right jaw */}
      <path d="M14 11V6a2 2 0 0 0-2-2" vectorEffect="non-scaling-stroke" />
      {/* Middle pivot */}
      <circle cx="12" cy="11" r="1.5" vectorEffect="non-scaling-stroke" />
      {/* Left handle */}
      <path d="M10 11c-.5 2-1.5 5-2 10" vectorEffect="non-scaling-stroke" />
      {/* Right handle */}
      <path d="M14 11c.5 2 1.5 5 2 10" vectorEffect="non-scaling-stroke" />
      {/* Gripping ridges */}
      <path d="M10 7.5h4" vectorEffect="non-scaling-stroke" />
      <path d="M10 9.5h4" vectorEffect="non-scaling-stroke" />
    </g>
  </svg>
);

const SEGMENTS = [
  { label: "Vermelho", color: "#ed1c24", Icon: Wrench },
  { label: "Azul", color: "#1e73be", Icon: Pliers },
  { label: "Verde", color: "#22c55e", Icon: Scissors },
  { label: "Amarelo", color: "#ffcc00", Icon: Axe },
  { label: "Marrom", color: "#78350f", Icon: PocketKnife },
  { label: "Rosa", color: "#ec4899", Icon: Hammer },
];

export default function App() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [resultColor, setResultColor] = useState<typeof SEGMENTS[0] | null>(null);
  const [showResult, setShowResult] = useState(false);

  const spin = useCallback((choiceColor: string) => {
    if (isSpinning) return;

    playClickSound();
    setSelectedColor(choiceColor);
    setIsSpinning(true);
    setShowResult(false);
    setResultColor(null);

    // Random landing segment
    const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
    
    const spinCount = 8;
    const sliceAngle = 360 / SEGMENTS.length;
    
    // Calculate final rotation to land on the segment
    const targetModulo = (360 - (randomIndex * sliceAngle)) % 360;
    const baseRotation = rotation + (spinCount * 360);
    const currentModulo = baseRotation % 360;
    const correction = (targetModulo - currentModulo + 360) % 360;
    const finalRotation = baseRotation + correction;
    
    setRotation(finalRotation);

    // We removed the setTimeout here and will handle completion via onSpinComplete
  }, [rotation, isSpinning]);

  const onSpinComplete = useCallback((finalRotationValue: number) => {
    setIsSpinning(false);
    
    // Calculate which segment it landed on based on rotation
    // Note: sliceAngle = 360 / SEGMENTS.length
    const normalizedRotation = ((finalRotationValue % 360) + 360) % 360;
    const sliceAngle = 360 / SEGMENTS.length;
    
    // The pointer is at the top (0 degrees in the wheel coordinate system)
    // The segments are drawn starting from 0 - sliceAngle/2
    // So we need to find the segment at (360 - normalizedRotation) % 360
    const landedIndex = Math.floor(((360 - normalizedRotation + sliceAngle/2) % 360) / sliceAngle);
    const landed = SEGMENTS[landedIndex];
    
    setResultColor(landed);
    setShowResult(true);

    if (landed.label === selectedColor) {
      playWinSound();
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: [landed.color, '#fbbf24', '#ffffff']
      });
    } else {
      playLossSound();
    }
  }, [selectedColor]);

  const reset = () => {
    playClickSound();
    setShowResult(false);
    setSelectedColor(null);
    setResultColor(null);
  };

  const isWinner = resultColor?.label === selectedColor;

  return (
    <div className="w-full h-screen h-[100dvh] bg-[#050b18] flex flex-col justify-between items-center p-3 sm:p-4 select-none overflow-hidden font-sans relative">
      {/* Background Decor - Tool Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="flex flex-wrap gap-12 p-8 justify-center">
          {Array.from({ length: 45 }).map((_, i) => {
            const Icon = SEGMENTS[i % SEGMENTS.length].Icon;
            return (
              <Icon key={i} size={60} className={i % 2 === 0 ? 'rotate-45' : '-rotate-12'} />
            );
          })}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full flex flex-col items-center shrink-0 mb-0.5 mt-1">
        <Logo className="w-[170px] sm:w-[200px] md:w-[220px]" />
        <p className="text-white/40 font-bold tracking-[0.25em] uppercase text-[8px] sm:text-[10px] mt-1.5 text-center">
          Onde a sorte é sua ferramenta
        </p>
      </header>

      {/* Main Wheel Area (Flex center) */}
      <main className="relative z-10 flex-grow flex flex-col justify-center items-center w-full max-w-sm min-h-0 py-2">
        {/* Wheel Container */}
        <div className="w-full flex-grow flex items-center justify-center min-h-0">
          <Wheel 
            segments={SEGMENTS} 
            rotation={rotation} 
            isSpinning={isSpinning} 
            onSpinComplete={onSpinComplete}
          />
        </div>

        {/* Dynamic Compact Result / Waiting Status Area */}
        <div className="h-12 flex items-center justify-center w-full mt-2 select-none shrink-0">
          <AnimatePresence mode="wait">
            {resultColor && showResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 bg-black/50 backdrop-blur-md py-1.5 px-4 rounded-full border border-white/10 shadow-lg"
              >
                <span className="text-xs font-semibold text-white/70">Palpite:</span>
                <span 
                  className="text-xs font-black px-2.5 py-0.5 rounded-full text-white shadow-sm" 
                  style={{ backgroundColor: resultColor.color }}
                >
                  {resultColor.label}
                </span>
                <span className={`text-xs font-extrabold ${isWinner ? 'text-green-400 font-black tracking-widest' : 'text-red-400 font-bold'}`}>
                  {isWinner ? "🎉 GANHOU!" : "✖ TENTE DE NOVO"}
                </span>
              </motion.div>
            ) : (
              <p className="text-[11px] font-medium text-white/30 tracking-wider animate-pulse uppercase">
                {selectedColor ? `Torcendo por ${selectedColor}...` : "Escolha uma cor abaixo para começar"}
              </p>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Selection Panel Grid (Fixed dynamic footprint) */}
      <section className="relative z-10 w-full max-w-xs shrink-0 select-none pb-1 mt-1">
        <div className="bg-black/35 backdrop-blur-md rounded-[24px] p-3 sm:p-4 border border-white/10 shadow-xl">
          <h3 className="text-center text-white/50 font-semibold mb-2.5 tracking-wider text-[11px] sm:text-xs">
            Escolha uma cor para girar:
          </h3>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {SEGMENTS.map((seg) => (
              <motion.button
                key={seg.label}
                whileHover={!isSpinning ? { scale: 1.02 } : {}}
                whileTap={!isSpinning ? { scale: 0.98 } : {}}
                onClick={() => spin(seg.label)}
                disabled={isSpinning}
                className={`
                  relative h-11 sm:h-12 rounded-xl flex items-center px-3 gap-2.5 transition-all overflow-hidden
                  ${isSpinning ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 shadow-md'}
                  ${selectedColor === seg.label ? 'ring-3 ring-white ring-inset font-black' : ''}
                `}
                style={{ backgroundColor: seg.color }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                  <seg.Icon className="text-white" size={16} />
                </div>
                <span className="text-white font-bold text-xs sm:text-sm tracking-wide">{seg.label}</span>
                
                {selectedColor === seg.label && !isSpinning && (
                  <div className="absolute right-3">
                    <Check className="text-white" size={18} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Reset Floating Action Button */}
      {showResult && !isSpinning && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={reset}
          className="fixed bottom-4 right-4 w-12 h-12 bg-white text-[#050b18] rounded-full shadow-2xl flex items-center justify-center hover:bg-yellow-400 transition-colors z-50 hover:text-black border border-white/20 active:scale-95"
          title="Reiniciar"
        >
          <RotateCcw size={20} />
        </motion.button>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full pt-1 pb-1 flex justify-center items-center shrink-0">
        <p className="text-white/20 text-[9px] font-bold tracking-wider uppercase text-center">
          © 2026 Vila Ferramentas. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
