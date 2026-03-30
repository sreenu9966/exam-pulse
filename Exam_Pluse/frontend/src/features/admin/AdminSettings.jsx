import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

const CARD = { 
  background: 'rgba(13, 15, 23, 0.6) !important', 
  backdropFilter: 'blur(24px) !important', 
  border: '1px solid rgba(255, 255, 255, 0.05) !important', 
  borderRadius: '24px', 
  padding: '32px', 
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
};

const BTN = { 
  padding: '12px 24px', 
  borderRadius: '12px', 
  border: 'none', 
  fontWeight: 900, 
  cursor: 'pointer', 
  fontFamily: '"Outfit", sans-serif', 
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontSize: '11px'
};

const INPUT_MODERN = {
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'monospace',
  outline: 'none',
  transition: 'all 0.3s'
};

export default function AdminSettings({ token, showToast }) {
  const [configs, setConfigs] = useState({
    registration_open: true,
    maintenance_mode: false,
    exam_timer_offset: 0,
    results_visible: true,
    support_email: 'support@tcsnqt.test',
    upi_id: 'tcsnqt@apl',
    offer_price_original: 399,
    offer_price_deal: 1,
    offer_discount_text: '99.7%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const admToken = token || sessionStorage.getItem('admin_token');
      const { data } = await axios.get(`${API}/admin/configs`, { headers: { Authorization: `Bearer ${admToken}` } });
      setConfigs(prev => ({ ...prev, ...data }));
    } catch (err) { console.error("Fetch Config Error:", err); }
    setLoading(false);
  };

  const updateConfig = async (key, value) => {
    try {
      const admToken = token || sessionStorage.getItem('admin_token');
      await axios.post(`${API}/admin/config`, { key, value }, { headers: { Authorization: `Bearer ${admToken}` } });
      setConfigs(prev => ({ ...prev, [key]: value }));
      showToast(`${key.replace(/_/g,' ')} UPDATED`);
    } catch (err) { showToast("UPDATE FAILED"); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '20px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 245, 212, 0.1)', borderTopColor: '#00f5d4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <div style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 800, letterSpacing: '2px' }}>LOADING CALIBRATION DATA...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '32px', 
      paddingTop: '20px',
      animation: 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .config-label { font-size: 14px; fontWeight: 800; color: #fff; margin-bottom: 4px; font-family: 'Outfit', sans-serif; }
        .config-sub { font-size: 11px; color: var(--muted); margin-bottom: 16px; }
        .modern-input:focus { border-color: rgba(0, 245, 212, 0.5) !important; box-shadow: 0 0 15px rgba(0, 245, 212, 0.1) !important; background: rgba(0, 0, 0, 0.6) !important; }
      `}</style>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}></span>
           <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', letterSpacing: '2px' }}>SYSTEM CALIBRATION HUB</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0', color: '#fff', letterSpacing: '-1px' }}>Global Configurations</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>
        {/* Registration & Maintenance */}
        <div style={CARD}>
          <div style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 900, letterSpacing: '2px', marginBottom: '24px' }}>ACCESS CONTROL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
               <div>
                 <div className="config-label">Open Registrations</div>
                 <div className="config-sub" style={{ marginBottom: 0 }}>Onboard new student entries</div>
               </div>
               <button 
                 onClick={() => updateConfig('registration_open', !configs.registration_open)} 
                 style={{ 
                   ...BTN, 
                   background: configs.registration_open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                   color: configs.registration_open ? '#10b981' : '#64748b',
                   border: configs.registration_open ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                 }}
               >
                 {configs.registration_open ? '● ACTIVE' : '○ DISABLED'}
               </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
               <div>
                 <div className="config-label">Maintenance Mode</div>
                 <div className="config-sub" style={{ marginBottom: 0 }}>Restrict access for hardware sync</div>
               </div>
               <button 
                 onClick={() => updateConfig('maintenance_mode', !configs.maintenance_mode)} 
                 style={{ 
                   ...BTN, 
                   background: configs.maintenance_mode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                   color: configs.maintenance_mode ? '#ef4444' : '#64748b',
                   border: configs.maintenance_mode ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                 }}
               >
                 {configs.maintenance_mode ? '● WARNING' : '○ NOMINAL'}
               </button>
            </div>
          </div>
        </div>

        {/* Global Parameters */}
        <div style={CARD}>
          <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 900, letterSpacing: '2px', marginBottom: '24px' }}>EXAM PRECISION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
               <div className="config-label">Timer Offset Calibration</div>
               <div className="config-sub">Seconds added to global exam countdowns</div>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <input 
                   type="number" 
                   value={configs.exam_timer_offset} 
                   onChange={(e) => setConfigs(p => ({ ...p, exam_timer_offset: parseInt(e.target.value) }))}
                   className="modern-input"
                   style={{ ...INPUT_MODERN, width: '120px' }}
                 />
                 <button onClick={() => updateConfig('exam_timer_offset', configs.exam_timer_offset)} style={{ ...BTN, background: '#f59e0b', color: '#000', padding: '12px 24px' }}>SYNCHRONIZE</button>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
               <div>
                 <div className="config-label">Live Score Visibility</div>
                 <div className="config-sub" style={{ marginBottom: 0 }}>Instant result propagation to students</div>
               </div>
               <button 
                 onClick={() => updateConfig('results_visible', !configs.results_visible)} 
                 style={{ 
                   ...BTN, 
                   background: configs.results_visible ? 'rgba(0, 245, 212, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                   color: configs.results_visible ? '#00f5d4' : '#64748b',
                   border: configs.results_visible ? '1px solid rgba(0, 245, 212, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                 }}
               >
                 {configs.results_visible ? '● ENABLED' : '○ HIDDEN'}
               </button>
            </div>
          </div>
        </div>

        {/* Payment & Financials */}
        <div style={CARD}>
          <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 900, letterSpacing: '2px', marginBottom: '24px' }}>COMMERCE ENGINE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
               <div className="config-label">Master UPI Identifier</div>
               <div className="config-sub">Identity mapping for QR payment generation</div>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <input 
                   type="text" 
                   value={configs.upi_id} 
                   onChange={(e) => setConfigs(p => ({ ...p, upi_id: e.target.value }))}
                   className="modern-input"
                   style={{ ...INPUT_MODERN, flex: 1 }}
                 />
                 <button onClick={() => updateConfig('upi_id', configs.upi_id)} style={{ ...BTN, background: '#10b981', color: '#000' }}>MAP ID</button>
               </div>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
               <div className="config-label">Asset Pricing Matrix</div>
               <div className="config-sub">Adjust global tier pricing and labels</div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>BASE (₹)</div>
                    <input type="number" value={configs.offer_price_original} onChange={e => setConfigs(p=>({...p, offer_price_original: Number(e.target.value)}))} className="modern-input" style={{ ...INPUT_MODERN, width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>DEAL (₹)</div>
                    <input type="number" value={configs.offer_price_deal} onChange={e => setConfigs(p=>({...p, offer_price_deal: Number(e.target.value)}))} className="modern-input" style={{ ...INPUT_MODERN, width: '100%' }} />
                  </div>
               </div>
               <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>DISCOUNT STRING</div>
                  <input type="text" value={configs.offer_discount_text} onChange={e => setConfigs(p=>({...p, offer_discount_text: e.target.value}))} className="modern-input" style={{ ...INPUT_MODERN, width: '100%' }} />
               </div>
               <button onClick={() => {
                  updateConfig('offer_price_original', configs.offer_price_original);
                  updateConfig('offer_price_deal', configs.offer_price_deal);
                  updateConfig('offer_discount_text', configs.offer_discount_text);
               }} style={{ ...BTN, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', width: '100%' }}>UPDATE PRICING MATRIX</button>
            </div>
          </div>
        </div>

        {/* Support & Alerts */}
        <div style={CARD}>
          <div style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 900, letterSpacing: '2px', marginBottom: '24px' }}>COMMUNICATION NODE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div className="config-label">Master Support Alias</div>
             <div className="config-sub">Primary destination for incoming student queries</div>
             <input 
                type="text" 
                value={configs.support_email} 
                onChange={(e) => setConfigs(p => ({ ...p, support_email: e.target.value }))}
                className="modern-input"
                style={{ ...INPUT_MODERN, width: '100%' }}
             />
             <button onClick={() => updateConfig('support_email', configs.support_email)} style={{ ...BTN, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)', width: '100%' }}>SYNCHRONIZE ALIAS</button>
          </div>
        </div>
      </div>
    </div>
  );
}
