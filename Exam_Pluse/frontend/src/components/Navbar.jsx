import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_BASE_URL as API } from '../config';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    if (showProfile && user && token) {
      setLoadingProfile(true);
      axios.get(`${API}/exam/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setProfileData({ ...res.data.user, rank: res.data.rank, totalUsers: res.data.totalUsers, attemptCount: res.data.attemptCount });
          setEditName(res.data.user.name);
          setEditEmail(res.data.user.email || '');
          setLoadingProfile(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingProfile(false);
        });
    } else {
      setEditMode(false);
    }
  }, [showProfile, user]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const { data } = await axios.post(`${API}/exam/update-profile`, {
        name: editName,
        email: editEmail
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setProfileData({ ...profileData, name: data.user.name, email: data.user.email });
      setEditMode(false);
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Don't show public navbar on admin routes or landing page if not logged in
  if (location.pathname === '/') return null;
  if (location.pathname.startsWith('/admin')) return null;
  if (!user && location.pathname !== '/login' && location.pathname !== '/') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="global-nav">
      
      <div className="nav-logo" onClick={() => navigate(user ? '/user/home' : '/')}>
        <div className="nav-logo-icon">💠</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="nav-logo-title">BIT<span>mCQ</span></div>
          <div className="nav-logo-sub">Premium Portal</div>
        </div>
      </div>

      {/* Dynamic portal host for the Exam Status (Absolute Centered) */}
      <div id="navbar-center-portal" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Dynamic portal host for Exam Controls (Timer & Submit) */}
        <div id="navbar-right-portal" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}></div>
        {user ? (
          <>
            <div className="nav-profile-chip" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)}>
              <div className="nav-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
              ⏻
            </button>
          </>
        ) : (
          location.pathname !== '/' && (
            <button 
              onClick={() => navigate('/')} 
              style={{ background: 'linear-gradient(135deg, var(--accent2), var(--accent))', color: '#000', border: 'none', borderRadius: '10px', padding: '10px 20px', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0, 245, 212, 0.2)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Access Portal
            </button>
          )
        )}
      </div>
      {/* 👤 User Profile Modal */}
      {showProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '440px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px dashed var(--border2)' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#fff' }}>User Profile Maintenance</div>
              <button onClick={() => setShowProfile(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {loadingProfile ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent)', fontWeight: 800 }}>Loading profile data...</div>
            ) : profileData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {updateError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{updateError}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: '8px', background: !editMode ? 'rgba(0, 245, 212, 0.1)' : 'transparent', border: !editMode ? '1px solid var(--accent)' : '1px solid transparent', color: !editMode ? 'var(--accent)' : 'var(--muted)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Details</button>
                  <button onClick={() => { setEditMode(true); setUpdateError(null); }} style={{ flex: 1, padding: '8px', background: editMode ? 'rgba(0, 245, 212, 0.1)' : 'transparent', border: editMode ? '1px solid var(--accent)' : '1px solid transparent', color: editMode ? 'var(--accent)' : 'var(--muted)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Settings</button>
                </div>

                {!editMode ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent2), var(--accent))', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900 }}>
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{profileData.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{profileData.email || 'No email set'}</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--muted)' }}>Access Code</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>{profileData.code}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--muted)' }}>Current Plan</span>
                        <span style={{ textTransform: 'uppercase', fontWeight: 800, color: profileData.plan === 'premium' ? 'var(--gold)' : 'var(--accent2)' }}>{profileData.plan || 'Free'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--muted)' }}>Exams Written</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{profileData.attemptCount || 0} / {profileData.subscription?.maxAttempts || 2}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                         <span style={{ color: 'var(--muted)' }}>Global Rank</span>
                         <span style={{ color: 'var(--accent)', fontWeight: 800 }}>#{profileData.rank || 'N/A'} <small style={{ color: 'var(--muted)', fontSize: '10px' }}>out of {profileData.totalUsers}</small></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Display Name</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '12px 16px', color: '#fff', outline: 'none' }} placeholder="Enter name" />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Email Address</label>
                      <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '12px 16px', color: '#fff', outline: 'none' }} placeholder="Enter email" />
                    </div>
                    <button onClick={handleUpdateProfile} disabled={updating} style={{ background: 'linear-gradient(135deg, var(--accent2), var(--accent))', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, width: '100%', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}>
                      {updating ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  </div>
                )}

                <button onClick={() => setShowProfile(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border2)', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 600, width: '100%', cursor: 'pointer' }}>Close Modal</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--danger)' }}>Failed to load profile.</div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
