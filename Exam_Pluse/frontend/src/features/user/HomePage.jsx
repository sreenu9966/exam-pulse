import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

import { API_BASE_URL as API } from '../../config';

const TOP_TABS = ['Class Based', 'State Exams', 'Central Exams', 'IT Exams', 'Non-IT Exams'];
const LEVELS = ['Easy', 'Medium', 'Hard', 'Advanced'];

// CATEGORY_MAP is now fetched dynamically from the backend for 100% automation.

const CLASS_SYLLABUS_MAP = {
  'Class 1': { Mathematics: ['Basic Counting', 'Basic Addition'], English: ['Alphabet & Words', 'Basic Spelling'] },
  'Class 2 - 5': { Mathematics: ['Mathematical Operations', 'Areas, Shapes & Perimeter', 'Divisibility'], English: ['Spelling Test', 'Synonyms', 'Antonyms'], Logic: ['Odd Man Out', 'Direction Sense'] },
  'Class 6 - 8': { Mathematics: ['Percentages', 'Ratios, Proportion, and Averages', 'Equations', 'Geometry', 'Averages'], English: ['Active and Passive Voice', 'Prepositions', 'Reading Comprehension'], Logic: ['Number Series', 'Coding-Decoding', 'Blood Relations'] },
  'Class 9': { Aptitude: ['Profit and Loss', 'Speed Time and Distance', 'Work and Time', 'Probability', 'Calendar & Clock'], Reasoning: ['Analogy', 'Distance and Directions', 'Statement and Conclusion', 'Data Interpretation'], Verbal: ['Sentence Completion', 'Spotting Errors', 'Fill in the Blanks', 'Cloze Test'] },
  'Class 10': { Aptitude: ['Ages', 'Allegations and Mixtures', 'Arrangements and Series', 'Clocks & Calendar', 'P&C'], Reasoning: ['Classification', 'Seating Arrangement', 'Syllogism', 'Symbols and Notations'], Verbal: ['Idioms & Phrases', 'Para Jumbles', 'Passage Completion', 'Sentence Arrangement'] }
};

const Skeleton = ({ width, height, style }) => (
  <div className="skeleton-box loading-shimmer" style={{ width, height, ...style }} />
);

// 🚀 MEMOIZED PORTALS FOR MAXIMUM PERFORMANCE
const DashboardPortal = React.memo(({ activeSide, loading, categoryStats, advancedChartData, highestScore, averageScore, trendData, submissions, overallAccuracy, chartPeriod, setChartPeriod, setActiveSide, user, disabledTopics = [], setActiveTopic }) => {
  if (activeSide !== 'dashboard') return null;
  return (
    <div style={{ animation: 'fadeIn 0.5s', background: '#0b1221', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) minmax(400px, 2fr) minmax(250px, 1fr)', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Overall Accuracy Matrix</h3>
            <div style={{ display: 'flex', alignItems: 'center', height: '180px' }}>
              <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: 100 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={70} fill="#00f5d4" opacity={0.2} stroke="none" isAnimationActive={false} />
                    <Pie data={[{ v: categoryStats.Aptitude || 68 }, { v: 100 - (categoryStats.Aptitude || 68) }]} dataKey="v" cx="50%" cy="50%" innerRadius={60} outerRadius={70} stroke="none" cornerRadius={4}>
                      <Cell fill="#00f5d4" />
                      <Cell fill="transparent" />
                    </Pie>
                    <Pie data={[{ v: 100 }]} cx="50%" cy="50%" innerRadius={45} outerRadius={55} fill="#00bbf9" opacity={0.2} stroke="none" isAnimationActive={false} />
                    <Pie data={[{ v: categoryStats.Reasoning || 45 }, { v: 100 - (categoryStats.Reasoning || 45) }]} dataKey="v" cx="50%" cy="50%" innerRadius={45} outerRadius={55} stroke="none" cornerRadius={4}>
                      <Cell fill="#00bbf9" />
                      <Cell fill="transparent" />
                    </Pie>
                    <Pie data={[{ v: 100 }]} cx="50%" cy="50%" innerRadius={30} outerRadius={40} fill="#FDB931" opacity={0.2} stroke="none" isAnimationActive={false} />
                    <Pie data={[{ v: categoryStats.Verbal || 70 }, { v: 100 - (categoryStats.Verbal || 70) }]} dataKey="v" cx="50%" cy="50%" innerRadius={30} outerRadius={40} stroke="none" cornerRadius={4}>
                      <Cell fill="#FDB931" />
                      <Cell fill="transparent" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00f5d4', fontWeight: 700, width: '32px' }}>{categoryStats.Aptitude || 68}%</span><span>Aptitude</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00bbf9', fontWeight: 700, width: '32px' }}>{categoryStats.Reasoning || 45}%</span><span>Reasoning</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#FDB931', fontWeight: 700, width: '32px' }}>{categoryStats.Verbal || 70}%</span><span>Verbal Skill</span></div>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Subject Mastery (vs Cohort)</h3>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={70} data={[
                  { subject: 'Aptitude', A: categoryStats.Aptitude || 75, B: 65, fullMark: 100 },
                  { subject: 'Reasoning', A: categoryStats.Reasoning || 80, B: 60, fullMark: 100 },
                  { subject: 'Verbal', A: categoryStats.Verbal || 60, B: 75, fullMark: 100 },
                  { subject: 'Coding', A: categoryStats.Technical || 90, B: 70, fullMark: 100 },
                  { subject: 'Aptitude II', A: 85, B: 75, fullMark: 100 },
                  { subject: 'Logic', A: 80, B: 85, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Radar name="My Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Avg Cohort" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Recent Activity (Mins)</h3>
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={advancedChartData || []} margin={{ left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="duration" name="Mins Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 12px 0' }}>Performance Progression</h3>
                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {highestScore} <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Highest</span>
                    </div>
                    <div style={{ color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>Best Score</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {averageScore} <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Average</span>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>Average Score</div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-start' }}>
                <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value)} style={{ padding: '6px 16px', fontSize: '12px', background: '#1e293b', color: '#fff', borderRadius: '6px', cursor: 'pointer', textAlign: 'center', border: 'none', outline: 'none' }}>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            <div style={{ height: '300px', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData || []} margin={{ left: -20, bottom: 0, right: 0, top: 20 }}>
                  <defs>
                    <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="score" name="Your Score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorO)" />
                  <Area type="monotone" dataKey="avg" name="Passing Average" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorI)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {[
              { no: 'Total Exams', val: submissions.length, sub: 'Attempted' },
              { no: 'Total Time', val: `${Math.floor((submissions.reduce((a, b) => a + (b.timeUsed || 0), 0)) / 60)}h ${(submissions.reduce((a, b) => a + (b.timeUsed || 0), 0)) % 60}m`, sub: 'Spent Testing' },
              { no: 'XP Points', val: submissions.length * 10, sub: 'Earned' },
              { no: 'Pass Rate', val: overallAccuracy + '%', sub: 'Consistent' },
              { no: 'National Rank', val: 'Top 12%', sub: 'Estimated' }
            ].map((s, i) => (
              <div key={s.no} className={`stagger-item stagger-${i + 1} cyber-card`} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', textAlign: 'left', backdropFilter: 'blur(10px)' }}>
                {loading ? <Skeleton width="100%" height="40px" /> : (
                  <>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.no}</div>
                    <div style={{ fontSize: '20px', color: '#fff', fontWeight: 300 }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {[
              { title: 'Accuracy', pct: overallAccuracy, color: '#3b82f6', info: 'Overall Response Accuracy' },
              { title: 'Speed', pct: 85, color: '#f59e0b', info: 'Time Efficiency Ratio' },
              { title: 'Completed', pct: submissions.length > 0 ? 95 : 0, color: '#10b981', info: 'Syllabus Completion Index' }
            ].map(d => (
              <div key={d.title} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <PieChart>
                      <Pie data={[{ v: 100 }]} cx="50%" cy="50%" innerRadius={48} outerRadius={58} fill={d.color} opacity={0.2} stroke="none" isAnimationActive={false} />
                      <Pie data={[{ v: d.pct }, { v: 100 - d.pct }]} dataKey="v" cx="50%" cy="50%" innerRadius={48} outerRadius={58} stroke="none" cornerRadius={4} startAngle={90} endAngle={-270}>
                        <Cell fill={d.color} />
                        <Cell fill="transparent" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'relative', zIndex: 1, marginTop: '10px' }}>
                    <div style={{ fontSize: '24px', color: '#fff', fontWeight: 700, lineHeight: 1 }}>{d.pct}%</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{d.title}</div>
                  </div>
                </div>
                <div style={{ marginTop: '24px', fontSize: '11px', color: d.color, opacity: 0.8, lineHeight: 1.6 }}>
                  BITMCQS Engine<br />{d.info}<br />Performance Profile
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
              <span>Student ID</span>
              <span>{user?.uid?.substring(0, 8) || 'N/A'}</span>
            </div>
            <div style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '12px', marginTop: '12px' }}>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Exam Preparation</div>
              <div style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.5px' }}>{user?.displayName || 'Student'}<br />Candidate</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>Batch: 2026 Graduating</div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', height: '260px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0' }}>Module Completion</h3>
            <div style={{ flex: 1, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Done', value: 30 }, { name: 'Working', value: 40 }, { name: 'Pending', value: 20 }, { name: 'Passed', value: 10 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                    <Cell fill="#00f5d4" />
                    <Cell fill="#00bbf9" />
                    <Cell fill="#FDB931" />
                    <Cell fill="#f15bb5" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
            <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 24px 0', borderLeft: '4px solid #ef4444', paddingLeft: '12px' }}>Strategic Roadmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(submissions && submissions.length > 0) ? (
                Object.entries(submissions.reduce((acc, sub) => {
                  if (!sub.answers) return acc;
                  sub.answers.forEach(ans => {
                    if (!acc[ans.topic]) acc[ans.topic] = { correct: 0, total: 0 };
                    acc[ans.topic].total++;
                    if (ans.isCorrect) acc[ans.topic].correct++;
                  });
                  return acc;
                }, {}))
                .map(([name, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  const isCritical = pct < 45;
                  return { name, pct, isCritical };
                })
                .filter(t => t.pct < 70 && !disabledTopics.includes(t.name))
                .sort((a,b) => a.pct - b.pct)
                .slice(0, 4)
                .map((item, idx) => (
                  <div key={item.name} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                    {item.isCritical && <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '8px', color: '#ef4444', fontWeight: 900, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>CRITICAL</div>}
                    <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px', width: '80%' }}>{idx + 1}. {item.name}</div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '10px' }}>
                      <div style={{ height: '100%', width: `${item.pct}%`, background: item.isCritical ? '#ef4444' : '#f59e0b', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '11px', color: item.isCritical ? '#f87171' : '#fbbf24', fontWeight: 800 }}>{item.pct}% Mastery</span>
                       <button 
                         onClick={() => { setActiveSide('practice'); setActiveTopic(item.name); }}
                         style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '10px', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                        >
                          PRACTICE →
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--muted2)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>Complete an exam to generate your roadmap.</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--accent)', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', textAlign: 'center', marginTop: '24px' }} onClick={() => setActiveSide('topic-mastery')}>
          🎯 View Full Topic Mastery Analytics →
        </div>
      </div>
    </div>
  );
});

const TopicMasteryPortal = React.memo(({ activeSide, topicFilter, setTopicFilter, topicStats, setActiveSide, setActiveSection, setActiveTopic, categoryMap }) => {
  if (activeSide !== 'topic-mastery') return null;
  return (
    <div style={{ animation: 'fadeIn 0.5s', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>🎯 Topic Mastery Explorer</h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Detailed syllabus coverage and performance across all categories.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Aptitude', 'Reasoning', 'Verbal', 'Technical'].map(cat => (
            <button key={cat} onClick={() => setTopicFilter(cat)} style={{ padding: '12px 24px', background: topicFilter === cat ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: topicFilter === cat ? '#000' : '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s' }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
        {(categoryMap[topicFilter] || []).map(topic => {
          const s = topicStats[topic];
          const pct = s ? Math.round((s.correct / s.total) * 100) : 0;
          const attempted = !!s;
          return (
            <div key={topic} className="cyber-card" style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: 100 }]} cx="50%" cy="50%" innerRadius={30} outerRadius={38} fill={attempted ? (pct >= 60 ? 'var(--accent)' : 'var(--danger)') : 'rgba(255,255,255,0.05)'} opacity={0.2} stroke="none" isAnimationActive={false} />
                    <Pie data={[{ v: attempted ? pct : 0 }, { v: attempted ? 100 - pct : 100 }]} dataKey="v" cx="50%" cy="50%" innerRadius={30} outerRadius={38} stroke="none" cornerRadius={4} startAngle={90} endAngle={-270}>
                      <Cell fill={attempted ? (pct >= 60 ? 'var(--accent)' : 'var(--danger)') : 'transparent'} />
                      <Cell fill="transparent" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 800, color: attempted ? '#fff' : 'var(--muted2)' }}>{attempted ? `${pct}%` : 'N/A'}</div>
              </div>
              <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, marginBottom: '12px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{topic}</h4>
              <div style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: attempted ? (pct >= 60 ? 'rgba(0,245,212,0.1)' : 'rgba(239,68,68,0.1)') : 'rgba(255,255,255,0.05)', color: attempted ? (pct >= 60 ? 'var(--accent)' : 'var(--danger)') : 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'inline-block' }}>{attempted ? (pct >= 60 ? 'Mastered' : 'Needs Practice') : 'Not Attempted'}</div>
              {!attempted && (
                <div style={{ marginTop: '20px' }}>
                  <button onClick={() => { setActiveSide('practice'); setActiveSection(topicFilter); setActiveTopic(topic); }} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', width: '100%' }}>Practice Now →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

const RewardsPortal = React.memo(({ activeSide, token, showToast, refreshUser }) => {
  if (activeSide !== 'rewards') return null;
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);

  const playGame = async (type) => {
    setPlaying(true);
    try {
      const res = await axios.post(`${API}/auth/gamified/play`, { gameType: type }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
      if (res.data.win) refreshUser();
    } catch (e) { showToast(e.response?.data?.error || "Failed to play"); }
    finally { setPlaying(false); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', padding: '24px' }}>
      <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>🎁 Lucky Rewards & Games</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="cyber-card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(0,0,0,0.4))', border: '1px solid #8b5cf6', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🃏</div>
          <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Lucky Scratch Card</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Scratch and win high-value discount coupons or premium access!</p>
          <button onClick={() => playGame('scratch')} disabled={playing} style={{ background: '#8b5cf6', color: '#fff', padding: '12px 32px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            {playing ? 'Scratching...' : 'Play Now'}
          </button>
        </div>
        <div className="cyber-card" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(0,0,0,0.4))', border: '1px solid #ec4899', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎡</div>
          <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Wheel of Fortune</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Spin the wheel to get instant rewards and exclusive offer codes.</p>
          <button onClick={() => playGame('spin')} disabled={playing} style={{ background: '#ec4899', color: '#fff', padding: '12px 32px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            {playing ? 'Spinning...' : 'Spin Wheel'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', textAlign: 'center', animation: 'zoomIn 0.3s' }}>
          <h3 style={{ color: result.win ? 'var(--accent)' : 'var(--danger)', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
            {result.win ? '🎉 YOU WON!' : '😅 Oops!'}
          </h3>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>{result.message}</p>
          {result.win && result.prize?.code && (
            <div style={{ background: 'rgba(0,245,212,0.1)', border: '2px dashed var(--accent)', padding: '16px', borderRadius: '12px', display: 'inline-block', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(result.prize.code); showToast("Code copied! 📋"); }}>
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '2px', color: 'var(--accent)' }}>{result.prize.code}</span>
              <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--muted)' }}>Click to copy</div>
            </div>
          )}
          <div style={{ marginTop: '24px' }}>
             <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
});

const UpgradePortal = React.memo(({ activeSide, token, showToast, refreshUser, user }) => {
  if (activeSide !== 'upgrade') return null;
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  const applyCoupon = async () => {
    if (!code) return showToast("Enter a coupon code");
    setApplying(true);
    try {
      const res = await axios.post(`${API}/auth/coupon/apply`, { code }, { headers: { Authorization: `Bearer ${token}` } });
      showToast(res.data.message);
      refreshUser();
      setCode('');
    } catch (e) { showToast(e.response?.data?.error || "Invalid coupon"); }
    finally { setApplying(false); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>👑 Unlock Premium Potential</h2>
        <p style={{ color: 'var(--muted)', fontSize: '18px' }}>Get unlimited access to all exams, detailed analytics, and priority support.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
        <div className="cyber-card" style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', opacity: user?.plan === 'premium' ? 0.6 : 1 }}>
          <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Free Plan</h3>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px', color: 'var(--muted)' }}>$0 <span style={{ fontSize: '14px', fontWeight: 400 }}>/ month</span></div>
          <ul style={{ color: 'var(--muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none' }}>
            <li>✅ Limited Practice Access</li>
            <li>✅ 2 Mock Exam Attempts</li>
            <li>❌ Advanced Analytics</li>
            <li>❌ 100% Syllabus Coverage</li>
          </ul>
        </div>
        <div className="cyber-card" style={{ background: 'rgba(0, 245, 212, 0.05)', border: '2px solid var(--accent)', borderRadius: '24px', padding: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--accent)', color: '#000', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>MOST POPULAR</div>
          <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Premium Pro</h3>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px', color: 'var(--accent)' }}>$9 <span style={{ fontSize: '14px', fontWeight: 400, color: '#fff' }}>/ month</span></div>
          <ul style={{ color: '#fff', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none' }}>
            <li>✅ Unlimited Practice & Exams</li>
            <li>✅ Deep Performance Analytics</li>
            <li>✅ Smart Topic Radar</li>
            <li>✅ 24/7 Priority Support</li>
          </ul>
          {user?.plan === 'premium' ? (
             <div style={{ marginTop: '24px', background: 'rgba(0,245,212,0.2)', color: 'var(--accent)', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: 800 }}>ACTIVE PLAN 👑</div>
          ) : (
             <button style={{ marginTop: '24px', width: '100%', background: 'var(--accent)', color: '#000', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Upgrade Now →</button>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
        <h4 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>🎟️ Have a Coupon?</h4>
        <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="ENTER CODE HERE" style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }} />
          <button onClick={applyCoupon} disabled={applying} style={{ background: 'var(--accent)', color: '#000', padding: '0 24px', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            {applying ? '...' : 'APPLY'}
          </button>
        </div>
      </div>
    </div>
  );
});

const AnalyticsPortal = React.memo(({ activeSide, filterTime, setFilterTime, filterChart, setFilterChart, trendData, advancedChartData, loading, topicPerformanceData, catData, overallAccuracy }) => {
  if (activeSide !== 'analytics') return null;
  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <h2 style={{ color: 'var(--text)', marginBottom: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>📈 Performance Analytics</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select value={filterTime} onChange={e => setFilterTime(e.target.value)} style={{ padding: '10px 14px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
          <option value="1">Last 1 Hour</option><option value="2">Last 2 Hours</option><option value="6">Last 6 Hours</option><option value="24">Last 24 Hours</option><option value="168">Last 7 Days</option><option value="720">Last Month</option><option value="lifetime">Lifetime</option>
        </select>
        <select value={filterChart} onChange={e => setFilterChart(e.target.value)} style={{ padding: '10px 14px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
          <option value="Area">Area/Line Chart</option><option value="Bar">Bar Chart</option><option value="Pie">Pie Chart</option>
        </select>
      </div>

      {trendData.length > 0 || (advancedChartData && advancedChartData.length > 0) ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {advancedChartData && advancedChartData.length > 0 && (
            <div style={{ background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px', gridColumn: 'span 2' }}>
              <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 800, marginBottom: '20px' }}>⏱️ Daily Time Spent</h4>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {filterChart === 'Area' ? (
                    <AreaChart data={advancedChartData}><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip /><Area type="monotone" dataKey="duration" stroke="#FDB931" fill="#FDB931" fillOpacity={0.2} /></AreaChart>
                  ) : <BarChart data={advancedChartData}><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip /><Bar dataKey="duration" fill="#FDB931" radius={[8, 8, 0, 0]} /></BarChart>}
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {topicPerformanceData.length > 0 && (
            <div style={{ background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', gridColumn: 'span 2' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>📊 Topic Performance</h4>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicPerformanceData} layout="vertical" margin={{ left: 40 }}><XAxis type="number" domain={[0, 100]} /><YAxis dataKey="name" type="category" width={140} /><Tooltip /><Bar dataKey="accuracy" fill="var(--accent)" radius={[0, 4, 4, 0]} /></BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {trendData.length > 0 && (
            <div style={{ background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>📈 Exam Score Trend</h4>
              <div style={{ height: '300px' }}><ResponsiveContainer><AreaChart data={trendData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="score" stroke="#00f5d4" fill="#00f5d4" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
            </div>
          )}
          {catData.length > 0 && (
            <div style={{ background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>📊 Category Accuracy</h4>
              <div style={{ height: '300px' }}><ResponsiveContainer><PieChart><Pie data={catData} dataKey="count" nameKey="name" outerRadius={85} label><Cell fill="#00f5d4" /><Cell fill="#00bbf9" /><Cell fill="#FDB931" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            </div>
          )}
        </div>
      ) : <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '60px' }}>Not enough data for analytics.</p>}
    </div>
  );
});

export default function HomePage() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [practiceTimer, setPracticeTimer] = useState(0);
  const [activities, setActivities] = useState([]);
const [submissions, setSubmissions] = useState([]);

const [activeSide, setActiveSide] = useState('home');
const [sidebarOpen, setSidebarOpen] = useState(false); // 'home', 'dashboard', 'exams', 'practice'
const [activeTab, setActiveTab] = useState('IT Exams');
const [activeClass, setActiveClass] = useState(null);
const [activeSection, setActiveSection] = useState(null);
const [activeLevel, setActiveLevel] = useState('Easy');
const [activeTopic, setActiveTopic] = useState(null);
const [moduleCount, setModuleCount] = useState(0);
const [loading, setLoading] = useState(true);

const [modal, setModal] = useState({ show: false, type: 'alert', title: '', message: '', onConfirm: null });
const [advancedStats, setAdvancedStats] = useState([]);
const [filterTime, setFilterTime] = useState('24'); // hours
const [filterChart, setFilterChart] = useState('Area');
const [userExams, setUserExams] = useState({ unattempted: [], completed: [] });
const [examSubTab, setExamSubTab] = useState('All');
const [examSubCategory, setExamSubCategory] = useState('All');
const [chartPeriod, setChartPeriod] = useState('all');
const [topicFilter, setTopicFilter] = useState('Aptitude');
const [categoryMap, setCategoryMap] = useState({ Aptitude: [], Reasoning: [], Verbal: [], Technical: [] });
const [disabledTopics, setDisabledTopics] = useState([]);

const [showSupport, setShowSupport] = useState(false);
const [supportMsg, setSupportMsg] = useState("");
const [isSendingSupport, setIsSendingSupport] = useState(false);

const handleSupportSubmit = async () => {
    if (!supportMsg.trim()) return showToast("Please describe your issue.");
    setIsSendingSupport(true);
    try {
      await axios.post(`${API}/admin/support`, { 
        message: supportMsg,
        userName: user?.displayName || 'Student',
        userCode: user?.uid || 'Unknown' 
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Issue reported! Our team will review it. 🚀");
      setSupportMsg("");
      setShowSupport(false);
    } catch (e) { showToast("Failed to send report. Please try again."); }
    finally { setIsSendingSupport(false); }
};

const showToast = (message) => {
  setModal({ show: true, type: 'alert', title: 'Notification', message });
};

useEffect(() => {
  if (activeSide === 'exams') {
    axios.get(`${API}/questions/user-exams`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUserExams(r.data))
      .catch(() => { });
  }
}, [activeSide]);

const advancedChartData = React.useMemo(() => {
  return advancedStats.map(s => ({
    name: s._id.topic || s._id.category || s._id.action || 'Other',
    duration: Math.round((s.totalDuration || 0) / 60),
    count: s.visitCount || 0
  }));
}, [advancedStats]);

// Stats Computes (NOW USING SCALABLE SUBMISSIONS)
const stats = React.useMemo(() => {
  const res = {
    totalScore: 0, totalQuestions: 0, highestScore: 0, averageScore: 0,
    totalTime: 0,
    categoryStats: { Aptitude: 0, Reasoning: 0, Verbal: 0, Technical: 0 },
    topicStats: {}, topicPerformanceData: [], trendData: [], catData: []
  };

  if (!submissions || submissions.length === 0) return { ...res, totalQuestions: 1 };

  submissions.forEach(sub => {
    res.totalScore += sub.score || 0;
    res.totalQuestions += sub.total || 0;
    res.totalTime += sub.timeUsed || 0;
    if (sub.pct > res.highestScore) res.highestScore = sub.pct;

    // Category Logic
    const cat = sub.examType || 'Mock Exam';
    if (res.categoryStats[cat] !== undefined) {
        if (!res.catDetail) res.catDetail = {};
        if (!res.catDetail[cat]) res.catDetail[cat] = { score: 0, total: 0 };
        res.catDetail[cat].score += sub.score || 0;
        res.catDetail[cat].total += sub.total || 0;
    }

    // Topic Performance
    if (sub.topic) {
      if (!res.topicStats[sub.topic]) res.topicStats[sub.topic] = { correct: 0, total: 0 };
      res.topicStats[sub.topic].correct += sub.score || 0;
      res.topicStats[sub.topic].total += sub.total || 0;
    }

    if (sub.answers && Array.isArray(sub.answers)) {
        sub.answers.forEach(ans => {
          const t = ans.topic || 'General';
          if (!res.topicStats[t]) res.topicStats[t] = { correct: 0, total: 0 };
          res.topicStats[t].total++;
          if (ans.isCorrect) res.topicStats[t].correct++;
        });
    }
  });

  res.overallAccuracy = Math.round((res.totalScore / (res.totalQuestions || 1)) * 100);
  res.averageScore = submissions.length > 0 ? Math.round(submissions.reduce((a, b) => a + (b.pct || 0), 0) / submissions.length) : 0;

  // Format for Charts
  res.topicPerformanceData = Object.entries(res.topicStats)
    .filter(([_, s]) => s.total > 0)
    .map(([name, s]) => ({
    name, accuracy: Math.round((s.correct / s.total) * 100), attempts: s.total
  })).sort((a,b) => b.accuracy - a.accuracy).slice(0, 10);

  res.catData = Object.entries(res.catDetail || {}).map(([name, s]) => ({
    name, count: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0
  }));

  res.trendData = [...submissions].reverse().map((s, i) => ({
    name: `T-${i+1}`, score: s.pct, date: new Date(s.date).toLocaleDateString(), avg: 70
  })).slice(-10);

  // Patch basic categoryStats for the matrix
  Object.keys(res.categoryStats).forEach(k => {
     if (res.catDetail && res.catDetail[k]) {
        res.categoryStats[k] = res.catDetail[k].total > 0 ? Math.round((res.catDetail[k].score / res.catDetail[k].total) * 100) : res.categoryStats[k];
     }
  });

  return res;
}, [submissions]);

const { totalScore, totalQuestions, overallAccuracy, categoryStats, trendData, catData, totalTime, highestScore, averageScore, topicStats, topicPerformanceData } = stats;

const getActiveCategoryMap = () => {
  if (activeTab === 'Class Based' && activeClass) {
    return CLASS_SYLLABUS_MAP[activeClass] || categoryMap;
  }
  return categoryMap;
};
const activeMap = getActiveCategoryMap();

const fetchData = () => {
  if (token) {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/auth/activity`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/exam/submissions`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/questions/mapping`)
    ]).then(([act, sub, map]) => {
      setActivities(act.data);
      setSubmissions(sub.data);
      if (map.data.CATEGORY_MAP) setCategoryMap(map.data.CATEGORY_MAP);
      if (map.data.disabledTopics) setDisabledTopics(map.data.disabledTopics);
    }).catch(() => { }).finally(() => setLoading(false));
  }
};

useEffect(() => {
  refreshUser();
  axios.get(`${API}/leaderboard`).then(r => setLeaderboard(r.data)).catch(() => { });
  fetchData();
}, [token]);

useEffect(() => { setActiveTopic(null); }, [activeSection, activeLevel]);

// 📈 Advanced Analytics & Heartbeat Log
useEffect(() => {
  if (activeSide === 'analytics') {
    axios.get(`${API}/auth/analytics/advanced?hours=${filterTime}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAdvancedStats(res.data))
      .catch(() => { });
  }
}, [activeSide, filterTime]);

useEffect(() => {
  const interval = setInterval(() => {
    if (document.hasFocus() && token) {
      axios.post(`${API}/auth/log`, {
        action: activeSide,
        category: activeSection || null,
        topic: activeTopic || null,
        duration: 60,
        detail: `User viewed ${activeSide}`
      }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => { });
    }
  }, 60000);
  return () => clearInterval(interval);
}, [activeSide, activeSection, activeTopic, token]);

useEffect(() => {
  if (activeTopic) {
    axios.get(`${API}/questions/count?topics=${activeTopic}`)
      .then(res => setModuleCount(res.data.count))
      .catch(() => setModuleCount(0));
  } else {
    setModuleCount(0);
  }
}, [activeTopic]);

const handleStartModule = async (modIndex) => {
  const isPractice = activeSide === 'practice';
  const mode = isPractice ? 'practice' : 'final';

  if (user && !isPractice) {
    const sub = user.subscription || { planType: 'attempts', maxAttempts: 2 };
    const isUnlimitedForThisTopic = sub.unlimitedExams && sub.unlimitedExams.includes(activeTopic);

    if (!isUnlimitedForThisTopic && sub.planType === 'time' && sub.validUntil && Date.now() > new Date(sub.validUntil).getTime()) {
      return setModal({ show: true, type: 'alert', title: 'Subscription Expired', message: `Your time subscription expired on ${new Date(sub.validUntil).toLocaleString()}. Please contact Admin.` });
    }
    if (!isUnlimitedForThisTopic && sub.planType === 'attempts' && submissions.length >= (sub.maxAttempts || 2)) {
      return setModal({ show: true, type: 'alert', title: 'Exam Limit Reached', message: `You reached the max limit (${sub.maxAttempts || 2}) for attempts.` });
    }
  }
  // We mark progress via POST API securely here before navigating
  try {
    await axios.post(`${API}/auth/progress`, {
      category: activeTab, section: activeSection, level: isPractice ? 'Easy' : activeLevel, topic: activeTopic, moduleIndex: modIndex
    }, { headers: { Authorization: `Bearer ${token}` } });
  } catch (e) { }
  const timerParam = isPractice && practiceTimer > 0 ? `&duration=${practiceTimer}` : '';
  navigate(`/user/exam?mode=${mode}&topics=${activeTopic}&page=${modIndex}${!isPractice ? `&difficulty=${activeLevel}` : ''}${timerParam}`);
};

const handleStartExam = (examKey) => {
  if (user) {
    const sub = user.subscription || { planType: 'attempts', maxAttempts: 2 };
    const isUnlimited = sub.unlimitedExams && sub.unlimitedExams.includes(examKey);

    if (!isUnlimited && sub.planType === 'time' && sub.validUntil && Date.now() > new Date(sub.validUntil).getTime()) {
      return setModal({ show: true, type: 'alert', title: 'Subscription Expired', message: `Your time subscription expired on ${new Date(sub.validUntil).toLocaleString()}. Please contact Admin.` });
    }
    if (!isUnlimited && sub.planType === 'attempts' && submissions.length >= (sub.maxAttempts || 2)) {
      return setModal({ show: true, type: 'alert', title: 'Exam Limit Reached', message: `You reached the max limit (${sub.maxAttempts || 2}) for attempts.` });
    }
  }
  navigate(`/user/exam?type=${examKey}`);
};

const handleDeleteAttempt = (attemptId) => {
  setModal({
    show: true, type: 'confirm', title: 'Delete Attempt', message: 'Are you sure you want to delete this attempt permanently?',
    onConfirm: async () => {
      try {
        const { data } = await axios.post(`${API}/auth/delete-attempt`, { attemptId }, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) {
          showToast('Attempt deleted successfully 🗑️');
          refreshUser();
          fetchData();
        }
      } catch (err) { 
        showToast('❌ Delete failed: ' + (err.response?.data?.error || err.message));
      }
    }
  });
};

const isCompleted = (modIndex) => {
  if (!user || !user.moduleProgress) return false;
  const prog = user.moduleProgress.find(p => p.category === activeTab && p.section === activeSection && p.level === activeLevel && p.topic === activeTopic);
  return prog && prog.completedModules && prog.completedModules.includes(modIndex);
};

const best = submissions.length ? Math.max(...submissions.map(a => a.pct)) : null;

return (
  <div className="screen active" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <div className="grid-bg"></div>

    <div style={{ display: 'flex', width: '100%', flex: 1, position: 'relative', marginTop: '64px' }}>

      {/* 🌿 Left Sidebar */}
      {sidebarOpen && (
        <div className="no-scrollbar" style={{ width: '280px', background: 'var(--glass)', backdropFilter: 'var(--blur)', borderRight: '1px solid var(--border)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', height: 'calc(100vh - 64px)', position: 'sticky', top: '64px', overflowY: 'auto' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 800, color: 'var(--muted)', letterSpacing: '2px', marginBottom: '16px', paddingLeft: '8px' }}>PORTALS</h3>
          {[
            { id: 'home', icon: '🏠', title: 'Home' },
            { id: 'dashboard', icon: '📊', title: 'Dashboard' },
            { id: 'analytics', icon: '📈', title: 'Analytics' },
            { id: 'topic-mastery', icon: '🎯', title: 'Topic Mastery' },
            { id: 'exams', icon: '🎓', title: 'Exams' },
            { id: 'practice', icon: '🛠️', title: 'Practice Mode' },
            { id: 'history', icon: '📜', title: 'Exam History' },
            { id: 'rewards', icon: '🎁', title: 'Daily Rewards' },
            { id: 'upgrade', icon: '👑', title: 'Go Premium' }
          ].map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveSide(item.id)}
              className={`stagger-item stagger-${idx + 1}`}
              style={{
                padding: '16px', borderRadius: '12px',
                background: activeSide === item.id ? 'rgba(0, 245, 212, 0.1)' : 'transparent',
                border: activeSide === item.id ? '1px solid var(--accent)' : '1px solid transparent',
                color: activeSide === item.id ? 'var(--accent)' : '#fff',
                cursor: 'pointer', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (activeSide !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (activeSide !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.title}
            </div>
          ))}
        </div>
      )}

      {/* 🌿 Right Panel */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', height: 'calc(100vh - 64px)', position: 'relative' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 9999, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)' }} title="Toggle Navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>


        {/* 🏠 Home Mode */}
        {activeSide === 'home' && (
          <div style={{ animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {/* 🌟 Welcome Banner */}
            <div className="stagger-item stagger-1" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(0,245,212,0.15) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(0,245,212,0.3)', borderRadius: '24px', padding: '40px', marginBottom: '32px', boxShadow: '0 20px 40px rgba(0,245,212,0.05)' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-block', background: user?.plan === 'premium' ? 'linear-gradient(90deg, #FDB931, #9f7928)' : 'rgba(255,255,255,0.1)', color: user?.plan === 'premium' ? '#000' : '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>{user?.plan === 'premium' ? '👑 Premium' : 'Default Access'}</div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>Welcome back, <span style={{ background: 'linear-gradient(90deg, #00f5d4, #00bbf9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || 'Explorer'}</span>! 👋</h1>
                <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '500px' }}>Explore courses, take exams, and measure your speed securely.</p>
              </div>
            </div>

            {/* 🚀 Launchpad Grid */}
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>🚀 Quick Launchpad</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div onClick={() => setActiveSide('exams')} className="cyber-card" style={{ background: 'linear-gradient(145deg, rgba(0,245,212,0.1), rgba(0,0,0,0.4))', border: '1px solid rgba(0,245,212,0.2)', borderRadius: '20px', padding: '32px', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎓</div>
                <h4 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Mock Examination</h4>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Take full-length tests and test your speed with real exam simulations.</p>
              </div>
              <div onClick={() => setActiveSide('practice')} className="cyber-card" style={{ background: 'linear-gradient(145deg, rgba(0,187,249,0.1), rgba(0,0,0,0.4))', border: '1px solid rgba(0,187,249,0.2)', borderRadius: '20px', padding: '32px', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛠️</div>
                <h4 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Practice Mode</h4>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Solve topic-wise questions with real-time feedback and stats percentages.</p>
              </div>
            </div>
          </div>
        )}

        <DashboardPortal 
          activeSide={activeSide} loading={loading} categoryStats={categoryStats} 
          advancedChartData={advancedChartData} highestScore={highestScore} 
          averageScore={averageScore} trendData={trendData} 
          submissions={submissions} overallAccuracy={overallAccuracy} 
          chartPeriod={chartPeriod} setChartPeriod={setChartPeriod} 
          setActiveSide={setActiveSide} user={user} 
          disabledTopics={disabledTopics}
          setActiveTopic={setActiveTopic}
        />

        <TopicMasteryPortal 
          activeSide={activeSide} topicFilter={topicFilter} setTopicFilter={setTopicFilter} 
          topicStats={topicStats} setActiveSide={setActiveSide} 
          setActiveSection={setActiveSection} setActiveTopic={setActiveTopic} 
          categoryMap={categoryMap} 
        />

        <AnalyticsPortal 
          activeSide={activeSide} filterTime={filterTime} setFilterTime={setFilterTime} 
          filterChart={filterChart} setFilterChart={setFilterChart} 
          trendData={trendData} advancedChartData={advancedChartData} 
          loading={loading} topicPerformanceData={topicPerformanceData} 
          catData={catData} overallAccuracy={overallAccuracy} 
        />
        {activeSide === 'practice' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ color: '#fff', marginBottom: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>🛠️ Practice Mode Playground</h2>

            {/* TOP TABS Filter Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', overflowX: 'auto' }} className="no-scrollbar">
              {TOP_TABS.map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setActiveSection(null); }} style={{
                  padding: '12px 24px', whiteSpace: 'nowrap', background: activeTab === tab ? 'var(--accent)' : 'rgba(0,0,0,0.3)',
                  color: activeTab === tab ? '#000' : 'var(--muted)', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px'
                }}>{tab}</button>
              ))}
            </div>

            {activeTab === 'Class Based' && !activeClass ? (
              <div>
                <h2 style={{ color: 'var(--text)', marginBottom: '24px' }}>📚 Class Hierarchy Selection</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  {['Class 1', 'Class 2 - 5', 'Class 6 - 8', 'Class 9', 'Class 10', 'Inter', 'Degree', 'PG', 'PhD'].map(c => (
                    <div key={c} onClick={() => setActiveClass(c)} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '20px 40px', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(0, 245, 212, 0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--glass)'; }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* If Class Based select state requires sections mapping, we need to map activeMap instead of CATEGORY_MAP */}

            {/* Section Picker */}
            {!activeSection && (activeTab !== 'Class Based' || activeClass) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {Object.keys(activeMap).map(sec => (
                  <div key={sec} onClick={() => setActiveSection(sec)} style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>{sec}</h3>
                    <p style={{ color: 'var(--accent)', fontSize: '12px', marginTop: '8px' }}>Select Topic →</p>
                  </div>
                ))}
              </div>
            )}

            {activeSection && (
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>📂 {activeSection} Explorer</h2>
                  <button onClick={() => { setActiveSection(null); setActiveTopic(null); }} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Back to Sections</button>
                </div>

                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '500px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>Select Topic</div>
                    {activeMap[activeSection] && activeMap[activeSection].map((t, idx) => (
                      <button key={`${t}-${idx}`} onClick={() => setActiveTopic(t)} style={{ padding: '12px 14px', textAlign: 'left', background: activeTopic === t ? 'rgba(0,245,212,0.1)' : 'transparent', color: activeTopic === t ? 'var(--accent)' : '#fff', border: activeTopic === t ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>{t}</button>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    {activeTopic ? (
                      <div>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>{activeTopic} (Practice Modules)</h3>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
                          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>⏱️ Practice Timer:</span>
                          <select value={practiceTimer} onChange={e => setPracticeTimer(parseInt(e.target.value))} style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border2)', borderRadius: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                            <option value={0}>Unlimited (∞)</option>
                            <option value={10}>10 Minutes</option>
                            <option value={20}>20 Minutes</option>
                            <option value={40}>40 Minutes</option>
                            <option value={60}>1 Hour</option>
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
                          {Array.from({ length: Math.ceil(moduleCount / 25) || 1 }).map((_, i) => (
                            <div key={i} onClick={() => handleStartModule(i + 1)} style={{ background: 'rgba(0,0,0,0.4)', border: isCompleted(i + 1) ? '1px solid var(--accent)' : '1px solid var(--border2)', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' }}>
                              <div style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>Module {i + 1}</div>
                              {isCompleted(i + 1) && <div style={{ fontSize: '20px', marginTop: '8px' }}>✅</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: '16px' }}>Select a topic on the left to load modules.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSide === 'exams' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ color: '#fff', marginBottom: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>🎓 Live Examinations Playground</h2>

            {/* 🎛️ Exam Sub-Tabs Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }} className="no-scrollbar">
              {['All', 'State', 'Central', 'IT', 'Banks', 'Companies'].map(tab => (
                <button key={tab} onClick={() => { setExamSubTab(tab); setExamSubCategory('All'); }} style={{ padding: '8px 16px', background: examSubTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: examSubTab === tab ? '#000' : '#fff', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* 🎛️ Level-2 Sub-Category Filters */}
            {examSubTab !== 'All' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }} className="no-scrollbar">
                {['All', ...([...(userExams.unattempted || []), ...(userExams.completed || [])].filter(e => e.category === examSubTab).map(e => e.subCategory).filter(Boolean).reduce((acc, curr) => acc.includes(curr) ? acc : [...acc, curr], []))].map(sub => (
                  <button key={sub} onClick={() => setExamSubCategory(sub)} style={{ padding: '6px 12px', background: examSubCategory === sub ? 'var(--accent2)' : 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    {sub}
                  </button>
                ))}
              </div>
            )}

            <h4 style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>🚀 Unattempted Exams</h4>
            {!(userExams.unattempted && userExams.unattempted.length > 0) ? (
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>No unattempted exams available right now.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {(userExams.unattempted || []).filter(e => (examSubTab === 'All' || e.category === examSubTab) && (examSubCategory === 'All' || e.subCategory === examSubCategory)).map(e => (
                  <div key={e._id} style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <h5 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: '0 0 8px 0' }}>{e.title}</h5>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>⏱️ {e.duration} Mins | 📂 {e.sections?.length || 0} Secs</div>
                    <button onClick={() => handleStartExam(e.key)} style={{ width: '100%', background: 'var(--accent)', color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>▶️ Start Exam</button>
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ color: 'var(--muted)', fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>✅ Completed Exams</h4>
            {!(userExams.completed && userExams.completed.length > 0) ? (
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No completed exams yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {(userExams.completed || []).filter(e => (examSubTab === 'All' || e.category === examSubTab) && (examSubCategory === 'All' || e.subCategory === examSubCategory)).map(e => {
                  const lastAttempt = submissions.find(s => s.examType === e.key);
                  return (
                    <div key={e._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '24px', opacity: 0.8 }}>
                      <h5 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0' }}>{e.title}</h5>
                      <button
                        onClick={() => {
                          if (lastAttempt) navigate('/user/results', { state: { attempt: lastAttempt, rank: 'N/A', totalUsers: '1000+' } });
                          else setActiveSide('history');
                        }}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                      >
                        📊 View Results
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSide === 'history' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ color: '#fff', marginBottom: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>📜 Exam Submission History</h2>

            {!submissions || submissions.length === 0 ? (
              <div style={{ background: 'var(--glass)', border: '1px dashed var(--border)', padding: '60px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                <h4 style={{ color: '#fff', marginBottom: '8px' }}>No attempts found.</h4>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Start an exam to build your performance history!</p>
              </div>
            ) : (
              <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <th style={{ padding: '20px' }}>Exam Title</th>
                      <th style={{ padding: '20px' }}>Date</th>
                      <th style={{ padding: '20px' }}>Score</th>
                      <th style={{ padding: '20px' }}>Time</th>
                      <th style={{ padding: '20px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#fff', fontSize: '14px' }}>
                    {[...submissions].map((sub, idx) => (
                      <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '20px', fontWeight: 700 }}>{sub.examType || 'Practice Session'}</td>
                        <td style={{ padding: '20px', color: 'var(--muted)' }}>{new Date(sub.date).toLocaleDateString()} {new Date(sub.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ color: sub.pct >= 60 ? '#00f5d4' : '#ff5252', fontWeight: 800 }}>{sub.score}/{sub.total} ({sub.pct}%)</span>
                        </td>
                        <td style={{ padding: '20px', color: 'var(--muted)' }}>{Math.floor(sub.timeUsed / 60)}m {sub.timeUsed % 60}s</td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => navigate('/user/results', { state: { attempt: sub, rank: 'N/A', totalUsers: '1000+' } })} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View Analysis</button>
                            <button onClick={() => handleDeleteAttempt(sub._id)} style={{ background: 'rgba(255, 82, 82, 0.1)', color: '#ff5252', border: '1px solid #ff5252', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 🌿 Right Panel — Portals Routing */}
        <RewardsPortal activeSide={activeSide} token={token} showToast={showToast} refreshUser={refreshUser} />
        <UpgradePortal activeSide={activeSide} token={token} showToast={showToast} refreshUser={refreshUser} user={user} />
        {modal.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ background: 'var(--glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{modal.type === 'confirm' ? '🤔' : '💡'}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>{modal.title || 'Notification'}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>{modal.message}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {modal.type === 'confirm' ? (
                  <>
                    <button onClick={() => { modal.onConfirm && modal.onConfirm(); }} style={{ flex: 1, background: 'var(--accent)', color: '#000', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Confirm</button>
                    <button onClick={() => setModal({ show: false, type: 'alert', title: '', message: '', onConfirm: null })} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setModal({ show: false, type: 'alert', title: '', message: '', onConfirm: null })} style={{ flex: 1, background: 'var(--accent)', color: '#000', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Dismiss</button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 🆘 Support Floating Widget */}
        <button 
          onClick={() => setShowSupport(true)}
          style={{ position: 'fixed', bottom: '32px', right: '32px', width: '64px', height: '64px', background: 'var(--accent)', color: '#000', borderRadius: '50%', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0, 245, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, transition: '0.3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
        >
          🆘
        </button>

        {showSupport && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', borderRadius: '24px', background: '#0b1221', border: '1px solid var(--border2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Report an Issue 🛡️</h2>
                <button onClick={() => setShowSupport(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>Describe the problem you're facing. Our technical team will resolve it within 24 hours.</p>
              <textarea 
                value={supportMsg}
                onChange={e => setSupportMsg(e.target.value)}
                placeholder="Type your message here..."
                style={{ width: '100%', minHeight: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border2)', borderRadius: '12px', color: '#fff', padding: '16px', fontSize: '14px', outline: 'none', marginBottom: '24px' }}
              />
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setShowSupport(false)} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSupportSubmit} disabled={isSendingSupport} style={{ flex: 1, padding: '14px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  {isSendingSupport ? 'Sending...' : 'Submit Report 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
