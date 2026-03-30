const fs = require('fs');

// ------------- HOME PAGE SIDEBAR -------------------
const homeFile = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/pages/HomePage.jsx';
let homeContent = fs.readFileSync(homeFile, 'utf8');

const homeStart = `{/* 🌿 Left Sidebar */}`;
const homeEnd = `{/* 🌿 Right Panel */}`;
const homeStartIdx = homeContent.indexOf(homeStart);
const homeEndIdx = homeContent.indexOf(homeEnd);

if (homeStartIdx !== -1 && homeEndIdx !== -1) {
  const newHomeSidebar = `{/* 🌿 Left Sidebar */}\n` +
  `        <div className="no-scrollbar" style={{ width: '90px', background: 'var(--glass)', backdropFilter: 'var(--blur)', borderRight: '1px solid var(--border)', padding: '32px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', height: 'calc(100vh - 64px)', position: 'sticky', top: '64px' }}>` +
  `\n            {[
              { id: 'home', icon: '🏠', title: 'Home' },
              { id: 'dashboard', icon: '📊', title: 'Dashboard' },
              { id: 'analytics', icon: '📈', title: 'Analytics' },
              { id: 'exams', icon: '🎓', title: 'Exams' },
              { id: 'practice', icon: '🛠️', title: 'Practice Mode' }
            ].map(item => (
              <div key={item.id} onClick={() => setActiveSide(item.id)} title={item.title} style={{ width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', borderRadius: '16px', background: activeSide === item.id ? 'rgba(0, 245, 212, 0.15)' : 'transparent', border: activeSide === item.id ? '1px solid var(--accent)' : '1px solid transparent', color: activeSide === item.id ? 'var(--accent)' : '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: activeSide === item.id ? '0 8px 20px rgba(0, 245, 212, 0.2)' : 'none' }}>
                {item.icon}
              </div>
            ))}
        </div>\n\n        `;
        
   homeContent = homeContent.substring(0, homeStartIdx) + newHomeSidebar + homeContent.substring(homeEndIdx);
   fs.writeFileSync(homeFile, homeContent);
   console.log('HomePage sidebar updated!');
}

// ------------- ADMIN DASHBOARD SIDEBAR -------------------
const adminFile = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/admin/AdminDashboard.jsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');

const adminStart = `{/* ── SIDEBAR ── */}`;
const adminEnd = `{/* ── CONTENT AREA ── */}`;
const adminStartIdx = adminContent.indexOf(adminStart);
const adminEndIdx = adminContent.indexOf(adminEnd);

if (adminStartIdx !== -1 && adminEndIdx !== -1) {
  const newAdminSidebar = `{/* ── SIDEBAR ── */}\n` +
  `        <aside className="no-scrollbar" style={{ width: activeView === 'questions' ? '280px' : '90px', transition: 'width 0.3s', background: 'var(--glass)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: activeView === 'questions' ? 'stretch' : 'center', padding: activeView === 'questions' ? '24px 16px' : '32px 12px', gap: activeView === 'questions' ? '8px' : '20px', zIndex: 10, overflowY: 'auto' }}>
          
          {activeView !== 'questions' ? (
            <>
              {[
                { key: 'dashboard', icon: '📊', label: 'Dashboard' },
                { key: 'pending', icon: '⏳', label: 'Pending Access' },
                { key: 'users', icon: '👥', label: 'Users' },
                { key: 'exams', icon: '📝', label: 'Exams Config' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  title={item.label}
                  style={{
                    width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    borderRadius: '16px', border: activeView === item.key ? '1px solid var(--accent)' : '1px solid transparent',
                    background: activeView === item.key ? 'rgba(0,245,212,0.15)' : 'transparent',
                    color: activeView === item.key ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '28px', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0,
                    boxShadow: activeView === item.key ? '0 8px 20px rgba(0, 245, 212, 0.2)' : 'none'
                  }}
                  onMouseEnter={e => { if (activeView !== item.key) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}}
                  onMouseLeave={e => { if (activeView !== item.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
                >
                  {item.icon}
                </button>
              ))}

              <div style={{ width: '40px', height: '1px', background: 'var(--border)', margin: '8px 0', flexShrink: 0 }} />

              <button onClick={() => { setActiveView('questions'); setQFilter('All'); setActiveCategory('Aptitude'); }}
                  title="Question Bank"
                  style={{
                    width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    borderRadius: '16px', border: activeView === 'questions' ? '1px solid var(--accent)' : '1px solid transparent',
                    background: activeView === 'questions' ? 'rgba(0,245,212,0.15)' : 'transparent',
                    color: activeView === 'questions' ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '28px', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0
                  }}
                  onMouseEnter={e => { if (activeView !== 'questions') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}}
                  onMouseLeave={e => { if (activeView !== 'questions') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
              >
                  📁
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setActiveView('dashboard'); setQFilter('All'); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', fontSize: '13px', fontWeight: 600, marginBottom: '16px', transition: 'all 0.2s', flexShrink: 0
              }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                ← Back to Menu
              </button>

              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', padding: '8px 14px', marginBottom: '8px', fontFamily: 'var(--font-heading)', flexShrink: 0 }}>Question Bank</div>
              
              {['Aptitude', 'Reasoning', 'Verbal', 'Technical', ...(sections.some(s => !Object.values(CATEGORY_MAP).flat().includes(s)) ? ['Other'] : [])].map(cat => {
                const isExpanded = activeCategory === cat;
                const topics = sections.filter(s => {
                  const list = CATEGORY_MAP[cat] || [];
                  return list.includes(s) || (cat === 'Other' && !Object.values(CATEGORY_MAP).flat().includes(s));
                });

                return (
                  <div key={cat} style={{ marginBottom: '6px', flexShrink: 0 }}>
                    <button onClick={() => setActiveCategory(cat)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: isExpanded ? 'rgba(0,245,212,0.08)' : 'transparent',
                      color: isExpanded ? 'var(--accent)' : 'var(--muted)',
                      fontSize: '14px', fontWeight: 600, textAlign: 'left', transition: 'all 0.2s'
                    }}>
                      <span>{cat}</span>
                      <span style={{ fontSize: '10px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </button>

                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '12px', marginTop: '4px', borderLeft: '1px solid var(--border)', marginLeft: '8px' }}>
                        <button onClick={() => setQFilter('All')} style={{
                          padding: '6px 10px', fontSize: '12px', background: qFilter === 'All' ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: qFilter === 'All' ? 'var(--text)' : 'var(--muted2)', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: qFilter === 'All' ? 700 : 500, fontFamily: 'var(--font-body)'
                        }}>All Options</button>
                        {topics.map(t => (
                          <button key={t} onClick={() => setQFilter(t)} style={{
                            padding: '6px 10px', fontSize: '12px', background: qFilter === t ? 'rgba(0,245,212,0.1)' : 'transparent',
                            color: qFilter === t ? 'var(--accent2)' : 'var(--muted2)', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: qFilter === t ? 700 : 500,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-body)'
                          }} title={t}>{t}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

        </aside>\n\n        `;
        
   adminContent = adminContent.substring(0, adminStartIdx) + newAdminSidebar + adminContent.substring(adminEndIdx);
   fs.writeFileSync(adminFile, adminContent);
   console.log('AdminDashboard sidebar updated!');
}
