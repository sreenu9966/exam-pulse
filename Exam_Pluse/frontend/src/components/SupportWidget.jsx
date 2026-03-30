import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SupportWidget() {
  const { user, API } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Constants for styles to avoid global CSS pollution
  const BUTTON = {
    position: 'fixed', bottom: '24px', right: '24px',
    background: 'linear-gradient(135deg, var(--accent2, #00f5d4), var(--accent, #00bbf9))',
    color: '#000', border: 'none', borderRadius: '50px',
    padding: '14px 20px', fontSize: '14px', fontWeight: 800,
    cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,245,212,0.3)',
    display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9998,
    transition: 'all 0.3s ease'
  };

  const PANEL = {
    position: 'fixed', bottom: '85px', right: '24px',
    width: '320px', background: 'rgba(10,15,30,0.85)',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    zIndex: 9998, animation: 'slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
  };

  const INPUT = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    padding: '12px', fontSize: '13px', color: '#fff',
    fontFamily: 'sans-serif', resize: 'none', minHeight: '80px', outline: 'none'
  };

  const SUBMIT_BTN = {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', background: 'var(--accent, #00bbf9)', color: '#000',
    fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s'
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/admin/support`, {
        userCode: user?.code || 'ANON',
        userName: user?.name || 'Anonymous',
        message: message.trim()
      });
      setSent(true);
      setMessage('');
      setTimeout(() => { setSent(false); setOpen(false); }, 2000);
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  if (!user) return null; // Only show support widget to logged-in users taking exam

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {open && (
        <div style={PANEL}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>💬 Ask a Question</span>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
          </div>
          
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Type your issue or question below. Admins will address it soon.
          </p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--accent, #00f5d4)', fontWeight: 700, fontSize: '14px' }}>
              ✅ Sent Successfully!
            </div>
          ) : (<>
            <textarea 
              style={INPUT} 
              placeholder="E.g., I cannot see images inside Question 4..." 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              disabled={loading}
              autoFocus
            />
            <button style={{ ...SUBMIT_BTN, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </>)}
        </div>
      )}

      <button style={BUTTON} onClick={() => setOpen(!open)}>
        <span>{open ? '✖' : '💡'}</span>
        <span>{open ? 'Close' : 'Support'}</span>
      </button>
    </>
  );
}
