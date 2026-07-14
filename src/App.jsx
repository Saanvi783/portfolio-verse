import React, { useState } from 'react';
import SpaceCanvas from './components/SpaceCanvas';
import HUD from './components/HUD';
import InfoPanel from './components/InfoPanel';
import portfolioData from './data/portfolioData.json';
import './styles/hud.css';

export default function App() {
  const [focusedGalaxyId, setFocusedGalaxyId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [controlMode, setControlMode] = useState('orbit');
  const [cameraCoords, setCameraCoords] = useState([0, 40, 75]);

  const handleFocusGalaxy = (galaxyId) => {
    setFocusedGalaxyId(galaxyId);
    setSelectedNode(null); // Reset detail panel on galaxy transition
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Sci-Fi Scanlines Overlay */}
      <div className="scanlines" />

      {/* 3D WebGL Canvas */}
      <SpaceCanvas
        portfolioData={portfolioData}
        controlMode={controlMode}
        focusedGalaxyId={focusedGalaxyId}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
        onFocusGalaxy={handleFocusGalaxy}
        setCameraCoords={setCameraCoords}
      />

      {/* 2D Interactive HUD Overlay */}
      <HUD
        portfolioData={portfolioData}
        focusedGalaxyId={focusedGalaxyId}
        controlMode={controlMode}
        setControlMode={setControlMode}
        onFocusGalaxy={handleFocusGalaxy}
        cameraCoords={cameraCoords}
      />

      {/* Sliding Glassmorphic Info Panel */}
      <InfoPanel
        selectedNode={selectedNode}
        onClose={handleClosePanel}
      />
    </div>
  );
}
