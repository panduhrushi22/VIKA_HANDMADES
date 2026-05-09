'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css'; // Reusing admin styles

interface Customization {
  id: string;
  userId: string;
  category: string;
  options: Record<string, string>;
  customInput?: string;
  feedback?: 'like' | 'dislike';
  image?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reviewed' | 'completed' | 'cancelled';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminCustomizationsPage() {
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});

  const fetchCustomizations = () => {
    fetch('/api/admin/customizations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomizations(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCustomizations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/customizations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setCustomizations(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text?.trim()) return;

    setIsReplying(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/customizations/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: text })
      });

      if (res.ok) {
        setReplyText(prev => ({ ...prev, [id]: '' }));
        fetchCustomizations();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send reply');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsReplying(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customization request?')) return;
    try {
      const res = await fetch(`/api/admin/customizations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomizations(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Failed to delete customization');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading customizations...</div>;
  }

  return (
    <div className={styles.adminContainer} style={{ display: 'block' }}>
      <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Customization Requests</h2>
          <span style={{ background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.875rem' }}>
            {customizations.length} Total
          </span>
        </div>

        {customizations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666', border: '1px dashed #ddd', borderRadius: '8px' }}>
            <p>No customization requests found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {customizations.map(request => (
              <div key={request.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>{request.id}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                      {new Date(request.createdAt || request.createdAt).toLocaleDateString()} at {new Date(request.createdAt || request.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{request.user?.name || 'User'}</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>{request.user?.email || 'No email'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: '#666' }}>Category:</span>
                      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{request.category}</span>
                      
                      {request.options && Object.entries(request.options).map(([key, value]) => (
                        <React.Fragment key={key}>
                          <span style={{ color: '#666', textTransform: 'capitalize' }}>{key}:</span>
                          <span style={{ fontWeight: 500 }}>{value}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>User Idea</h4>
                    <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '6px', minHeight: '80px', fontSize: '0.9rem', fontStyle: 'italic', color: (request.customInput || request.customInput) ? '#333' : '#999', marginBottom: '1rem' }}>
                      {request.customInput || request.customInput || 'No custom description provided.'}
                    </div>

                    {(request.image) && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Attached Inspiration</h4>
                        <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', maxWidth: '200px' }}>
                          <img 
                            src={request.image} 
                            alt="Customization" 
                            style={{ width: '100%', display: 'block', cursor: 'pointer' }} 
                            onClick={() => window.open(request.image!, '_blank')}
                          />
                        </div>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>Click to view full size</p>
                      </div>
                    )}
                  </div>
                </div>

                {(request.adminReply || request.adminReply) && (
                  <div style={{ marginTop: '1.5rem', background: '#FDF2F2', padding: '1.25rem', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>ADMIN REPLY</span>
                      <span style={{ fontWeight: 400, color: '#888' }}>{new Date((request.repliedAt || request.repliedAt)!).toLocaleDateString()}</span>
                    </div>
                    {request.adminReply || request.adminReply}
                  </div>
                )}

                {!(request.adminReply || request.adminReply) && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea 
                      placeholder="Type your reply to the customer..."
                      value={replyText[request.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [request.id]: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px', fontSize: '0.9rem' }}
                    />
                    <button 
                      onClick={() => handleReply(request.id)}
                      disabled={!replyText[request.id]?.trim() || isReplying[request.id]}
                      className={styles.btnPrimary}
                      style={{ 
                        alignSelf: 'flex-end', 
                        padding: '0.5rem 1.25rem', 
                        fontSize: '0.85rem',
                        borderRadius: '6px'
                      }}
                    >
                      {isReplying[request.id] ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', background: request.status === 'pending' ? '#FFF3CD' : request.status === 'rejected' ? '#ffebee' : '#E8F5E9', color: request.status === 'pending' ? '#856404' : request.status === 'rejected' ? '#c62828' : '#155724', textTransform: 'capitalize' }}>
                      {request.status}
                    </span>
                    
                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleStatusChange(request.id, 'approved')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleStatusChange(request.id, 'rejected')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                      </div>
                    )}
                    
                    {request.status === 'approved' && (
                      <button onClick={() => handleStatusChange(request.id, 'completed')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '4px', cursor: 'pointer' }}>Mark Completed</button>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(request.id)} 
                    style={{ 
                      padding: '0.25rem 0.75rem', 
                      fontSize: '0.75rem', 
                      color: '#c62828', 
                      border: '1px solid #ffcdd2', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      background: 'transparent',
                      fontWeight: 500
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
