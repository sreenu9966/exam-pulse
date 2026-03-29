import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { API_BASE_URL as API } from '../../config';

export default function LandingPage({ initialView = 'home' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { login } = useAuth();

  // Views: 'home', 'pricing', 'payment', 'login', 'setup', 'admin'
  const [view, setView] = useState(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment Form State
  const [payName, setPayName] = useState('');
  const [payEmail, setPayEmail] = useState('');
  const [payPhone, setPayPhone] = useState('');
  const [payUtr, setPayUtr] = useState('');

  // Status Check State
  const [checkMode, setCheckMode] = useState(false);
  const [statusUtr, setStatusUtr] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [upiId, setUpiId] = useState('vhs@ptyes');

  useEffect(() => {
    axios.get(`${API}/auth/config/upi_details`).then(r => {
      if (r.data && r.data.upiId) setUpiId(r.data.upiId);
    }).catch(e => console.error("UPI loading failed", e));
  }, []);

  // Fetch submission if in correction mode
  useEffect(() => {
    if (view === 'correction' && id) {
      setLoading(true);
      axios.get(`${API}/auth/submission/${id}`)
        .then(r => {
          setPayName(r.data.name);
          setPayEmail(r.data.email);
          setPayPhone(r.data.phone);
          setPayUtr(r.data.utr);
          if (r.data.rejectionReason) setError(`REJECTION REASON: ${r.data.rejectionReason}`);
        })
        .catch(e => setError("Failed to load submission. It may be already approved or doesn't exist."))
        .finally(() => setLoading(false));
    }
  }, [view, id]);

  // Login/Setup State
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');

  // Admin State
  const [adminPass, setAdminPass] = useState('');

  const [activeOffer, setActiveOffer] = useState({ title: 'Lifetime Access', priceOriginal: 399, priceOffer: 1, discount: '99.7%' });
  const [selectedPlan, setSelectedPlan] = useState({ name: 'Pro Plan', price: 299 });
  const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ avgRating: 5.0, totalReviews: 0 });
  const [userRating, setUserRating] = useState(() => localStorage.getItem('user_rating') ? parseInt(localStorage.getItem('user_rating')) : 0);
  const [ratedReviewId, setRatedReviewId] = useState(() => localStorage.getItem('rated_review_id') || null);
  const [rateSuccess, setRateSuccess] = useState('');

  useEffect(() => {
    axios.get(`${API}/auth/offer`).then(r => setActiveOffer(r.data)).catch(err => console.error(err));
    axios.get(`${API}/auth/reviews`).then(r => {
      setReviews(r.data.reviews || []);
      if (r.data.stats) setStats(r.data.stats);
    }).catch(err => console.error(err));
  }, []);

  const changeView = (v) => {
    setView(v); setError(''); setSuccess('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setSuccess('UPI ID copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // --- Handlers ---
    const handlePublicRateClick = async (num) => {
    try {
      const res = await axios.post(`${API}/auth/reviews/public`, { rating: num, id: ratedReviewId });
      if (res.data.id) {
        localStorage.setItem('rated_review_id', res.data.id);
        setRatedReviewId(res.data.id);
      }
      localStorage.setItem('user_rating', num.toString());
      setUserRating(num);
      setRateSuccess(`Thanks for giving ${num} stars! ✅`);
      
      axios.get(`${API}/auth/reviews`).then(r => {
        setReviews(r.data.reviews || []);
        if (r.data.stats) setStats(r.data.stats);
      });
    } catch (err) { console.error(err); }
  };
  const handlePaymentSubmit = async () => {
    if (!payName || !payEmail || !payUtr || !payPhone) return setError('All fields (Name, Email, Phone, Transaction ID) are required');
    if (!payName || !payEmail || !payPhone || !payUtr) {
      setError('Please fill in all details for verification.');
      return;
    }
    
    if (!payPhone.startsWith('+')) return setError('Phone number must include Country Code (e.g., +91...)');
    if (!payEmail.includes('@') || !payEmail.includes('.')) return setError('Invalid email address');

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axios.post(`${API}/auth/payment`, { 
        name: payName, 
        email: payEmail, 
        phone: payPhone, 
        utr: payUtr, 
        amount: selectedPlan.price,
        planRequested: selectedPlan.name
      });
      setSuccess(res.data.message || 'Payment submitted! Admin will verify and send your code to your phone.');
      setPayName(''); setPayPhone(''); setPayUtr('');
    } catch (err) {
      setError(err.response?.data?.error || 'Payment submission failed');
    } finally { setLoading(false); }
  };

  const handleCheckStatus = async () => {
    if (!statusUtr.trim()) return setError('Enter UTR Number');
    setLoading(true); setError(''); setStatusResult(null);
    try {
      const { data } = await axios.get(`${API}/auth/payment/status/${statusUtr.trim()}`);
      setStatusResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Status check failed');
    } finally { setLoading(false); }
  };

  const handleCodeLogin = async () => {
    if (!code.trim()) return setError('Enter your access code');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/validate`, { code: code.trim() });
      if (data.token) {
        login(data.token, data.user);
        navigate('/user/home');
      } else {
        changeView('setup');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid access code');
    } finally { setLoading(false); }
  };

  const handleSetup = async () => {
    if (!setupName.trim() || !setupEmail.trim()) return setError('All fields required');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/setup`, { code, name: setupName, email: setupEmail });
      login(data.token, data.user);
      navigate('/user/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally { setLoading(false); }
  };

  const handleAdminLogin = async () => {
    if (!adminPass) return setError('Please enter password');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/admin/login`, { password: adminPass });
      sessionStorage.setItem('admin_token', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Incorrect admin password');
    } finally { setLoading(false); }
  };

  const handleCorrectionSubmit = async () => {
    if (!payName || !payEmail || !payUtr || !payPhone) return setError('All fields required');
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.put(`${API}/auth/submission/${id}`, { name: payName, email: payEmail, phone: payPhone, utr: payUtr });
      setSuccess('Your details have been updated and resubmitted! 🎉 Admin will verify it shortly.');
      setTimeout(() => navigate('/'), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Global Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '64px', background: 'rgba(3,4,11,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 1000, transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '28px' }}>🛡️</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '1px', fontFamily: 'var(--font-heading)' }}>BIT<span style={{ color: 'var(--accent)' }}>mCQ</span></div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1.5px', fontWeight: 600 }}>PREMIUM PORTAL</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          {view !== 'correction' && ['home', 'pricing', 'login'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: 'transparent', border: 'none', color: view === v ? 'var(--accent)' : 'var(--muted)', fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '6px 10px', cursor: 'pointer', transition: 'color 0.2s', fontFamily: 'var(--font-heading)' }} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => { if(view !== v) e.currentTarget.style.color='var(--muted)' }}>{v}</button>
          ))}
          {view !== 'correction' && <button onClick={() => setView('payment')} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', border: 'none', color: '#000', padding: '10px 24px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 15px var(--accent-glow)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='none'}>Get Access</button>}
        </div>
      </nav>

      <div id="pay-screen" className="screen active" style={{ paddingTop: '64px' }}>
        {/* Background Mesh */}
        <div className="grid-bg"></div>

      {view === 'home' && (
        <div style={{ width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
          {/* Hero Section */}
          <div style={{ padding: '80px 20px 60px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(0, 245, 212, 0.08)', padding: '6px 16px', borderRadius: '28px', display: 'inline-block', color: 'var(--accent)', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', border: '1px solid rgba(0, 245, 212, 0.15)' }}>🎯 ACE THE BITmCQ EXAM</div>
            <h1 style={{ fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '24px', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>
              Simulate the <span style={{ color: 'transparent', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>Real Exams</span><br/> Experience Today.
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.8 }}>
              Gain complete familiarity with the official Exam Console Interface. 310+ Authentic PYQs spanning Aptitude, Reasoning, Verbal, and Technical domains. <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>(TCS NQT, Digital & Ninja Prep included)</span>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="stagger-item stagger-4" onClick={() => setView('login')} style={{ cursor: 'pointer', padding: '16px 36px', borderRadius: '12px', background: 'var(--accent)', color: '#000', border: 'none', fontWeight: 800, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 8px 20px var(--accent-glow)' }}>🚀 Start Practice</button>
              <button className="stagger-item stagger-5" onClick={() => setView('pricing')} style={{ cursor: 'pointer', padding: '16px 36px', borderRadius: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, fontSize: '14px', backdropFilter: 'blur(10px)', textTransform: 'uppercase', letterSpacing: '1px' }}>💎 View Offer (₹{activeOffer.priceOffer})</button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto 80px', padding: '0 20px' }}>
            {[
              { label: 'AUTHENTIC PYQs', value: '310+', color: 'var(--accent)' },
              { label: 'TOPICS COVERED', value: '16+', color: 'var(--accent2)' },
              { label: 'UI SIMULATION', value: '100%', color: 'var(--gold)' },
              { label: 'ONLINE USERS', value: '500+', color: '#ff7eb3' }
            ].map((s, i) => (
              <div key={i} className={`stagger-item stagger-${i + 1} cyber-card`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '40px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Module Categories Grid */}
          <div style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '40px', fontFamily: 'var(--font-heading)' }}>Included Test Modules</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {[
                { icon: '🧮', title: 'Quantitative Aptitude', desc: 'Ratios, speed, percentages, geometry, and arrangements.' },
                { icon: '🧠', title: 'Logical Reasoning', desc: 'Blood relations, seating arrangements, and coding structure.' },
                { icon: '🔤', title: 'Verbal Ability', desc: 'Grammar, sentence rearrangement (reordering), and idioms phrases.' },
                { icon: '💻', title: 'Technical Concepts', desc: 'C, SQL, DSA foundations, Cloud computing, and OS fundamentals.' }
              ].map((m, i) => (
                <div key={i} className={`stagger-item stagger-${i + 1} cyber-card`} style={{ background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '32px', cursor: 'default', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{m.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>{m.title}</h3>
                  <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: '1.6' }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Auto-Scroll Slider */}
          <div style={{ padding: '0 0 100px 0', width: '100%' }}>
            <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>What Students Say</h2>
            
            {/* Community Rating Badge */}
            {stats.totalReviews > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(255, 183, 3, 0.1)', border: '1px solid rgba(255, 183, 3, 0.3)', borderRadius: '28px', padding: '4px 12px', fontSize: '11px', color: '#ffb703', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ★ {stats.avgRating} / 5 Rating
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>({stats.totalReviews} verified reviews)</span>
              </div>
            )}
            <p style={{ textAlign: 'center', fontSize: '15px', color: 'var(--muted)', marginBottom: '4px' }}>Real feedback from candidates who cracked the assessment.</p>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '30px', fontStyle: 'italic' }}>(*BITmCQ is an independent mock portal and is not affiliated with Tata Consultancy Services or TCS NQT official brands.)</p>
            
            <div className="marquee-container">
              <div className="marquee-track" style={{ animationDuration: stats.scrollSpeed || '20s' }}>
                {(() => {
                  const fallback = [
                    { name: 'Kiran Sai', role: 'Cracked Top MNC', text: 'The interface was exactly like the real exam. Helped me manage my time perfectly!', rating: 5 },
                    { name: 'Megha R.', role: 'Elite Achiever', text: 'Authentic previous year questions are extremely useful. Cracking the logic was easier.', rating: 5 },
                    { name: 'Rohan Sharma', role: 'System Engineer', text: 'The detailed speed performance analytics are a game-changer. Loved the leaderboard!', rating: 5 },
                    { name: 'Divya P.', role: 'Cracked NQT 2025', text: 'From Aptitude to Technical rounds, topics cover the full latest 2026 syllabus accurately.', rating: 5 }
                  ];
                  const list = reviews.length > 0 ? reviews : fallback;
                  // Duplicate list for continuous infinite marquee scrolling (fixes right-side gap)
                  const loopedList = [...list, ...list, ...list]; // 3x for safety or 2x
                  return loopedList.map((r, i) => (
                   <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '40px', width: '300px', flexShrink: 0, backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', color: 'var(--accent)', gap: '4px', fontSize: '12px' }}>
                        {'⭐'.repeat(r.rating || 5)}
                      </div>
                      <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.6', fontStyle: 'italic', flex: 1 }}>"{r.text}"</p>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#000' }}>{r.name ? r.name[0] : 'U'}</div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{r.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--accent)' }}>{r.role}</div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* PlayStore Style Rating distribution setup */}
            {stats.totalReviews > 0 && (
              <div style={{ maxWidth: '650px', margin: '40px auto 0', padding: '0 20px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', gap: '48px', background: 'transparent', border: 'none', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(20px)', alignItems: 'center', boxShadow: 'none' }}>
                  
                  {/* Left: Big Average Rate */}
                  <div style={{ textAlign: 'center', flexShrink: 0, paddingRight: '32px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '64px', fontWeight: 900, color: '#ffb703', lineHeight: 1, letterSpacing: '-1px' }}>{stats.avgRating}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: '#ffb703', fontSize: '18px', margin: '10px 0' }}>
                      {'★'.repeat(Math.round(stats.avgRating || 5))}{'☆'.repeat(5 - Math.round(stats.avgRating || 5))}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>{stats.totalReviews.toLocaleString()} verified reviews</div>
                  </div>

                  {/* Right: Small Horizontal Bars */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[5, 4, 3, 2, 1].map((num) => {
                      const count = stats.breakdown ? (stats.breakdown[num] || 0) : 0;
                      const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                      return (
                        <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '15px', color: 'var(--muted)', width: '10px', textAlign: 'right', fontWeight: 600 }}>{num}</span>
                          <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.max(pct, 1)}%`, background: '#00F5D4', borderRadius: '5px', boxShadow: '0 0 12px rgba(0,245,212,0.4)', transition: 'width 0.8s ease-out' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* --- Rate Instant Stars --- */}
                <div style={{ marginTop: '24px', textAlign: 'center', background: 'transparent', border: 'none', padding: '12px' }}>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>Tap Stars to submit rating instantly:</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    {[1,2,3,4,5].map((num) => (
                      <span 
                        key={num} 
                        onClick={() => handlePublicRateClick(num)} 
                        style={{ fontSize: '48px', cursor: 'pointer', color: num <= userRating ? '#ffb703' : 'rgba(255,255,255,0.15)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { if (num > userRating) e.currentTarget.style.color = '#ffb703'; }}
                        onMouseLeave={e => { if (num > userRating) e.currentTarget.style.color = 'rgba(255,255,255,0.15)'; }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {view === 'pricing' && (
        <>
          <div className="pay-hero">
            <div className="pay-hero-inner">
              <div className="pay-eyebrow">Limited Time Offer</div>
              <h1 className="pay-h1">BITmCQ<br/><em>Full Mock Exam</em></h1>
              <p className="pay-subtitle">Master the exam with 310 Previous Year Questions distributed across 16 Official Sections. Real UI/UX simulation.</p>

              {/* NEW: 5-Tier Pricing Table */}
              <div className="pricing-container" style={{ marginTop: '50px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
                  
                  {/* FREE TRIAL */}
                  <div className="pricing-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                     <div className="plan-name">Free Trial</div>
                     <div className="plan-price">₹0</div>
                     <div className="plan-duration">7 Days</div>
                     <ul className="plan-features">
                        <li>✅ 5 Exams / day</li>
                        <li>✅ Basic Analytics</li>
                        <li>✅ Practice Mode</li>
                     </ul>
                     <button className="btn-select-plan" onClick={() => { setSelectedPlan({ name: 'Free Trial', price: 0 }); changeView('payment'); }}>Start Trial</button>
                  </div>

                  {/* BASIC PLAN */}
                  <div className="pricing-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                     <div className="plan-name">Basic Plan</div>
                     <div className="plan-price">₹99</div>
                     <div className="plan-duration">Per Month</div>
                     <ul className="plan-features">
                        <li>✅ 20 Exams / day</li>
                        <li>✅ Standard Analytics</li>
                        <li>✅ 310 Authentic PYQs</li>
                     </ul>
                     <button className="btn-select-plan" onClick={() => { setSelectedPlan({ name: 'Basic Plan', price: 99 }); changeView('payment'); }}>Select Basic</button>
                  </div>

                  {/* PRO PLAN (STAR) */}
                  <div className="pricing-card pro-card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--accent)', transform: 'scale(1.05)', position: 'relative' }}>
                     <div className="best-value">BEST VALUE ⭐</div>
                     <div className="plan-name" style={{ color: 'var(--accent)' }}>Pro Plan</div>
                     <div className="plan-price">₹299</div>
                     <div className="plan-duration">Per Month</div>
                     <ul className="plan-features">
                        <li>✅ <strong>Unlimited Exams</strong></li>
                        <li>✅ Full Analytics</li>
                        <li>✅ Performance Tracking</li>
                     </ul>
                     <button className="btn-select-plan" style={{ background: 'var(--accent)', color: '#000' }} onClick={() => { setSelectedPlan({ name: 'Pro Plan', price: 299 }); changeView('payment'); }}>Go Pro Now</button>
                  </div>

                  {/* PREMIUM PLAN */}
                  <div className="pricing-card" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid #8b5cf6' }}>
                     <div className="plan-name" style={{ color: '#8b5cf6' }}>Premium</div>
                     <div className="plan-price">₹1999</div>
                     <div className="plan-duration">Per Year</div>
                     <ul className="plan-features">
                        <li>✅ Unlimited Access</li>
                        <li>✅ Advanced Reports</li>
                        <li>✅ Priority Support</li>
                     </ul>
                     <button className="btn-select-plan" style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }} onClick={() => { setSelectedPlan({ name: 'Premium Plan', price: 1999 }); changeView('payment'); }}>Choose Premium</button>
                  </div>

                  {/* LIFETIME PLAN */}
                  <div className="pricing-card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid #f59e0b' }}>
                     <div className="plan-name" style={{ color: '#f59e0b' }}>Lifetime</div>
                     <div className="plan-price">₹2999</div>
                     <div className="plan-duration">One-Time</div>
                     <ul className="plan-features">
                        <li>✅ Unlimited Forever</li>
                        <li>✅ All Future Updates</li>
                        <li>✅ VIP Badge</li>
                     </ul>
                     <button className="btn-select-plan" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => { setSelectedPlan({ name: 'Lifetime Plan', price: 2999 }); changeView('payment'); }}>Get Lifetime</button>
                  </div>

                </div>
              </div>

              <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={() => changeView('login')} style={{ background: 'transparent', border: '1px solid rgba(0,245,212,0.3)', color: 'var(--accent)', padding: '12px 24px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>🔐 Already Have Code?</button>
              </div>
            </div>
          </div>

          {/* Premium Features Grid */}
          <div className="pay-features">
            <h2 className="section-heading">Premium Features Included</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <div className="feature-title">310 Authentic PYQs</div>
                <div className="feature-desc">Carefully curated questions from past year exams to give you the exact edge you need.</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <div className="feature-title">Topic-wise Practice</div>
                <div className="feature-desc">Filter questions by granular topics like Number System, Blood Relations, and SQL.</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <div className="feature-title">Live Global Leaderboard</div>
                <div className="feature-desc">Compare your Final Exam scores against all other users in real-time.</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💻</div>
                <div className="feature-title">Real Test UI Simulation</div>
                <div className="feature-desc">Build stamina and familiarity by practicing on the exact official Exam interface.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'payment' && (
        <div id="upi-screen" style={{ minHeight: '100vh', display: 'flex', zIndex: 1, width: '100%' }}>
          <div className="upi-card">
            <button className="upi-back" onClick={() => { if(checkMode) { setCheckMode(false); setStatusResult(null); setError(''); } else { changeView('pricing')} }}>← {checkMode ? 'Back to Payment' : 'Back to Offer'}</button>
            
            {!checkMode ? (
              <>
                 <h2 className="upi-title">{selectedPlan.name}</h2>
                <p className="upi-sub">Follow 3 simple steps to activate your plan.</p>

                <div className="upi-amount-pill">
                  <div className="upi-amount-label">Amount Due</div>
                  <div className="upi-amount-val">₹{selectedPlan.price}</div>
                </div>

                <div className="upi-id-box">
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>UPI ID</div>
                  <div className="upi-id-val">{upiId}</div>
                  <button className="btn-copy" onClick={copyToClipboard}>Copy</button>
                </div>

                <div className="steps" style={{ marginBottom: '32px' }}>
                   <div style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '12px', lineHeight: '1.6' }}>
                      <span style={{ color: 'var(--accent)' }}>1.</span> Open your UPI App (GPay, PhonePe, Paytm)<br/>
                      <span style={{ color: 'var(--accent)' }}>2.</span> Pay exactly <strong>₹{selectedPlan.price}</strong> to the UPI ID above.<br/>
                      <span style={{ color: 'var(--accent)' }}>3.</span> Enter your details below to verify.
                   </div>
                </div>

                <div className="utr-section">
                  <span className="utr-label">Verification Details</span>
                  <input className="name-input" placeholder="Your Full Name" value={payName} onChange={e => setPayName(e.target.value)} />
                  <input className="name-input" type="email" placeholder="Email Address" value={payEmail} onChange={e => setPayEmail(e.target.value)} />
                  <input className="name-input" placeholder="Phone Number with Country Code (+91...)" value={payPhone} onChange={e => setPayPhone(e.target.value)} />
                  <input className="utr-input" placeholder="Transaction ID (UTR Number)" value={payUtr} onChange={e => setPayUtr(e.target.value)} />
                  {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '10px' }}>⚠ {error}</div>}
                  {success && <div style={{ color: 'var(--accent)', fontSize: '12px', marginTop: '10px' }}>✅ {success}</div>}
                </div>

                <button className="btn-verify" onClick={handlePaymentSubmit} disabled={loading}>{loading ? 'Processing...' : 'Verify Payment'}</button>
                <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', textAlign: 'center', fontWeight: 600 }} onClick={() => { setCheckMode(true); setError(''); setSuccess(''); setStatusResult(null); }}>Already paid? Check Approval Status 🔍</div>
              </>
            ) : (
              <>
                <h2 className="upi-title">Check Status</h2>
                <p className="upi-sub">Enter your 12-Digit UTR number to retrieve your code.</p>

                <div className="utr-section" style={{ background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
                  <input className="utr-input" style={{ textAlign: 'center', fontSize: '16px' }} placeholder="Enter 12-Digit UTR Number" value={statusUtr} onChange={e => setStatusUtr(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStatus()} />
                  {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>⚠ {error}</div>}
                </div>

                {statusResult && (
                  <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: statusResult.status === 'approved' ? 'var(--accent)' : statusResult.status === 'rejected' ? 'var(--danger)' : 'var(--gold)', fontWeight: 700, marginBottom: '8px' }}>
                      {statusResult.message}
                    </div>
                    {statusResult.generatedCode && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>YOUR ACCESS CODE:</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', padding: '10px', background: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.3)', borderRadius: '8px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(statusResult.generatedCode); setSuccess('Code copied to clipboard!'); }}>
                          {statusResult.generatedCode} 📋
                        </div>
                        {success && <div style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '10px' }}>{success}</div>}
                        <button className="btn-verify" style={{ padding: '10px', fontSize: '15px' }} onClick={() => { setCheckMode(false); setCode(statusResult.generatedCode); setView('login'); setStatusResult(null); setError(''); }}>Login Now 🔑</button>
                      </div>
                    )}
                  </div>
                )}

                <button className="btn-verify" onClick={handleCheckStatus} disabled={loading} style={{ marginTop: '10px' }}>{loading ? 'Verifying...' : 'Check Status'}</button>
              </>
            )}
          </div>
        </div>
      )}

      {view === 'login' && (
        <div id="upi-screen" style={{ minHeight: '100vh', display: 'flex', zIndex: 1, width: '100%' }}>
          <div className="upi-card">
            <button className="upi-back" onClick={() => changeView('pricing')}>← Back</button>
            <h2 className="upi-title">Access Portal</h2>
            <p className="upi-sub">Enter your unique 25-character access code or generic code.</p>

            <div className="utr-section" style={{ position: 'relative', background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
              <input className="utr-input" type={showCode ? "text" : "password"} style={{ letterSpacing: '3px', textAlign: 'center', fontSize: '18px', paddingRight: '44px' }} placeholder="XXXXX-XXXXX-XXXX" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCodeLogin()} />
              <span 
                onClick={() => setShowCode(!showCode)} 
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--accent)', fontSize: '18px', userSelect: 'none' }}
              >
                {showCode ? '👁️' : '👁️‍🗨️'}
              </span>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>⚠ {error}</div>}
            </div>

            <button className="btn-verify" onClick={handleCodeLogin} disabled={loading}>{loading ? 'Verifying...' : 'Authenticate'}</button>
          </div>
        </div>
      )}

      {view === 'setup' && (
        <div id="upi-screen" style={{ minHeight: '100vh', display: 'flex', zIndex: 1, width: '100%' }}>
          <div className="upi-card">
            <h2 className="upi-title">Profile Setup</h2>
            <p className="upi-sub">First time using this access code. Let's create your profile.</p>

            <div className="upi-id-box" style={{ justifyContent: 'center' }}>
              <div className="upi-id-val" style={{ fontSize: '14px' }}>{code}</div>
            </div>

            <div className="utr-section" style={{ background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
              <input className="name-input" placeholder="Full Name" value={setupName} onChange={e => setSetupName(e.target.value)} />
              <input className="name-input" placeholder="Email Address" value={setupEmail} onChange={e => setSetupEmail(e.target.value)} />
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '10px' }}>⚠ {error}</div>}
            </div>

            <button className="btn-verify" onClick={handleSetup} disabled={loading} style={{ marginBottom: '16px' }}>{loading ? 'Finalizing...' : 'Complete Profile'}</button>
            <button className="upi-back" style={{ justifyContent: 'center', width: '100%', marginBottom: 0 }} onClick={() => changeView('login')}>Use a different code</button>
          </div>
        </div>
      )}

      {view === 'correction' && (
        <div id="upi-screen" style={{ minHeight: '100vh', display: 'flex', zIndex: 1, width: '100%' }}>
          <div className="upi-card">
            <h2 className="upi-title" style={{ color: 'var(--accent)' }}>Fix Your Details 📝</h2>
            <p className="upi-sub">An administrator noticed some mistakes. Please fix them below to resubmit.</p>

            <div className="utr-section">
              <span className="utr-label">Correction Details</span>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "8px" }}>YOUR FULL NAME</label>
                <input className="name-input" placeholder="Your Full Name" value={payName} onChange={e => setPayName(e.target.value)} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "8px" }}>EMAIL ADDRESS</label>
                <input className="name-input" type="email" placeholder="Email Address" value={payEmail} onChange={e => setPayEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "8px" }}>PHONE (+CODE)</label>
                <input className="name-input" placeholder="Phone Number with Country Code (+91...)" value={payPhone} onChange={e => setPayPhone(e.target.value)} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "8px" }}>TRANSACTION ID / UTR</label>
                <input className="utr-input" placeholder="Transaction ID (UTR Number)" value={payUtr} onChange={e => setPayUtr(e.target.value)} />
              </div>

              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>⚠ {error}</div>}
              {success && <div style={{ color: 'var(--accent)', fontSize: '13px', marginTop: '10px', background: 'rgba(0, 245, 212, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0, 245, 212, 0.2)' }}>✅ {success}</div>}
            </div>

            <button className="btn-verify" onClick={handleCorrectionSubmit} disabled={loading || success}>{loading ? 'Saving...' : 'Save & Resubmit Changes 🚀'}</button>
            <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>This will reset your status to <span style={{ color: 'var(--gold)', fontWeight: 800 }}>PENDING</span>.</p>
          </div>
        </div>
      )}


      {/* Global Footer */}
      <footer style={{ 
        width: '100%', 
        padding: '40px 20px', 
        marginTop: 'auto', 
        background: 'rgba(5, 5, 10, 0.8)', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>About Us</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>Privacy Policy</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>Terms of Service</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>Contact Support</a>
        </div>
        <div style={{ color: 'var(--muted2)', fontSize: '12px', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} BITmCQ Mock Platform. All rights reserved. <br/>
          <span style={{ fontSize: '12px', marginTop: '4px', display: 'inline-block' }}>Not affiliated with Tata Consultancy Services. For educational purposes only.</span>
        </div>
      </footer>

    </div>
    </>
  );
}
