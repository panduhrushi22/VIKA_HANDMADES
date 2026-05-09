'use client';

import React from 'react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      backgroundColor: 'var(--color-background)',
      zIndex: 1000
    }}>
      <div className="floral-loader">
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="petal"></div>
        <div className="center"></div>
      </div>
      <h2 style={{ 
        marginTop: '2rem', 
        fontFamily: 'var(--font-playfair)', 
        color: 'var(--color-primary-dark)',
        fontSize: '1.5rem',
        letterSpacing: '1px'
      }}>
        Arranging your experience...
      </h2>
      
      <style jsx>{`
        .floral-loader {
          position: relative;
          width: 100px;
          height: 100px;
          animation: rotate 10s linear infinite;
        }
        
        .petal {
          position: absolute;
          width: 40px;
          height: 40px;
          background: var(--color-primary);
          border-radius: 50% 50% 0 50%;
          transform-origin: bottom right;
          opacity: 0.8;
          filter: blur(0.5px);
        }
        
        .petal:nth-child(1) { transform: rotate(0deg) scale(1); animation: pulse 2s ease-in-out infinite; }
        .petal:nth-child(2) { transform: rotate(60deg) scale(1); animation: pulse 2s ease-in-out infinite 0.3s; }
        .petal:nth-child(3) { transform: rotate(120deg) scale(1); animation: pulse 2s ease-in-out infinite 0.6s; }
        .petal:nth-child(4) { transform: rotate(180deg) scale(1); animation: pulse 2s ease-in-out infinite 0.9s; }
        .petal:nth-child(5) { transform: rotate(240deg) scale(1); animation: pulse 2s ease-in-out infinite 1.2s; }
        .petal:nth-child(6) { transform: rotate(300deg) scale(1); animation: pulse 2s ease-in-out infinite 1.5s; }
        
        .center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: var(--color-accent);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
          z-index: 2;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: rotate(inherit) scale(1); opacity: 0.8; }
          50% { transform: rotate(inherit) scale(1.1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
