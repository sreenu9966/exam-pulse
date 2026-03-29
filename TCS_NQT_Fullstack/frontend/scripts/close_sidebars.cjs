const fs = require('fs');

// =========== ADMIN DASHBOARD ============
const adminFile = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/admin/AdminDashboard.jsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');

// 1. Add state variable
if (!adminContent.includes('sidebarOpen')) {
  adminContent = adminContent.replace(
    /const \[activeCategory, setActiveCategory\] = useState\('Aptitude'\);/,
    `const [activeCategory, setActiveCategory] = useState('Aptitude');\n  const [sidebarOpen, setSidebarOpen] = useState(false);`
  );
}

// 2. Wrap Sidebar
const adminSidebarMatch = adminContent.match(/{\/\* ── SIDEBAR ── \*\/}[\s\S]*?(?={\/\* ── CONTENT AREA ── \*\/})/);
if (adminSidebarMatch && !adminSidebarMatch[0].includes('sidebarOpen &&')) {
   const originalSidebar = adminSidebarMatch[0];
   const wrappedSidebar = `{/* ── SIDEBAR ── */}\n        {sidebarOpen && (\n  ` + originalSidebar.replace(/{\/\* ── SIDEBAR ── \*\/}\n/, '').trimEnd() + `\n        )}\n\n        `;
   adminContent = adminContent.replace(originalSidebar, wrappedSidebar);
}

// 3. Add Hamburger to Header
if (!adminContent.includes('setSidebarOpen(!sidebarOpen)')) {
  const headerTarget = `<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>`;
  const hamburgerCode = `<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>\n            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>`;
  adminContent = adminContent.replace(headerTarget, hamburgerCode);
}

fs.writeFileSync(adminFile, adminContent);
console.log('AdminDashboard updated');

// =========== HOME PAGE ============
const homeFile = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/pages/HomePage.jsx';
let homeContent = fs.readFileSync(homeFile, 'utf8');

if (!homeContent.includes('sidebarOpen')) {
  homeContent = homeContent.replace(
    /const \[activeSide, setActiveSide\] = useState\('home'\);/,
    `const [activeSide, setActiveSide] = useState('home');\n  const [sidebarOpen, setSidebarOpen] = useState(false);`
  );
}

const homeSidebarMatch = homeContent.match(/{\/\* 🌿 Left Sidebar \*\/}[\s\S]*?(?={\/\* 🌿 Right Panel \*\/})/);
if (homeSidebarMatch && !homeSidebarMatch[0].includes('sidebarOpen &&')) {
  const originalHomeSidebar = homeSidebarMatch[0];
  const wrappedHomeSidebar = `{/* 🌿 Left Sidebar */}\n        {sidebarOpen && (\n  ` + originalHomeSidebar.replace(/{\/\* 🌿 Left Sidebar \*\/}\n/, '').trimEnd() + `\n        )}\n\n        `;
  homeContent = homeContent.replace(originalHomeSidebar, wrappedHomeSidebar);
}

// For home page, we can inject a floating hamburger button if there's no clear header inside the layout, 
// or put it at the top of the right panel. Let's put it as a floating fixed button so it's always accessible.
if (!homeContent.includes('setSidebarOpen(!sidebarOpen)')) {
  const rightPanelStart = `{/* 🌿 Right Panel */}\n        <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>`;
  const floatingHamburger = `{/* 🌿 Right Panel */}\n        <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', height: 'calc(100vh - 64px)', position: 'relative' }}>\n          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 9999, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', color: '#fff', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)' }} title="Toggle Navigation">☰</button>\n`;
  homeContent = homeContent.replace(rightPanelStart, floatingHamburger);
}

fs.writeFileSync(homeFile, homeContent);
console.log('HomePage updated');
