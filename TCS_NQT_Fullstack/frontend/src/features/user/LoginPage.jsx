import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { API_BASE_URL as API } from '../../config';

export default function LoginPage() {
  const [step, setStep] = useState('code'); // 'code' | 'setup'
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCodeSubmit = async () => {
    if (!code.trim()) return setError('Enter your access code');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/validate`, { code: code.trim() });
      if (data.token) {
        login(data.token, data.user);
        navigate('/home');
      } else {
        setStep('setup'); // Fallback if API changes
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid access code');
    } finally { setLoading(false); }
  };

  const handleSetup = async () => {
    if (!name.trim() || !email.trim()) return setError('All fields required');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/setup`, { code, name, email });
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally { setLoading(false); }
  };

  const s = { minHeight: '100vh', background: '#07080d', color: '#e8eaf0', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const card = { background: '#0d0f17', border: '1px solid #1c1f2e', borderRadius: 16, padding: '36px 32px', maxWidth: 400, width: '100%', textAlign: 'center' };
  const inp = { width: '100%', background: '#12151f', border: '1px solid #252838', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e8eaf0', outline: 'none', marginBottom: 12, fontFamily: 'monospace', boxSizing: 'border-box' };
  const btn = { width: '100%', background: '#4fffb0', color: '#000', border: 'none', borderRadius: 8, padding: 13, fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 };

  return (
    <div style={s}>
      <div style={card}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{step === 'code' ? '🔐' : '🎓'}</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{step === 'code' ? 'Enter Access Code' : 'Setup Your Profile'}</div>
        <div style={{ fontSize: 11, color: '#5a5e72', marginBottom: 24 }}>
          {step === 'code' ? 'Use the code shared by admin after payment approval' : 'Enter your details to create your account'}
        </div>

        {step === 'code' ? (
          <>
            <input style={inp} value={code} onChange={e => setCode(e.target.value)} placeholder="Enter access code (e.g. UTR123-20260309-ABC)" onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()} />
          </>
        ) : (
          <>
            <div style={{ background: '#12151f', border: '1px solid #252838', borderRadius: 8, padding: '8px 14px', fontSize: 11, color: '#5a5e72', marginBottom: 16, wordBreak: 'break-all' }}>
              🔐 Code: <strong style={{ color: '#00d4ff' }}>{code}</strong>
            </div>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
          </>
        )}

        {error && <div style={{ color: '#ff4757', fontSize: 11, marginBottom: 12 }}>⚠ {error}</div>}
        <button style={btn} onClick={step === 'code' ? handleCodeSubmit : handleSetup} disabled={loading}>
          {loading ? 'Please wait...' : step === 'code' ? '✅ VERIFY CODE' : '🚀 CREATE PROFILE & START'}
        </button>

        {step === 'setup' && (
          <button onClick={() => setStep('code')} style={{ marginTop: 12, background: 'none', border: 'none', color: '#5a5e72', fontSize: 11, cursor: 'pointer' }}>← Back</button>
        )}
      </div>
    </div>
  );
}
