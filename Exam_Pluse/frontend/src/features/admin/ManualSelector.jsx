import React from 'react';

/**
 * 🔍 ManualSelector Overlay (Full-Screen Premium)
 * Handles the manual question selection for a specific topic cluster.
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
      background: "#211335", 
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
       <div style={{ height: "80px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "rgba(33, 19, 53, 0.8)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
             <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.2)", marginBottom: "6px", letterSpacing: "1px" }}>DEPLO_ARCHITECTURE_AUDIT</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.3)", padding: "8px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "8px", color: "#60a5fa", fontWeight: 900 }}>AUTO</span>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#60a5fa" }}>{Math.max(0, targetCount - currentSelectedCount)}</span>
                   </div>
                   <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", fontWeight: 900 }}>+</span>
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "8px", color: "var(--accent)", fontWeight: 900 }}>MANUAL</span>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "var(--accent)" }}>{currentSelectedCount}</span>
                   </div>
                   <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", fontWeight: 900 }}>=</span>
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "8px", color: "#fff", fontWeight: 900, opacity: 0.5 }}>TOTAL</span>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#fff" }}>{targetCount}</span>
                   </div>
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
                               padding: "40px", 
                               background: isSelected ? "rgba(0, 245, 212, 0.04)" : "rgba(255,255,255,0.02)", 
                               borderRadius: "32px", 
                               border: isSelected ? "1px solid rgba(0, 245, 212, 0.3)" : "1px solid rgba(255,255,255,0.06)", 
                               position: "relative",
                               cursor: "pointer",
                               transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                               boxShadow: isSelected ? "0 20px 50px rgba(0, 245, 212, 0.05)" : "none"
                           }}
                           onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                           }}
                           onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                           }}
                        >
                           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                 <span style={{ fontSize: "10px", fontWeight: 900, color: isSelected ? "#000" : "var(--accent)", background: isSelected ? "var(--accent)" : "rgba(0, 245, 212, 0.1)", padding: "4px 14px", borderRadius: "8px", letterSpacing: "1px" }}>RESOURCE_ID_{i+1}</span>
                                 <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "1px" }}>SHA: {q._id.slice(-8).toUpperCase()}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                 <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>VERIFIED_KEY:</span>
                                 <span style={{ fontSize: "13px", fontWeight: 900, color: "#fff", background: "rgba(0, 245, 212, 0.1)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: "1px solid rgba(0, 245, 212, 0.2)" }}>{q.answer}</span>
                              </div>
                           </div>
                           
                           <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "36px", lineHeight: "1.6", letterSpacing: "-0.3px" }}>{q.qText || q.q}</h3>
                           
                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                              {['A','B','C','D'].map(opt => (
                                 <div key={opt} style={{ 
                                    padding: "20px 28px", 
                                    background: q.answer === opt ? "rgba(0, 245, 212, 0.03)" : "rgba(0,0,0,0.2)", 
                                    borderRadius: "18px", 
                                    fontSize: "15px", 
                                    border: q.answer === opt ? "1px solid rgba(0, 245, 212, 0.15)" : "1px solid rgba(255,255,255,0.04)", 
                                    transition: "0.3s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px"
                                 }}>
                                    <span style={{ color: q.answer === opt ? "var(--accent)" : "rgba(255,255,255,0.2)", fontWeight: 900 }}>{opt}.</span> 
                                    <span style={{ color: q.answer === opt ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: q.answer === opt ? 700 : 400 }}>{q['o'+opt] || q[opt]}</span>
                                 </div>
                              ))}
                           </div>

                           {/* Selection Ring (Neatly Polished) */}
                           <div style={{ position: "absolute", top: "40px", right: "-12px", width: "28px", height: "28px", borderRadius: "50%", background: isSelected ? "var(--accent)" : "#1a0f2b", border: isSelected ? "none" : "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s", boxShadow: isSelected ? "0 0 15px rgba(0, 245, 212, 0.4)" : "none" }}>
                              {isSelected && <span style={{ color: "#000", fontSize: "14px", fontWeight: 900 }}>✓</span>}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>

          {/* Right Summary Sidebar (Neat Refinement) */}
          <div style={{ background: "var(--glass-heavy)", backdropFilter: "blur(40px)", borderLeft: "1px solid rgba(255,255,255,0.08)", padding: "48px", display: "flex", flexDirection: "column" }}>
             <h3 style={{ fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "48px" }}>Resource Statistics</h3>
             
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
                SAVE & RETURN
             </button>
          </div>
       </div>
    </div>
  );
};
