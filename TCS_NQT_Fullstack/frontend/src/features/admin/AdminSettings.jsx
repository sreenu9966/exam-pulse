import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

const CARD = { background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px', transition: 'all 0.3s' };
const BTN = { padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: '0.3s' };

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
      showToast(`${key.replace(/_/g,' ')} updated! ✅`);
    } catch (err) { showToast("Failed to update config ❌"); }
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading Configurations...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>⚙️ Global Settings</h1>
      
      <div className="dashboard-grid">
        {/* Registration & Maintenance */}
        <div style={CARD}>
          <h3 style={{ fontSize: '16px', color: '#0ea5e9', marginBottom: '20px' }}>Access Control</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Open Registrations</div>
                 <div style={{ fontSize: '12px', color: '#94a3b8' }}>Allow new students to sign up</div>
               </div>
               <button onClick={() => updateConfig('registration_open', !configs.registration_open)} style={{ ...BTN, background: configs.registration_open ? '#10b981' : '#334155', color: '#fff' }}>
                 {configs.registration_open ? 'ON' : 'OFF'}
               </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Maintenance Mode</div>
                 <div style={{ fontSize: '12px', color: '#94a3b8' }}>Block student area for updates</div>
               </div>
               <button onClick={() => updateConfig('maintenance_mode', !configs.maintenance_mode)} style={{ ...BTN, background: configs.maintenance_mode ? '#ef4444' : '#334155', color: '#fff' }}>
                 {configs.maintenance_mode ? 'ON' : 'OFF'}
               </button>
            </div>
          </div>
        </div>

        {/* Global Parameters */}
        <div style={CARD}>
          <h3 style={{ fontSize: '16px', color: '#f59e0b', marginBottom: '20px' }}>Exam Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
               <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Timer Offset (Seconds)</div>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <input 
                   type="number" 
                   value={configs.exam_timer_offset} 
                   onChange={(e) => setConfigs(p => ({ ...p, exam_timer_offset: parseInt(e.target.value) }))}
                   style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '4px', width: '80px' }}
                 />
                 <button onClick={() => updateConfig('exam_timer_offset', configs.exam_timer_offset)} style={{ ...BTN, background: '#0ea5e9', color: '#fff', padding: '8px 16px' }}>Save</button>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Visible Results</div>
                 <div style={{ fontSize: '12px', color: '#94a3b8' }}>Show scores to students immediately</div>
               </div>
               <button onClick={() => updateConfig('results_visible', !configs.results_visible)} style={{ ...BTN, background: configs.results_visible ? '#10b981' : '#334155', color: '#fff' }}>
                 {configs.results_visible ? 'ON' : 'OFF'}
               </button>
            </div>
          </div>
        </div>

        {/* Payment & Financials */}
        <div style={CARD}>
          <h3 style={{ fontSize: '16px', color: '#10b981', marginBottom: '20px' }}>💰 Payment & Checkout</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
               <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Admin UPI ID (for QR)</div>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <input 
                   type="text" 
                   value={configs.upi_id} 
                   onChange={(e) => setConfigs(p => ({ ...p, upi_id: e.target.value }))}
                   style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '8px', flex: 1 }}
                 />
                 <button onClick={() => updateConfig('upi_id', configs.upi_id)} style={{ ...BTN, background: '#10b981', color: '#fff' }}>Save</button>
               </div>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
               <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>Landing Page Deal Price</div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Original (₹)</div>
                    <input type="number" value={configs.offer_price_original} onChange={e => setConfigs(p=>({...p, offer_price_original: Number(e.target.value)}))} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Deal Price (₹)</div>
                    <input type="number" value={configs.offer_price_deal} onChange={e => setConfigs(p=>({...p, offer_price_deal: Number(e.target.value)}))} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', width: '100%' }} />
                  </div>
               </div>
               <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Discount Label (e.g. 99%)</div>
                  <input type="text" value={configs.offer_discount_text} onChange={e => setConfigs(p=>({...p, offer_discount_text: e.target.value}))} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', width: '100%' }} />
               </div>
               <button onClick={() => {
                  updateConfig('offer_price_original', configs.offer_price_original);
                  updateConfig('offer_price_deal', configs.offer_price_deal);
                  updateConfig('offer_discount_text', configs.offer_discount_text);
               }} style={{ ...BTN, background: '#6366f1', color: '#fff', width: '100%' }}>Update Prices & Labels</button>
            </div>
          </div>
        </div>

        {/* Support & Alerts */}
        <div style={CARD}>
          <h3 style={{ fontSize: '16px', color: '#312e81', marginBottom: '20px' }}>🛟 Helpdesk & Support</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Admin Support Email</div>
             <input 
                type="text" 
                value={configs.support_email} 
                onChange={(e) => setConfigs(p => ({ ...p, support_email: e.target.value }))}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%' }}
             />
             <button onClick={() => updateConfig('support_email', configs.support_email)} style={{ ...BTN, background: '#4338ca', color: '#fff', width: '100%' }}>Update Support Address</button>
          </div>
        </div>
      </div>
    </div>
  );
}
