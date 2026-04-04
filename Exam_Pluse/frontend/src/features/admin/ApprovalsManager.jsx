import React, { useState } from "react";

const fmtDate = (d) => { if (!d) return "—"; const dt = new Date(d); return isNaN(dt) ? "—" : dt.toLocaleString("en-IN"); };

const T = {
  accent:    "#00f5d4",
  textPrim:  "#f0eafa",
  textSec:   "#c4b5d4",
  textMuted: "#8b7ba8",
  surface:   "#1e1133",
  surfaceHi: "#261840",
  border:    "rgba(255,255,255,0.09)",
  green:     "#34d399",
  red:       "#f87171",
  gold:      "#fbbf24",
  blue:      "#60a5fa",
};

const STATUS_CFG = {
  pending:  { label: "PENDING",  color: T.gold,  bg: "rgba(251,191,36,0.12)",  bd: "rgba(251,191,36,0.3)"  },
  approved: { label: "APPROVED", color: T.green, bg: "rgba(52,211,153,0.12)",  bd: "rgba(52,211,153,0.3)"  },
  rejected: { label: "REJECTED", color: T.red,   bg: "rgba(248,113,113,0.12)", bd: "rgba(248,113,113,0.3)" },
};

const PLANS = ["basic", "pro", "premium", "lifetime"];
const PLAN_COLORS = { basic: T.blue, pro: "#a78bfa", premium: T.accent, lifetime: T.gold };

const PAGE_SIZE = 15;

export default function ApprovalsManager({ submissions, processSubmission, sendCorrectionLink, setRejectionModal, showToast }) {
  const [filter, setFilter]   = useState("approved");
  const [planMap, setPlanMap] = useState({});
  const [page, setPage]       = useState(1);

  const getStatus = (sub) => (sub.status || "pending").toLowerCase();

  const counts = {
    all:      submissions.length,
    pending:  submissions.filter(s => getStatus(s) === "pending").length,
    approved: submissions.filter(s => getStatus(s) === "approved").length,
    rejected: submissions.filter(s => getStatus(s) === "rejected").length,
  };

  const filtered = submissions.filter(sub => {
    if (filter === "all") return true;
    return getStatus(sub) === filter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (f) => { setFilter(f); setPage(1); };

  const TABS = [
    { id: "all",      label: "All",      count: counts.all,      color: T.accent },
    { id: "pending",  label: "Pending",  count: counts.pending,  color: T.gold   },
    { id: "approved", label: "Approved", count: counts.approved, color: T.green  },
    { id: "rejected", label: "Rejected", count: counts.rejected, color: T.red    },
  ];

  return (
    <div style={{ animation: "fadeUp 0.35s ease", display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Header + Tabs (same row) ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "24px", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Approvals</h2>
          <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0", fontWeight: 500 }}>
            Verify payment submissions and activate student memberships
          </p>
        </div>

        {/* Tabs → right side */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {TABS.map(tab => {
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => handleFilterChange(tab.id)} style={{
                padding: "9px 18px", borderRadius: "11px", cursor: "pointer", transition: "all 0.18s",
                background: active ? `${tab.color}18` : "rgba(255,255,255,0.04)",
                border: active ? `1.5px solid ${tab.color}50` : "1.5px solid rgba(255,255,255,0.07)",
                color: active ? tab.color : T.textMuted,
                fontWeight: active ? 800 : 600, fontSize: "13px",
                display: "flex", alignItems: "center", gap: "7px",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = T.textSec; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = T.textMuted; } }}
              >
                {tab.label}
                <span style={{
                  padding: "2px 7px", borderRadius: "7px", fontSize: "11px", fontWeight: 900,
                  background: active ? `${tab.color}25` : "rgba(255,255,255,0.06)",
                  color: active ? tab.color : T.textMuted,
                }}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table container — sticky header, scrollable body ── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "18px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ overflowX: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            {/* ── Sticky thead ── */}
            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#1e1133" }}>
              <tr>
                {["Student", "Transaction ID", "Plan", "Submitted", "Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "13px 20px", textAlign: "left",
                    fontSize: "11px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px",
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: `1px solid ${T.border}`,
                    whiteSpace: "nowrap",
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>

            {/* ── Scrollable tbody ── */}
            <tbody>
              {paginated.map(sub => {
                const status = getStatus(sub);
                const sc = STATUS_CFG[status] || STATUS_CFG.pending;
                const pc = PLAN_COLORS[planMap[sub._id] || sub.planType] || T.accent;
                const isPending = status === "pending";

                return (
                  <tr key={sub._id} style={{ borderTop: `1px solid ${T.border}`, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "13px 20px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: T.textPrim }}>{sub.name}</div>
                      <div style={{ fontSize: "11px", color: T.accent, fontFamily: "monospace", marginTop: "2px" }}>{sub.userCode}</div>
                    </td>

                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ fontSize: "12px", color: T.blue, fontWeight: 700, fontFamily: "monospace" }}>
                        {sub.transactionId || <span style={{ color: T.textMuted, fontFamily: "sans-serif", fontWeight: 500 }}>N/A</span>}
                      </span>
                    </td>

                    <td style={{ padding: "13px 20px", whiteSpace: "nowrap" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "7px", background: `${pc}18`, color: pc, fontSize: "11px", fontWeight: 800, border: `1px solid ${pc}30` }}>
                        {(sub.planType || "PREMIUM").toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: "13px 20px", fontSize: "12px", color: T.textSec, whiteSpace: "nowrap" }}>{fmtDate(sub.createdAt)}</td>

                    <td style={{ padding: "13px 20px", whiteSpace: "nowrap" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "7px", background: sc.bg, color: sc.color, fontSize: "11px", fontWeight: 900, border: `1px solid ${sc.bd}`, letterSpacing: "0.5px" }}>
                        {sc.label}
                      </span>
                    </td>

                    <td style={{ padding: "13px 20px" }}>
                      {isPending ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", minWidth: "190px" }}>
                          <select value={planMap[sub._id] || sub.planType || "premium"}
                            onChange={e => setPlanMap(p => ({ ...p, [sub._id]: e.target.value }))}
                            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, outline: "none", cursor: "pointer" }}
                          >
                            {PLANS.map(p => <option key={p} value={p} style={{ background: "#1e1133" }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                          </select>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => processSubmission(sub._id, "approved", planMap[sub._id] || sub.planType || "premium")}
                              style={{ flex: 1, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: T.green, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>
                              ✅ Approve
                            </button>
                            <button onClick={() => setRejectionModal(sub)}
                              style={{ flex: 1, background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.3)", color: T.red, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => sendCorrectionLink(sub._id)}
                          style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.textSec, padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          📧 Resend
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>
                      {filter === "approved" ? "✅" : filter === "rejected" ? "❌" : filter === "pending" ? "⏳" : "📋"}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>
                      No {filter === "all" ? "" : filter} submissions found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px", borderTop: `1px solid ${T.border}`,
            background: "rgba(255,255,255,0.02)", flexShrink: 0,
          }}>
            <span style={{ fontSize: "13px", color: T.textMuted, fontWeight: 600 }}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                style={{ padding: "7px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: safePage === 1 ? T.textMuted : T.textPrim, cursor: safePage === 1 ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: safePage === 1 ? 0.4 : 1 }}>
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - safePage) <= 2).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: "7px 13px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer", transition: "0.15s",
                    background: p === safePage ? T.accent : "rgba(255,255,255,0.05)",
                    color: p === safePage ? "#000" : T.textMuted,
                    border: p === safePage ? "none" : `1px solid ${T.border}`,
                  }}>
                  {p}
                </button>
              ))}

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                style={{ padding: "7px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: safePage === totalPages ? T.textMuted : T.textPrim, cursor: safePage === totalPages ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: safePage === totalPages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        select option { background: #1e1133; color: #f0eafa; }
      `}</style>
    </div>
  );
}
