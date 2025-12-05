import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { TreeMode } from './types';

const App: React.FC = () => {
  const [treeMode, setTreeMode] = useState<TreeMode>(TreeMode.ASSEMBLED);

  return (
    <div className="w-full h-screen relative bg-[#050505]">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeMode={treeMode} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay 
        treeMode={treeMode}
        setTreeMode={setTreeMode}
      />
    </div>
  );
};

export default App;