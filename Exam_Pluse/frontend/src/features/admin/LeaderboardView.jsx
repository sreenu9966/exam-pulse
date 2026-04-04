import React from "react";

export default function LeaderboardView({ leaderboard, showToast }) {
  return (
    <div className="reveal-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: 900 }}>Global Standings</h2>
          <p style={{ color: "var(--muted)" }}>Verify the competitive integrity and ranking protocols.</p>
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left", fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>
              <th style={{ padding: "20px" }}>RANK</th>
              <th style={{ padding: "20px" }}>STUDENT / CODE</th>
              <th style={{ padding: "20px" }}>ACCURACY</th>
              <th style={{ padding: "20px" }}>TIME_INDEX</th>
              <th style={{ padding: "20px" }}>ATTEMPTS</th>
              <th style={{ padding: "20px" }}>SCORE</th>
            </tr>
          </thead>
          <tbody>
            {(leaderboard || []).map((entry, i) => (
              <tr key={entry._id} className="q-row-card">
                <td style={{ padding: "20px" }}>
                   <div className={`rank-circle rank-${(i+1).toString().padStart(2, '0')}`}>{(i + 1).toString().padStart(2, '0')}</div>
                </td>
                <td style={{ padding: "20px" }}>
                   <div style={{ fontWeight: 800 }}>{entry.name}</div>
                   <div style={{ fontSize: "10px", color: "var(--accent)" }}>{entry.userCode}</div>
                </td>
                <td style={{ padding: "20px" }}>
                   <span style={{ fontWeight: 900, color: entry.accuracy > 80 ? '#10b981' : '#fff' }}>{entry.accuracy}%</span>
                </td>
                <td style={{ padding: "20px", fontSize: "12px", color: "var(--muted)" }}>{entry.avgTime || '01:42'}m</td>
                <td style={{ padding: "20px", fontSize: "12px", color: "#60a5fa", fontWeight: 800 }}>{entry.attempts || 1}</td>
                <td style={{ padding: "20px", fontSize: "18px", fontWeight: 950, color: "#fff" }}>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .rank-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); font-size: 11px; }
        .rank-01 { border-color: #facc15; color: #facc15; box-shadow: 0 0 15px rgba(250, 204, 21, 0.2); }
        .rank-02 { border-color: #cbd5e1; color: #cbd5e1; }
        .rank-03 { border-color: #92400e; color: #92400e; }
      `}</style>
    </div>
  );
}
