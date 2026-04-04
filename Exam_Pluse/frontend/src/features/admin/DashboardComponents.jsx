import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * 🎯 Radial Accuracy Matrix (Top Left)
 * Shows nested rings for Subject Accuracy
 */
export const AccuracyMatrix = ({ data }) => {
  const chartData = [
    { name: 'Aptitude', value: data?.aptitude || 0, fill: '#00f5d4' },
    { name: 'Reasoning', value: data?.reasoning || 0, fill: '#ec4899' },
    { name: 'Verbal', value: data?.verbal || 0, fill: '#8b5cf6' },
    { name: 'Technical', value: data?.technical || 0, fill: '#38bdf8' },
  ];

  return (
    <div className="glass-card" style={{ height: '280px', padding: '24px', borderRadius: '28px', position: 'relative' }}>
      <h3 className="dash-card-title" style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Accuracy Matrix</h3>
      <div className="radial-matrix-container" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="35%"
            outerRadius="105%"
            barSize={8}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 800 }}
              background={{ fill: 'rgba(255,255,255,0.03)' }}
              clockWise
              dataKey="value"
              cornerRadius={12}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="radial-legend">
          {chartData.map((item) => (
            <div key={item.name} className="legend-item" style={{ marginBottom: '8px' }}>
              <div className="legend-dot" style={{ backgroundColor: item.fill, boxShadow: `0 0 10px ${item.fill}` }}></div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '11px', width: '35px' }}>{item.value}%</span>
              <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 🕸️ Subject Mastery Radar (Middle Left)
 */
export const SubjectRadar = ({ data }) => {
  const radarData = data || [
    { subject: 'Aptitude', A: 80, fullMark: 100 },
    { subject: 'Reasoning', A: 70, fullMark: 100 },
    { subject: 'Verbal', A: 60, fullMark: 100 },
    { subject: 'Technical', A: 90, fullMark: 100 },
  ];

  return (
    <div className="dash-card reveal-item" style={{ minHeight: '260px', padding: '24px', animationDelay: '0.2s', borderRadius: '28px' }}>
      <h3 className="dash-card-title" style={{ fontSize: '11px', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>SUBJECT MASTERY</h3>
      <div style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} fontWeight={700} />
            <Radar
              name="Performance"
              dataKey="A"
              stroke="#00f5d4"
              fill="url(#radarGradient)"
              fillOpacity={0.5}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00bbf9" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 🚀 Metric Circle (Big Performance Rings)
 */
export const MetricCircle = ({ label, subLabel, value, color, brand = "CORE_ENGINE" }) => {
  const pieData = [
    { name: 'Completed', value: value },
    { name: 'Remaining', value: 100 - value },
  ];

  return (
    <div className="metric-circle-wrap" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px' }}>
      <div style={{ width: '80px', height: '80px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={38}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              <Cell fill={color} cornerRadius={8} />
              <Cell fill="rgba(255,255,255,0.03)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="circle-inner-label" style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: '11px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' 
        }}>
          {value}%
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: 900, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '9px', color: color, fontWeight: 800, letterSpacing: '2px', marginBottom: '6px' }}>{brand}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.4 }}>{subLabel}</div>
      </div>
    </div>
  );
};

/**
 * 📊 Strategic Roadmap (Right Side)
 */
export const StrategicRoadmap = ({ items }) => {
  const roadmapItems = items || [
    { title: "MATHEMATICS_CORE", mastery: 45, status: "CALIBRATING" },
    { title: "GENERAL_INTELLIGENCE", mastery: 30, status: "OPTIMIZING" },
    { title: "VERBAL_REASONING", mastery: 85, status: "NOMINAL" },
    { title: "QUANTITATIVE_ANALYSIS", mastery: 20, status: "CRITICAL" },
  ];

  return (
    <div className="glass-card" style={{ padding: '32px', borderRadius: '28px' }}>
      <h3 className="dash-card-title" style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>Strategic Roadmap</h3>
      <div className="roadmap-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {roadmapItems.map((item, idx) => (
          <div key={idx} className="roadmap-card" style={{ 
            background: 'rgba(255,255,255,0.01)', 
            border: '1px solid rgba(255,255,255,0.03)', 
            padding: '16px', 
            borderRadius: '16px' 
          }}>
            <div className="roadmap-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>{item.title}</span>
              <span style={{ 
                fontSize: '9px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px',
                background: item.status === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 245, 212, 0.1)',
                color: item.status === 'CRITICAL' ? '#ef4444' : '#00f5d4',
                border: item.status === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(0, 245, 212, 0.2)'
              }}>{item.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
               <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>MASTERY_LEVEL</span>
               <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{item.mastery}%</span>
            </div>
            <div className="mastery-progress-bg" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${item.mastery}%`, 
                height: '100%', 
                background: item.mastery > 70 ? '#00f5d4' : (item.mastery > 40 ? '#f59e0b' : '#ef4444'),
                boxShadow: `0 0 10px ${item.mastery > 70 ? '#00f5d433' : '#ef444433'}`
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ⚡ Stat Mini Block
 */
export const StatMiniCard = ({ label, value, sub }) => (
  <div className="glass-card" style={{ 
    display: 'flex', flexDirection: 'column', 
    padding: '24px 32px', 
    borderRadius: '24px',
  }}>
    <div className="stat-mini-label" style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
    <div className="stat-mini-val" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', margin: '4px 0' }}>{value}</div>
    <div className="stat-mini-sub" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>{sub}</div>
  </div>
);
