import React from "react";
import axios from "axios";

export default function ReviewManager({ reviews, toggleReviewApproval, deleteReview, setNewReviewModal, showToast }) {
  return (
    <div className="reveal-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: 900 }}>Public Sentiment</h2>
          <p style={{ color: "var(--muted)" }}>Manage user feedback and social proof protocols.</p>
        </div>
        <button onClick={() => setNewReviewModal(true)} style={{ background: "#00f5d4", color: "#000", border: "none", padding: "14px 28px", borderRadius: "14px", fontWeight: 900, cursor: "pointer" }}>⭐ MANAGE_INTERNAL_REVIEW</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
        {reviews.map((rev) => (
          <div key={rev._id} className="glass-card" style={{ padding: "24px", borderRadius: "24px", opacity: rev.approved ? 1 : 0.6, border: rev.approved ? "1px solid rgba(0, 245, 212, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
               <div>
                  <div style={{ fontWeight: 800, fontSize: "16px" }}>{rev.name}</div>
                  <div style={{ fontSize: "10px", color: "var(--muted)" }}>{rev.plan || 'User'} • {rev.userCode}</div>
               </div>
               <div style={{ color: "#facc15" }}>{'⭐'.repeat(rev.rating)}</div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontStyle: "italic", marginBottom: "24px" }}>"{rev.comment}"</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <button 
                 onClick={() => toggleReviewApproval(rev._id, !rev.approved)} 
                 style={{ 
                   background: rev.approved ? "rgba(16, 185, 129, 0.1)" : "rgba(0, 245, 212, 0.1)", 
                   color: rev.approved ? "#10b981" : "#00f5d4", 
                   border: "none", padding: "6px 12px", borderRadius: "8px", 
                   fontSize: "10px", fontWeight: 900, cursor: "pointer" 
                 }}
               >
                 {rev.approved ? 'VISIBLE_ON_WEB' : 'PENDING_APPROVE'}
               </button>
               <button onClick={() => deleteReview(rev._id)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", cursor: "pointer" }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
