const fs = require('fs');

const file = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/client/src/pages/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = `{activeSide === 'dashboard' && (`;
const endStr = `{activeSide === 'practice' && (`;
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found!');
  process.exit(1);
}

const newDashboardCode = `{activeSide === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.5s', background: '#0b1221', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
              
              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) minmax(400px, 2fr) minmax(250px, 1fr)', gap: '20px' }}>
                
                {/* ── LEFT COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Category Distribution */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Overall Accuracy Matrix</h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '180px' }}>
                      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={60} outerRadius={70} fill="#0ea5e9" opacity={0.2} stroke="none" isAnimationActive={false} />
                             <Pie data={[{v:categoryStats.Aptitude || 68}, {v:100-(categoryStats.Aptitude||68)}]} dataKey="v" cx="50%" cy="50%" innerRadius={60} outerRadius={70} stroke="none" cornerRadius={4}>
                               <Cell fill="#0ea5e9" />
                               <Cell fill="transparent" />
                             </Pie>
                             <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={45} outerRadius={55} fill="#34d399" opacity={0.2} stroke="none" isAnimationActive={false} />
                             <Pie data={[{v:categoryStats.Reasoning || 45}, {v:100-(categoryStats.Reasoning||45)}]} dataKey="v" cx="50%" cy="50%" innerRadius={45} outerRadius={55} stroke="none" cornerRadius={4}>
                               <Cell fill="#34d399" />
                               <Cell fill="transparent" />
                             </Pie>
                             <Pie data={[{v:100}]} cx="50%" cy="50%" innerRadius={30} outerRadius={40} fill="#facc15" opacity={0.2} stroke="none" isAnimationActive={false} />
                             <Pie data={[{v:categoryStats.Verbal || 70}, {v:100-(categoryStats.Verbal||70)}]} dataKey="v" cx="50%" cy="50%" innerRadius={30} outerRadius={40} stroke="none" cornerRadius={4}>
                               <Cell fill="#facc15" />
                               <Cell fill="transparent" />
                             </Pie>
                           </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#0ea5e9', fontWeight: 700, width: '32px' }}>{categoryStats.Aptitude || 68}%</span><span>Aptitude</span></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#34d399', fontWeight: 700, width: '32px' }}>{categoryStats.Reasoning || 45}%</span><span>Reasoning</span></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#facc15', fontWeight: 700, width: '32px' }}>{categoryStats.Verbal || 70}%</span><span>Verbal Skill</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Skills (Radar) */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Subject Mastery (vs Cohort)</h3>
                    <div style={{ height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={70} data={[
                          { subject: 'Aptitude', A: categoryStats.Aptitude||75, B: 65, fullMark: 100 },
                          { subject: 'Reasoning', A: categoryStats.Reasoning||80, B: 60, fullMark: 100 },
                          { subject: 'Verbal', A: categoryStats.Verbal||60, B: 75, fullMark: 100 },
                          { subject: 'Coding', A: categoryStats.Technical||90, B: 70, fullMark: 100 },
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

                  {/* Time Spent (Bar) */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>Recent Activity (Mins)</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={advancedChartData || [
                          { day: 'Mon', uv: 30 }, { day: 'Tue', uv: 45 }, { day: 'Wed', uv: 20 },
                          { day: 'Thu', uv: 60 }, { day: 'Fri', uv: 80 }, { day: 'Sat', uv: 120 }, { day: 'Sun', uv: 90 }
                        ]} margin={{ left: -25, bottom: 0 }}>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                          <Bar dataKey="uv" name="Mins Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* ── CENTER COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Score Progression */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 12px 0' }}>Performance Progression</h3>
                        <div style={{ display: 'flex', gap: '40px' }}>
                          <div>
                            <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {highestScore} <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Highest</span>
                            </div>
                            <div style={{ color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#10b981'}}></div>Best Score</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {averageScore} <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Average</span>
                            </div>
                            <div style={{ color: '#f59e0b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#f59e0b'}}></div>Average Score</div>
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
                               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorI" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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

                  {/* Multi-Stats Row (Bottom Center) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                    {[
                      { no: 'Total Exams', val: totalAttempts || 0, sub: 'Attempted' },
                      { no: 'Total Time', val: \`\${Math.floor((totalTime||0)/60)}h \${(totalTime||0)%60}m\`, sub: 'Spent Testing' },
                      { no: 'XP Points', val: userPoints || 0, sub: 'Earned' },
                      { no: 'Pass Rate', val: overallAccuracy + '%', sub: 'Consistent' },
                      { no: 'National Rank', val: 'Top 12%', sub: 'Estimated' }
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
                        const acc = overallAccuracy || 0;
                        const timeEff = 85; // mock time efficiency
                        const com = totalAttempts > 0 ? 95 : 0; // mock completion rate
                        
                       return [
                        { title: 'Accuracy', pct: acc, color: '#3b82f6', info: 'Overall Response Accuracy' },
                        { title: 'Speed', pct: timeEff, color: '#f59e0b', info: 'Time Efficiency Ratio' },
                        { title: 'Completed', pct: com, color: '#10b981', info: 'Syllabus Completion Index' }
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
                            BITMCQS Engine<br/>{d.info}<br/>Performance Profile
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
                      <span>Student ID</span>
                      <span>{user?.uid?.substring(0,8) || 'N/A'}</span>
                    </div>
                    <div style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '12px', marginTop: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>TCS NQT Preparation</div>
                      <div style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.5px' }}>{user?.displayName || 'Student'}<br/>Candidate</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>Batch: 2026 Graduating</div>
                    </div>
                  </div>

                  {/* Application Status (Donut) */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', height: '260px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 16px 0' }}>Module Completion</h3>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={[
                              { name: 'Completed', value: 30, color: '#6366f1' },
                              { name: 'In Progress', value: 40, color: '#3b82f6' },
                              { name: 'To View', value: 20, color: '#34d399' },
                              { name: 'Skipped', value: 10, color: '#f59e0b' },
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
                                { name: 'Done', color: '#6366f1' },
                                { name: 'Working', color: '#3b82f6' },
                                { name: 'Pending', color: '#34d399' },
                                { name: 'Passed', color: '#f59e0b' }
                              ].map((entry, index) => <Cell key={\`cell-\${index}\`} fill={entry.color} />)
                            }
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Popular Exams */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                    <h3 style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, margin: '0 0 24px 0' }}>Weakest Topics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {[
                        { name: 'Data Interpretation', val: 50, pct: '45%' },
                        { name: 'Probability', val: 40, pct: '55%' },
                        { name: 'C Programming', val: 36, pct: '60%' },
                        { name: 'Reading Comprehension', val: 30, pct: '62%' }
                      ].map(item => (
                        <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                            <span>{item.name}</span>
                            <span style={{ color: '#ef4444' }}>{item.pct}</span>
                          </div>
                          <div style={{ height: '14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: item.pct, height: '100%', background: '#ef4444' }}></div>
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
console.log('Successfully updated HomePage.jsx');
