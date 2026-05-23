import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center bg-transparent select-none ${className || ''}`}>
      <img
        src="https://www.vilaferramentas.com.br/imagens/logos/logo.png"
        alt="Vila Ferramentas Logo"
        referrerPolicy="no-referrer"
        className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-full"
      />
    </div>
  );
};


