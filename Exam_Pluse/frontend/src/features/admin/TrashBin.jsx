import React from "react";
import axios from "axios";

export default function TrashBin({ trashQuestions, recoverTrashQuestion, deleteTrashPermanently, showToast }) {
  return (
    <div className="reveal-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: 900 }}>Trash Bin Recovery</h2>
          <p style={{ color: "var(--muted)" }}>Restore deleted questions or purge them permanently from the system.</p>
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left", fontSize: "11px", fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>
              <th style={{ padding: "20px" }}>QUESTION</th>
              <th style={{ padding: "20px" }}>TOPIC</th>
              <th style={{ padding: "20px" }}>DELETED_ON</th>
              <th style={{ padding: "20px" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {(trashQuestions || []).map((q) => (
              <tr key={q._id} className="q-row-card">
                <td style={{ padding: "20px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{q.qText || q.q}</div>
                </td>
                <td style={{ padding: "20px" }}>
                   <div style={{ fontSize: "11px", fontWeight: 900, color: "var(--accent)" }}>{q.topic?.toUpperCase()}</div>
                </td>
                <td style={{ padding: "20px", fontSize: "11px", color: "var(--muted)" }}>{new Date(q.updatedAt).toLocaleString()}</td>
                <td style={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => recoverTrashQuestion(q._id)} style={{ background: "rgba(0, 245, 212, 0.1)", color: "#00f5d4", border: "1.5px solid rgba(0, 245, 212, 0.3)", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 900, cursor: "pointer" }}>RESTORE</button>
                    <button onClick={() => deleteTrashPermanently(q._id)} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1.5px solid rgba(239, 68, 68, 0.3)", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 900, cursor: "pointer" }}>PURGE</button>
                  </div>
                </td>
              </tr>
            ))}
            {(!trashQuestions || trashQuestions.length === 0) && (
              <tr><td colSpan="4" style={{ padding: "60px", textAlign: "center", color: "var(--muted)", fontWeight: 800 }}>TRASH BIN EMPTY. SYSTEM PURIFIED.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
