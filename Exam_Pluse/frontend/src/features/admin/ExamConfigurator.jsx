import React from 'react';

/* ─────────────────────────────────────────────────────────
   TopicRow — compact single-line card
   APTITUDE · Numbers  [− 3 +]  [AUTO ▼]  [📋 Manage Qs]  [✕]
───────────────────────────────────────────────────────── */
const TopicRow = ({ topic, section, addAutoQs, openManualSelection, removeTopicFromConfig, changeTopicMode }) => {
  const manualCount = (topic.selectedQuestions || []).length;
  // Note: logic in AdminDashboard now makes manualCount EXTRA to the auto portion
  // so autoCount is the base count and total is auto + manual.
  // Actually, in the state, 'count' is the TOTAL.
  // So autoCount = totalCount - manualCount.
  const totalCount  = topic.count || 0;
  const autoCount   = Math.max(0, totalCount - manualCount);
  const mode        = topic.mode || 'AUTO';
  const isComplete  = manualCount > 0 && manualCount === totalCount;

  const modeStyle = {
    AUTO:   { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  color: '#60a5fa'       },
    MANUAL: { bg: 'rgba(0,245,212,0.10)',   border: 'rgba(0,245,212,0.3)',   color: 'var(--accent)' },
  }[mode] || { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' };

  return (
    <div style={{ borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "10px", overflow: "hidden", transition: "0.3s ease" }}>

      {/* ── Main Action Row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", flexWrap: "wrap" }}>

        {/* 1. Identity Segment */}
        <div style={{ flex: 1, minWidth: "140px" }}>
          <div style={{ fontSize: "8px", fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "2px" }}>{section}</div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>{topic.name}</div>
        </div>

        {/* 2. Auto Count Control (Directly controls the "Auto" portion) */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "4px 10px", gap: "10px" }}>
          <div style={{ fontSize: "8px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>AUTO</div>
          <button onClick={() => addAutoQs(section, topic.name, -1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontWeight: 900, fontSize: "16px", lineHeight: 1 }}>−</button>
          <span style={{ fontSize: "14px", fontWeight: 900, color: "#60a5fa", minWidth: "20px", textAlign: "center" }}>{autoCount}</span>
          <button onClick={() => addAutoQs(section, topic.name,  1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontWeight: 900, fontSize: "16px", lineHeight: 1 }}>+</button>
        </div>

        {/* 3. Mode Selection Dropdown */}
        <div style={{ position: "relative" }}>
          <select
            value={mode}
            onChange={e => changeTopicMode(section, topic.name, e.target.value)}
            style={{
              background: modeStyle.bg,
              border: `1px solid ${modeStyle.border}`,
              borderRadius: "10px",
              color: modeStyle.color,
              padding: "8px 30px 8px 12px",
              fontSize: "10px",
              fontWeight: 900,
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            <option value="AUTO"   style={{ background: "#1a0f2b", color: "#60a5fa" }}>🎲 AUTO MODE</option>
            <option value="MANUAL" style={{ background: "#1a0f2b", color: "#00f5d4" }}>🔨 MANUAL MODE</option>
            <option value="BOTH"   disabled style={{ background: "#1a0f2b", color: "rgba(255,255,255,0.2)" }}>🔥 BOTH (DEPRECATED)</option>
          </select>
          <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>▼</span>
        </div>

        {/* 4. Manual Pins Manager */}
        <button
          onClick={() => openManualSelection(section, topic.name)}
          style={{
            background: "rgba(0,245,212,0.06)", 
            border: "1px solid rgba(0,245,212,0.25)",
            borderRadius: "10px", 
            padding: "8px 16px", 
            color: "var(--accent)",
            fontSize: "10px", 
            fontWeight: 900, 
            cursor: "pointer",
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            whiteSpace: "nowrap",
            transition: "0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(0,245,212,0.12)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(0,245,212,0.06)'}
        >
          <span style={{ fontSize: "14px" }}>🔨</span>
          <span>MANUAL PINS</span>
          {manualCount > 0 && (
            <span style={{ background: "var(--accent)", color: "#000", borderRadius: "5px", padding: "1px 7px", fontSize: "10px", fontWeight: 900 }}>{manualCount}</span>
          )}
        </button>

        {/* 5. Remove Button */}
        <button 
          onClick={() => removeTopicFromConfig(section, topic.name)} 
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "8px", color: "rgba(239,68,68,0.5)", cursor: "pointer", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", marginLeft: "4px" }}
          title="Remove Topic"
        >✕</button>
      </div>

      {/* ── Formula Bar: Architecture Saturation Analysis ── */}
      {(mode === 'AUTO' || manualCount > 0) && (
        <div style={{ 
          padding: "10px 16px", 
          background: "rgba(0,0,0,0.2)", 
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "1px" }}>Architecture Analysis:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 900 }}>
                <span style={{ color: "var(--accent)" }}>{manualCount} Locked (M)</span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>+</span>
                <span style={{ color: "#60a5fa" }}>{autoCount} Dynamic (A)</span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>=</span>
                <span style={{ color: modeStyle.color }}>{totalCount} Total</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            {/* Left side: Manual Questions (M) */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {(topic.selectedQuestions || []).map((id, idx) => (
                <div 
                  key={`m-${idx}`} 
                  style={{ 
                    width: "20px", height: "20px", borderRadius: "5px", 
                    background: "var(--accent)", color: "#000", 
                    fontSize: "7px", fontWeight: 900, 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "help", border: "1px solid rgba(0,0,0,0.1)"
                  }}
                  title={`Manual Selection (M${idx+1})\nID: ${id}`}
                >
                  M{idx+1}
                </div>
              ))}
              {manualCount === 0 && <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.1)", fontWeight: 800 }}>NO_MANUAL_PINS</span>}
            </div>

            <div style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.05)" }}></div>

            {/* Right side: Auto Slots (A) */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {Array.from({ length: Math.min(autoCount, 15) }).map((_, idx) => (
                <div 
                  key={`a-${idx}`} 
                  style={{ 
                    width: "20px", height: "20px", borderRadius: "5px", 
                    background: "rgba(96,165,250,0.1)", color: "#60a5fa", 
                    fontSize: "7px", fontWeight: 900, 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(96,165,250,0.2)",
                    cursor: "default"
                  }}
                  title={`Auto-Generated Slot (A${idx+1})`}
                >
                  A{idx+1}
                </div>
              ))}
              {autoCount > 15 && <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.1)", fontWeight: 800 }}>+{autoCount-15}_MORE</span>}
              {autoCount === 0 && <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.1)", fontWeight: 800 }}>NO_AUTO_FILL</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ExamConfigurator = ({
  target, setTarget, builderData, setBuilderData,
  primarySectors, categoryMap, topicsMap, norm, fuzzyMatch,
  addTopicFromBuilder, addAutoQs, removeTopicFromConfig, openManualSelection,
  activeTab, setActiveTab, detailedStats, handleSave
}) => {
  const [step, setStep] = React.useState(1);
  if (!target) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const getSectionStats = (secName) => {
    const s = target.sections?.find(sc => fuzzyMatch(sc.name, secName));
    if (!s) return { total: 0, pinned: 0 };
    return {
      total: (s.topics || []).reduce((a, t) => a + (t.count || 0), 0),
      pinned: (s.topics || []).reduce((a, t) => a + (t.selectedQuestions?.length || 0), 0)
    };
  };

  /* Change a topic's mode directly in target, without re-computing via addAutoQs */
  const changeTopicMode = (secName, topName, newMode) => {
    setTarget(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => {
        if (!fuzzyMatch(s.name, secName)) return s;
        return {
          ...s,
          topics: (s.topics || []).map(t => {
            if (!fuzzyMatch(t.name, topName)) return t;
            return { ...t, mode: newMode };
          })
        };
      })
    }));
  };

  const allSummary = activeTab === "ALL" ? (target.sections || []) : (target.sections || []).filter(s => {
    if (activeTab === "APT") return fuzzyMatch(s.name, "Aptitude");
    if (activeTab === "REA") return fuzzyMatch(s.name, "Reasoning");
    if (activeTab === "VER") return fuzzyMatch(s.name, "Verbal");
    if (activeTab === "TEC") return fuzzyMatch(s.name, "Technical");
    return false;
  });

  const subTierPresets = {
    IT: ["MNCs", "Product Based", "Service Based", "Startups", "Top 100"],
    State: ["AP", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "UP", "Rajasthan"],
    Central: ["SSC", "UPSC", "RRB", "IBPS", "Insurance", "Defence"],
    Banks: ["SBI", "IBPS PO", "IBPS Clerk", "RRB Banks", "Private Banks", "BOB"],
    Companies: ["FAANG", "Big 4", "Fortune 500", "BPO/KPO"],
    Mock: ["General", "Subject Wise", "Topic Wise"],
  };
  const currentPresets = subTierPresets[target.category] || ["General", "Subject Wise", "Topic Wise"];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#211335", zIndex: 9999, display: "flex", flexDirection: "column", color: "#fff", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(0,245,212,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", filter: "blur(90px)", pointerEvents: "none" }}></div>

      {/* Header */}
      <div style={{ height: "80px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(33,19,53,0.8)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={() => setTarget(null)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", width: "34px", height: "34px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>✕</button>
          <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.1)" }}></div>
          <div>
            <div style={{ fontSize: "9px", fontWeight: 900, color: "var(--accent)", letterSpacing: "1.5px", marginBottom: "2px" }}>DEPLOYMENT_MODULE_v3.0</div>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff" }}>{target.title || "Untitled Deployment"}</div>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0", position: "absolute", left: "50%", transform: "translateX(-50%)", width: "440px" }}>
          {[{ id:1, label:"Identity", icon:"🆔" }, { id:2, label:"Architecture", icon:"🏗️" }, { id:3, label:"Simulation", icon:"👁️" }, { id:4, label:"Deployment", icon:"🚀" }].map((s, idx, arr) => (
            <React.Fragment key={s.id}>
              <div onClick={() => setStep(s.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", opacity: step >= s.id ? 1 : 0.2, transition: "0.4s", position: "relative", zIndex: 2, minWidth: "72px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: step === s.id ? "var(--accent)" : step > s.id ? "rgba(0,245,212,0.2)" : "rgba(255,255,255,0.05)", border: step === s.id ? "none" : `1px solid ${step > s.id ? "rgba(0,245,212,0.4)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: step === s.id ? "#000" : "var(--accent)", boxShadow: step === s.id ? "0 0 20px rgba(0,245,212,0.5)" : "none", transform: step === s.id ? "scale(1.1)" : "scale(1)", transition: "0.3s" }}>
                  {step > s.id ? "✓" : s.id}
                </div>
                <span style={{ fontSize: "9px", fontWeight: 900, color: step === s.id ? "var(--accent)" : "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</span>
              </div>
              {idx < arr.length - 1 && <div style={{ flex: 1, height: "2px", background: `linear-gradient(90deg, ${step > s.id ? "var(--accent)" : "rgba(255,255,255,0.05)"} 0%, ${step > s.id + 1 ? "var(--accent)" : "rgba(255,255,255,0.05)"} 100%)`, marginTop: "-16px", transition: "0.5s", zIndex: 1 }}></div>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={prevStep} disabled={step === 1} style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "11px", fontWeight: 900, cursor: "pointer", opacity: step === 1 ? 0.3 : 1 }}>← PREV</button>
          <button onClick={nextStep} disabled={step === 4} style={{ padding: "10px 20px", borderRadius: "12px", background: "var(--accent)", border: "none", color: "#000", fontSize: "11px", fontWeight: 900, cursor: "pointer", opacity: step === 4 ? 0.3 : 1 }}>NEXT →</button>
        </div>
      </div>

      {/* Main Grid — fixed height so scroll works */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "calc(100vh - 80px)", overflow: "hidden", background: "rgba(33,19,53,0.4)" }}>

        {/* LEFT scrollable */}
        <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", padding: "32px 36px", borderRight: "1px solid rgba(255,255,255,0.05)" }} className="no-scrollbar">

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ marginBottom: "40px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginBottom: "6px" }}>Define Deployment Identity</h3>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Establish the core credentials and hierarchical taxonomy for this exam resource.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "10px", fontWeight: 900, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "2px" }}>Strategic Title</label>
                  <input value={target.title || ""} onChange={e => setTarget({ ...target, title: e.target.value })} placeholder="e.g., Q1 Technical Proficiency Assessment" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 20px", color: "#fff", fontSize: "15px", fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <label style={{ fontSize: "10px", fontWeight: 900, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "2px" }}>Access Key</label>
                    <button onClick={() => { const slug = (target.title || "EXAM").toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 10); const rand = Math.random().toString(36).substring(2,6).toUpperCase(); setTarget({ ...target, key: `${slug}-${rand}` }); }} style={{ background: "transparent", border: "none", color: "var(--accent)", fontSize: "9px", fontWeight: 900, cursor: "pointer" }}>✨ AUTO-GENERATE</button>
                  </div>
                  <input value={target.key || ""} onChange={e => setTarget({ ...target, key: e.target.value.toUpperCase().replace(/\s+/g, '-') })} placeholder="SET-UNIQUE-IDENTIFIER" style={{ width: "280px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "14px 18px", color: "var(--accent)", fontSize: "13px", fontWeight: 900, outline: "none", fontFamily: "monospace" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Primary Layer */}
                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", minWidth: "110px" }}>Primary Layer</span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["IT", "State", "Central", "Banks", "Companies", "Mock"].map(cat => (
                        <button key={cat} onClick={() => setTarget({ ...target, category: cat, subCategory: "" })} style={{ padding: "10px 18px", borderRadius: "12px", fontSize: "11px", fontWeight: 900, background: target.category === cat ? "rgba(0,245,212,0.12)" : "rgba(255,255,255,0.02)", color: target.category === cat ? "var(--accent)" : "rgba(255,255,255,0.4)", border: `1px solid ${target.category === cat ? "rgba(0,245,212,0.25)" : "rgba(255,255,255,0.05)"}`, cursor: "pointer", transition: "0.2s" }}>
                          {cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Sub-Tier Layer — chips + free text */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", minWidth: "110px", paddingTop: "10px" }}>Sub-Tier</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {currentPresets.map(sub => (
                          <button key={sub} onClick={() => setTarget({ ...target, subCategory: sub })} style={{ padding: "7px 14px", borderRadius: "10px", fontSize: "10px", fontWeight: 900, background: target.subCategory === sub ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.01)", color: target.subCategory === sub ? "#60a5fa" : "rgba(255,255,255,0.25)", border: `1px solid ${target.subCategory === sub ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.04)"}`, cursor: "pointer", transition: "0.2s" }}>
                            {sub.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", opacity: 0.35, pointerEvents: "none" }}>✏️</span>
                          <input value={target.subCategory || ""} onChange={e => setTarget({ ...target, subCategory: e.target.value })} placeholder={`Type custom ${target.category || "sub-category"}… e.g., Andhra Pradesh`} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", padding: "9px 32px 9px 30px", fontSize: "11px", fontWeight: 700, outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                          {target.subCategory && <button onClick={() => setTarget({ ...target, subCategory: "" })} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "11px" }}>✕</button>}
                        </div>
                        {target.subCategory && <div style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", fontSize: "9px", fontWeight: 900, color: "#60a5fa", whiteSpace: "nowrap" }}>✅ {target.subCategory.toUpperCase()}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "48px", padding: "24px", borderRadius: "20px", background: "rgba(0,245,212,0.05)", border: "1px dashed rgba(0,245,212,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent)" }}>Ready to architect the questions?</div>
                  <div style={{ fontSize: "11px", color: "rgba(0,245,212,0.6)" }}>Configure topics and resources in the next step.</div>
                </div>
                <button onClick={nextStep} style={{ padding: "12px 28px", borderRadius: "12px", background: "var(--accent)", color: "#000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "12px" }}>PROCEED TO BUILDER</button>
              </div>
            </div>
          )}

          {/* STEP 2 — ARCHITECTURE */}
          {step === 2 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              {/* Builder Card */}
              <div style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.03) 0%, rgba(59,130,246,0.03) 100%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "24px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}></div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(0,245,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
                  <div>
                    <h3 style={{ fontSize: "12px", fontWeight: 900, color: "var(--accent)", letterSpacing: "1.5px" }}>RESOURCES ARCHITECT</h3>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>INJECT TOPICS AND QUESTION FLOWS INTO DEPLOYMENT</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 160px 180px", gap: "16px", alignItems: "flex-end" }}>
                  {/* Section Selection */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>Section</label>
                    <select value={builderData.section} onChange={e => setBuilderData({...builderData, section: e.target.value, topic: ""})} style={{ height: "48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "#fff", padding: "0 12px", outline: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>
                      <option value="">-- Select Sector --</option>
                      {primarySectors.map(s => <option key={s} value={s} style={{ background: "#211335" }}>{s}</option>)}
                    </select>
                  </div>

                  {/* Topic Selection */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>Topic Cluster</label>
                    <select value={builderData.topic} onChange={e => { const max = (topicsMap[norm(e.target.value)] || {count:0}).count; setBuilderData({...builderData, topic: e.target.value, qs: Math.min(builderData.qs, max)}); }} disabled={!builderData.section} style={{ height: "48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "#fff", padding: "0 12px", outline: "none", cursor: "pointer", opacity: builderData.section ? 1 : 0.4, fontSize: "11px", fontWeight: 700 }}>
                      <option value="">-- Select Cluster --</option>
                      {builderData.section && (categoryMap[builderData.section] || []).map(t => (
                        <option key={t} value={t} style={{ background: "#211335" }}>{t} ({(topicsMap[norm(t)] || {count:0}).count} Qs)</option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-Generation Quota */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>Auto Quota</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.4)", height: "48px", padding: "0 12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <button onClick={() => setBuilderData(prev => ({...prev, qs: Math.max(0, prev.qs - 1)}))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontWeight: 900, fontSize: "18px" }}>−</button>
                      <span style={{ flex: 1, textAlign: "center", fontSize: "14px", fontWeight: 900, color: "#60a5fa" }}>{builderData.qs}</span>
                      <button onClick={() => setBuilderData(prev => ({...prev, qs: prev.qs + 1}))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontWeight: 900, fontSize: "18px" }}>+</button>
                    </div>
                  </div>

                  {/* Deploy Action */}
                  <button 
                    onClick={addTopicFromBuilder} 
                    disabled={!builderData.topic} 
                    style={{ 
                      height: "48px",
                      borderRadius: "12px", 
                      background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)", 
                      color: "#000", 
                      border: "none", 
                      fontWeight: 900, 
                      fontSize: "11px", 
                      letterSpacing: "0.5px", 
                      cursor: "pointer", 
                      opacity: builderData.topic ? 1 : 0.4, 
                      transition: "0.2s",
                      boxShadow: builderData.topic ? "0 8px 20px rgba(0, 245, 212, 0.2)" : "none"
                    }}
                  >
                    ✨ DEPLOY MODULE
                  </button>
                </div>
              </div>

              {/* Live Blueprint Feed */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {allSummary.map((s, idx) => (
                  <div key={idx} style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,245,212,0.1)", color: "var(--accent)", fontSize: "11px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,245,212,0.2)" }}>{idx+1}</span>
                      <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#fff" }}>{s.name}</h4>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontWeight: 800, textTransform: "uppercase" }}>{s.topics?.length || 0} clusters</span>
                    </div>
                    {s.topics?.map((t, tidx) => (
                      <TopicRow key={tidx} topic={t} section={s.name} addAutoQs={addAutoQs} openManualSelection={openManualSelection} removeTopicFromConfig={removeTopicFromConfig} changeTopicMode={changeTopicMode} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — SIMULATION */}
          {step === 3 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ marginBottom: "40px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginBottom: "6px" }}>Simulation Preview</h3>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Visualizing the resource from a candidate perspective.</p>
              </div>
              <div style={{ background: "rgba(33,19,53,0.4)", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.06)", padding: "2px", overflow: "hidden" }}>
                <div style={{ background: "#2e1a47", borderRadius: "26px", border: "10px solid #1a0f2b", minHeight: "540px", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
                  <div style={{ padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "16px" }}>E</div>
                      <div>
                        <div style={{ fontSize: "9px", fontWeight: 900, color: "var(--accent)" }}>CANDIDATE_INTERFACE_v4</div>
                        <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff" }}>{target.title}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "#60a5fa" }}>⏱️ 59:42</div>
                  </div>
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.03)" }}><div style={{ width: "85%", height: "100%", background: "linear-gradient(90deg, #60a5fa, var(--accent))" }}></div></div>
                  <div style={{ padding: "0 28px", display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
                    {(target.sections || []).map((s, idx) => (
                      <div key={idx} style={{ padding: "14px 20px", borderBottom: idx === 0 ? "3px solid var(--accent)" : "none", color: idx === 0 ? "var(--accent)" : "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer" }}>{s.name}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: "36px", display: "flex", flexDirection: "column", gap: "28px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>The simulation shows candidates how the exam will appear — section tabs, timer, and question flow are all here.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {['A','B','C','D'].map((o, i) => (
                        <div key={i} style={{ padding: "14px 22px", background: i===0 ? "rgba(0,245,212,0.04)" : "rgba(255,255,255,0.02)", border: i===0 ? "1px solid rgba(0,245,212,0.2)" : "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", color: i===0 ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "13px", display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ width: "22px", height: "22px", borderRadius: "6px", background: i===0 ? "var(--accent)" : "rgba(255,255,255,0.05)", color: i===0 ? "#000" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "11px" }}>{o}</span>
                          Choice Analysis {o}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
                <button onClick={nextStep} style={{ padding: "20px 60px", background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)", color: "#000", fontWeight: 900, border: "none", borderRadius: "20px", fontSize: "14px", cursor: "pointer", boxShadow: "0 16px 48px rgba(0,245,212,0.4)" }}>CONFIRM VALIDATION &amp; CONTINUE</button>
              </div>
            </div>
          )}

          {/* STEP 4 — DEPLOYMENT */}
          {step === 4 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ marginBottom: "40px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginBottom: "6px" }}>Authorize Deployment</h3>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Final review before publishing to the cloud.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "32px" }}>
                  <h4 style={{ fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>Resource Manifest</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div><div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", marginBottom: "4px" }}>ENTITY_TITLE</div><div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{target.title}</div></div>
                    <div><div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", marginBottom: "4px" }}>ACCESS_KEY</div><div style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent)" }}>{target.key}</div></div>
                    <div><div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", marginBottom: "4px" }}>CATEGORY</div><div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{target.category} / {target.subCategory}</div></div>
                    <div><div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", marginBottom: "4px" }}>TOTAL QUESTIONS</div><div style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent)" }}>{(target.sections || []).reduce((a, s) => a + (s.topics || []).reduce((b, t) => b + (t.count || 0), 0), 0)} Qs</div></div>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "20px", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "2px" }}>Architecture Audit</h4>
                    <span style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 900 }}>{(target.sections || []).length} MODULES</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", padding: "12px 18px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>
                      <div style={{ width: "30%" }}>SECTION</div><div style={{ width: "40%" }}>TOPIC</div><div style={{ width: "15%", textAlign: "center" }}>QTY</div><div style={{ width: "15%", textAlign: "right" }}>MODE</div>
                    </div>
                    {(target.sections || []).map((s, sIdx) => (s.topics || []).map((t, idx) => (
                      <div key={`${s.name}-${t.name}`} style={{ display: "flex", padding: "14px 18px", background: (sIdx + idx) % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", borderRadius: "10px", fontSize: "12px", alignItems: "center" }}>
                        <div style={{ width: "30%", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "10px" }}>{s.name.toUpperCase()}</div>
                        <div style={{ width: "40%", fontWeight: 800, color: "#fff" }}>{t.name}</div>
                        <div style={{ width: "15%", textAlign: "center", fontWeight: 900, color: "var(--accent)" }}>{t.count}</div>
                        <div style={{ width: "15%", textAlign: "right" }}>
                          <span style={{ 
                            fontSize: "10px", padding: "3px 10px", borderRadius: "6px", 
                            background: t.mode === 'MANUAL' ? "rgba(0,245,212,0.1)" : "rgba(59,130,246,0.1)", 
                            fontWeight: 900, 
                            color: t.mode === 'MANUAL' ? "var(--accent)" : "#60a5fa",
                            border: `1px solid ${t.mode === 'MANUAL' ? "rgba(0,245,212,0.2)" : "rgba(59,130,246,0.2)"}`
                          }}>
                            {t.mode === 'MANUAL' ? "🔨 MANUAL" : "🎲 AUTO"}
                          </span>
                        </div>
                      </div>
                    )))}
                  </div>
                </div>
                <div style={{ padding: "24px", borderRadius: "18px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "rgb(239,68,68)" }}>Critical: This action is irreversible.</div>
                    <div style={{ fontSize: "11px", color: "rgba(239,68,68,0.6)" }}>Ensure all questions are mapped correctly before deployment.</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "60px", textAlign: "center" }}>
                <button onClick={handleSave} style={{ padding: "22px 72px", borderRadius: "20px", background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)", color: "#000", fontWeight: 900, fontSize: "15px", letterSpacing: "2px", border: "none", cursor: "pointer", boxShadow: "0 16px 64px rgba(0,245,212,0.4)" }}>
                  🚀 EXECUTE GLOBAL DEPLOYMENT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT sidebar — fixed, no overflow */}
        <div style={{ height: "100%", background: "rgba(26,15,43,0.9)", backdropFilter: "blur(40px)", display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "28px 24px", flex: 1, overflowY: "auto", overflowX: "hidden" }} className="no-scrollbar">
            <h3 style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "28px" }}>Deployment Analytics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>TARGET MODE</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent)" }}>{target.mode?.toUpperCase() || "MOCK"}</span>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(0,245,212,0.1)", color: "var(--accent)", fontSize: "8px", fontWeight: 900 }}>STABLE_v2</span>
                </div>
              </div>
              <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>GLOBAL SECTOR</div>
                <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>{target.category || "GENERAL"}</div>
                <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 800, marginTop: "4px" }}>{target.subCategory || "Awaiting Domain..."}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "18px", borderRadius: "18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "8px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>TOTAL</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--accent)" }}>{(target.sections || []).reduce((a, s) => a + (s.topics || []).reduce((b, t) => b + (t.count || 0), 0), 0)}</div>
                </div>
                <div style={{ padding: "18px", borderRadius: "18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "8px", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>MODULES</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#fff" }}>{target.sections?.length || 0}</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "32px" }}>
              <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.2)", marginBottom: "20px", letterSpacing: "2px" }}>SECTIONAL SATURATION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(target.sections || []).map(s => {
                  const stats = getSectionStats(s.name);
                  const totalAll = (target.sections || []).reduce((a, sc) => a + (sc.topics || []).reduce((b, t) => b + (t.count || 0), 0), 0);
                  return (
                    <div key={s.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{s.name}</span>
                        <span style={{ fontSize: "11px", fontWeight: 900, color: "var(--accent)" }}>{stats.total} Qs</span>
                      </div>
                      <div style={{ height: "5px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${(stats.total / Math.max(1, totalAll)) * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), #3b82f6)" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {step === 2 && (
            <div style={{ padding: "20px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <button onClick={nextStep} style={{ width: "100%", padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "#fff", fontWeight: 900, fontSize: "12px", cursor: "pointer" }}>
                CONTINUE TO PREVIEW
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
