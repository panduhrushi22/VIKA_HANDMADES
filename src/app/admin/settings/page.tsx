'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function DeliverySettings() {
  const [settings, setSettings] = useState({
    deliveryFee: 0,
    freeDeliveryThreshold: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMessage({ text: 'Settings updated successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to update settings.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className={styles.card} style={{ maxWidth: '600px' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Delivery Configuration</h3>
      </div>
      
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fixed Delivery Fee (₹)</label>
          <input 
            type="number" 
            className={styles.input}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #DDD' }}
            value={settings.deliveryFee}
            onChange={(e) => setSettings({...settings, deliveryFee: Number(e.target.value)})}
            required
            min="0"
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Standard shipping cost applied to orders.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Free Delivery Threshold (₹)</label>
          <input 
            type="number" 
            className={styles.input}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #DDD' }}
            value={settings.freeDeliveryThreshold}
            onChange={(e) => setSettings({...settings, freeDeliveryThreshold: Number(e.target.value)})}
            required
            min="0"
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Orders above this amount will have ₹0 delivery fee. Set to 0 to disable.</p>
        </div>

        {message.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
            color: message.type === 'success' ? '#2E7D32' : '#C62828',
            fontSize: '0.9rem'
          }}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSaving}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            backgroundColor: 'var(--color-primary-dark)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontWeight: '600',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'Saving Changes...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );
}
