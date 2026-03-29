const fs = require('fs');

const file = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/admin/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = `{/* ════════ DASHBOARD VIEW ════════ */}`;
const endStr = `{/* ════════ PENDING APPROVALS ════════ */}`;
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found!');
  process.exit(1);
}

const newDashboardCode = `          {/* ════════ DASHBOARD VIEW ════════ */}
          {activeView === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.5s', background: '#0b1221', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
              
              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) minmax(400px, 2fr) minmax(250px, 1fr)', gap: '20px' }}>
                
                {/* ── LEFT COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Category Distribution */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Question Bank Distribution</h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '180px' }}>
                      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={60} outerRadius={70} fill="#0ea5e9" opacity={0.2} stroke="none" isAnimationActive={false} />
                             <Pie data={[{v:40}, {v:60}]} dataKey="v" cx="50%" cy="50%" innerRadius={60} outerRadius={70} stroke="none" cornerRadius={4}>
                               <Cell fill="#0ea5e9" />
                               <Cell fill="transparent" />
                             </Pie>
                             <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={45} outerRadius={55} fill="#34d399" opacity={0.2} stroke="none" isAnimationActive={false} />
                             <Pie data={[{v:35}, {v:65}]} dataKey="v" cx="50%" cy="50%" innerRadius={45} outerRadius={55} stroke="none" cornerRadius={4}>
                               <Cell fill="#34d399" />
                               <Cell fill="transparent" />
                             </Pie>
                             <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={30} outerRadius={40} fill="#facc15" opacity={0.2} stroke="none" isAnimationActive={false} />
                             <Pie data={[{v:25}, {v:75}]} dataKey="v" cx="50%" cy="50%" innerRadius={30} outerRadius={40} stroke="none" cornerRadius={4}>
                               <Cell fill="#facc15" />
                               <Cell fill="transparent" />
                             </Pie>
                           </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#0ea5e9', fontWeight: 700, width: '32px' }}>40%</span><span>Aptitude & Math</span></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#34d399', fontWeight: 700, width: '32px' }}>35%</span><span>Reasoning Skills</span></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#facc15', fontWeight: 700, width: '32px' }}>25%</span><span>Verbal & Tech</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Skills (Radar) */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Student Strengths Matrix</h3>
                    <div style={{ height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={70} data={[
                          { subject: 'Aptitude', A: 120, B: 110, fullMark: 150 },
                          { subject: 'Reasoning', A: 98, B: 130, fullMark: 150 },
                          { subject: 'Verbal', A: 86, B: 130, fullMark: 150 },
                          { subject: 'Coding', A: 99, B: 100, fullMark: 150 },
                          { subject: 'Core IT', A: 85, B: 90, fullMark: 150 },
                          { subject: 'Logic', A: 65, B: 85, fullMark: 150 },
                        ]}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Radar name="Platform Avg" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                          <Radar name="Top 10% Avg" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Daily Traffic (Bar) */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Daily Registrations</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.timeline && analytics.timeline.length > 0 ? analytics.timeline.slice(-7).map(t => ({ day: t.date.split('-')[2], uv: t.registrations })) : [
                          { day: 'Mon', uv: 30 }, { day: 'Tue', uv: 15 }, { day: 'Wed', uv: 22 },
                          { day: 'Thu', uv: 12 }, { day: 'Fri', uv: 18 }, { day: 'Sat', uv: 28 }, { day: 'Sun', uv: 23 }
                        ]} margin={{ left: -25, bottom: 0 }}>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                          <Bar dataKey="uv" name="New Signups" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* ── CENTER COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Exam vs Signups Traffic */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 12px 0' }}>Exams Conducted & Signups Trend</h3>
                        <div style={{ display: 'flex', gap: '40px' }}>
                          <div>
                            <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {stats.totalUsers || 0} <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Active</span>
                            </div>
                            <div style={{ color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#10b981'}}></div>Total Users</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {stats.totalAttempts || 0}   <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Growing ↑</span>
                            </div>
                            <div style={{ color: '#f59e0b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#f59e0b'}}></div>Total Exams</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-start' }}>
                         <select value={daysFilter} onChange={e => setDaysFilter(e.target.value)} style={{ padding: '6px 16px', fontSize: '12px', background: '#1e293b', color: '#fff', borderRadius: '6px', cursor: 'pointer', textAlign: 'center', border: 'none', outline: 'none' }}>
                            <option value="7">7 Days</option>
                            <option value="30">30 Days</option>
                            <option value="90">Quarter</option>
                         </select>
                      </div>
                    </div>

                    <div style={{ height: '300px', flex: 1 }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={analytics.timeline || []} margin={{ left: -20, bottom: 0, right: 0, top: 20 }}>
                           <defs>
                             <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                           <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d?.split('-').slice(1).join('/')} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                           <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                           <Area type="monotone" dataKey="attempts" name="Exams" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAttempts)" />
                           <Area type="monotone" dataKey="registrations" name="Signups" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Multi-Stats Row (Bottom Center) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                    {[
                      { no: 'Exams DB', val: stats.totalQuestions || 0, sub: 'Total Questions' },
                      { no: 'Approvals', val: stats.pending || 0, sub: 'Pending Review' },
                      { no: 'Students', val: stats.approved || 0, sub: 'Active Subs' },
                      { no: 'Sessions', val: stats.activeUsers || 0, sub: 'Online Now' },
                      { no: 'System', val: fps + ' fps', sub: 'Monitoring...' }
                    ].map(s => (
                      <div key={s.no} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', textAlign: 'left', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.no}</div>
                        <div style={{ fontSize: '20px', color: '#fff', fontWeight: 300 }}>{s.val}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Submission Success/Fail (Bottom Center) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {(() => {
                       const pi = analytics.pie || [];
                       const totalPi = pi.reduce((a, b) => a + b.value, 0) || 1;
                       const vApp = (pi.find(p => p.name === 'Approved') || {value:0}).value;
                       const vRej = (pi.find(p => p.name === 'Rejected') || {value:0}).value;
                       const vPen = (pi.find(p => p.name === 'Pending') || {value:0}).value;

                       return [
                        { title: 'Approved', pct: Math.round((vApp / totalPi)*100), color: '#3b82f6', info: 'Platform Access Granted' },
                        { title: 'Rejected', pct: Math.round((vRej / totalPi)*100), color: '#ef4444', info: 'Invalid Payment/Details' },
                        { title: 'Processing', pct: Math.round((vPen / totalPi)*100), color: '#eab308', info: 'Awaiting Verification' }
                      ].map(d => (
                        <div key={d.title} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <ResponsiveContainer width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                               <PieChart>
                                 <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={48} outerRadius={58} fill={d.color} opacity={0.2} stroke="none" isAnimationActive={false} />
                                 <Pie data={[{v:d.pct}, {v:100-d.pct}]} dataKey="v" cx="50%" cy="50%" innerRadius={48} outerRadius={58} stroke="none" cornerRadius={4} startAngle={90} endAngle={-270}>
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
                            TCS NQT Gateway<br/>{d.info}<br/>Admin Queue
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top Right Header Card */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                      <span>System Status</span>
                      <span>{new Date().toISOString().split('T')[0]}</span>
                    </div>
                    <div style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '12px', marginTop: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Operations Control</div>
                      <div style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.5px' }}>TCS NQT 2026<br/>Live Database</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>Interface: Admin Console</div>
                    </div>
                  </div>

                  {/* Application Status (Donut) */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', height: '260px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0' }}>Plan Subscriptions</h3>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={[
                              { name: 'Basic Free', value: 30, color: '#6366f1' },
                              { name: '1 Month Pro', value: 40, color: '#3b82f6' },
                              { name: 'Exam Token', value: 20, color: '#34d399' },
                              { name: 'Enterprise', value: 10, color: '#f59e0b' },
                            ]} 
                            cx="50%" cy="50%" innerRadius={50} outerRadius={70} 
                            dataKey="value" stroke="none"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index, name }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = innerRadius + (outerRadius - innerRadius) + 20;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);
                              return (
                                <text x={x} y={y} fill="#94a3b8" fontSize={11} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                  {name}
                                </text>
                              );
                            }}
                          >
                            {
                              [
                                { name: 'Basic', color: '#6366f1' },
                                { name: 'Pro', color: '#3b82f6' },
                                { name: 'Tokens', color: '#34d399' },
                                { name: 'Company', color: '#f59e0b' }
                              ].map((entry, index) => <Cell key={\`cell-\${index}\`} fill={entry.color} />)
                            }
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Popular Exams */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 24px 0' }}>Top Performing Categories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {analytics.examBreakdown && analytics.examBreakdown.length > 0 ? analytics.examBreakdown.slice(0, 5).map(item => (
                        <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                            <span style={{ color: '#fff' }}>{item.accuracy}% Avg</span>
                          </div>
                          <div style={{ height: '14px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: \`\${item.accuracy}%\`, height: '100%', background: '#38bdf8' }}></div>
                          </div>
                        </div>
                      )) : [
                        { name: 'Quantitative Aptitude', val: 50, pct: '80%' },
                        { name: 'Logical Reasoning', val: 40, pct: '65%' },
                        { name: 'Verbal Ability', val: 36, pct: '50%' },
                        { name: 'Technical Programming', val: 30, pct: '40%' }
                      ].map(item => (
                        <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                            <span>{item.name}</span>
                            <span style={{ color: '#fff' }}>{item.pct}</span>
                          </div>
                          <div style={{ height: '14px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: item.pct, height: '100%', background: '#38bdf8' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
`;

content = content.substring(0, startIdx) + newDashboardCode + content.substring(endIdx);
fs.writeFileSync(file, content);
console.log('Successfully updated AdminDashboard.jsx');
