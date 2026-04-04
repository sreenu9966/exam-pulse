import React, { useState } from "react";

const T = {
  accent: "#00f5d4", textPrim: "#f0eafa", textSec: "#c4b5d4", textMuted: "#8b7ba8",
  surface: "#1e1133", surfaceHi: "#261840", border: "rgba(255,255,255,0.09)",
  green: "#34d399", red: "#f87171", gold: "#fbbf24", blue: "#60a5fa",
};

const fmtDate = (d) => { if (!d) return "—"; const dt = new Date(d); return isNaN(dt) ? "—" : dt.toLocaleString("en-IN"); };

const PAGE_SIZE = 15;

const Pagination = ({ page, total, pageSize, onPage }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const safe = Math.min(page, totalPages);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 22px", borderTop: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
      <span style={{ fontSize: "13px", color: T.textMuted, fontWeight: 600 }}>
        Showing {(safe - 1) * pageSize + 1}–{Math.min(safe * pageSize, total)} of {total}
      </span>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button onClick={() => onPage(p => Math.max(1, p - 1))} disabled={safe === 1}
          style={{ padding: "7px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: safe === 1 ? T.textMuted : T.textPrim, cursor: safe === 1 ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: safe === 1 ? 0.4 : 1 }}>← Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - safe) <= 2).map(p => (
          <button key={p} onClick={() => onPage(() => p)}
            style={{ padding: "7px 12px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer", transition: "0.15s", background: p === safe ? T.accent : "rgba(255,255,255,0.05)", color: p === safe ? "#000" : T.textMuted, border: p === safe ? "none" : `1px solid ${T.border}` }}>{p}</button>
        ))}
        <button onClick={() => onPage(p => Math.min(totalPages, p + 1))} disabled={safe === totalPages}
          style={{ padding: "7px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: safe === totalPages ? T.textMuted : T.textPrim, cursor: safe === totalPages ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: safe === totalPages ? 0.4 : 1 }}>Next →</button>
      </div>
    </div>
  );
};

const StickyTable = ({ headers, children, empty, pagination }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "18px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
    <div style={{ overflowX: "auto", flex: 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#1e1133" }}>
          <tr>
            {headers.map((h, hi) => (
              <th key={hi} style={{ padding: "13px 20px", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px", background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
    {empty}
    {pagination}
  </div>
);

const RowStyle = { borderTop: `1px solid ${T.border}`, transition: "background 0.15s" };
const onRowEnter = e => e.currentTarget.style.background = "rgba(255,255,255,0.025)";
const onRowLeave = e => e.currentTarget.style.background = "transparent";

const TD = ({ children, style = {} }) => (
  <td style={{ padding: "13px 20px", ...style }}>{children}</td>
);

/* ─────────────────────────────────────── */
/*  SUPPORT TICKETS                        */
/* ─────────────────────────────────────── */
export function SupportTickets({ issues = [], resolveIssue, showToast }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const dataArr = Array.isArray(issues) ? issues : [];
  const filtered = dataArr.filter(i => filter === "all" ? true : filter === "open" ? i.status !== "resolved" : i.status === "resolved");
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts = { all: dataArr.length, open: dataArr.filter(i => i.status !== "resolved").length, resolved: dataArr.filter(i => i.status === "resolved").length };
  const TABS = [{ id: "all", label: "All", color: T.accent }, { id: "open", label: "Open", color: T.gold }, { id: "resolved", label: "Resolved", color: T.green }];

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Support Tickets</h2>
          <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0" }}>Resolve student issues and platform exceptions</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {TABS.map(tab => {
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => { setFilter(tab.id); setPage(1); }}
                style={{ padding: "9px 16px", borderRadius: "11px", cursor: "pointer", background: active ? `${tab.color}18` : "rgba(255,255,255,0.04)", border: active ? `1.5px solid ${tab.color}50` : "1.5px solid rgba(255,255,255,0.07)", color: active ? tab.color : T.textMuted, fontWeight: active ? 800 : 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "7px" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = T.textSec; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = T.textMuted; } }}>
                {tab.label}
                <span style={{ padding: "2px 7px", borderRadius: "7px", fontSize: "11px", fontWeight: 900, background: active ? `${tab.color}25` : "rgba(255,255,255,0.06)", color: active ? tab.color : T.textMuted }}>{counts[tab.id] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <StickyTable
        headers={["Ticket", "Student", "Status", "Created", "Action"]}
        empty={paged.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎫</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>No {filter === 'all' ? '' : filter} tickets found.</div>
          </div>
        ) : null}
        pagination={<Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />}
      >
        {paged.map((issue, idx) => {
          const isResolved = issue.status === "resolved";
          return (
            <tr key={issue._id || idx} style={RowStyle} onMouseEnter={onRowEnter} onMouseLeave={onRowLeave}>
              <TD><div style={{ fontWeight: 700, fontSize: "14px", color: T.textPrim, maxWidth: "320px" }}>{issue.title || "Platform Query"}</div><div style={{ fontSize: "12px", color: T.textMuted, marginTop: "3px", lineHeight: 1.5 }}>{issue.description?.slice(0, 80)}{issue.description?.length > 80 ? "…" : ""}</div></TD>
              <TD><span style={{ fontSize: "12px", color: T.accent, fontFamily: "monospace", fontWeight: 700 }}>{issue.userCode || '—'}</span></TD>
              <TD><span style={{ padding: "4px 10px", borderRadius: "7px", background: isResolved ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)", color: isResolved ? T.green : T.gold, fontSize: "11px", fontWeight: 900, border: `1px solid ${isResolved ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}` }}>{isResolved ? "RESOLVED" : "OPEN"}</span></TD>
              <TD style={{ fontSize: "12px", color: T.textSec, whiteSpace: "nowrap" }}>{fmtDate(issue.createdAt)}</TD>
              <TD>{!isResolved ? (<button onClick={() => resolveIssue(issue._id)} style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: T.green, padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>✅ Resolve</button>) : (<span style={{ fontSize: "12px", color: T.textMuted }}>Closed</span>)}</TD>
            </tr>
          );
        })}
      </StickyTable>
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  REVIEW MANAGER                         */
/* ─────────────────────────────────────── */
export function ReviewManager({ reviews, toggleReviewApproval, deleteReview, showToast }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = reviews.filter(r => filter === "all" ? true : filter === "approved" ? r.approved : !r.approved);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts = { all: reviews.length, approved: reviews.filter(r => r.approved).length, pending: reviews.filter(r => !r.approved).length };
  const TABS = [{ id: "all", label: "All", color: T.accent }, { id: "approved", label: "Approved", color: T.green }, { id: "pending", label: "Pending", color: T.gold }];

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Reviews</h2>
          <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0" }}>Manage user feedback and social proof</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {TABS.map(tab => {
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => { setFilter(tab.id); setPage(1); }}
                style={{ padding: "9px 16px", borderRadius: "11px", cursor: "pointer", background: active ? `${tab.color}18` : "rgba(255,255,255,0.04)", border: active ? `1.5px solid ${tab.color}50` : "1.5px solid rgba(255,255,255,0.07)", color: active ? tab.color : T.textMuted, fontWeight: active ? 800 : 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "7px" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = T.textSec; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = T.textMuted; } }}>
                {tab.label}
                <span style={{ padding: "2px 7px", borderRadius: "7px", fontSize: "11px", fontWeight: 900, background: active ? `${tab.color}25` : "rgba(255,255,255,0.06)", color: active ? tab.color : T.textMuted }}>{counts[tab.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <StickyTable
        headers={["Student", "Plan", "Rating", "Comment", "Status", "Actions"]}
        empty={paged.length === 0 ? <div style={{ padding: "60px", textAlign: "center" }}><div style={{ fontSize: "36px", marginBottom: "10px" }}>⭐</div><div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>No {filter === 'all' ? '' : filter} reviews found.</div></div> : null}
        pagination={<Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />}
      >
        {paged.map((rev, idx) => (
          <tr key={rev._id || idx} style={RowStyle} onMouseEnter={onRowEnter} onMouseLeave={onRowLeave}>
            <TD>
              <div style={{ fontWeight: 700, fontSize: "14px", color: T.textPrim }}>
                {(!rev.name || rev.name === "User" || rev.name === "Student" || rev.name === rev.userCode) ? "Verified Student" : rev.name}
              </div>
              <div style={{ fontSize: "11px", color: T.accent, fontFamily: "monospace", marginTop: "2px" }}>{rev.userCode || '—'}</div>
            </TD>
            <TD><span style={{ padding: "4px 9px", borderRadius: "7px", background: "rgba(0,245,212,0.1)", color: T.accent, fontSize: "11px", fontWeight: 800 }}>{rev.plan || "Free"}</span></TD>
            <TD><span style={{ color: "#fbbf24", fontSize: "14px" }}>{"⭐".repeat(rev.rating || 0)}</span></TD>
            <TD style={{ maxWidth: "300px" }}><span style={{ fontSize: "13px", color: T.textSec, fontStyle: "italic" }}>"{rev.text?.slice(0, 80) || ""}{rev.text?.length > 80 ? "…" : ""}"</span></TD>
            <TD><span style={{ padding: "4px 10px", borderRadius: "7px", background: rev.approved ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)", color: rev.approved ? T.green : T.gold, fontSize: "11px", fontWeight: 900, border: `1px solid ${rev.approved ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}` }}>{rev.approved ? "LIVE" : "PENDING"}</span></TD>
            <TD>
              <div style={{ display: "flex", gap: "7px" }}>
                <button onClick={() => toggleReviewApproval(rev._id, !rev.approved)} style={{ background: rev.approved ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.12)", border: `1px solid ${rev.approved ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.35)"}`, color: rev.approved ? T.gold : T.green, padding: "7px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>{rev.approved ? "Unpublish" : "Approve"}</button>
                <button onClick={() => deleteReview(rev._id)} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: T.red, padding: "7px 11px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Del</button>
              </div>
            </TD>
          </tr>
        ))}
      </StickyTable>
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  LEADERBOARD VIEW                       */
/* ─────────────────────────────────────── */
export function LeaderboardView({ leaderboard, showToast }) {
  const [page, setPage] = useState(1);
  const data = leaderboard || [];
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rankColors = ["#fbbf24", "#cbd5e1", "#b45309"];

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Rankings</h2>
        <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0" }}>Global standings · {data.length} students ranked</p>
      </div>

      <StickyTable
        headers={["Rank", "Student", "Score", "Accuracy", "Avg Time", "Attempts"]}
        empty={paged.length === 0 ? <div style={{ padding: "60px", textAlign: "center" }}><div style={{ fontSize: "36px", marginBottom: "10px" }}>🏅</div><div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>No ranking data available.</div></div> : null}
        pagination={<Pagination page={page} total={data.length} pageSize={PAGE_SIZE} onPage={setPage} />}
      >
        {paged.map((entry, idx) => {
          const rank = (page - 1) * PAGE_SIZE + idx + 1;
          const rc = rankColors[rank - 1] || T.textMuted;
          return (
            <tr key={entry._id || idx} style={RowStyle} onMouseEnter={onRowEnter} onMouseLeave={onRowLeave}>
              <TD>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", background: rank <= 3 ? `${rc}18` : "rgba(255,255,255,0.05)", border: `1px solid ${rank <= 3 ? rc : "rgba(255,255,255,0.1)"}`, color: rank <= 3 ? rc : T.textMuted, boxShadow: rank === 1 ? `0 0 12px ${rc}40` : "none" }}>
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}
                </div>
              </TD>
              <TD><div style={{ fontWeight: 700, fontSize: "14px", color: T.textPrim }}>{entry.name || 'Student'}</div><div style={{ fontSize: "11px", color: T.accent, fontFamily: "monospace", marginTop: "2px" }}>{entry.userCode || '—'}</div></TD>
              <TD><span style={{ fontSize: "20px", fontWeight: 900, color: T.textPrim }}>{entry.score}</span></TD>
              <TD><span style={{ fontWeight: 800, fontSize: "14px", color: entry.accuracy > 80 ? T.green : entry.accuracy > 60 ? T.gold : T.red }}>{entry.accuracy}%</span></TD>
              <TD style={{ fontSize: "13px", color: T.textSec }}>{entry.avgTime || "0"}m</TD>
              <TD style={{ fontSize: "14px", fontWeight: 800, color: T.blue }}>{entry.attempts || 1}</TD>
            </tr>
          );
        })}
      </StickyTable>
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  TRASH BIN                              */
/* ─────────────────────────────────────── */
export function TrashBin({ trashQuestions, recoverTrashQuestion, deleteTrashPermanently, showToast }) {
  const [page, setPage] = useState(1);
  const data = trashQuestions || [];
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Trash Bin</h2>
        <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0" }}>Restore or permanently delete {data.length} archived questions</p>
      </div>

      <StickyTable
        headers={["Question", "Topic", "Deleted On", "Actions"]}
        empty={paged.length === 0 ? <div style={{ padding: "60px", textAlign: "center" }}><div style={{ fontSize: "36px", marginBottom: "10px" }}>🗑️</div><div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>Trash bin is empty.</div></div> : null}
        pagination={<Pagination page={page} total={data.length} pageSize={PAGE_SIZE} onPage={setPage} />}
      >
        {paged.map((q, idx) => (
          <tr key={q._id || idx} style={RowStyle} onMouseEnter={onRowEnter} onMouseLeave={onRowLeave}>
            <TD style={{ maxWidth: "420px" }}><div style={{ fontSize: "14px", color: T.textSec, lineHeight: 1.5 }}>{q.qText || q.q}</div></TD>
            <TD><span style={{ padding: "4px 10px", borderRadius: "7px", background: "rgba(0,245,212,0.1)", color: T.accent, fontSize: "11px", fontWeight: 800 }}>{q.topic?.toUpperCase() || "—"}</span></TD>
            <TD style={{ fontSize: "12px", color: T.textMuted, whiteSpace: "nowrap" }}>{fmtDate(q.updatedAt)}</TD>
            <TD>
              <div style={{ display: "flex", gap: "7px" }}>
                <button onClick={() => recoverTrashQuestion(q._id)} style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.3)", color: T.accent, padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>↩ Restore</button>
                <button onClick={() => deleteTrashPermanently(q._id)} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: T.red, padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>🗑️ Purge</button>
              </div>
            </TD>
          </tr>
        ))}
      </StickyTable>
    </div>
  );
}

/* Default exports for backward compat */
export default SupportTickets;

/* Global styles */
const _style = document.createElement("style");
_style.textContent = `@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`;
if (typeof document !== "undefined" && !document.getElementById("admin-shared-styles")) {
  _style.id = "admin-shared-styles";
  document.head.appendChild(_style);
}
