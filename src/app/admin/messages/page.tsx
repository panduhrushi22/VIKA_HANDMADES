'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';

interface Message {
  id: string;
  name: string;
  email: string;
  userId?: string;
  message: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});

  const fetchMessages = () => {
    fetch('/api/admin/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        alert('Failed to delete message');
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
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: text })
      });

      if (res.ok) {
        setReplyText(prev => ({ ...prev, [id]: '' }));
        fetchMessages(); // Refresh to show reply
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

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading messages...</div>;
  }

  return (
    <div className={styles.adminContainer} style={{ display: 'block' }}>
      <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Customer Messages</h2>
          <span style={{ background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.875rem' }}>
            {messages.length} Total
          </span>
        </div>

        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666', border: '1px dashed #ddd', borderRadius: '8px' }}>
            <p>No messages found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{msg.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>{msg.email}</p>
                    {msg.userId && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#888' }}>User ID: {msg.userId}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#999' }}>
                      {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#AAA', fontWeight: 600 }}>{msg.id}</p>
                  </div>
                </div>

                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '6px', fontSize: '1rem', color: '#333', whiteSpace: 'pre-wrap', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  {msg.message}
                </div>

                {msg.adminReply && (
                  <div style={{ background: '#FDF2F2', padding: '1.25rem', borderRadius: '6px', fontSize: '1rem', color: 'var(--color-primary-dark)', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>ADMIN REPLY</span>
                      <span style={{ fontWeight: 400, color: '#888' }}>{new Date(msg.repliedAt!).toLocaleDateString()}</span>
                    </div>
                    {msg.adminReply}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!(msg.adminReply) && (msg.userId) && (

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea 
                        placeholder="Type your reply here..."
                        value={replyText[msg.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px', fontSize: '0.9rem' }}
                      />
                      <button 
                        onClick={() => handleReply(msg.id)}
                        disabled={!replyText[msg.id]?.trim() || isReplying[msg.id]}
                        className={styles.btnPrimary}
                        style={{ 
                          alignSelf: 'flex-end', 
                          padding: '0.6rem 1.5rem', 
                          fontSize: '0.9rem',
                          borderRadius: '8px'
                        }}
                      >
                        {isReplying[msg.id] ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleDelete(msg.id)} 
                      style={{ 
                        padding: '0.4rem 1rem', 
                        fontSize: '0.875rem', 
                        color: '#c62828', 
                        border: '1px solid #ffcdd2', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        background: 'transparent',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#ffebee'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      Delete Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
