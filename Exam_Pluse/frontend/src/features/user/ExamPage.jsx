import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { API_BASE_URL as API } from '../../config';

export default function ExamPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') || 'final';
  const duration = searchParams.get('duration') ? parseInt(searchParams.get('duration')) : (mode === 'final' ? 90 : 0);
  
  const [qDatabase, setQDatabase] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [activeSection, setActiveSection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPoints, setLocalPoints] = useState(0);
  const [questionsStats, setQuestionsStats] = useState({}); // Track state lock for practice item levels
  const [pointPopups, setPointPopups] = useState([]); // [{id, text}] for floating reward animations
  const [marked, setMarked] = useState({}); // { qIndex: boolean }
  const [errorModal, setErrorModal] = useState(null);

  // Sync practice answers from user profile on load
  useEffect(() => {
    if (user && user.practiceAnswers && qDatabase.length > 0) {
      const saved = {};
      const statsMap = {};
      qDatabase.forEach((q, i) => {
        // practiceAnswers in JSON format usually has IDs as keys
        const data = user.practiceAnswers[q._id];
        if (data && data.selected !== undefined && data.selected !== -1) {
          saved[i] = data.selected;
          statsMap[q._id] = data;
        }
      });
      setAnswers(saved);
      setQuestionsStats(statsMap);
      if (user.totalPoints) setLocalPoints(user.totalPoints);
    }
  }, [user, qDatabase]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [examConfig, setExamConfig] = useState(null);
  const [visited, setVisited] = useState({});
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [optionFontSize, setOptionFontSize] = useState(15); // Default 15px For Options

  // Timer state for Final Exam
  const [timeLeft, setTimeLeft] = useState(duration * 60); 
  const timerRef = useRef(null);
  const initialDurationRef = useRef(duration);

  const examType = searchParams.get('type') || '';
  const topics = searchParams.get('topics') || '';
  const page = searchParams.get('page') || '';
  const difficulty = searchParams.get('difficulty') || '';

  // Fetch Questions from MongoDB
  useEffect(() => {
    // Clear prior answers/visited navigation indices to prevent caching carries
    setAnswers({});
    setVisited({});
    setQIndex(0);

    let fetchUrl = `${API}/questions`;
    if (topics) {
      fetchUrl += `?topics=${topics}${page ? `&page=${page}` : ''}${difficulty ? `&difficulty=${difficulty}` : ''}`;
    } else if (examType) {
      fetchUrl += `?examType=${examType}`;
    }

    axios.get(fetchUrl)
      .then(res => {
        let qs = res.data;
        
        if (!examType && !topics) {
          if (mode === 'easy') qs = qs.filter((_, i) => i % 3 === 0);
          else if (mode === 'hard') qs = qs.filter((_, i) => i % 3 === 1);
          else if (mode === 'advanced') qs = qs.filter((_, i) => i % 3 === 2);
          else if (mode === 'final') {
            let shuffled = [...qs];
            shuffled.sort(() => 0.5 - Math.random());
            qs = shuffled.slice(0, Math.min(shuffled.length, DEFAULT_EXAM_LIMIT));
          }
        }
        
        setQDatabase(qs);
        if (qs.length > 0) setActiveSection(qs[0].s);

        if (examType) {
          axios.get(`${API}/questions/configs`)
            .then(cRes => {
              const conf = cRes.data.find(c => c.key === examType);
              if (conf) {
                setExamConfig(conf);
                if (conf.instructions) setShowInstructions(true);
                if (conf.duration) {
                  setTimeLeft(conf.duration * 60);
                  initialDurationRef.current = conf.duration; // Sync anchor for handleSubmit
                }
              }
            }).catch(() => {});
        }
      })
      .catch(err => {
        console.error("Failed to load questions from DB:", err);
        alert("Could not load exam data. Please refresh.");
      });
  }, [mode, examType, topics, page, difficulty]);

  // Sync active section and mark visited
  useEffect(() => {
    if (qDatabase[qIndex]) {
      setActiveSection(qDatabase[qIndex].s);
      setVisited(prev => ({ ...prev, [qIndex]: true }));
    }
  }, [qIndex, qDatabase]);

  // Handle final exam timer
  useEffect(() => {
    if (mode === 'final' || duration > 0) {
      if (timeLeft > 0 && qDatabase.length > 0 && !showInstructions) {
        timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      } else if (timeLeft === 0 && qDatabase.length > 0 && !isSubmitting) {
        handleSubmit();
      }
      return () => clearInterval(timerRef.current);
    }
  }, [timeLeft, qDatabase, mode, isSubmitting, showInstructions]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmModal || showInstructions || isSubmitting) return;
      if (e.key === 'ArrowRight') setQIndex(p => Math.min(qDatabase.length - 1, p + 1));
      if (e.key === 'ArrowLeft') setQIndex(p => Math.max(0, p - 1));
      if (e.key === 'm' || e.key === 'M') toggleMark();
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key) - 1;
        if (qDatabase[qIndex]?.o[optIdx]) handleAnswer(optIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qIndex, qDatabase, showConfirmModal, showInstructions, isSubmitting]);

  const toggleMark = () => setMarked(prev => ({ ...prev, [qIndex]: !prev[qIndex] }));

  const handleAnswer = async (optIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));

    if (mode !== 'final') { // Apply practice auto-saves to non-final rigid exam modules
      try {
        const { data } = await axios.post(`${API}/exam/save-practice-answer`, {
          qId: qDatabase[qIndex]._id,
          selected: optIndex
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        if (data.success) {
          if (data.points !== undefined) {
             const diff = data.points - localPoints;
             if (diff > 0) {
                const id = Date.now();
                setPointPopups(prev => [...prev, { id, text: `+${diff.toFixed(1).replace('.0','')}` }]);
                setTimeout(() => {
                   setPointPopups(prev => prev.filter(p => p.id !== id));
                }, 1200);
             }
             setLocalPoints(data.points);
          }
          if (data.qData) {
            setQuestionsStats(prev => ({ ...prev, [qDatabase[qIndex]._id]: data.qData }));
          }
        }
      } catch (err) {
        console.error("Auto-save practice answer failed:", err);
      }
    }
  };

  const handleResetAll = async () => {
    if (window.confirm("Are you sure you want to reset all practice points and answers?")) {
      try {
        const { data } = await axios.post(`${API}/exam/reset-practice`, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) {
          setAnswers({});
          setQuestionsStats({});
          setLocalPoints(0);
          alert(data.message || "Practice session reset successfully 🔄");
        }
      } catch (err) {
        console.error("Reset failed:", err);
      }
    }
  };

  const handleSubmit = async (force = false) => {
    if (mode !== 'final' && !force) {
      setShowConfirmModal(true);
      return;
    }
    
    setShowConfirmModal(false);
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let score = 0;
    qDatabase.forEach((q, i) => {
      const isCorrect = (answers[i] === Number(q.a) || (q.o && q.o[answers[i]] === q.a));
      if (isCorrect) score++;
    });

    const totalTime = initialDurationRef.current * 60;
    const timeUsed = initialDurationRef.current > 0 ? (totalTime - timeLeft) : 0;
    const pct = Math.round((score / qDatabase.length) * 100);

    try {
      const submissionAnswers = qDatabase.map((q, i) => ({
        _id: q._id,
        qText: q.q,
        topic: q.s,
        options: q.o,
        selected: answers[i] !== undefined ? answers[i] : -1,
        correct: q.a,
        isCorrect: (answers[i] === Number(q.a) || (q.o && q.o[answers[i]] === q.a))
      }));

      const { data } = await axios.post(`${API}/exam/submit`, {
        score,
        total: qDatabase.length,
        pct,
        timeUsed,
        answers: submissionAnswers,
        examType: searchParams.get('type') || '',
        topics: searchParams.get('topics') || '',
        page: parseInt(searchParams.get('page')) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      navigate('/user/results', { state: { attempt: data.attempt, rank: data.rank, totalUsers: data.totalUsers } });
    } catch (err) {
      console.error(err);
      setErrorModal(err.response?.data?.error || 'Failed to submit exam!');
      setIsSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const [loadingState, setLoadingState] = useState('loading'); // 'loading', 'empty'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (qDatabase.length === 0) setLoadingState('empty');
    }, 5000); // Wait 5 seconds before giving up
    return () => clearTimeout(timer);
  }, [qDatabase]);

  if (qDatabase.length === 0) {
    if (loadingState === 'loading') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--accent)' }}>
          <div className="grid-bg"></div>
          <div style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 800, zIndex: 1, textShadow: '0 0 20px var(--accent)' }}>LOADING EXAM SIMULATION...</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--accent)' }}>
        <div className="grid-bg"></div>
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>No Questions Found</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>We couldn't find any questions for the selected topics or filters.</p>
          <button onClick={() => navigate('/user/home')} style={{ background: 'var(--accent)', color: '#000', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)' }}>
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const currentQ = qDatabase[qIndex];
  const sections = [...new Set(qDatabase.map(q => q.s))];

  const handleSectionClick = (sec) => {
    const idx = qDatabase.findIndex(q => q.s === sec);
    if (idx !== -1) setQIndex(idx);
  };

  const centerNode = document.getElementById('navbar-center-portal');
  const CenterPortal = centerNode ? createPortal(
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
       <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, letterSpacing: '1px' }}>
         {mode === 'final' ? `🎓 FINAL EXAM` : `🛠️ PRACTICE`}
       </span>
       {searchParams.get('page') && <span style={{ color: '#fff', fontSize: '12px', opacity: 0.8 }}>(Mod {searchParams.get('page')})</span>}
       <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
          | {qDatabase.length} Qs
       </span>
    </div>,
    centerNode
  ) : null;

  const rightNode = document.getElementById('navbar-right-portal');
  const RightPortal = rightNode ? createPortal(
    <>
      {/* Score Points View - Hidden in Final Exams */}
      {mode !== 'final' && (
        <div style={{ 
          position: 'relative', // for floating popup animations absolute anchor
          background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 245, 212, 0.02))', 
          border: '1px solid rgba(0, 245, 212, 0.2)',
          padding: '6px 12px', borderRadius: '8px',
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '13px', color: '#fff',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          🌟 <span style={{ color: 'var(--accent)' }}>{localPoints}</span> PTS

          {/* Floating Reward Animations */}
          {pointPopups.map(p => (
             <div key={p.id} className="reward-pop" style={{ 
                position: 'absolute', top: '-15px', right: '10px', 
                color: 'var(--accent)', fontWeight: 800, fontSize: '15px',
                textShadow: '0 0 10px rgba(0, 245, 212, 0.8)',
                pointerEvents: 'none'
             }}>
               {p.text} PTS
             </div>
          ))}
        </div>
      )}

      {/* Countdown Timer */}
      <div style={{ 
        color: duration > 0 && timeLeft <= 300 ? 'var(--danger)' : 'var(--accent)', 
        background: 'rgba(0,0,0,0.3)', border: duration > 0 && timeLeft <= 300 ? '1px solid var(--danger)' : '1px solid rgba(0, 245, 212, 0.2)',
        padding: '6px 12px', borderRadius: '8px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', letterSpacing: '1px',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        ⏱️ {duration > 0 ? formatTime(timeLeft) : '∞'}
      </div>

      {/* Submit Control */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={toggleMark}
          style={{ 
            background: marked[qIndex] ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)', 
            color: marked[qIndex] ? '#c084fc' : '#fff', border: marked[qIndex] ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.1)', 
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-heading)', 
            fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px'
          }}
        >
          {marked[qIndex] ? '🔖 MARKED' : '🕒 MARK'}
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.4)', 
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-heading)', 
            fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
        >
          {isSubmitting ? '...' : 'SUBMIT'}
        </button>
      </div>
    </>,
    rightNode
  ) : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {CenterPortal}
      {RightPortal}
      <div className="grid-bg"></div>
      
      <div className="has-nav" style={{ flex: 1, padding: '24px', paddingTop: '88px', display: 'flex', flexDirection: 'column', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Section Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {sections.map(s => {
            const sQs = qDatabase.filter(q => q.s === s);
            const total = sQs.length;
            const answered = sQs.filter(q => {
              const idx = qDatabase.findIndex(qd => qd._id === q._id);
              return answers[idx] !== undefined;
            }).length;
            const pct = Math.round((answered / total) * 100);
            const isActive = activeSection === s;

            return (
              <div key={s} style={{ 
                flex: 1, minWidth: '140px', background: 'rgba(0,0,0,0.3)', border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)', 
                borderRadius: '10px', padding: '10px 14px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--accent)', width: `${pct}%`, transition: 'width 0.4s ease' }}></div>
                <div style={{ fontSize: '10px', color: isActive ? 'var(--accent)' : 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{answered} <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>/ {total}</span></div>
                  <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800 }}>{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column Exam Layout (Topics Removed) */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>

          {/* Main Question Area (Middle) */}
          <div style={{ 
            flex: '1 1 500px', background: 'var(--glass)', backdropFilter: 'var(--blur)', 
            border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', 
            display: 'flex', flexDirection: 'column', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--border2)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--muted)' }}>
                Question <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>{qIndex + 1}</span> of {qDatabase.length}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 245, 212, 0.1)', color: 'var(--accent)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                  {activeSection}
                </div>
              </div>
            </div>
            
            <div key={qIndex} className="stagger-item stagger-1" style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '24px', paddingRight: '12px' }}>
              <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.6, color: '#fff', fontWeight: 500, transition: 'font-size 0.2s ease' }} dangerouslySetInnerHTML={{ __html: currentQ.q }} />
            </div>

            {/* Options Header (Zoom items unified above) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Options Selection</span>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {currentQ.o.map((opt, i) => {
                const qData = questionsStats[currentQ._id];

                // isSelected: ONLY from current session answers — prevents old practice data from bleeding
                const isSelected = answers[qIndex] === i;

                // For feedback display: also consider saved practice data
                const isSelectedForFeedback = isSelected || (qData && qData.selected === i);

                const isCorrect = (i === Number(currentQ.a) || currentQ.o[i] === currentQ.a);

                // hasAnswered: ONLY current session — prevents cross-question contamination
                const hasAnswered = answers[qIndex] !== undefined;
                const showFeedback = mode !== 'final' && hasAnswered;

                // Style defaults
                let bg = 'rgba(0,0,0,0.3)';
                let borderColor = 'var(--border2)';
                let shadow = 'none';

                if (showFeedback) {
                  if (isCorrect) {
                     bg = 'rgba(0, 200, 83, 0.08)';
                     borderColor = 'rgba(0, 200, 83, 0.6)';
                  } else if (isSelectedForFeedback) {
                     bg = 'rgba(211, 47, 47, 0.08)';
                     borderColor = 'rgba(211, 47, 47, 0.6)';
                  }
                } else if (isSelected) {
                  bg = 'rgba(0, 245, 212, 0.1)';
                  borderColor = 'var(--accent)';
                  shadow = 'inset 0 0 20px rgba(0, 245, 212, 0.05)';
                }

                return (
                  <div 
                    key={`${qIndex}-${i}`} 
                    onClick={(e) => { e.stopPropagation(); handleAnswer(i); }}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 20px', 
                      borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                      background: bg, border: `1px solid ${borderColor}`, boxShadow: shadow
                    }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = showFeedback && isCorrect ? 'rgba(0, 200, 83, 0.6)' : showFeedback && isSelectedForFeedback && !isCorrect ? 'rgba(211, 47, 47, 0.6)' : 'var(--border2)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input type="radio" name={`option-q${qIndex}`} checked={isSelected} readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer', pointerEvents: 'none' }} />
                      <span style={{ fontSize: `${optionFontSize}px`, color: '#fff', transition: 'font-size 0.2s ease' }} dangerouslySetInnerHTML={{ __html: opt }} />
                    </div>

                    {/* Feedback and Percentage Statistics */}
                    {showFeedback && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                        {isSelectedForFeedback && (
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: isCorrect ? 'rgba(0,200,83,0.2)' : 'rgba(211,47,47,0.2)', color: isCorrect ? '#00e676' : '#ff5252', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isCorrect ? 'Correct' : 'Wrong'}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                          {(() => {
                            const totalPicks = currentQ.stats ? currentQ.stats.reduce((a,b) => a+b, 0) : 0;
                            if (totalPicks > 0) return `${Math.round((currentQ.stats[i] / totalPicks) * 100)}% picked`;
                            return `${(25 + (opt.length % 15))}% picked`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nav Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
              <button 
                onClick={() => setQIndex(p => Math.max(0, p - 1))} 
                disabled={qIndex === 0} 
                style={{ 
                  padding: '12px 24px', background: 'transparent', border: '1px solid var(--border2)', 
                  color: '#fff', borderRadius: '10px', cursor: qIndex === 0 ? 'not-allowed' : 'pointer', 
                  opacity: qIndex === 0 ? 0.3 : 1, fontFamily: 'var(--font-heading)', fontWeight: 600, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if(qIndex !== 0) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; } }}
                onMouseLeave={e => { if(qIndex !== 0) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border2)'; } }}
              >
                ← PREVIOUS
              </button>

              {/* Inline Zoom Controls between Nav Triggers */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => { setFontSize(p => Math.min(p + 2, 28)); setOptionFontSize(o => Math.min(o + 2, 24)); }} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '0 6px', fontWeight: 800, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>+</button>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 8px' }}>Style</span>
                <button onClick={() => { setFontSize(p => Math.max(p - 2, 14)); setOptionFontSize(o => Math.max(o - 2, 12)); }} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '0 6px', fontWeight: 800, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>-</button>
                
                {/* Reset Button */}
                {mode !== 'final' && (
                  <button onClick={handleResetAll} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '4px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
                    Reset
                  </button>
                )}
              </div>

              {(() => {
                const isLastQ = qIndex === qDatabase.length - 1;
                const showSave = isLastQ;

                return (
                  <button 
                    onClick={() => showSave ? handleSubmit() : setQIndex(p => Math.min(qDatabase.length - 1, p + 1))} 
                    style={{ 
                      padding: '12px 28px',
                      background: showSave
                        ? 'linear-gradient(135deg, #10b981, #00f5d4)'
                        : 'linear-gradient(135deg, var(--accent2), var(--accent))', 
                      border: 'none', color: '#000', borderRadius: '10px',
                      cursor: 'pointer', 
                      fontFamily: 'var(--font-heading)', fontWeight: 800, transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(0, 245, 212, 0.3)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                  >
                    {showSave ? '✅ SAVE & SUBMIT' : 'NEXT Q →'}
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Right Sidebar - Nav Grid */}
          <div style={{ 
            flex: '0 0 260px', background: 'var(--glass)', backdropFilter: 'var(--blur)', 
            border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', 
            position: 'sticky', top: '90px', maxHeight: 'calc(100vh - 120px)', 
            overflowY: 'auto', display: 'flex', flexDirection: 'column' 
          }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--muted)', marginBottom: '16px', letterSpacing: '1px' }}>
              {activeSection.toUpperCase()} Qs
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
              {qDatabase.map((q, i) => {
                const isAnswered = answers[i] !== undefined;
                const isVisited = visited[i] === true;
                const isActive = i === qIndex;
                const isMarked = marked[i];

                let bgColor = 'rgba(0,0,0,0.3)';
                let textColor = '#fff';
                let borderColor = 'transparent';

                if (isMarked) {
                  bgColor = '#a855f7'; // Purple for Marked
                  textColor = '#fff';
                } else if (isAnswered) {
                  bgColor = '#10b981'; // Green for Answered
                  textColor = '#fff';
                } else if (isActive) {
                  bgColor = '#eab308'; // Yellow for Current Active Question
                  textColor = '#000';
                } else if (isVisited) {
                  bgColor = '#ef4444'; // Red for Visited but Unanswered
                  textColor = '#fff';
                }

                return (
                  <div 
                    key={i} 
                    onClick={() => setQIndex(i)} 
                    className={`stagger-item stagger-${(i % 10) + 1}`}
                    style={{ 
                      height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '13px', fontFamily: 'var(--font-mono)', cursor: 'pointer', borderRadius: '8px', 
                      background: bgColor, color: textColor, 
                      border: isActive ? '2px solid #fff' : '1px solid transparent', 
                      fontWeight: isActive || isAnswered ? 800 : 500, transition: 'all 0.2s',
                      boxShadow: isActive ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                    }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '14px', height: '14px', background: '#10b981', borderRadius: '4px' }}></div> <span style={{ fontWeight: 500 }}>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '4px' }}></div> <span style={{ fontWeight: 500 }}>Not Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '14px', height: '14px', background: '#eab308', borderRadius: '4px' }}></div> <span style={{ fontWeight: 500 }}>Viewing Now</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '14px', height: '14px', background: '#a855f7', borderRadius: '4px' }}></div> <span style={{ fontWeight: 500 }}>Marked for Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '14px', height: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border2)', borderRadius: '4px' }}></div> <span style={{ fontWeight: 500 }}>Unvisited</span>
              </div>
            </div>
          </div>
          {/* Custom Error Dialog Modal */}
          {errorModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: 'var(--glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Action Blocked</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>{errorModal}</p>
                <button onClick={() => setErrorModal(null)} style={{ background: 'var(--accent)', color: '#000', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)', width: '100%', textTransform: 'uppercase' }}>Dismiss</button>
              </div>
            </div>
          )}

        <style>{`
          @keyframes rewardFloat {
            0% { opacity: 0; transform: translateY(15px) scale(0.5); }
            20% { opacity: 1; transform: translateY(0) scale(1.3); }
            80% { opacity: 1; transform: translateY(-25px) scale(1); }
            100% { opacity: 0; transform: translateY(-45px) scale(0.8); }
          }
          .reward-pop {
            animation: rewardFloat 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>

          {/* Custom Confirm Dialog Modal */}
          {showConfirmModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: 'var(--glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤔</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Finish Practice?</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>Are you sure you want to finish your practice session and view results?</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleSubmit(true)} style={{ flex: 1, background: 'var(--accent)', color: '#000', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Yes, Finish</button>
                  <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border2)', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showInstructions && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
              <div style={{ background: 'var(--glass)', border: '1px solid var(--accent)', borderRadius: '24px', padding: '36px', width: '90%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 0 40px rgba(0, 245, 212, 0.2)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 900, color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                     {examConfig?.title || 'Exam'} Instructions
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>Please read the guidelines before proceeding.</p>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border2)', textAlign: 'left', marginBottom: '32px', maxHeight: '220px', overflowY: 'auto', fontSize: '14px', lineHeight: 1.6, color: '#e2e8f0' }}>
                     {examConfig?.instructions || "Standard Exam Rules apply. Ensure stable connection and time tracking triggers."}
                </div>

                <button onClick={() => setShowInstructions(false)} style={{ background: 'linear-gradient(135deg, var(--accent2), var(--accent))', color: '#000', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-heading)', width: '100%', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 20px rgba(0, 245, 212, 0.3)' }}>
                     Start Test Now 🚀
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
