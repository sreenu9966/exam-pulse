import React, { useState } from "react";

const T = {
  accent: "#00f5d4", textPrim: "#f0eafa", textSec: "#c4b5d4", textMuted: "#8b7ba8",
  surface: "#1e1133", border: "rgba(255,255,255,0.09)", green: "#34d399",
  red: "#f87171", gold: "#fbbf24", blue: "#60a5fa",
};

const CATEGORY_ICONS = {
  Aptitude: "🧮", Reasoning: "🧠", Verbal: "📖", Technical: "💻",
};

const OPT_LABELS = ["A", "B", "C", "D"];

export default function QuestionBank({
  questions, activeCategory, setActiveCategory,
  qFilter, setQFilter, categoryMap,
  searchTerm, setSearchTerm,
  deleteQuestion, setEditQ, setNewQModal,
  qPage, setQPage, qTotalPages, showToast
}) {
  const [expandedId, setExpandedId] = useState(null); // which row's answers are open
  const categories = Object.keys(categoryMap);
  const topics = categoryMap[activeCategory] || [];

  const toggleAnswer = (id) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div style={{ animation: "fadeUp 0.35s ease", display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Question Bank</h2>
          <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0" }}>Curate exam questions and verify data integrity</p>
        </div>
        <button onClick={() => setNewQModal(true)}
          style={{ background: T.accent, color: "#000", border: "none", padding: "12px 22px", borderRadius: "12px", fontWeight: 800, cursor: "pointer", fontSize: "13px", boxShadow: "0 6px 20px rgba(0,245,212,0.3)" }}>
          ⚡ New Question
        </button>
      </div>

      {/* ── Category Tabs (LEFT → RIGHT) ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", flexShrink: 0 }}>
        {categories.map(cat => {
          const active = activeCategory === cat;
          const icon   = CATEGORY_ICONS[cat] || "📂";
          return (
            <button key={cat}
              onClick={() => { setActiveCategory(cat); setQFilter("All"); setQPage(1); }}
              style={{
                padding: "10px 20px", borderRadius: "12px", cursor: "pointer", transition: "all 0.18s",
                background: active ? "rgba(0,245,212,0.12)" : "rgba(255,255,255,0.04)",
                border: active ? "1.5px solid rgba(0,245,212,0.4)" : "1.5px solid rgba(255,255,255,0.08)",
                color: active ? T.accent : T.textMuted,
                fontWeight: active ? 800 : 600, fontSize: "14px",
                display: "flex", alignItems: "center", gap: "8px", position: "relative",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = T.textSec; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = T.textMuted; } }}
            >
              <span style={{ fontSize: "16px" }}>{icon}</span>
              <span>{cat}</span>
              {active && <div style={{ position: "absolute", bottom: 0, left: "20%", width: "60%", height: "2px", background: T.accent, borderRadius: "2px 2px 0 0" }} />}
            </button>
          );
        })}
      </div>

      {/* ── Search + Topic Filter ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "center", flexShrink: 0 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px" }}>🔍</span>
          <input
            type="text" placeholder="Search questions by text or topic…"
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setQPage(1); }}
            style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, color: T.textPrim, padding: "11px 18px 11px 42px", borderRadius: "12px", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "rgba(0,245,212,0.4)"}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>
        <select value={qFilter} onChange={e => { setQFilter(e.target.value); setQPage(1); }}
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrim, padding: "11px 16px", borderRadius: "12px", outline: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", minWidth: "180px" }}>
          <option value="All">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* ── Table — sticky thead, only tbody scrolls ── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "18px", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: "auto", overflowX: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>

            {/* ── Sticky thead with Fixed Widths ── */}
            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#1e1133" }}>
              <tr>
                <th style={{ width: "4%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>#</th>
                <th style={{ width: "38%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>QUESTION</th>
                <th style={{ width: "13%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>CORRECT</th>
                <th style={{ width: "10%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>EXP</th>
                <th style={{ width: "14%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>TOPIC</th>
                <th style={{ width: "10%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>TYPE</th>
                <th style={{ width: "13%", padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}` }}>ACTIONS</th>
              </tr>
            </thead>

            {/* ── tbody ── */}
            <tbody>
              {questions.map((q, idx) => {
                const isOpen = expandedId === q._id;
                
                // DATA MAPPING FROM BACKEND (Question.js: q, o, a, s) + Robust Fallbacks
                const questionText = q.q || q.qText || "—";
                
                // Try to find options: q.o (array), q.options (array), or discrete oA...oD
                let opts = q.o || q.options;
                if (!opts || !Array.isArray(opts)) {
                  opts = [q.oA, q.oB, q.oC, q.oD].filter(o => o !== undefined && o !== null);
                }
                
                // Try to find correct answer: q.a, q.answer, q.correctOption
                const correctVal = (q.a !== undefined && q.a !== null) ? q.a : (q.answer !== undefined ? q.answer : q.correctOption);
                
                let correctIdx = -1;
                if (correctVal !== undefined && correctVal !== null && opts.length > 0) {
                  const cleaned = String(correctVal).trim();
                  const parsed = parseInt(cleaned);
                  
                  // If it's a number AND within array bounds, it's an index
                  if (!isNaN(parsed) && cleaned.length > 0 && parsed >= 0 && parsed < opts.length) {
                    correctIdx = parsed;
                  } 
                  // Otherwise, check if it's a letter (A, B, C, D)
                  else if (OPT_LABELS.includes(cleaned.toUpperCase())) {
                    correctIdx = OPT_LABELS.indexOf(cleaned.toUpperCase());
                  }
                  // Finally, try direct text match (handles cases like a: "40")
                  else {
                    const valStr = cleaned.toLowerCase();
                    const matchIdx = opts.findIndex(o => String(o).toLowerCase() === valStr);
                    if (matchIdx !== -1) {
                      correctIdx = matchIdx;
                    }
                  }
                }

                return (
                  <React.Fragment key={q._id}>
                    {/* ── Main row — Fixed cells ── */}
                    <tr 
                      style={{ borderTop: `1px solid ${T.border}`, transition: "background 0.15s", background: isOpen ? "rgba(0,245,212,0.04)" : "transparent" }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* # */}
                      <td style={{ padding: "13px 18px", fontSize: "12px", color: T.textMuted, fontWeight: 700 }}>
                        {(qPage - 1) * 15 + idx + 1}
                      </td>

                      {/* Question text — Word wrap and clear boundary */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ fontSize: "14px", color: T.textPrim, fontWeight: 600, lineHeight: 1.55, wordBreak: "break-word", overflowWrap: "break-word" }}>
                          {questionText}
                        </div>
                      </td>

                      {/* Correct Answer */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: T.accent, display: "flex", gap: "5px" }}>
                          <span style={{ opacity: 0.6 }}>{correctIdx >= 0 ? OPT_LABELS[correctIdx] : "?"}</span>
                          <span style={{ color: "#fff" }}>{correctIdx >= 0 ? opts[correctIdx] : (correctVal || "—")}</span>
                        </div>
                      </td>

                      {/* EXP Status */}
                      <td style={{ padding: "13px 18px" }}>
                        {q.explanation ? (
                          <span style={{ fontSize: "10px", fontWeight: 900, color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(52,211,153,0.25)" }}>YES</span>
                        ) : (
                          <span style={{ fontSize: "10px", fontWeight: 900, color: "#f87171", background: "rgba(248,113,113,0.12)", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.25)" }}>N/A</span>
                        )}
                      </td>

                      {/* Topic */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: T.accent, wordBreak: "break-word", whiteSpace: "normal" }}>{(q.s || q.topic || "CORE").toUpperCase()}</div>
                        <div style={{ fontSize: "11px", color: T.textMuted, marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis" }}>{q.subtopic || q.subTopic || "General"}</div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 900, background: q.isPYQ ? "rgba(251,191,36,0.12)" : "rgba(96,165,250,0.12)", color: q.isPYQ ? T.gold : T.blue, border: `1px solid ${q.isPYQ ? "rgba(251,191,36,0.3)" : "rgba(96,165,250,0.3)"}` }}>
                          {q.isPYQ ? "PYQ" : "GENERIC"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button onClick={() => toggleAnswer(q._id)}
                            style={{ background: isOpen ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isOpen ? "rgba(0,245,212,0.4)" : "rgba(255,255,255,0.12)"}`, color: isOpen ? T.accent : T.textSec, padding: "7px 11px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "11.5px", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {isOpen ? "▲ Hide" : "▼ Opts"}
                          </button>
                          <button onClick={() => setEditQ(q)}
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: T.textPrim, padding: "7px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                            Edit
                          </button>
                          <button onClick={() => deleteQuestion(q._id)}
                            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", color: T.red, padding: "7px 10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded Answer Row ── */}
                    {isOpen && (
                      <tr style={{ background: "rgba(0,245,212,0.03)", borderTop: `1px solid rgba(0,245,212,0.1)` }}>
                        <td colSpan={7} style={{ padding: "0 18px 20px 48px" }}>
                          <div style={{ paddingTop: "16px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 900, color: T.textMuted, letterSpacing: "1.5px", marginBottom: "12px" }}>
                              OPTIONS — CORRECT: <span style={{ color: T.accent }}>
                                {correctIdx >= 0 ? `${OPT_LABELS[correctIdx]}. ${opts[correctIdx] || "?"}` : (q.a || q.answer || "—")}
                              </span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "100%" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 2, minWidth: "300px" }}>
                                {opts.map((opt, i) => {
                                  const isCorrect = i === correctIdx;
                                  return (
                                    <div key={i} style={{
                                      padding: "10px 14px", borderRadius: "10px",
                                      background: isCorrect ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.02)",
                                      border: isCorrect ? "1.5px solid rgba(52,211,153,0.4)" : `1px solid ${T.border}`,
                                      display: "flex", alignItems: "center", gap: "10px",
                                    }}>
                                      <div style={{
                                        width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0,
                                        background: isCorrect ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.05)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "11px", fontWeight: 900, color: isCorrect ? T.green : T.textMuted,
                                      }}>
                                        {isCorrect ? "✓" : OPT_LABELS[i]}
                                      </div>
                                      <span style={{ fontSize: "13px", color: isCorrect ? T.textPrim : T.textSec }}>{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {q.explanation && (
                                <div style={{ flex: 1, minWidth: "260px", padding: "16px", background: "rgba(0,245,212,0.04)", borderRadius: "14px", border: `1px solid rgba(0,245,212,0.15)` }}>
                                  <div style={{ fontSize: "10px", fontWeight: 900, color: T.accent, marginBottom: "8px", letterSpacing: "1.2px" }}>💡 EXPLANATION</div>
                                  <div style={{ fontSize: "12.5px", color: T.textSec, lineHeight: "1.55", whiteSpace: "pre-wrap" }}>{q.explanation}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {questions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>📝</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>No questions found for this selection.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {qTotalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 22px", borderTop: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
            <span style={{ fontSize: "13px", color: T.textMuted, fontWeight: 600 }}>Page {qPage} of {qTotalPages}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button disabled={qPage === 1} onClick={() => { setQPage(qPage - 1); setExpandedId(null); }}
                style={{ padding: "7px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: qPage === 1 ? T.textMuted : T.textPrim, cursor: qPage === 1 ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: qPage === 1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              {Array.from({ length: qTotalPages }, (_, i) => i + 1).filter(p => Math.abs(p - qPage) <= 2).map(p => (
                <button key={p} onClick={() => { setQPage(p); setExpandedId(null); }}
                  style={{ padding: "7px 12px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer", background: p === qPage ? T.accent : "rgba(255,255,255,0.05)", color: p === qPage ? "#000" : T.textMuted, border: p === qPage ? "none" : `1px solid ${T.border}` }}>
                  {p}
                </button>
              ))}
              <button disabled={qPage === qTotalPages} onClick={() => { setQPage(qPage + 1); setExpandedId(null); }}
                style={{ padding: "7px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: qPage === qTotalPages ? T.textMuted : T.textPrim, cursor: qPage === qTotalPages ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: qPage === qTotalPages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        select option { background: #1e1133; color: #f0eafa; }
      `}</style>
    </div>
  );
}
