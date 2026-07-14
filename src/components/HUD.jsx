import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Eye, Compass, ArrowLeft, HelpCircle, Shield, Move } from 'lucide-react';
import { spaceAudio } from './SpaceAudio';

export default function HUD({ 
  portfolioData, 
  focusedGalaxyId, 
  controlMode, 
  setControlMode, 
  onFocusGalaxy, 
  cameraCoords 
}) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Keyboard listener for Escape key to exit galaxy focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && focusedGalaxyId) {
        spaceAudio.playClick();
        onFocusGalaxy(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedGalaxyId, onFocusGalaxy]);

  const handleSoundToggle = () => {
    if (soundEnabled) {
      spaceAudio.stopDrone();
      setSoundEnabled(false);
    } else {
      spaceAudio.startDrone();
      setSoundEnabled(true);
    }
  };

  const handleGalaxyClick = (id) => {
    spaceAudio.playClick();
    onFocusGalaxy(id);
  };

  // Map 3D coordinates ([-50, 50]) to 2D Radar coordinates ([5px, 135px])
  const getRadarStyle = (coords) => {
    if (!coords) return { display: 'none' };
    const maxVal = 45; // Max expected coordinate bound for display
    const radarRadius = 70; // Half of 140px width
    
    // Project X and Z onto radar circle
    const x = radarRadius + (coords[0] / maxVal) * (radarRadius - 10);
    const y = radarRadius + (coords[2] / maxVal) * (radarRadius - 10);
    
    // Clamp inside radar boundary
    const dx = x - radarRadius;
    const dy = y - radarRadius;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > (radarRadius - 6)) {
      const angle = Math.atan2(dy, dx);
      return {
        left: `${radarRadius + Math.cos(angle) * (radarRadius - 8)}px`,
        top: `${radarRadius + Math.sin(angle) * (radarRadius - 8)}px`
      };
    }
    
    return {
      left: `${x}px`,
      top: `${y}px`
    };
  };

  return (
    <div className="hud-overlay">
      {/* 1. Header UI */}
      <div className="hud-header hud-interactive">
        <div className="hud-logo">
          <h1>PORTFOLIO VERSE</h1>
          <span>Saanvi Dixit // Explore Mode</span>
        </div>

        {/* Galaxy Jump Buttons */}
        <div className="hud-nav">
          {portfolioData.galaxies.map((g) => (
            <button
              key={g.id}
              className={`hud-btn hud-btn-galaxy ${focusedGalaxyId === g.id ? 'active' : ''}`}
              data-galaxy={g.id}
              onClick={() => handleGalaxyClick(g.id)}
            >
              {focusedGalaxyId === g.id ? <Eye size={14} /> : null}
              {g.name.split(' ')[0]}
            </button>
          ))}
          
          {focusedGalaxyId && (
            <button 
              className="hud-btn" 
              onClick={() => handleGalaxyClick(null)}
              style={{ borderLeftColor: '#ffffff', color: '#ffffff' }}
            >
              <ArrowLeft size={14} />
              Return
            </button>
          )}
        </div>

        {/* Audio & Help Controls */}
        <div className="audio-control">
          <button 
            className={`hud-btn ${soundEnabled ? 'active' : ''}`} 
            onClick={handleSoundToggle}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={14} /> Sound On
              </>
            ) : (
              <>
                <VolumeX size={14} /> Sound Off
              </>
            )}
          </button>

        </div>
      </div>

      {/* 2. Left Overlay (Radar & Telemetry) */}
      <div className="hud-left-panel hud-interactive">
        {/* Radar Minimap */}
        <div className="radar-panel glass-panel">
          <span className="radar-title">System Radar</span>
          <div className="radar-display">
            <div className="radar-grid" />
            <div className="radar-sweep" />
            
            {/* Galaxy marker dots on radar */}
            {portfolioData.galaxies.map((g) => (
              <div
                key={`radar_${g.id}`}
                className="radar-dot"
                style={{
                  ...getRadarStyle(g.coordinates),
                  backgroundColor: g.color,
                  color: g.color
                }}
                title={g.name}
              />
            ))}
            
            {/* Realtime Camera tracking dot */}
            <div 
              className="radar-dot camera"
              style={getRadarStyle(cameraCoords)}
              title="Camera Telemetry"
            />
          </div>
        </div>
      </div>


      {/* 4. Bottom Controls / Telemetry */}
      <div className="hud-footer hud-interactive">
        {/* Active Coordinates & Speed */}
        <div className="glass-panel control-panel">
          <div className="mode-indicator" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>
            <span className="indicator-label">Vector Grid</span>
            <span className="indicator-val">Active</span>
          </div>

          <div className="mode-indicator">
            <span className="indicator-label">Telemetry coords</span>
            <span className="indicator-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              X:{cameraCoords[0]} Y:{cameraCoords[1]} Z:{cameraCoords[2]}
            </span>
          </div>
        </div>

        {/* Orbit/Fly Mode Switcher */}
        <div className="hud-nav">
          <button 
            className={`hud-btn ${controlMode === 'orbit' ? 'active' : ''}`}
            onClick={() => { spaceAudio.playClick(); setControlMode('orbit'); }}
          >
            <Compass size={14} /> Orbit Mode
          </button>
          
          <button 
            className={`hud-btn ${controlMode === 'fly' ? 'active' : ''}`}
            onClick={() => { spaceAudio.playClick(); setControlMode('fly'); }}
          >
            <Move size={14} /> Fly Mode
          </button>
        </div>
      </div>
    </div>
  );
}
