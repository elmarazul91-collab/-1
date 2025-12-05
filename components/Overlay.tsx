import React from 'react';
import { TreeMode } from '../types';

interface OverlayProps {
  treeMode: TreeMode;
  setTreeMode: (mode: TreeMode) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  treeMode,
  setTreeMode,
}) => {

  const toggleTreeMode = () => {
    setTreeMode(treeMode === TreeMode.ASSEMBLED ? TreeMode.SCATTERED : TreeMode.ASSEMBLED);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
      {/* Header */}
      <header className="p-8 w-full flex justify-between items-start animate-fade-in pointer-events-auto">
        <div>
          <h1 className="text-arix-gold font-display text-2xl tracking-widest drop-shadow-lg select-none">
            MERRY CHRISTMAS
          </h1>
        </div>
        
        {/* Mode Toggle Switch */}
        <button 
          onClick={toggleTreeMode}
          className="group flex items-center gap-3 bg-black/20 backdrop-blur-md border border-arix-gold/30 px-6 py-2 rounded-full hover:bg-arix-emerald/40 transition-all duration-500"
        >
          <span className="text-arix-goldHighlight text-xs uppercase tracking-widest font-sans">
            {treeMode === TreeMode.ASSEMBLED ? 'Deconstruct' : 'Assemble'}
          </span>
          <div className="w-2 h-2 rounded-full bg-arix-gold shadow-[0_0_10px_#D4AF37] group-hover:scale-125 transition-transform duration-300"></div>
        </button>
      </header>

      {/* Main Content Area - Empty to showcase the tree */}
      <main className="flex-1 pointer-events-none"></main>

      {/* Footer */}
      <footer className="p-8 w-full flex justify-between text-arix-gold/40 text-xs font-sans tracking-widest select-none">
        <span>© 2025 ARIX</span>
        <span>INTERACTIVE EXPERIENCE</span>
      </footer>
    </div>
  );
};