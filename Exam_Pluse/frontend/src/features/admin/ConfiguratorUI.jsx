import React from 'react';

/**
 * 🛠️ Topic Row Component
 * Displays the topic name, mode badge, and stats line.
 */
const TopicRow = ({ topic, section, addAutoQs, openManualSelection, removeTopicFromConfig, fuzzyMatch }) => {
  const manualCount = (topic.selectedQuestions || []).length;
  const autoCount = (topic.count || 0) - manualCount;
  const isComplete = topic.count === manualCount && manualCount > 0;

  return (
    <div className="glass-card" style={{ padding: "20px", borderRadius: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent)" }}>{topic.name}</h4>
            <span style={{ 
              fontSize: "9px", 
              fontWeight: 900, 
              padding: "2px 8px", 
              borderRadius: "6px", 
              background: topic.mode === 'AUTO' ? "rgba(96, 165, 250, 0.1)" : (topic.mode === 'MANUAL' ? "rgba(0, 245, 212, 0.1)" : "rgba(245, 158, 11, 0.1)"),
              color: topic.mode === 'AUTO' ? "#60a5fa" : (topic.mode === 'MANUAL' ? "var(--accent)" : "#f59e0b"),
              border: `1px solid ${topic.mode === 'AUTO' ? "rgba(96, 165, 250, 0.2)" : (topic.mode === 'MANUAL' ? "rgba(0, 245, 212, 0.2)" : "rgba(245, 158, 11, 0.2)")}`
            }}>
              {topic.mode === 'AUTO' ? "🎲 AUTO" : (topic.mode === 'MANUAL' ? "🔨 MANUAL" : "🔥 BOTH")}
            </span>
          </div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.5px" }}>
            <span style={{ color: manualCount > 0 ? "var(--accent)" : "inherit" }}>{manualCount} PINNED</span> + 
            <span style={{ color: autoCount > 0 ? "#60a5fa" : "inherit" }}> {autoCount} AUTO</span> = 
            <span style={{ color: "#fff" }}> {topic.count} TOTAL</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Total Count Controller */}
          <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", padding: "4px 8px", gap: "12px" }}>
             <button onClick={() => addAutoQs(section, topic.name, -1)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontWeight: 900 }}>-</button>
             <span style={{ fontSize: "13px", fontWeight: 900, color: "#fff", width: "16px", textAlign: "center" }}>{topic.count}</span>
             <button onClick={() => addAutoQs(section, topic.name, 1)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontWeight: 900 }}>+</button>
          </div>

          {/* Pins Button */}
          <button 
            onClick={() => openManualSelection(section, topic.name)}
            style={{ 
              background: "rgba(0, 245, 212, 0.05)", 
              border: "1px solid rgba(0, 245, 212, 0.2)", 
              borderRadius: "10px", 
              padding: "8px 16px", 
              color: "var(--accent)", 
              fontSize: "10px", 
              fontWeight: 900, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            className="hover-accent"
          >
            📍 PINS
          </button>

          <button onClick={() => removeTopicFromConfig(section, topic.name)} style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.4)", cursor: "pointer", fontSize: "14px" }}>✕</button>
        </div>
      </div>

      {/* Manual Selection Status Cards */}
      {(topic.mode === 'MANUAL' || topic.mode === 'BOTH') && (
        <div style={{ 
          marginTop: "16px", 
          padding: "12px", 
          borderRadius: "12px", 
          background: isComplete ? "rgba(0, 245, 212, 0.03)" : "rgba(59, 130, 246, 0.03)", 
          border: `1px solid ${isComplete ? "rgba(0, 245, 212, 0.1)" : "rgba(59, 130, 246, 0.1)"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             <span style={{ fontSize: "14px" }}>{isComplete ? "✅" : "🔨"}</span>
             <div>
                <div style={{ fontSize: "10px", fontWeight: 900, color: isComplete ? "var(--accent)" : "#60a5fa", textTransform: "uppercase" }}>
                   {isComplete ? "SELECTION COMPLETE" : "MANUAL SELECTION ACTIVE"}
                </div>
                <div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 700 }}>
                   {manualCount} of {topic.count} slots filled with pinned questions
                </div>
             </div>
          </div>
          
          <div style={{ display: "flex", gap: "6px" }}>
             {(topic.selectedQuestions || []).map((q, idx) => (
                <div key={idx} style={{ 
                  width: "20px", 
                  height: "20px", 
                  borderRadius: "4px", 
                  background: "var(--accent)", 
                  color: "#000", 
                  fontSize: "8px", 
                  fontWeight: 900, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                   Q{idx + 1}
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 📦 ExamConfigurator Overlay
 */
export const ExamConfigurator = ({ 
  target, setTarget, builderData, setBuilderData, 
  primarySectors, categoryMap, topicsMap, norm, fuzzyMatch,
  addTopicFromBuilder, addAutoQs, removeTopicFromConfig, openManualSelection,
  activeTab, setActiveTab, detailedStats, handleSave
}) => {

  if (!target) return null;

  const getSectionStats = (secName) => {
    const s = target.sections?.find(sc => fuzzyMatch(sc.name, secName));
    if (!s) return { total: 0, pinned: 0 };
    const total = (s.topics || []).reduce((a, t) => a + (t.count || 0), 0);
    const pinned = (s.topics || []).reduce((a, t) => a + (t.selectedQuestions?.length || 0), 0);
    return { total, pinned };
  };

  const allSummary = activeTab === "ALL" ? (target.sections || []) : (target.sections || []).filter(s => {
    if (activeTab === "APT") return fuzzyMatch(s.name, "Aptitude");
    if (activeTab === "REA") return fuzzyMatch(s.name, "Reasoning");
    if (activeTab === "VER") return fuzzyMatch(s.name, "Verbal");
    if (activeTab === "TEC") return fuzzyMatch(s.name, "Technical");
    return false;
  });

  // Sub-tier preset options per category
  const subTierPresets = {
    IT: ["MNCs", "Product Based", "Service Based", "Startups", "Top 100"],
    State: ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "UP", "Rajasthan", "Odisha", "Bihar"],
    Central: ["SSC", "UPSC", "RRB", "IBPS", "Insurance", "Defence", "Railways"],
    Banks: ["SBI", "IBPS PO", "IBPS Clerk", "RRB Banks", "Private Banks", "Co-Op Banks", "BOB", "PNB"],
    Companies: ["FAANG", "Big 4", "Fortune 500", "BPO/KPO", "Unicorns", "PSUs"],
    Mock: ["General", "Subject Wise", "Topic Wise"],
  };
  const currentPresets = subTierPresets[target.category] || ["General", "Subject Wise", "Topic Wise"];

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100vw", 
      height: "100vh", 
      background: "#020617", 
      zIndex: 9999, 
      display: "flex",
      flexDirection: "column",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden"
    }}>
      {/* 🌌 Sophisticated Backdrop */}
      <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(0, 245, 212, 0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, transparent 70%)", filter: "blur(90px)", pointerEvents: "none" }}></div>

      {/* 🚀 Premium Header */}
      <div style={{ height: "80px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "rgba(10, 15, 30, 0.6)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10 }}>
         <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
               <input 
                  value={target.title || ""} 
                  onChange={e => setTarget({ ...target, title: e.target.value })}
                  placeholder="Enter Deployment Title..."
                  style={{ background: "none", border: "none", fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", width: "450px", outline: "none" }}
               />
               <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
                  <span style={{ fontSize: "9px", fontWeight: 900, color: "var(--accent)", letterSpacing: "1.5px" }}>ENGINEERED BY EXAMPLUS</span>
                  <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(0, 245, 212, 0.4)" }}></span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>DEPLOYMENT_ID:</span>
                  <input 
                     value={target.key || ""} 
                     onChange={e => setTarget({ ...target, key: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
                     placeholder="SET-UNIQUE-KEY"
                     style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "9px", fontWeight: 900, outline: "none", width: "140px", textDecoration: "underline" }}
                  />
               </div>
            </div>
         </div>

         <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.4)", padding: "5px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
               {["ALL", "APT", "REA", "VER", "TEC"].map(t => (
                  <button 
                     key={t}
                     onClick={() => setActiveTab(t)}
                     style={{ height: "32px", padding: "0 18px", borderRadius: "10px", border: "none", background: activeTab === t ? "rgba(0, 245, 212, 0.15)" : "transparent", color: activeTab === t ? "var(--accent)" : "rgba(255,255,255,0.3)", fontSize: "10px", fontWeight: 900, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  >
                     {t}
                  </button>
               ))}
            </div>
            <button onClick={() => setTarget(null)} style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", width: "38px", height: "38px", borderRadius: "12px", color: "rgb(239, 68, 68)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} className="hover-red">✕</button>
         </div>
      </div>

      {/* 🏗️ System Architecture Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", flex: 1, overflow: "hidden", background: "rgba(2, 6, 23, 0.8)" }}>
        
        {/* LEFT: Logic Builder & Data Ingress (Scrollable) */}
        <div style={{ height: "100%", overflowY: "auto", padding: "48px", borderRight: "1px solid rgba(255,255,255,0.05)" }} className="no-scrollbar">
           
           {/* Section 1: Hierarchical Meta-Tagging */}
           <div style={{ display: "flex", flexDirection: "column", gap: "36px", marginBottom: "56px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                 <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", minWidth: "120px" }}>Primary Layer</span>
                 <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["IT", "State", "Central", "Banks", "Companies", "Mock"].map(cat => (
                       <button 
                          key={cat} 
                          onClick={() => setTarget({ ...target, category: cat, subCategory: "" })} 
                          style={{ padding: "12px 24px", borderRadius: "16px", fontSize: "11px", fontWeight: 900, background: target.category === cat ? "rgba(0, 245, 212, 0.12)" : "rgba(255,255,255,0.02)", color: target.category === cat ? "var(--accent)" : "rgba(255,255,255,0.4)", border: `1px solid ${target.category === cat ? "rgba(0, 245, 212, 0.25)" : "rgba(255,255,255,0.05)"}`, cursor: "pointer", transition: "0.3s" }}
                       >
                          {cat.toUpperCase()}
                       </button>
                    ))}
                 </div>
              </div>

              {/* ── ENHANCED SUB-TIER LAYER ── */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
                 <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", minWidth: "120px", paddingTop: "14px" }}>Sub-Tier Layer</span>
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                    
                    {/* Quick-select preset chips */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                       {currentPresets.map(sub => (
                          <button
                             key={sub}
                             onClick={() => setTarget({ ...target, subCategory: sub })}
                             style={{
                                padding: "10px 20px",
                                borderRadius: "14px",
                                fontSize: "10px",
                                fontWeight: 900,
                                background: target.subCategory === sub ? "rgba(59, 130, 246, 0.12)" : "rgba(255,255,255,0.01)",
                                color: target.subCategory === sub ? "#60a5fa" : "rgba(255,255,255,0.25)",
                                border: `1px solid ${target.subCategory === sub ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.04)"}`,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: target.subCategory === sub ? "0 0 12px rgba(59,130,246,0.15)" : "none"
                             }}
                          >
                             {sub.toUpperCase()}
                          </button>
                       ))}
                    </div>

                    {/* Custom free-text input */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                       <div style={{ position: "relative", flex: 1, maxWidth: "440px" }}>
                          <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none", opacity: 0.45 }}>✏️</span>
                          <input
                             value={target.subCategory || ""}
                             onChange={e => setTarget({ ...target, subCategory: e.target.value })}
                             placeholder={`Or type any ${target.category || "sub-category"} name… e.g., Andhra Pradesh`}
                             style={{
                                width: "100%",
                                background: "rgba(0,0,0,0.38)",
                                border: "1px solid rgba(255,255,255,0.09)",
                                borderRadius: "14px",
                                color: "#fff",
                                padding: "11px 40px 11px 40px",
                                fontSize: "12px",
                                fontWeight: 700,
                                outline: "none",
                                boxSizing: "border-box",
                                letterSpacing: "0.3px"
                             }}
                             onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,0.5)"; e.target.style.background = "rgba(10,20,50,0.45)"; }}
                             onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.background = "rgba(0,0,0,0.38)"; }}
                          />
                          {target.subCategory && (
                             <button
                                onClick={() => setTarget({ ...target, subCategory: "" })}
                                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "13px", lineHeight: 1, padding: "2px" }}
                             >✕</button>
                          )}
                       </div>
                       {target.subCategory && (
                          <div style={{
                             padding: "8px 14px",
                             borderRadius: "10px",
                             background: "rgba(59,130,246,0.07)",
                             border: "1px solid rgba(59,130,246,0.22)",
                             fontSize: "10px",
                             fontWeight: 900,
                             color: "#60a5fa",
                             whiteSpace: "nowrap",
                             letterSpacing: "0.5px"
                          }}>
                             ✅ {target.subCategory.toUpperCase()}
                          </div>
                       )}
                    </div>

                    {/* Helper hint */}
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.5px" }}>
                       💡 Click a preset chip OR type any custom name — exams filter by this tag in the list view.
                    </div>

                 </div>
              </div>
           </div>

           {/* Section 2: Logic Ingress (Builder) */}
           <div style={{ background: "linear-gradient(135deg, rgba(0, 245, 212, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "32px", padding: "40px", marginBottom: "48px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
                 <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0, 245, 212, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
                 <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 900, color: "var(--accent)", letterSpacing: "2px" }}>RESOURCES ARCHITECT</h3>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>INJECT TOPICS AND QUESTION FLOWS INTO DEPLOYMENT</div>
                 </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 100px 150px", gap: "24px", alignItems: "flex-end" }}>
                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Primary Section</label>
                    <select 
                       value={builderData.section} 
                       onChange={e => setBuilderData({...builderData, section: e.target.value, topic: ""})} 
                       style={{ height: "54px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "#fff", padding: "0 20px", outline: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
                    >
                       <option value="">-- Select Target --</option>
                       {primarySectors.map(s => <option key={s} value={s} style={{ background: "#020617" }}>{s}</option>)}
                    </select>
                 </div>

                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Topic Domain</label>
                    <select 
                       value={builderData.topic} 
                       onChange={e => {
                         const max = (topicsMap[norm(e.target.value)] || {count: 0}).count;
                         setBuilderData({...builderData, topic: e.target.value, qs: Math.min(builderData.qs, max)});
                       }} 
                       disabled={!builderData.section}
                       style={{ height: "54px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "#fff", padding: "0 20px", outline: "none", cursor: "pointer", opacity: builderData.section ? 1 : 0.4, fontSize: "13px", fontWeight: 700 }}
                    >
                       <option value="">-- Select Domain --</option>
                       {builderData.section && (categoryMap[builderData.section] || []).map(t => (
                          <option key={t} value={t} style={{ background: "#020617" }}>{t} ({(topicsMap[norm(t)] || {count:0}).count} Qs)</option>
                       ))}
                    </select>
                 </div>

                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Quantity</label>
                    <input 
                       type="number" 
                       value={builderData.qs} 
                       onChange={e => {
                         const val = parseInt(e.target.value) || 0;
                         const max = (topicsMap[norm(builderData.topic)] || {count: 999}).count;
                         setBuilderData({...builderData, qs: Math.min(val, max)});
                       }} 
                       style={{ height: "54px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "#fff", padding: "0 16px", outline: "none", textAlign: "center", fontWeight: 900, fontSize: "16px" }}
                    />
                 </div>

                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Selection Mode</label>
                    <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.4)", padding: "5px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                       {['auto', 'manual'].map(m => (
                          <button 
                             key={m}
                             onClick={() => setBuilderData({...builderData, mode: m})}
                             style={{ flex: 1, height: "44px", borderRadius: "12px", border: "none", background: builderData.mode === m ? "rgba(255,255,255,0.06)" : "transparent", color: builderData.mode === m ? "var(--accent)" : "rgba(255,255,255,0.2)", fontSize: "10px", fontWeight: 900, cursor: "pointer", transition: "0.2s" }}
                          >
                             {m.toUpperCase()}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <button 
                 onClick={addTopicFromBuilder}
                 disabled={!builderData.topic}
                 style={{ width: "100%", marginTop: "32px", padding: "20px", borderRadius: "20px", background: "var(--accent)", color: "#000", border: "none", fontWeight: 900, fontSize: "14px", letterSpacing: "1.5px", cursor: "pointer", boxShadow: "0 12px 48px rgba(0, 245, 212, 0.25)", opacity: builderData.topic ? 1 : 0.4, transition: "0.3s transform ease" }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                 ✨ INJECT ARCHITECTURE TO SET
              </button>
           </div>

           {/* Section 3: Live Blueprint Feed */}
           <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {allSummary.map((s, idx) => (
                 <div key={idx} style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", fontSize: "12px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0, 245, 212, 0.2)" }}>{idx+1}</span>
                          <h4 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{s.name}</h4>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>{s.topics?.length || 0} Clusters Active</span>
                       </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {s.topics?.map((t, tidx) => (
                        <TopicRow 
                            key={tidx} 
                            topic={t} 
                            section={s.name} 
                            addAutoQs={addAutoQs} 
                            openManualSelection={openManualSelection} 
                            removeTopicFromConfig={removeTopicFromConfig}
                            fuzzyMatch={fuzzyMatch}
                        />
                      ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* RIGHT: Deployment Status Center (Fixed Sidebar) */}
        <div style={{ height: "100%", background: "rgba(5, 10, 25, 0.8)", backdropFilter: "blur(40px)", display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ padding: "48px", flex: 1, overflowY: "auto" }} className="no-scrollbar">
                <h3 style={{ fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "40px" }}>Deployment Analytics</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                   {/* Strategic Cards */}
                   <div style={{ padding: "28px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "10px", letterSpacing: "1px" }}>TARGET MODE</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <span style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent)" }}>{target.mode?.toUpperCase() || "MOCK"}</span>
                         <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", fontSize: "9px", fontWeight: 900 }}>STABLE_v2</span>
                      </div>
                   </div>

                   <div style={{ padding: "28px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "10px", letterSpacing: "1px" }}>GLOBAL SECTOR</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>{target.category || "GENERAL"}</div>
                      <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 800, marginTop: "6px" }}>{target.subCategory || "Awaiting Domain..."}</div>
                   </div>

                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div style={{ padding: "24px", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                         <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>TOTAL POOL</div>
                         <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--accent)" }}>
                           {(target.sections || []).reduce((a, s) => a + (s.topics || []).reduce((b, t) => b + (t.count || 0), 0), 0)}
                         </div>
                      </div>
                      <div style={{ padding: "24px", borderRadius: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                         <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>MODULES</div>
                         <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>{target.sections?.length || 0}</div>
                      </div>
                   </div>
                </div>

                {/* Progress Visuals */}
                <div style={{ marginTop: "56px" }}>
                   <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.2)", marginBottom: "28px", letterSpacing: "2px" }}>SECTIONAL SATURATION</div>
                   <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {(target.sections || []).map(s => {
                         const stats = getSectionStats(s.name);
                         return (
                           <div key={s.name}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                 <span style={{ fontSize: "12px", fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{s.name}</span>
                                 <span style={{ fontSize: "12px", fontWeight: 900, color: "var(--accent)" }}>{stats.total} Qs</span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                                 <div style={{ width: `${(stats.total / Math.max(1, (target.sections || []).reduce((a, s) => a + (s.topics || []).reduce((b, t) => b + (t.count || 0), 0), 0))) * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), #3b82f6)" }}></div>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
             </div>

             {/* Final Actions */}
             <div style={{ padding: "48px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button 
                  onClick={handleSave} 
                  style={{ 
                    width: "100%", 
                    padding: "24px", 
                    background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)", 
                    border: "none", 
                    borderRadius: "20px", 
                    color: "#000", 
                    fontWeight: 900, 
                    fontSize: "15px", 
                    letterSpacing: "1.5px",
                    cursor: "pointer", 
                    boxShadow: "0 16px 64px rgba(0, 245, 212, 0.25)",
                    transition: "0.4s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 80px rgba(0, 245, 212, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 16px 64px rgba(0, 245, 212, 0.25)'}
                >
                  🚀 AUTHORIZE DEPLOYMENT
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🔍 ManualSelector Overlay (Full-Screen Premium)
 */
export const ManualSelector = ({ 
  manualModal, setManualModal, toggleManualSelect, target, fuzzyMatch 
}) => {
  if (!manualModal) return null;

  const topicObj = target?.sections?.find(s => fuzzyMatch(s.name, manualModal.section))?.topics?.find(t => fuzzyMatch(t.name, manualModal.topic));
  const currentSelectedCount = topicObj?.selectedQuestions?.length || 0;
  const targetCount = topicObj?.count || 0;

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100vw", 
      height: "100vh", 
      background: "#020617", 
      zIndex: 10000, 
      display: "flex",
      flexDirection: "column",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden"
    }}>
       {/* 🌌 Atmospheric Backdrop */}
       <div style={{ position: "absolute", top: "-5%", right: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }}></div>
       
       {/* 🚀 Selector Header */}
       <div style={{ height: "80px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "rgba(10, 15, 30, 0.6)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
             <button 
                onClick={() => setManualModal(null)}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#fff", padding: "10px 20px", borderRadius: "12px", cursor: "pointer", fontSize: "11px", fontWeight: 800, transition: "0.2s" }}
                className="hover-bright"
             >
                ← BACK TO ENGINE
             </button>
             <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.1)" }}></div>
             <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                   <span style={{ fontSize: "9px", fontWeight: 900, color: "var(--accent)", letterSpacing: "1.5px" }}>RESOURCE_PICKER_v1.0</span>
                   <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>DOMAIN:</span>
                   <span style={{ fontSize: "9px", fontWeight: 900, color: "#fff" }}>{manualModal.section.toUpperCase()}</span>
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{manualModal.topic}</h2>
             </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
             <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>SELECTED SATURATION</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                   <div style={{ width: "120px", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${(currentSelectedCount/targetCount)*100 || 0}%`, height: "100%", background: "var(--accent)" }}></div>
                   </div>
                   <span style={{ fontSize: "14px", fontWeight: 900, color: "var(--accent)" }}>{currentSelectedCount} / {targetCount}</span>
                </div>
             </div>
             <button 
                onClick={() => setManualModal(null)}
                style={{ padding: "14px 32px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "14px", fontWeight: 900, fontSize: "12px", cursor: "pointer", boxShadow: "0 8px 32px rgba(0, 245, 212, 0.2)" }}
             >
                CONFIRM SELECTION
             </button>
          </div>
       </div>

       {/* 🏗️ Main Selection Interface */}
       <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", flex: 1, overflow: "hidden" }}>
          
          {/* Scrollable Question Feed */}
          <div style={{ height: "100%", overflowY: "auto", padding: "40px" }} className="no-scrollbar">
             <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ marginBottom: "40px", position: "relative" }}>
                   <input 
                      placeholder="🔍 Filter questions by keywords or tags..." 
                      style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", color: "#fff", padding: "20px 28px", fontSize: "15px", outline: "none", backdropFilter: "blur(10px)" }} 
                   />
                   <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>CTRL + F TO SEARCH</div>
                </div>

                {manualModal.questions.length === 0 ? (
                  <div style={{ padding: "100px 0", textAlign: "center" }}>
                     <div style={{ fontSize: "48px", marginBottom: "20px", opacity: 0.2 }}>📉</div>
                     <div style={{ fontSize: "14px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "2px" }}>NO RESOURCES DISCOVERED FOR THIS CLUSTER</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {manualModal.questions.map((q, i) => {
                      const qIdStr = String(q?._id); 
                      const isSelected = (topicObj?.selectedQuestions || [])?.some(id => (typeof id === 'string' ? id : id?._id) === qIdStr);
                      
                      return (
                        <div 
                           key={q._id} 
                           onClick={() => toggleManualSelect(q._id)}
                           style={{ 
                              padding: "32px", 
                              background: isSelected ? "rgba(0, 245, 212, 0.03)" : "rgba(255,255,255,0.02)", 
                              borderRadius: "28px", 
                              border: isSelected ? "1px solid rgba(0, 245, 212, 0.3)" : "1px solid rgba(255,255,255,0.04)", 
                              position: "relative",
                              cursor: "pointer",
                              transition: "0.2s transform ease"
                           }}
                           onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.005)'}
                           onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                 <span style={{ fontSize: "10px", fontWeight: 900, color: isSelected ? "#000" : "var(--accent)", background: isSelected ? "var(--accent)" : "rgba(0, 245, 212, 0.1)", padding: "4px 12px", borderRadius: "8px" }}>QUESTION {i+1}</span>
                                 <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>UID: {q._id.slice(-6)}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                 <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>KEY:</span>
                                 <span style={{ fontSize: "12px", fontWeight: 900, color: "#fff", background: "rgba(255,255,255,0.05)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>{q.answer}</span>
                              </div>
                           </div>
                           
                           <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "28px", lineHeight: "1.6" }}>{q.qText || q.q}</h3>
                           
                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                              {['A','B','C','D'].map(opt => (
                                 <div key={opt} style={{ padding: "16px 24px", background: q.answer === opt ? "rgba(0, 245, 212, 0.05)" : "rgba(0,0,0,0.2)", borderRadius: "16px", fontSize: "14px", border: q.answer === opt ? "1px solid rgba(0, 245, 212, 0.1)" : "1px solid rgba(255,255,255,0.03)", transition: "0.2s" }}>
                                    <span style={{ color: q.answer === opt ? "var(--accent)" : "rgba(255,255,255,0.2)", fontWeight: 900, marginRight: "12px" }}>{opt}.</span> 
                                    <span style={{ color: q.answer === opt ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: q.answer === opt ? 700 : 400 }}>{q['o'+opt] || q[opt]}</span>
                                 </div>
                              ))}
                           </div>

                           {/* Selection Ring */}
                           <div style={{ position: "absolute", top: "32px", right: "-12px", width: "24px", height: "24px", borderRadius: "50%", background: isSelected ? "var(--accent)" : "#020617", border: isSelected ? "none" : "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s" }}>
                              {isSelected && <span style={{ color: "#000", fontSize: "12px", fontWeight: 900 }}>✓</span>}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>

          {/* Right Summary Sidebar */}
          <div style={{ background: "rgba(5, 10, 25, 0.8)", borderLeft: "1px solid rgba(255,255,255,0.05)", padding: "40px", display: "flex", flexDirection: "column" }}>
             <h3 style={{ fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "40px" }}>Selection Summary</h3>
             
             <div style={{ flex: 1, overflowY: "auto" }} className="no-scrollbar">
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                   <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>ALLOCATED SLOTS</div>
                      <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--accent)" }}>{currentSelectedCount} <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.2)" }}>/ {targetCount}</span></div>
                   </div>

                   <div style={{ padding: "20px", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center" }}>
                      <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.2)", marginBottom: "4px" }}>REMAINING TO PIN</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>{Math.max(0, targetCount - currentSelectedCount)}</div>
                   </div>
                </div>

                <div style={{ marginTop: "40px" }}>
                   <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.2)", marginBottom: "20px", letterSpacing: "1px" }}>PINNED ARCHIVE</div>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {(topicObj?.selectedQuestions || []).map((id, idx) => (
                         <div key={idx} style={{ padding: "6px 12px", background: "rgba(0, 245, 212, 0.1)", borderRadius: "8px", border: "1px solid rgba(0, 245, 212, 0.2)", color: "var(--accent)", fontSize: "10px", fontWeight: 900 }}>Q{idx + 1}</div>
                      ))}
                   </div>
                </div>
             </div>

             <button 
                onClick={() => setManualModal(null)}
                style={{ width: "100%", padding: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "#fff", fontWeight: 900, fontSize: "13px", cursor: "pointer", marginTop: "24px" }}
             >
                SAVE &amp; RETURN
             </button>
          </div>
       </div>
    </div>
  );
};
