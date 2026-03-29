import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { API_BASE_URL as API } from '../../config';

const COLORS = ['#00f5d4', '#00bbf9', '#FDB931', '#f15bb5', '#9b5de5'];

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'correct', 'wrong', 'skipped'
  const [activeRating, setActiveRating] = useState(5);

  const { attempt, rank, totalUsers } = state || {};

  // Calculate Category Data
  const categoryStats = useMemo(() => {
    if (!attempt?.answers) return [];
    const map = {};
    attempt.answers.forEach(ans => {
      const topic = ans.topic || 'General';
      const mainCat = topic.split(' - ')[0]; // Group by main category if possible
      if (!map[mainCat]) map[mainCat] = { name: mainCat, correct: 0, total: 0 };
      map[mainCat].total++;
      if (ans.isCorrect) map[mainCat].correct++;
    });
    return Object.values(map).map(cat => ({
      name: cat.name,
      accuracy: Math.round((cat.correct / cat.total) * 100),
      label: `${cat.correct}/${cat.total}`
    }));
  }, [attempt]);

  const pieData = useMemo(() => {
    if (!attempt) return [];
    return [
      { name: 'Correct', value: attempt.score, color: '#00f5d4' },
      { name: 'Incorrect', value: attempt.total - attempt.score, color: '#ff5252' }
    ];
  }, [attempt]);

  const radarData = useMemo(() => {
    if (!categoryStats.length) return [];
    return categoryStats.map(cat => ({
      subject: cat.name,
      A: cat.accuracy,
      B: 65, // Global Average Dummy
      C: 92, // Top 10% Dummy
      fullMark: 100
    }));
  }, [categoryStats]);

  const filteredAnswers = useMemo(() => {
    if (!attempt?.answers) return [];
    return attempt.answers.filter(ans => {
      if (filterType === 'all') return true;
      if (filterType === 'correct') return ans.isCorrect;
      if (filterType === 'wrong') return !ans.isCorrect && ans.selected !== -1;
      if (filterType === 'skipped') return ans.selected === -1;
      return true;
    });
  }, [attempt, filterType]);

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true); setError('');
    try {
      const token = localStorage.getItem('nqt_token');
      await axios.post(`${API}/exam/feedback`, { message: feedback, rating: activeRating }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmitted(true);
    } catch (err) { setError('Failed to save feedback.'); }
    setSubmitting(false);
  };

  if (!state || !state.attempt) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div className="grid-bg"></div>
        <div style={{ color: 'var(--muted)', fontSize: '18px', zIndex: 1 }}>No results currently available.</div>
        <button 
          onClick={() => navigate('/home')} 
          style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', zIndex: 1 }}
        >
          Return Home
        </button>
      </div>
    );
  }

  const passed = attempt.pct >= 60;
  const mainColor = passed ? '#00f5d4' : '#ff5252';

  return (
    <div className="custom-scroll" style={{ minHeight: '100vh', padding: '100px 20px 40px', position: 'relative' }}>
      <div className="grid-bg"></div>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header Hero Section */}
        {/* 📋 NEW: Top Action Bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📊</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '1.5px' }}>PERFORMANCE AUDIT</h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>System Generated Official Simulation Report</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="btn-glow"
            style={{ 
              background: 'rgba(0, 245, 212, 0.12)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', 
              padding: '12px 24px', borderRadius: '14px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <span style={{ fontSize: '18px' }}>💾</span> DOWNLOAD RESULT CARD (PDF)
          </button>
        </div>

        <div className="result-main-container" style={{ 
          background: 'var(--glass)', backdropFilter: 'var(--blur)', border: '1px solid var(--border)', 
          borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '24px',
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 60px ${mainColor}11`,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', filter: `drop-shadow(0 0 20px ${mainColor}55)` }}>
            {passed ? '🏆' : '📉'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '2px' }}>
            {passed ? 'CONGRATULATIONS!' : 'KEEP PUSHING!'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>
            You've completed the {attempt.examType || 'Mock'} Exam simulation. Here is your performance audit.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Left: Overall Accuracy Pie */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border2)' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px', textAlign: 'left' }}>OVERALL ACCURACY</div>
              <div style={{ height: '220px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: mainColor, lineHeight: 1 }}>{attempt.pct}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>ACCURACY</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fff' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5d4' }}></div> {attempt.score} Correct
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fff' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5252' }}></div> {attempt.total - attempt.score} Wrong
                </div>
              </div>
            </div>

            {/* Right: Category Performance Bar */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border2)' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px', textAlign: 'left' }}>SECTION PERFORMANCE</div>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} layout="vertical" margin={{ left: -10, right: 30 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={90} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={12}>
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 NEW: Strategic Peer Benchmarking */}
        <div style={{ 
          background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', marginBottom: '24px',
          display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>STRATEGIC RADAR</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              See how your skill distribution compares against the **Global Cohort** and the **Top 10% Performers**. High convergence in the center indicates balanced mastery.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#fff' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.4)', border: '2px solid #3b82f6', borderRadius: '2px' }}></div> Your Performance
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(148, 163, 184, 0.2)', border: '2px solid #94a3b8', borderRadius: '2px' }}></div> Global Average (65%)
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#00f5d4' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(0, 245, 212, 0.1)', border: '2px solid #00f5d4', borderRadius: '2px' }}></div> Top 10% Batch (92%)
               </div>
            </div>
          </div>
          <div style={{ height: '350px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Radar name="Top 10%" dataKey="C" stroke="#00f5d4" fill="#00f5d4" fillOpacity={0.05} />
                  <Radar name="Global Avg" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.05} />
                  <Radar name="You" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
               </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="stagger-item stagger-1 cyber-card" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>GLOBAL RANK</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#FDB931', textShadow: '0 0 20px rgba(253, 185, 49, 0.3)' }}>#{rank || '-'}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '4px' }}>out of {totalUsers} students</div>
          </div>
          <div className="stagger-item stagger-2 cyber-card" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>TIME CONSUMPTION</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>
              {Math.floor(attempt.timeUsed / 60)}<span style={{ fontSize: '16px', color: 'var(--muted2)' }}>m</span> {attempt.timeUsed % 60}<span style={{ fontSize: '16px', color: 'var(--muted2)' }}>s</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '4px' }}>
              Avg: {(() => {
                const avg = attempt.timeUsed / (attempt.total || 1);
                if (avg >= 60) return `${Math.floor(avg / 60)}m ${Math.round(avg % 60)}s`;
                return `${avg.toFixed(1)}s`;
              })()} per question
            </div>
          </div>
          <div className="stagger-item stagger-3 cyber-card" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>RESULT STATUS</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: mainColor, marginTop: '8px' }}>{passed ? 'QUALIFIED ✓' : 'FAILED ✗'}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '6px' }}>Min. 60% required</div>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => navigate('/home')} 
            style={{ 
              flex: 1, padding: '18px', background: 'linear-gradient(135deg, #00bbf9, #00f5d4)', 
              border: 'none', borderRadius: '14px', color: '#000', fontFamily: 'var(--font-heading)', fontSize: '14px', 
              fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s',
              boxShadow: '0 10px 30px rgba(0, 245, 212, 0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Go to Dashboard 🏠
          </button>
          <button 
            onClick={() => window.print()} 
            style={{ 
              padding: '18px 32px', background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border)', borderRadius: '14px', color: '#fff', 
              fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            🖨️ PDF Report
          </button>
        </div>

        {/* 💡 Actionable Improvement Insights */}
        <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💡 IMPROVEMENT SUGGESTIONS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryStats.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '14px' }}>No categories data available for breakdown.</div>
            ) : categoryStats.map((cat, idx) => {
              let feedbackText = '';
              let bgColor = 'rgba(255,255,255,0.02)';
              let borderColor = 'rgba(255,255,255,0.05)';
              let accentColor = '#94a3b8';

              if (cat.accuracy < 40) {
                feedbackText = `Critical improvement needed in ${cat.name}. Revise fundamental concepts and formulas.`;
                bgColor = 'rgba(239, 68, 68, 0.05)';
                borderColor = 'rgba(239, 68, 68, 0.1)';
                accentColor = '#ef4444';
              } else if (cat.accuracy < 60) {
                feedbackText = `Moderate performance in ${cat.name}. Practice more timed questions to improve speed.`;
                bgColor = 'rgba(234, 179, 8, 0.05)';
                borderColor = 'rgba(234, 179, 8, 0.1)';
                accentColor = '#eab308';
              } else if (cat.accuracy < 85) {
                feedbackText = `Good performance in ${cat.name}. Focus on fully correct options to avoid accuracy dips.`;
                bgColor = 'rgba(0, 187, 249, 0.05)';
                borderColor = 'rgba(0, 187, 249, 0.1)';
                accentColor = '#00bbf9';
              } else {
                feedbackText = `Excellent accuracy in ${cat.name}! Keep maintaining this level of mastery.`;
                bgColor = 'rgba(0, 245, 212, 0.05)';
                borderColor = 'rgba(0, 245, 212, 0.1)';
                accentColor = '#00f5d4';
              }

              return (
                <div key={idx} style={{ background: bgColor, border: `1px solid ${borderColor}`, padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}>
                  <div style={{ width: '6px', height: '36px', background: accentColor, borderRadius: '3px', flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: accentColor, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{cat.name}</span>
                      <span>{cat.accuracy}% Accuracy</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 500, lineHeight: 1.4 }}>{feedbackText}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🔒 AI Features Teaser (Coming Soon) */}
        <div style={{ 
          background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.8), rgba(0,0,0,0.6))', 
          border: '1px dashed rgba(0, 245, 212, 0.2)', 
          borderRadius: '24px', padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {/* Glowing Aura */}
          <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(0, 245, 212, 0.04) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '36px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(0, 245, 212, 0.5))' }}>🤖</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '1px' }}>
              AI SUBJECT HEATMAPS & MICRO-SUGGESTIONS
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Track weak areas with AI on a sub-topic level. Receive tailored revision formulas and actionable insights automatically.
            </p>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 187, 249, 0.1))', border: '1px solid rgba(0, 245, 212, 0.3)', padding: '6px 16px', borderRadius: '20px', fontSize: '10px', color: '#00f5d4', fontWeight: 800, letterSpacing: '2px' }}>
              🔒 COMING SOON FOR PREMIUM
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div style={{ background: 'var(--glass)', border: '1px solid var(--border2)', borderRadius: '24px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>DASHBOARD SOLUTIONS REVIEW</h3>
            
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
               {[
                 { id: 'all', label: 'All', icon: '🔍' },
                 { id: 'correct', label: 'Correct', icon: '✅' },
                 { id: 'wrong', label: 'Wrong', icon: '❌' },
                 { id: 'skipped', label: 'Skipped', icon: '⏩' }
               ].map(btn => (
                 <button 
                   key={btn.id}
                   onClick={() => { setFilterType(btn.id); if(!showAnswers) setShowAnswers(true); }}
                   style={{ 
                     padding: '8px 16px', background: filterType === btn.id ? 'var(--accent)' : 'transparent', 
                     color: filterType === btn.id ? '#000' : 'var(--muted)', border: 'none', borderRadius: '8px', 
                     fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                   }}
                 >
                   <span>{btn.icon}</span> {btn.label}
                 </button>
               ))}
            </div>

            <button 
              onClick={() => setShowAnswers(!showAnswers)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
            >
              {showAnswers ? 'Collapse 🔼' : 'Expand All 🔽'}
            </button>
          </div>

          {showAnswers && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredAnswers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>
                   No questions match the current filter.
                </div>
              ) : filteredAnswers.map((ans, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted2)' }}>QUESTION {idx + 1}</span>
                      {ans.selected === -1 && (
                        <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid rgba(148, 163, 184, 0.2)', letterSpacing: '0.5px' }}>
                          SKIPPED
                        </span>
                      )}
                      {ans.isCorrect ? (
                        <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.2)', letterSpacing: '0.5px' }}>CORRECT ✓</span>
                      ) : ans.selected !== -1 && (
                        <span style={{ fontSize: '10px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', letterSpacing: '0.5px' }}>INCORRECT ✗</span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent)', opacity: 0.7, background: 'rgba(0, 245, 212, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                      {ans.topic || 'General'}
                    </span>
                  </div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500, marginBottom: '14px', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: ans.qText }} />
                  
                  {ans.selected === -1 && (
                    <div style={{ marginBottom: '16px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <span style={{ fontSize: '14px' }}>ℹ️</span> You did not attempt this question.
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {ans.options.map((opt, oIdx) => {
                      const isCorrect = (opt === ans.correct) || (oIdx === Number(ans.correct) && !ans.options.includes(ans.correct));
                      const isSelected = ans.selected === oIdx;
                      let borderColor = 'rgba(255,255,255,0.05)';
                      let bg = 'rgba(255,255,255,0.01)';
                      
                      if (isCorrect) { 
                        borderColor = '#10b981'; 
                        bg = 'rgba(16, 185, 129, 0.08)';
                      } else if (isSelected) { 
                        borderColor = '#ef4444'; 
                        bg = 'rgba(239, 68, 68, 0.08)';
                      }

                      return (
                        <div key={oIdx} style={{ 
                          padding: '12px 16px', borderRadius: '12px', 
                          border: `1px solid ${borderColor}`, background: bg,
                          fontSize: '13px', color: isCorrect ? '#fff' : isSelected ? '#fff' : '#94a3b8',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isCorrect ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontWeight: 800, color: isCorrect ? '#10b981' : isSelected ? '#ef4444' : 'var(--muted2)' }}>{String.fromCharCode(65 + oIdx)}.</span>
                             <span dangerouslySetInnerHTML={{ __html: opt }} />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                             {isSelected && (
                               <span style={{ fontSize: '9px', fontWeight: 900, background: isCorrect ? '#10b981' : '#ef4444', color: '#000', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                 Your Answer {isCorrect ? '✓' : '✗'}
                               </span>
                             )}
                             {isCorrect && !isSelected && (
                               <span style={{ fontSize: '9px', fontWeight: 900, background: '#10b981', color: '#000', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                 Correct Answer
                               </span>
                             )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border2)' }}>
          <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px', fontWeight: 800 }}>HELP US IMPROVE ✍️</h4>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>Rate your experience and share suggests for features.</p>
          
          {!submitted ? (
            <>
              {/* Star Rating Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>Your Rating:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      onClick={() => setActiveRating(star)} 
                      style={{ 
                        fontSize: '22px', cursor: 'pointer', 
                        transition: 'transform 0.1s',
                        transform: star <= activeRating ? 'scale(1.1)' : 'none',
                        color: star <= activeRating ? '#ffb703' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', marginLeft: '4px', fontWeight: 700 }}>{activeRating}/5 Stars</div>
              </div>
              <textarea 
                value={feedback} 
                onChange={e => setFeedback(e.target.value)} 
                placeholder="Share your thoughts..." 
                style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border2)', borderRadius: '12px', color: '#fff', fontSize: '14px', resize: 'none', height: '100px', marginBottom: '16px', outline: 'none' }} 
              />
              <button 
                onClick={submitFeedback} 
                disabled={submitting || !feedback.trim()} 
                style={{ background: 'var(--accent)', border: 'none', color: '#000', padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', opacity: (submitting || !feedback.trim()) ? 0.5 : 1 }}
              >
                {submitting ? 'SENDING...' : 'SUBMIT SUGGESTION'}
              </button>
            </>
          ) : (
            <div style={{ color: '#00f5d4', fontWeight: 700 }}>✅ Feedback saved to database. Thank you!</div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        @media print {
          @page { size: A4; margin: 1cm; }
          .no-print, nav, footer, .grid-bg, .feedback-section, .no-scrollbar { display: none !important; }
          body { background: #fff !important; color: #000 !important; font-family: 'Inter', sans-serif !important; }
          .admin-dashboard-root { background: #fff !important; padding: 0 !important; }
          .result-main-container { 
            background: #fff !important; color: #000 !important; border: 4px double #000 !important; 
            box-shadow: none !important; margin: 0 !important; padding: 40px !important; border-radius: 0 !important;
            backdrop-filter: none !important;
          }
          .cyber-card, .glass-card, div { 
            border: 1px solid #ddd !important; background: #fff !important; color: #000 !important; 
            box-shadow: none !important; backdrop-filter: none !important;
          }
          h1, h2, h3, p, span, div { color: #000 !important; text-shadow: none !important; }
          .recharts-responsive-container { background: #fff !important; }
          .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: #eee !important; }
          .recharts-text { fill: #000 !important; }
          
          /* Watermark */
          .result-main-container::after {
            content: "OFFICIAL SIMULATION REPORT";
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px; color: rgba(0,0,0,0.03); z-index: -1; white-space: nowrap; pointer-events: none;
          }
        }
      `}</style>
    </div>
  );
}
