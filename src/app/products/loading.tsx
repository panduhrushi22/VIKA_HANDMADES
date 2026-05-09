'use client';

import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) var(--spacing-md)' }}>
      <div style={{ height: '40px', width: '200px', backgroundColor: '#EEE', borderRadius: '4px', marginBottom: '2rem' }} className="skeleton"></div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2.5rem' 
      }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ 
            backgroundColor: 'white', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ height: '350px', backgroundColor: '#F5F5F5' }} className="skeleton"></div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ height: '24px', width: '70%', backgroundColor: '#EEE', borderRadius: '4px', marginBottom: '0.75rem' }} className="skeleton"></div>
              <div style={{ height: '16px', width: '40%', backgroundColor: '#F5F5F5', borderRadius: '4px', marginBottom: '1.5rem' }} className="skeleton"></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ height: '28px', width: '80px', backgroundColor: '#EEE', borderRadius: '4px' }} className="skeleton"></div>
                <div style={{ height: '40px', width: '120px', backgroundColor: '#F5F5F5', borderRadius: 'var(--radius-sm)' }} className="skeleton"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .skeleton {
          position: relative;
          overflow: hidden;
        }
        
        .skeleton::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
