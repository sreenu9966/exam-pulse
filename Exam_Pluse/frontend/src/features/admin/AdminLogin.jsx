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
      background: '#05060E', 
      color: '#e8eaf0', 
      fontFamily: '"Inter", "Outfit", sans-serif', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@400;700;900&display=swap');
        
        .login-wrapper { display: flex; flex-direction: column; }
        
        .ambient-glow {
          position: absolute;
          filter: blur(120px);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.15;
          animation: pulse-glow 10s infinite ease-in-out;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }

        .grid-bg {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
          background-size: 32px 32px;
          opacity: 0.5;
          mask-image: radial-gradient(circle, #fff, transparent 80%);
          z-index: 1;
        }

        .premium-card {
          background: rgba(13, 15, 23, 0.6) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 245, 212, 0.02) !important;
        }

        .glow-input:focus {
          border-color: rgba(0, 245, 212, 0.5) !important;
          box-shadow: 0 0 20px rgba(0, 245, 212, 0.1) !important;
          background: rgba(0, 245, 212, 0.02) !important;
        }

        .btn-authorize {
          background: linear-gradient(135deg, #00f5d4, #00bbf9) !important;
          box-shadow: 0 0 15px rgba(0, 245, 212, 0.2) !important;
          border: none !important;
          border-radius: 14px !important;
          padding: 16px !important;
          color: #000 !important;
          font-weight: 900 !important;
          letter-spacing: 2px !important;
          text-transform: uppercase !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .btn-authorize:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 245, 212, 0.4) !important;
        }

        @media (min-width: 900px) {
          .login-wrapper { flex-direction: row; height: 100vh; }
          .left-pane { 
            flex: 1.3; 
            display: flex !important; 
            flex-direction: column; 
            justify-content: space-between; 
            padding: 80px; 
            border-right: 1px solid rgba(255,255,255,0.02); 
            position: relative; 
            z-index: 2;
          }
          .right-pane { 
            flex: 1; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            position: relative;
            z-index: 2;
          }
        }
        @media (max-width: 899px) {
          .left-pane { display: none !important; }
          .right-pane { min-height: 100vh; display: flex; align-items: center; justify-content: center; z-index: 2; }
        }
      `}</style>

      <div className="grid-bg"></div>
      
      {/* 🌌 Atmospheric Glows */}
      <div className="ambient-glow" style={{ top: '-10%', left: '-5%', width: '60vw', height: '60vw', background: '#00f5d4' }}></div>
      <div className="ambient-glow" style={{ bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', background: '#a85af7' }}></div>

      <div className="grid-bg"></div>

      {/* 🧭 Left Pane Layout (Branding + Industrial Metrics) */}
      <div className="left-pane" style={{ display: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            background: 'rgba(0, 245, 212, 0.05)', 
            borderRadius: '14px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            border: '1px solid rgba(0, 245, 212, 0.2)', 
            color: '#00f5d4', fontSize: '24px' 
          }}>🛡️</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '2px' }}>
            BIT<span style={{ color: '#00f5d4' }}>mCQ</span>
            <span style={{ fontSize: '10px', color: '#64748b', verticalAlign: 'top', marginLeft: '4px' }}>TM</span>
          </div>
        </div>

        <div style={{ maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5d4', boxShadow: '0 0 10px #00f5d4' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#00f5d4', letterSpacing: '2px', textTransform: 'uppercase' }}>SECURE CLEARANCE PROTOCOL</span>
          </div>
          
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#fff', margin: '0 0 24px 0', lineHeight: 1, fontFamily: 'Outfit, sans-serif', letterSpacing: '-1px' }}>
             Command Center & <span style={{ background: 'linear-gradient(to right, #00f5d4, #00bbf9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Administrative Portal</span>
          </h1>
          
          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px' }}>
             Authorized personnel only. Direct access to secure metric overviews, system calibration dashboards, and administrative knowledge matrices.
          </p>

          {/* ⏰ Clock Section */}
          <div style={{ 
            background: 'rgba(0, 245, 212, 0.03)', 
            border: '1px solid rgba(0, 245, 212, 0.1)', 
            padding: '20px 32px', 
            borderRadius: '20px', 
            marginBottom: '32px'
          }}>
             <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '3px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>LIVE TERMINAL CLOCK</div>
             <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: '2px' }}>{timerStatus}</div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, letterSpacing: '1px' }}>SERVER STABILITY</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00f5d4', marginTop: '6px' }}>99.98%</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, letterSpacing: '1px' }}>SYSTEM HEALTH</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15', marginTop: '6px' }}>NOMINAL</div>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
             <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></span> SECURE NODE ACTIVE
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>V2.4.0 STABLE</div>
        </div>
      </div>

      {/* 🔐 Right Pane Layout (Authorization Form) */}
      <div className="right-pane">
        <div className="premium-card" style={{ 
          borderRadius: 32, 
          padding: '56px 48px', 
          maxWidth: 420, 
          width: '90%', 
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Top Line Glow for Card */}
          <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: '1px', background: 'linear-gradient(90deg, transparent, #00f5d4, transparent)' }}></div>

          <div style={{ 
            background: 'rgba(0, 245, 212, 0.05)', 
            width: '72px', height: '72px', 
            borderRadius: '20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '36px', margin: '0 auto 24px',
            border: '1px solid rgba(0, 245, 212, 0.2)',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.1)'
          }}>📡</div>

          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '1px', fontFamily: 'Outfit, sans-serif' }}>
            ADMIN ACCESS
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '40px', letterSpacing: '1px' }}>
             PROTOCOL // CLEARANCE_LEVEL_5
          </p>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Authorization Key"
              className="glow-input"
              style={{ 
                width: '100%', 
                background: 'rgba(0, 0, 0, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: 14, 
                padding: '16px 20px', 
                paddingRight: '50px',
                fontSize: '15px', 
                color: '#fff', 
                outline: 'none', 
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                textAlign: 'center',
                letterSpacing: password && !showPassword ? '6px' : '2px',
                fontFamily: 'monospace'
              }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', 
                cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s',
                fontSize: '18px', userSelect: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          
          {error && (
            <div style={{ 
              color: '#f87171', 
              fontSize: '12px', 
              marginBottom: '20px', 
              fontWeight: 700, 
              background: 'rgba(248, 113, 113, 0.05)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(248, 113, 113, 0.2)'
            }}>
              INVALID CREDENTIALS
            </div>
          )}
          
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="btn-authorize"
            style={{ 
              width: '100%', 
              cursor: 'pointer', 
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            {loading ? 'VERIFYING...' : '🔓 AUTHORIZE ACCESS'}
          </button>

          <button onClick={() => navigate('/')} style={{ marginTop: '32px', fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
             ← EXIT TO SYSTEM PORTAL
          </button>

          {/* Bottom Card ID */}
          <div style={{ position: 'absolute', bottom: '16px', right: '24px', fontSize: '9px', color: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>
             TERMINAL_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

