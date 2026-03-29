import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL as API } from '../../config';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [timerStatus, setTimerStatus] = useState('00:00:00');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setTimerStatus(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async () => {
    if (!password) return setError('Please enter password');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/admin/login`, { password });
      sessionStorage.setItem('admin_token', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Incorrect admin password');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper" style={{ 
      minHeight: '100vh', 
      background: '#04050a', 
      color: '#e8eaf0', 
      fontFamily: 'sans-serif', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        .login-wrapper { display: flex; flex-direction: column; }
        .grid-bg {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.3;
          mask-image: radial-gradient(circle, #fff, transparent 80%);
        }
        @media (min-width: 900px) {
          .login-wrapper { flex-direction: row; height: 100vh; }
          .left-pane { flex: 1.3; display: flex !important; flex-direction: column; justify-content: space-between; padding: 60px; border-right: 1px solid rgba(255,255,255,0.04); position: relative; background: radial-gradient(circle at top left, rgba(0, 245, 212, 0.05), transparent); }
          .right-pane { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at bottom right, rgba(157, 78, 221, 0.05), transparent); }
        }
        @media (max-width: 899px) {
          .left-pane { display: none !important; }
          .right-pane { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>

      <div className="grid-bg"></div>

      {/* 🧭 Left Pane Layout (Stats + Branding) */}
      <div className="left-pane" style={{ display: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: 'rgba(0, 245, 212, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', fontWeight: 900 }}>🎛️</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>BIT<span style={{ color: '#00f5d4' }}>mCQ</span></div>
        </div>

        <div style={{ maxWidth: '440px' }}>
          <div style={{ fontSize: '12px', color: '#00f5d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>SECURE CLEARANCE REQUIRED</div>
          <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', margin: '0 0 20px 0', lineHeight: 1.1, fontFamily: 'var(--font-heading)' }}>
             Core Administration & <span style={{ background: 'linear-gradient(to right, #00f5d4, #00bbf9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Audit Terminal</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
             Authorized personnel only. Standard metric overviews, databases configurations, overrides thresholds dashboards controllers accurate threshold controllers frame framework grids bounds responsibly thresholds grid setups budgets benchmarks datasets setups safely accurately responsibly frames accurately structures securely setups smoothly.
          </p>

          {/* ⏰ Premium Big Clock Section */}
          <div style={{ 
            background: 'rgba(0, 245, 212, 0.04)', 
            border: '1px solid rgba(0, 245, 212, 0.1)', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            textAlign: 'center', 
            boxShadow: '0 10px 30px rgba(0, 245, 212, 0.05)',
            marginBottom: '16px'
          }}>
             <div style={{ fontSize: '11px', color: '#00f5d4', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>LIVE TERMINAL CLOCK</div>
             <div style={{ fontSize: '36px', fontWeight: 900, color: '#fff', fontFamily: 'monospace', textShadow: '0 0 15px rgba(0, 245, 212, 0.3)', letterSpacing: '2px' }}>{timerStatus}</div>
          </div>

          {/* Metric Dashboard Mockups */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>SERVER UPTIME</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#00f5d4', marginTop: '4px' }}>99.98%</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>SYSTEM LOGS</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#eab308', marginTop: '4px' }}>0 ERRORS</div>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
             <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> NODE CONNECTED
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>VER 2.0.1 ALPHA</div>
        </div>
      </div>

      {/* 🔐 Right Pane Layout (Form) */}
      <div className="right-pane">
        <div style={{ 
          background: 'rgba(13, 15, 23, 0.6)', 
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.04)', 
          borderRadius: 24, 
          padding: '48px 40px', 
          maxWidth: 400, 
          width: '90%', 
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 245, 212, 0.02)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Top Line Glow for Card */}
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, #00f5d4, transparent)' }}></div>

          <div style={{ 
            background: 'rgba(0, 245, 212, 0.06)', 
            width: '64px', height: '64px', 
            borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', margin: '0 auto 20px',
            border: '1px solid rgba(0, 245, 212, 0.2)'
          }}>🛡️</div>

          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '1px' }}>
            ADMIN AUTH
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '1px' }}>
             Enter Key
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Clearance Key"
              style={{ 
                width: '100%', 
                background: 'rgba(0, 0, 0, 0.3)', 
                border: isFocused ? '1px solid rgba(0, 245, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)', 
                borderRadius: 12, 
                padding: '14px 44px', 
                fontSize: '15px', 
                color: '#fff', 
                outline: 'none', 
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                textAlign: 'center',
                letterSpacing: password && !showPassword ? '4px' : 'normal',
                boxShadow: isFocused ? '0 0 15px rgba(0, 245, 212, 0.04)' : 'none'
              }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', 
                cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s',
                fontSize: '18px', userSelect: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          
          {error && <div style={{ color: '#ef4444', fontSize: '11px', marginBottom: '16px', fontWeight: 600 }}>🚫 {error}</div>}
          
          <button 
            onClick={handleLogin} 
            disabled={loading}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #00f5d4, #00bbf9)', 
              color: '#000', 
              border: 'none', 
              borderRadius: 12, 
              padding: 14, 
              fontSize: '13px', 
              fontWeight: 800, 
              cursor: 'pointer', 
              letterSpacing: '1px', 
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 245, 212, 0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading ? 'VERIFYING...' : '🔓 AUTHORIZE ACCESS'}
          </button>

          <button onClick={() => navigate('/')} style={{ marginTop: '24px', fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
             ← Exit to Portal
          </button>
        </div>
      </div>
    </div>
  );
}

