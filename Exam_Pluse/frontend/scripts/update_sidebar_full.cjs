const fs = require('fs');

const toggleSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;

// =========== ADMIN DASHBOARD ============
const adminFile = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/admin/AdminDashboard.jsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');

// Replace Hamburger with Toggle Icon
adminContent = adminContent.replace(
  /<button onClick=\{\(\) => setSidebarOpen\(!sidebarOpen\)\}[\s\S]*?<\/button>/,
  `<button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Toggle Sidebar">\n              ${toggleSvg}\n            </button>`
);

// Replace Sidebar content to include Text & Full width
const adminSidebarMatch = adminContent.match(/{\/\* ── SIDEBAR ── \*\/}[\s\S]*?(?={\/\* ── CONTENT AREA ── \*\/})/);
if (adminSidebarMatch) {
  const newAdminSidebar = `{/* ── SIDEBAR ── */}\n        {sidebarOpen && (\n` +
`        <aside className="no-scrollbar" style={{ width: '280px', transition: 'width 0.3s', background: 'var(--glass)', backdropFilter: 'var(--blur)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '24px 16px', gap: '8px', zIndex: 10, overflowY: 'auto' }}>
          
          {activeView !== 'questions' ? (
            <>
              <div style={{ padding: '0 8px', marginBottom: '16px', color: 'var(--muted)', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Main Menu</div>
              {[
                { key: 'dashboard', icon: '📊', label: 'Dashboard' },
                { key: 'pending', icon: '⏳', label: 'Pending Access' },
                { key: 'users', icon: '👥', label: 'Users' },
                { key: 'exams', icon: '📝', label: 'Exams Config' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px',
                    borderRadius: '12px', border: activeView === item.key ? '1px solid var(--accent)' : '1px solid transparent',
                    background: activeView === item.key ? 'rgba(0,245,212,0.1)' : 'transparent',
                    color: activeView === item.key ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={e => { if (activeView !== item.key) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}}
                  onMouseLeave={e => { if (activeView !== item.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '16px 0' }} />

              <button onClick={() => { setActiveView('questions'); setQFilter('All'); setActiveCategory('Aptitude'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px',
                    borderRadius: '12px', border: activeView === 'questions' ? '1px solid var(--accent)' : '1px solid transparent',
                    background: activeView === 'questions' ? 'rgba(0,245,212,0.1)' : 'transparent',
                    color: activeView === 'questions' ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={e => { if (activeView !== 'questions') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}}
                  onMouseLeave={e => { if (activeView !== 'questions') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
              >
                  <span style={{ fontSize: '20px' }}>📁</span>
                  Question Bank
              </button>
            </>
          ) : (
            <>
               <button onClick={() => { setActiveView('dashboard'); setQFilter('All'); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', fontSize: '13px', fontWeight: 600, marginBottom: '16px', transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                ← Back to Menu
              </button>

              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', padding: '8px 14px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Question Bank</div>
              
              {['Aptitude', 'Reasoning', 'Verbal', 'Technical', ...(sections.some(s => !Object.values(CATEGORY_MAP).flat().includes(s)) ? ['Other'] : [])].map(cat => {
                const isExpanded = activeCategory === cat;
                const topics = sections.filter(s => {
                  const list = CATEGORY_MAP[cat] || [];
                  return list.includes(s) || (cat === 'Other' && !Object.values(CATEGORY_MAP).flat().includes(s));
                });

                return (
                  <div key={cat} style={{ marginBottom: '6px' }}>
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

        </aside>\n        )}\n\n        `;
  adminContent = adminContent.replace(adminSidebarMatch[0], newAdminSidebar);
}

fs.writeFileSync(adminFile, adminContent);
console.log('AdminDashboard sidebar updated with full options and new toggle icon!');


// =========== HOME PAGE ============
const homeFile = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/pages/HomePage.jsx';
let homeContent = fs.readFileSync(homeFile, 'utf8');

// Replace Floating Hamburger with Toggle Icon
homeContent = homeContent.replace(
  /<button onClick=\{\(\) => setSidebarOpen\(!sidebarOpen\)\}[\s\S]*?<\/button>/,
  `<button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 9999, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)' }} title="Toggle Navigation">\n            ${toggleSvg}\n          </button>`
);

// Replace Sidebar content to include Text & Full width
const homeSidebarMatch = homeContent.match(/{\/\* 🌿 Left Sidebar \*\/}[\s\S]*?(?={\/\* 🌿 Right Panel \*\/})/);
if (homeSidebarMatch) {
  const newHomeSidebar = `{/* 🌿 Left Sidebar */}\n        {sidebarOpen && (\n` +
`        <div className="no-scrollbar" style={{ width: '280px', background: 'var(--glass)', backdropFilter: 'var(--blur)', borderRight: '1px solid var(--border)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', height: 'calc(100vh - 64px)', position: 'sticky', top: '64px', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 800, color: 'var(--muted)', letterSpacing: '2px', marginBottom: '16px', paddingLeft: '8px' }}>PORTALS</h3>
            {[
              { id: 'home', icon: '🏠', title: 'Home' },
              { id: 'dashboard', icon: '📊', title: 'Dashboard' },
              { id: 'analytics', icon: '📈', title: 'Analytics' },
              { id: 'exams', icon: '🎓', title: 'Exams' },
              { id: 'practice', icon: '🛠️', title: 'Practice Mode' }
            ].map(item => (
              <div key={item.id} onClick={() => setActiveSide(item.id)} style={{ padding: '16px', borderRadius: '12px', background: activeSide === item.id ? 'rgba(0, 245, 212, 0.1)' : 'transparent', border: activeSide === item.id ? '1px solid var(--accent)' : '1px solid transparent', color: activeSide === item.id ? 'var(--accent)' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }} onMouseEnter={e => { if (activeSide !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }} onMouseLeave={e => { if (activeSide !== item.id) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.title}
              </div>
            ))}
        </div>\n        )}\n\n        `;
   homeContent = homeContent.replace(homeSidebarMatch[0], newHomeSidebar);
}

fs.writeFileSync(homeFile, homeContent);
console.log('HomePage sidebar updated with full options and new toggle icon!');
