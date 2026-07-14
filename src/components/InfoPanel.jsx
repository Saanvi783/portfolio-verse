import React from 'react';
import { X, Award, ExternalLink, Calendar, BookOpen, Cpu } from 'lucide-react';
import { spaceAudio } from './SpaceAudio';

export default function InfoPanel({ selectedNode, onClose }) {
  if (!selectedNode) return null;

  const handleClose = () => {
    spaceAudio.playClick();
    onClose();
  };

  const renderDetails = () => {
    const { type, details, color } = selectedNode;
    if (!details) return null;

    // A. Render Project Details
    if (type.includes('Solar System Center') || type === 'Technology Planet') {
      const techList = details["Tech Stack"] || details["Technology"];
      
      return (
        <>
          {/* Hologram Scanner Visualizer Box */}
          <div className="hologram-preview" style={{ '--color-certs': color }}>
            <div className="hologram-glow" />
            <Cpu className="hologram-icon" size={32} />
            <span className="hologram-text">{selectedNode.name} system</span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              TELEMETRY LOCKED // 60 FPS
            </span>
          </div>

          <div className="info-section">
            <span className="info-label">Telemetry Status</span>
            <div className="info-value" style={{ color }}>Connected & Active</div>
          </div>

          <div className="info-section">
            <span className="info-label">Description</span>
            <div className="info-value">{details.Description || `Core technology planet powering the ${details["Used In"] || 'parent'} system.`}</div>
          </div>

          {techList && (
            <div className="info-section">
              <span className="info-label">Engine Dependencies</span>
              <div className="tech-tags">
                {techList.split(', ').map((tech, idx) => (
                  <span key={idx} className="tech-tag" style={{ borderColor: `${color}40`, color }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    // B. Render Skills details
    if (type.includes('Skill')) {
      const isCenter = type === 'Skill Constellation Center';
      return (
        <>
          <div className="info-section">
            <span className="info-label">Classification</span>
            <div className="info-value" style={{ color: selectedNode.color }}>
              {isCenter ? 'Constellation Primary Core' : 'Minor Star Node'}
            </div>
          </div>

          {isCenter ? (
            <div className="info-section">
              <span className="info-label">Core Skills Included</span>
              <div className="tech-tags" style={{ marginTop: '0.5rem' }}>
                {details["Skills Included"].split(', ').map((skill, idx) => (
                  <span key={idx} className="tech-tag" style={{ color: selectedNode.color, borderColor: `${selectedNode.color}40` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="info-section">
                <span className="info-label">Skill Group</span>
                <div className="info-value">{details["Category Group"]}</div>
              </div>
              <div className="info-section">
                <span className="info-label">Proficiency Matrix</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: details["Confidence Level"], height: '100%', backgroundColor: color || 'var(--color-skills)', boxShadow: `0 0 8px ${color || 'var(--color-skills)'}` }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: color || 'var(--color-skills)' }}>{details["Confidence Level"]}</span>
                </div>
              </div>
              <div className="info-section">
                <span className="info-label">Status</span>
                <div className="info-value" style={{ color: 'var(--color-skills)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>▲ OPERATIONAL</div>
              </div>
            </>
          )}
        </>
      );
    }

    // C. Render Certifications
    if (type.includes('Certificate') || type.includes('Program')) {
      return (
        <>
          {/* Hologram certificate style */}
          <div className="hologram-preview" style={{ '--color-certs': '#00e5ff', height: '150px' }}>
            <div className="hologram-glow" />
            <Award className="hologram-icon" size={32} />
            <span className="hologram-text">VERIFIED CREDENTIAL</span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
              ISSUED BY: {details.Issuer.toUpperCase()}
            </span>
          </div>

          <div className="info-section">
            <span className="info-label">Issuer Authority</span>
            <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              {details.Issuer}
            </div>
          </div>

          <div className="info-section">
            <span className="info-label">Date Earned</span>
            <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Calendar size={14} className="text-muted" />
              {details["Date Earned"]}
            </div>
          </div>

          <div className="info-section">
            <span className="info-label">Competencies Mastered</span>
            <div className="tech-tags">
              {details["Skills Gained"].split(', ').map((skill, idx) => (
                <span key={idx} className="tech-tag" style={{ color: '#00e5ff', borderColor: 'rgba(0, 229, 255, 0.2)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <button 
            className="hud-btn" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', borderColor: 'rgba(0, 229, 255, 0.3)', color: '#00e5ff' }}
            onClick={() => { spaceAudio.playClick(); alert(`Mock Verification: Credential ID verified on ${details.Issuer} gateway.`); }}
          >
            <ExternalLink size={14} /> Verify Credential
          </button>
        </>
      );
    }

    // D. Render Achievements
    if (type.includes('Achievement')) {
      return (
        <>
          <div className="hologram-preview" style={{ '--color-certs': '#ffd700', height: '120px' }}>
            <div className="hologram-glow" />
            <Award className="hologram-icon" size={32} style={{ color: '#ffd700' }} />
            <span className="hologram-text" style={{ color: '#ffd700', textShadow: '0 0 8px rgba(255, 215, 0, 0.5)' }}>MILESTONE REACHED</span>
          </div>

          {Object.entries(details).map(([key, val]) => (
            <div key={key} className="info-section">
              <span className="info-label">{key}</span>
              <div className="info-value">{val}</div>
            </div>
          ))}
        </>
      );
    }

    // E. Render Personal Info
    return (
      <>
        {Object.entries(details).map(([key, val]) => (
          <div key={key} className="info-section">
            <span className="info-label">{key}</span>
            <div className="info-value" style={{ whiteSpace: 'pre-line' }}>{val}</div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={`info-panel-container glass-panel open`}>
      {/* Panel Header */}
      <div className="info-panel-header">
        <div className="info-panel-title-wrapper">
          <span className="info-panel-type">{selectedNode.type}</span>
          <h2 className="info-panel-title">{selectedNode.name}</h2>
          {selectedNode.subTitle && (
            <span className="info-panel-subtitle">{selectedNode.subTitle}</span>
          )}
        </div>
        
        <button className="close-btn" onClick={handleClose}>
          <X size={18} />
        </button>
      </div>

      {/* Panel Body */}
      <div className="info-panel-body">
        {renderDetails()}
      </div>
    </div>
  );
}
