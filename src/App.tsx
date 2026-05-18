/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hammer, LucideProps, Wrench, Scissors, Axe, Check, RotateCcw, Drill, PocketKnife } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Wheel } from "./components/Wheel.tsx";
import { Logo } from "./components/Logo.tsx";

const SEGMENTS = [
  { label: "Vermelho", color: "#ed1c24", Icon: Wrench },
  { label: "Azul", color: "#1e73be", Icon: Drill },
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

    setSelectedColor(choiceColor);
    setIsSpinning(true);
    setShowResult(false);
    setResultColor(null);

    // Random landing segment
    const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
    
    const spinCount = 5;
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
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: [landed.color, '#fbbf24', '#ffffff']
      });
    }
  }, [selectedColor]);

  const reset = () => {
    setShowResult(false);
    setSelectedColor(null);
    setResultColor(null);
  };

  const isWinner = resultColor?.label === selectedColor;

  return (
    <div className="min-h-screen bg-[#050b18] flex flex-col items-center py-12 px-4 select-none overflow-x-hidden font-sans">
      {/* Background Decor - Tool Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="flex flex-wrap gap-16 p-12 justify-center">
          {Array.from({ length: 60 }).map((_, i) => {
            const Icon = SEGMENTS[i % SEGMENTS.length].Icon;
            return (
              <Icon key={i} size={80} className={i % 2 === 0 ? 'rotate-45' : '-rotate-12'} />
            );
          })}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 text-center mb-8 md:mb-16 flex flex-col items-center">
        <div className="flex items-center gap-2 md:gap-4 px-2">
          <div className="text-2xl md:text-5xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🛠️</div>
          <h1 className="text-3xl md:text-7xl font-[1000] text-white tracking-tighter italic uppercase text-center leading-none">
            ROLETÃO VILA
          </h1>
          <div className="text-2xl md:text-5xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🛠️</div>
        </div>
        <p className="text-white/40 font-bold tracking-[0.3em] uppercase text-[10px] md:text-sm mt-2">
          Onde a sorte é sua ferramenta
        </p>
      </header>

      {/* Wheel Section */}
      <main className="relative z-10 flex flex-col items-center w-full max-w-4xl px-2">
        <div className="mb-8 md:mb-16 w-full">
          <Wheel 
            segments={SEGMENTS} 
            rotation={rotation} 
            isSpinning={isSpinning} 
            onSpinComplete={onSpinComplete}
          />
        </div>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {resultColor && showResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="text-2xl font-bold text-white/80">
                Resultado: <span style={{ color: resultColor.color }}>{resultColor.label}</span>
              </div>
              
              <motion.div 
                animate={isWinner ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`
                  px-12 py-3 rounded-2xl text-2xl font-black tracking-widest flex items-center gap-3 shadow-xl
                  ${isWinner ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                `}
              >
                🎉 {isWinner ? 'GANHADOR!' : 'TENTE DE NOVO'} 🎉
              </motion.div>
            </motion.div>
          ) : (
            <div className="h-24" /> // Placeholder
          )}
        </AnimatePresence>

        {/* Selection Area */}
        <div className="w-full max-w-lg mt-8 bg-black/30 backdrop-blur-md rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-white/10 shadow-2xl">
          <h3 className="text-center text-white/60 font-semibold mb-6 tracking-wide text-sm md:text-base">
            Escolha uma cor para girar:
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
            {SEGMENTS.map((seg) => (
              <motion.button
                key={seg.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => spin(seg.label)}
                disabled={isSpinning}
                className={`
                  relative h-16 rounded-2xl flex items-center px-4 gap-4 transition-all overflow-hidden
                  ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 shadow-lg'}
                  ${selectedColor === seg.label ? 'ring-4 ring-white ring-inset' : ''}
                `}
                style={{ backgroundColor: seg.color }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl backdrop-blur-sm -rotate-12">
                  <seg.Icon className="text-white" size={24} />
                </div>
                <span className="text-white font-bold text-lg">{seg.label}</span>
                
                {selectedColor === seg.label && !isSpinning && (
                  <div className="absolute right-4">
                    <Check className="text-white" size={24} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Reset FAB */}
      {showResult && !isSpinning && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={reset}
          className="fixed bottom-8 right-8 w-16 h-16 bg-white text-brand-dark rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-yellow transition-colors z-50"
        >
          <RotateCcw />
        </motion.button>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full mt-24 pb-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col items-center max-w-lg w-full text-center"
        >
          <Logo className="mb-6 scale-90 md:scale-100" />
          <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
            © 2024 Vila Ferramentas. Todos os direitos reservados.
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
