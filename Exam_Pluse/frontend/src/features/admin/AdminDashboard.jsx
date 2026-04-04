import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL as API } from "../../config";

import AdminSettings from './AdminSettings';
import { ExamConfigurator } from "./ExamConfigurator";
import { ManualSelector } from "./ManualSelector";
import ApprovalsManager from "./ApprovalsManager";
import { SupportTickets, ReviewManager, LeaderboardView, TrashBin } from "./SupportTickets";
import QuestionBank from "./QuestionBank";
import { AccuracyMatrix, SubjectRadar } from './DashboardComponents';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const norm = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
const fuzzyMatch = (a, b) => norm(a) === norm(b);
const fmtDate = (d) => { if (!d) return "—"; const dt = new Date(d); return isNaN(dt) ? "—" : dt.toLocaleDateString("en-IN"); };

/* ── Design Tokens ──────────────────────────────────── */
const T = {
  bg:         "#12071f",       // deep space bg
  surface:    "#1e1133",       // card surface
  surfaceHi:  "#261840",       // hovered card
  border:     "rgba(255,255,255,0.09)",
  borderHi:   "rgba(0,245,212,0.35)",
  textPrim:   "#f0eafa",       // near-white, warm tint
  textSec:    "#c4b5d4",       // muted but readable
  textMuted:  "#8b7ba8",       // very muted
  accent:     "#00f5d4",       // cyan
  accentDim:  "rgba(0,245,212,0.15)",
  purple:     "#a78bfa",
  blue:       "#60a5fa",
  gold:       "#fbbf24",
  red:        "#f87171",
  green:      "#34d399",
};

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, icon, accent = T.accent }) => (
  <div style={{
    background: T.surface, border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: "18px", padding: "22px 24px",
    position: "relative", overflow: "hidden", transition: "0.25s",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHi; e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.transform = "translateY(-3px)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: `${accent}18` }} />
    <div style={{ fontSize: "24px", marginBottom: "14px" }}>{icon}</div>
    <div style={{ fontSize: "13px", fontWeight: 700, color: T.textMuted, letterSpacing: "0.5px", marginBottom: "6px", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "36px", fontWeight: 900, color: T.textPrim, lineHeight: 1, marginBottom: "8px" }}>{value}</div>
    <div style={{ fontSize: "13px", color: T.textSec, fontWeight: 600 }}>{sub}</div>
    <div style={{ position: "absolute", bottom: 0, left: 0, height: "3px", width: "60%", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
  </div>
);

/* ── Page Title ── */
const PageTitle = ({ title, sub }) => (
  <div style={{ marginBottom: "28px" }}>
    <h2 style={{ fontSize: "28px", fontWeight: 900, color: T.textPrim, margin: 0, letterSpacing: "-0.5px" }}>{title}</h2>
    {sub && <p style={{ color: T.textSec, fontSize: "14px", marginTop: "6px", fontWeight: 500 }}>{sub}</p>}
  </div>
);

/* ── Badge ── */
const Badge = ({ label, color = T.accent }) => (
  <span style={{ padding: "4px 10px", borderRadius: "8px", background: `${color}18`, color, fontSize: "11px", fontWeight: 800, border: `1px solid ${color}30` }}>{label}</span>
);

/* ── Question Editor Modal Component ── */
const QuestionEditorModal = ({ editQ, newQModal, setEditQ, setNewQModal, activeCategory, categoryMap, handleSaveQuestion, T }) => {
  const [formData, setFormData] = useState(editQ || { s: activeCategory, q: "", o: ["", "", "", ""], a: "0", explanation: "" });
  const isEdit = !!editQ;
  const allTopics = Object.values(categoryMap).flat();

  useEffect(() => {
    if (editQ) setFormData(editQ);
    else setFormData({ s: activeCategory, q: "", o: ["", "", "", ""], a: "0", explanation: "" });
  }, [editQ, newQModal, activeCategory]);

  if (!newQModal && !editQ) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) { setEditQ(null); setNewQModal(false); } }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: T.surface, border: `1px solid ${T.accent}30`, borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "30px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>{isEdit ? "✏️" : "⚡"}</div>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: T.textPrim, margin: 0 }}>{isEdit ? "Edit Question" : "New Question"}</h3>
            <p style={{ fontSize: "13px", color: T.textSec, margin: "4px 0 0" }}>{isEdit ? "Modify existing data" : "Add a fresh item to the bank"}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 800, letterSpacing: "1px" }}>SELECT TOPIC</label>
            <select value={formData.s} onChange={e => setFormData({ ...formData, s: e.target.value })}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px 16px", borderRadius: "12px", outline: "none", fontSize: "14px" }}>
              {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 800, letterSpacing: "1px" }}>QUESTION TEXT</label>
            <textarea value={formData.q} onChange={e => setFormData({ ...formData, q: e.target.value })}
              placeholder="Enter the question text here..."
              style={{ width: "100%", height: "100px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px", borderRadius: "12px", outline: "none", fontSize: "15px", resize: "none", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "12px", fontWeight: 800, letterSpacing: "1px" }}>ANSWER OPTIONS</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {["A", "B", "C", "D"].map((lab, i) => (
                <div key={lab} style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "12px", fontSize: "12px", fontWeight: 900, color: T.accent }}>{lab}</span>
                  <input value={formData.o?.[i] || ""} onChange={e => {
                    const newO = [...(formData.o || ["","","",""])];
                    newO[i] = e.target.value;
                    setFormData({ ...formData, o: newO });
                  }}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px 12px 12px 34px", borderRadius: "10px", outline: "none", fontSize: "14px" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 800, letterSpacing: "1px" }}>CORRECT ANSWER</label>
              <select value={formData.a} onChange={e => setFormData({ ...formData, a: e.target.value })}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px", borderRadius: "12px", outline: "none", fontSize: "14px" }}>
                {["A", "B", "C", "D"].map((l, i) => <option key={l} value={String(i)}>{l} - Option {l}</option>)}
                <option value="A">A - Legacy</option>
                <option value="B">B - Legacy</option>
                <option value="C">C - Legacy</option>
                <option value="D">D - Legacy</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 800, letterSpacing: "1px" }}>EXPLANATION (OPTIONAL)</label>
              <textarea value={formData.explanation || ""} onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
                style={{ width: "100%", height: "45px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "10px", borderRadius: "12px", outline: "none", fontSize: "13px", resize: "none" }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          <button onClick={() => handleSaveQuestion(formData)} 
            style={{ flex: 1, background: T.accent, color: "#000", border: "none", padding: "15px", borderRadius: "14px", fontWeight: 800, cursor: "pointer", fontSize: "15px" }}>
            {isEdit ? "Update Question" : "Create Question"}
          </button>
          <button onClick={() => { setEditQ(null); setNewQModal(false); }} 
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: T.textSec, border: `1px solid ${T.border}`, padding: "15px", borderRadius: "14px", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Plan Editor Modal ── */
const GamifiedEditorModal = ({ editGamified, newGamifiedModal, setEditGamified, setNewGamifiedModal, handleSaveGamified, T }) => {
  const isEdit = !!editGamified;
  const [formData, setFormData] = useState(editGamified || { gameType: 'spin', title: '', description: '', rewards: [{ type: 'discount_coupon', value: '', probability: 0 }], active: true });

  const addReward = () => setFormData({ ...formData, rewards: [...formData.rewards, { type: 'discount_coupon', value: '', probability: 0 }] });
  const updateReward = (idx, field, val) => {
    const nr = [...formData.rewards];
    nr[idx][field] = field === 'probability' ? parseInt(val) || 0 : val;
    setFormData({ ...formData, rewards: nr });
  };

  if (!newGamifiedModal && !editGamified) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) { setEditGamified(null); setNewGamifiedModal(false); } }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: T.surface, border: `1.5px solid ${T.accent}40`, borderRadius: "28px", padding: "32px", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ color: T.textPrim, fontSize: "22px", fontWeight: 900, marginBottom: "24px" }}>{isEdit ? "Edit Rewards Logic" : "Setup Engagement Game"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
           <div>
             <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 900 }}>GAME TITLE</label>
             <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px", borderRadius: "10px" }} />
           </div>
           <div>
             <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 900 }}>DESCRIPTION</label>
             <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px", borderRadius: "10px", minHeight: "60px" }} />
           </div>
           <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "18px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
               <label style={{ fontSize: "11px", color: T.accent, fontWeight: 900 }}>REWARDS & ODDS</label>
               <button onClick={addReward} style={{ color: T.accent, background: "transparent", border: "none", cursor: "pointer", fontWeight: 800 }}>+ Add Reward</button>
             </div>
             {formData.rewards.map((rev, i) => (
               <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.6fr", gap: "10px", marginBottom: "10px" }}>
                 <select value={rev.type} onChange={e => updateReward(i, 'type', e.target.value)} style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "8px", padding: "8px", fontSize: "12px" }}>
                   {['discount_coupon', 'token', 'access'].map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
                 <input placeholder="Value" value={rev.value} onChange={e => updateReward(i, 'value', e.target.value)} style={{ background: "#222", color: "#fff", border: "1px solid #333", borderRadius: "8px", padding: "8px", fontSize: "12px" }} />
                 <input placeholder="Prob%" type="number" value={rev.probability} onChange={e => updateReward(i, 'probability', e.target.value)} style={{ background: "#222", color: "#fff", border: "1px solid #333", borderRadius: "8px", padding: "8px", fontSize: "12px" }} />
               </div>
             ))}
           </div>
           <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
             <button onClick={() => handleSaveGamified(formData)} style={{ flex: 1, background: T.accent, color: "#000", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 900, cursor: "pointer" }}>Save Config</button>
             <button onClick={() => { setEditGamified(null); setNewGamifiedModal(false); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: T.textMuted, border: `1px solid ${T.border}`, padding: "14px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const CouponEditorModal = ({ editCoupon, newCouponModal, setEditCoupon, setNewCouponModal, handleSaveCoupon, T }) => {
  const isEdit = !!editCoupon;
  const [formData, setFormData] = useState(editCoupon || { code: '', type: 'percentage', value: 0, usageLimit: 100, active: true });

  if (!newCouponModal && !editCoupon) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) { setEditCoupon(null); setNewCouponModal(false); } }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: T.surface, border: `1.5px solid ${T.accent}40`, borderRadius: "28px", padding: "32px", width: "100%", maxWidth: "480px" }}>
        <h3 style={{ color: T.textPrim, fontSize: "22px", fontWeight: 900, marginBottom: "26px" }}>{isEdit ? "Edit Coupon" : "Create Promo Code"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
           <div>
             <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 900 }}>COUPON CODE (UPPERCASE)</label>
             <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.accent, padding: "14px", borderRadius: "12px", fontSize: "18px", fontWeight: 900, letterSpacing: "2px" }} />
           </div>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 900 }}>TYPE</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: "100%", background: "#111", border: `1px solid ${T.border}`, color: "#fff", padding: "12px", borderRadius: "10px" }}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 900 }}>VALUE</label>
                <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: "#fff", padding: "12px", borderRadius: "10px" }} />
              </div>
           </div>
           <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "8px", fontWeight: 900 }}>USAGE LIMIT</label>
              <input type="number" value={formData.usageLimit} onChange={e => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 100 })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: "#fff", padding: "12px", borderRadius: "10px" }} />
           </div>
           <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
             <button onClick={() => handleSaveCoupon(formData)} style={{ flex: 1, background: T.accent, color: "#000", border: "none", padding: "15px", borderRadius: "12px", fontWeight: 900, cursor: "pointer" }}>Save Coupon</button>
             <button onClick={() => { setEditCoupon(null); setNewCouponModal(false); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: T.textMuted, border: `1px solid ${T.border}`, padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const PlanEditorModal = ({ editOffer, newOfferModal, setEditOffer, setNewOfferModal, handleSaveOffer, T }) => {
  const [formData, setFormData] = useState(editOffer || { 
    title: "", tierLevel: "PRO", priceOriginal: 399, priceOffer: 1, 
    discount: "99.7%", durationDays: 30, active: true, features: ["Unlimited Exams", "Performance Tracking"] 
  });
  const isEdit = !!editOffer;

  useEffect(() => {
    if (editOffer) setFormData(editOffer);
    else setFormData({ title: "", tierLevel: "PRO", priceOriginal: 399, priceOffer: 1, discount: "99.7%", durationDays: 30, active: true, features: ["Unlimited Exams", "Performance Tracking"] });
  }, [editOffer, newOfferModal]);

  if (!newOfferModal && !editOffer) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) { setEditOffer(null); setNewOfferModal(false); } }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: T.surface, border: `1.5px solid ${T.accent}40`, borderRadius: "28px", padding: "32px", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto", animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 50px 120px rgba(0,0,0,0.8)" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>{isEdit ? "💎" : "🚀"}</div>
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: T.textPrim, margin: 0 }}>{isEdit ? "Edit Subscription Plan" : "Launch New Plan"}</h3>
            <p style={{ fontSize: "14px", color: T.textSec, margin: "6px 0 0" }}>Configure pricing and features</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>PLAN TITLE</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Pro Super Saver" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px 18px", borderRadius: "14px", outline: "none", fontSize: "15px" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>TIER LEVEL</label>
              <select value={formData.tierLevel} onChange={e => setFormData({ ...formData, tierLevel: e.target.value })}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px 18px", borderRadius: "14px", outline: "none", fontSize: "15px" }}>
                {['FREE', 'BASIC', 'PRO', 'PREMIUM', 'LIFETIME'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>DURATION (DAYS)</label>
              <input type="number" value={formData.durationDays} onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px 18px", borderRadius: "14px", outline: "none", fontSize: "15px" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>ORIGINAL PRICE (₹)</label>
              <input type="number" value={formData.priceOriginal} onChange={e => setFormData({ ...formData, priceOriginal: parseInt(e.target.value) })}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px 18px", borderRadius: "14px", outline: "none", fontSize: "15px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>OFFER PRICE (₹)</label>
              <input type="number" value={formData.priceOffer} onChange={e => setFormData({ ...formData, priceOffer: parseInt(e.target.value) })}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px 18px", borderRadius: "14px", outline: "none", fontSize: "15px" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: T.textMuted, marginBottom: "10px", fontWeight: 900, letterSpacing: "1.2px" }}>FEATURES (COMMA SEPARATED)</label>
            <textarea value={formData.features?.join(", ")} onChange={e => setFormData({ ...formData, features: e.target.value.split(",").map(f => f.trim()) })}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "14px 18px", borderRadius: "14px", outline: "none", fontSize: "14px", minHeight: "80px", resize: "none" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button onClick={() => handleSaveOffer(formData)} 
              style={{ flex: 1, background: T.accent, color: "#000", border: "none", padding: "16px", borderRadius: "16px", fontWeight: 900, cursor: "pointer", fontSize: "15px", boxShadow: `0 8px 25px ${T.accent}40` }}>
              {isEdit ? "Update Plan" : "Launch Plan"}
            </button>
            <button onClick={() => { setEditOffer(null); setNewOfferModal(false); }} 
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: T.textSec, border: `1px solid ${T.border}`, padding: "16px", borderRadius: "16px", fontWeight: 800, cursor: "pointer", fontSize: "15px" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [offers, setOffers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [gamified, setGamified] = useState([]);
  const [trashQuestions, setTrashQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [detailedStats, setDetailedStats] = useState({ sections: {}, topics: [] });
  const [subStats, setSubStats] = useState({ activePremium: 0, expiringSoon: 0, distribution: {}, totalRevenueEstimation: 0 });

  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage]     = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [qFilter, setQFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("Aptitude");
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [planViewMode, setPlanViewMode] = useState("cards");
  const [newExam, setNewExam] = useState(null);
  const [editExam, setEditExam] = useState(null);
  const [newQModal, setNewQModal] = useState(false);
  const [editQ, setEditQ] = useState(null);
  const [editOffer, setEditOffer] = useState(null);
  const [newOfferModal, setNewOfferModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [manualModal, setManualModal] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [builderData, setBuilderData] = useState({ section: "", topic: "", qs: 5, mode: "auto" });
  const [activeTab, setActiveTab] = useState("ALL");
  const [activeSubTab, setActiveSubTab] = useState("plans");
  const [newCouponModal, setNewCouponModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [newGamifiedModal, setNewGamifiedModal] = useState(false);
  const [editGamified, setEditGamified] = useState(null);

  const topicsMap = useMemo(() => {
    const map = {};
    Object.values(detailedStats.sections || {}).forEach(sec => {
      (sec.topics || []).forEach(t => { map[norm(t.name)] = { count: t.count || 0 }; });
    });
    return map;
  }, [detailedStats]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3200);
  }, []);

  const token = sessionStorage.getItem("admin_token");
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const initData = useCallback(async () => {
    try {
      await Promise.all([
        axios.get(`${API}/admin/stats`, config).then(r => setStats(r.data)).catch(() => {}),
        axios.get(`${API}/admin/users`, config).then(r => setUsers(r.data)).catch(() => {}),
        axios.get(`${API}/admin/exams`, config).then(r => setExams(r.data)).catch(() => {}),
        axios.get(`${API}/admin/offers`, config).then(r => setOffers(r.data)).catch(() => {}),
        axios.get(`${API}/admin/mapping`, config).then(r => setCategoryMap(r.data.CATEGORY_MAP || {})).catch(() => {}),
        axios.get(`${API}/admin/stats/questions`, config).then(r => setDetailedStats(r.data)).catch(() => {}),
        axios.get(`${API}/admin/subscription-stats`, config).then(r => setSubStats(r.data)).catch(() => {}),
        axios.get(`${API}/admin/coupons`, config).then(r => setCoupons(r.data)).catch(() => {}),
        axios.get(`${API}/admin/gamified`, config).then(r => setGamified(r.data)).catch(() => {}),
      ]);
    } catch (e) { console.error("Init error:", e); }
  }, [config]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const base = [];
      if (activeView === "approvals") base.push(axios.get(`${API}/admin/submissions`, config).then(r => setSubmissions(r.data)).catch(() => {}));
      if (activeView === "questions") {
        let url = `${API}/admin/questions?page=${qPage}&limit=15&category=${encodeURIComponent(activeCategory)}`;
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        } else if (qFilter !== "All") {
          url += `&topic=${encodeURIComponent(qFilter)}`;
        }
        base.push(axios.get(url, config).then(r => { setQuestions(r.data.questions || []); setQTotalPages(Math.ceil((r.data.total || 0) / 15) || 1); }).catch(() => {}));
      }
      if (activeView === "issues") base.push(axios.get(`${API}/admin/issues`, config).then(r => setIssues(r.data)).catch(() => {}));
      if (activeView === "reviews") base.push(axios.get(`${API}/admin/reviews`, config).then(r => setReviews(r.data)).catch(() => {}));
      if (activeView === "trash") base.push(axios.get(`${API}/admin/questions/trash`, config).then(r => setTrashQuestions(r.data)).catch(() => {}));
      if (activeView === "leaderboard") base.push(axios.get(`${API}/leaderboard`, config).then(r => setLeaderboard(r.data)).catch(() => {}));
      await Promise.all(base);
    } catch (e) { console.error("Fetch error:", e); }
    setLoading(false);
  }, [activeView, config, qFilter, qPage, searchTerm, activeCategory, categoryMap]);

  useEffect(() => { initData(); }, [initData]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveExam = async () => {
    try {
      const t = newExam || editExam;
      if (!t?.title) return showToast("Title required.", "error");
      if (newExam) await axios.post(`${API}/admin/exam`, t, config);
      else await axios.put(`${API}/admin/exam/${t._id}`, t, config);
      showToast("Exam deployed successfully! 🚀"); setNewExam(null); setEditExam(null); fetchData();
    } catch (e) { showToast("Deployment failed.", "error"); }
  };

  const deleteExam = async (id) => {
    if (!window.confirm("Delete this exam permanently?")) return;
    try { await axios.delete(`${API}/admin/exam/${id}`, config); showToast("Exam deleted 🗑️"); fetchData(); }
    catch (e) { showToast("Deletion failed.", "error"); }
  };

  const processSubmission = (id, status, planType) => {
    axios.post(`${API}/admin/${status === 'approved' ? 'approve' : 'reject'}/${id}`, { planType }, config)
      .then(() => { showToast(status === 'approved' ? 'Approved ✅' : 'Rejected ❌', status === 'approved' ? 'success' : 'error'); fetchData(); })
      .catch(e => showToast(e.response?.data?.error || "Error", "error"));
  };

  const resolveIssue = (id) => axios.post(`${API}/admin/issues/${id}/resolve`, {}, config).then(() => { showToast("Issue Resolved ✅"); fetchData(); });
  const deleteQuestion = (id) => axios.delete(`${API}/admin/question/${id}`, config).then(() => { showToast("Moved to Trash 🗑️"); fetchData(); });
  const recoverTrashQuestion = (id) => axios.post(`${API}/admin/questions/trash/${id}/recover`, {}, config).then(() => { showToast("Restored ↩"); fetchData(); });
  const deleteTrashPermanently = (id) => { if (!window.confirm("Permanently delete?")) return; axios.delete(`${API}/admin/questions/trash/${id}`, config).then(() => { showToast("Purged permanently!"); fetchData(); }); };
  const toggleReviewApproval = (id, approved) => axios.put(`${API}/admin/reviews/${id}`, { approved }, config).then(() => fetchData());
  const deleteReview = (id) => axios.delete(`${API}/admin/reviews/${id}`, config).then(() => fetchData());

  const handleUserSave = async () => {
    try { await axios.put(`${API}/admin/user/${editUser.code}`, editUser, config); showToast("User updated ✅"); setEditUser(null); fetchData(); }
    catch (e) { showToast("Failed to update user.", "error"); }
  };

  const handleSaveQuestion = async (qData) => {
    try {
      if (editQ) await axios.put(`${API}/admin/question/${editQ._id}`, qData, config);
      else await axios.post(`${API}/admin/question`, qData, config);
      showToast(editQ ? "Question updated" : "Question added"); setEditQ(null); setNewQModal(false); fetchData();
    } catch (e) { showToast("Action failed", "error"); }
  };

  const handleSaveOffer = async (oData) => {
    try {
      if (editOffer) await axios.put(`${API}/admin/offers/${editOffer._id}`, oData, config);
      else await axios.post(`${API}/admin/offers`, oData, config);
      showToast(editOffer ? "Plan updated" : "Plan launched! 🚀"); setEditOffer(null); setNewOfferModal(false); initData();
    } catch (e) { showToast("Save failed", "error"); }
  };

  const toggleOffer = async (id) => {
    try { await axios.post(`${API}/admin/offers/${id}/toggle`, {}, config); showToast("Status toggled"); initData(); }
    catch (e) { showToast("Toggle failed", "error"); }
  };

  const handleSeedOffers = async () => {
    if (!window.confirm("This will replace all current plans with the 5 Standard Tiers (Free, Basic, Pro, Premium, Lifetime). Continue?")) return;
    try {
      await axios.post(`${API}/admin/offers/seed`, {}, config);
      showToast("5 Standard Plans Seeded! 🚀✨");
      initData();
    } catch (e) { showToast("Seeding failed", "error"); }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this plan permanently?")) return;
    try { await axios.post(`${API}/admin/offers/${id}/delete`, {}, config); showToast("Plan removed 🗑️"); initData(); }
    catch (e) { showToast("Deletion failed", "error"); }
  };

  const deleteUser = async (code) => {
    if (!window.confirm(`Delete user ${code}?`)) return;
    try { await axios.delete(`${API}/admin/user/${code}`, config); showToast("User deleted 🗑️"); fetchData(); }
    catch (e) { showToast("Deletion failed.", "error"); }
  };

  // Coupon Actions
  const handleSaveCoupon = async (cData) => {
    try {
      if (cData._id) await axios.put(`${API}/admin/coupons/${cData._id}`, cData, config);
      else await axios.post(`${API}/admin/coupons`, cData, config);
      showToast(cData._id ? "Coupon updated" : "Coupon created! 🎟️"); initData();
    } catch (e) { showToast("Save failed", "error"); }
  };
  const toggleCoupon = async (id) => {
    try { await axios.post(`${API}/admin/coupons/${id}/toggle`, {}, config); showToast("Status toggled"); initData(); }
    catch (e) { showToast("Toggle failed", "error"); }
  };
  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try { await axios.delete(`${API}/admin/coupons/${id}`, config); showToast("Coupon removed"); initData(); }
    catch (e) { showToast("Delete failed", "error"); }
  };

  // Gamified Actions
  const handleSaveGamified = async (gData) => {
    try {
      if (gData._id) await axios.put(`${API}/admin/gamified/${gData._id}`, gData, config);
      else await axios.post(`${API}/admin/gamified`, gData, config);
      showToast(gData._id ? "Game rules updated" : "Game launched! 🎡"); initData();
    } catch (e) { showToast("Save failed", "error"); }
  };
  const toggleGamified = async (id) => {
    try { await axios.post(`${API}/admin/gamified/${id}/toggle`, {}, config); showToast("Status toggled"); initData(); }
    catch (e) { showToast("Toggle failed", "error"); }
  };
  const deleteGamified = async (id) => {
    if (!window.confirm("Delete this game config?")) return;
    try { await axios.delete(`${API}/admin/gamified/${id}`, config); showToast("Config removed"); initData(); }
    catch (e) { showToast("Delete failed", "error"); }
  };

  const toggleManualSelect = (qId) => {
    const t = editExam || newExam; if (!t) return;
    const ne = JSON.parse(JSON.stringify(t));
    const sec = ne.sections.find(s => fuzzyMatch(s.name, manualModal.section));
    const top = sec?.topics?.find(t2 => fuzzyMatch(t2.name, manualModal.topic));
    if (!top) return;
    if (!top.selectedQuestions) top.selectedQuestions = [];
    const sid = String(qId);
    const has = top.selectedQuestions.some(id => (typeof id === 'string' ? id : id?._id) === sid);
    top.selectedQuestions = has ? top.selectedQuestions.filter(id => (typeof id === 'string' ? id : id?._id) !== sid) : [...top.selectedQuestions, sid];
    top.count = Math.max(top.count || 0, top.selectedQuestions.length);
    if (editExam) setEditExam(ne); else setNewExam(ne);
  };

  const openManualSelection = useCallback((section, topic) => {
    axios.get(`${API}/admin/questions?topic=${encodeURIComponent(topic)}&limit=100`, config)
      .then(r => setManualModal({ section, topic, questions: r.data.questions || [] }))
      .catch(() => showToast("Failed to load questions.", "error"));
  }, [config]);

  const addTopicFromBuilder = useCallback(() => {
    if (!builderData.section || !builderData.topic) return showToast("Select both section and topic", "error");
    const setter = newExam ? setNewExam : setEditExam;
    setter(prev => {
      if (!prev) return prev;
      const sections = JSON.parse(JSON.stringify(prev.sections || []));
      let sec = sections.find(s => fuzzyMatch(s.name, builderData.section));
      if (!sec) { sec = { name: builderData.section, topics: [] }; sections.push(sec); }
      const existing = sec.topics.find(t => fuzzyMatch(t.name, builderData.topic));
      if (existing) { existing.count = (existing.count || 0) + builderData.qs; showToast(`Updated: +${builderData.qs} Qs for ${builderData.topic}`); }
      else { sec.topics.push({ name: builderData.topic, count: builderData.qs, mode: 'AUTO', selectedQuestions: [] }); showToast(`✅ ${builderData.topic} added!`); }
      return { ...prev, sections };
    });
  }, [builderData, newExam, fuzzyMatch]);

  const addAutoQs = useCallback((secName, topName, delta) => {
    const setter = newExam ? setNewExam : setEditExam;
    setter(prev => {
      if (!prev) return prev;
      const sections = JSON.parse(JSON.stringify(prev.sections || []));
      const sec = sections.find(s => fuzzyMatch(s.name, secName));
      if (!sec) return prev;
      const top = sec.topics.find(t => fuzzyMatch(t.name, topName));
      if (!top) return prev;
      const mc = (top.selectedQuestions || []).length;
      top.count = mc + Math.max(0, (top.count || 0) - mc + delta);
      return { ...prev, sections };
    });
  }, [newExam, fuzzyMatch]);

  const removeTopicFromConfig = useCallback((secName, topName) => {
    const setter = newExam ? setNewExam : setEditExam;
    setter(prev => {
      if (!prev) return prev;
      const sections = JSON.parse(JSON.stringify(prev.sections || []));
      const sec = sections.find(s => fuzzyMatch(s.name, secName));
      if (!sec) return prev;
      sec.topics = sec.topics.filter(t => !fuzzyMatch(t.name, topName));
      return { ...prev, sections: sections.filter(s => s.topics.length > 0) };
    });
  }, [newExam, fuzzyMatch]);

  const handleLogout = () => { sessionStorage.removeItem("admin_token"); navigate("/admin"); };

  const pendingCount = submissions.filter(s => !s.status || s.status === 'pending').length;

  const navItems = [
    { id: "dashboard", label: "Overview",    icon: "📊" },
    { id: "approvals", label: "Approvals",   icon: "✅", badge: pendingCount },
    { id: "users",     label: "Students",    icon: "👥" },
    { id: "exams",     label: "Exams",       icon: "🏆" },
    { id: "leaderboard", label: "Rankings",  icon: "🏅" },
    { id: "questions", label: "Questions",   icon: "📝" },
    { id: "trash",     label: "Trash",       icon: "🗑️" },
    { id: "reviews",   label: "Reviews",     icon: "⭐" },
    { id: "issues",    label: "Support",     icon: "🎫" },
    { id: "subscriptions", label: "Pricing", icon: "💎" },
    { id: "settings",  label: "Settings",    icon: "⚙️" },
  ];

  /* plan → color */
  const planColor = { free: "#8b7ba8", basic: T.blue, pro: T.purple, premium: T.accent, lifetime: T.gold };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.textPrim, fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "15px" }}>

      {/* ══ HEADER ══ */}
      <header style={{ height: "66px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "rgba(18,7,31,0.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #00f5d4 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🛡️</div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: T.textPrim, letterSpacing: "-0.3px" }}>Admin <span style={{ color: T.accent }}>Panel</span></div>
            <div style={{ fontSize: "11px", color: T.textMuted, fontWeight: 600 }}>TCS NQT 2026 · Control Center</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", padding: "6px 14px", borderRadius: "20px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
            <span style={{ fontSize: "12px", fontWeight: 800, color: T.green }}>LIVE</span>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(248,113,113,0.1)", color: T.red, border: `1px solid rgba(248,113,113,0.25)`, padding: "8px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>Sign Out</button>
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 66px)" }}>

        {/* ══ SIDEBAR ══ */}
        <aside style={{ width: sidebarOpen ? "220px" : "66px", borderRight: `1px solid ${T.border}`, padding: "16px 8px", display: "flex", flexDirection: "column", gap: "2px", background: "rgba(18,7,31,0.95)", transition: "width 0.3s ease", overflowY: "auto", overflowX: "hidden", flexShrink: 0 }}>
          {navItems.map(item => {
            const active = activeView === item.id;
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                style={{ padding: sidebarOpen ? "11px 14px" : "11px", background: active ? "rgba(0,245,212,0.1)" : "transparent", border: active ? `1px solid rgba(0,245,212,0.3)` : "1px solid transparent", borderRadius: "11px", color: active ? T.accent : T.textMuted, textAlign: "left", cursor: "pointer", fontWeight: active ? 800 : 600, display: "flex", gap: "11px", alignItems: "center", transition: "all 0.18s", position: "relative", whiteSpace: "nowrap", fontSize: "14px" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = T.textSec; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; } }}
              >
                {active && <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: "3px", background: T.accent, borderRadius: "0 3px 3px 0" }} />}
                <span style={{ fontSize: "17px", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
                {sidebarOpen && item.badge > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", borderRadius: "10px", padding: "2px 8px", fontSize: "10px", fontWeight: 900 }}>{item.badge}</span>
                )}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", paddingTop: "12px" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: "10px", color: T.textMuted, cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              {sidebarOpen ? "← Collapse" : "→"}
            </button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ flex: 1, padding: "16px 28px 28px", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {loading && activeView !== "dashboard" ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `3px solid ${T.accentDim}`, borderTop: `3px solid ${T.accent}`, animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: T.textMuted, fontWeight: 700, fontSize: "14px" }}>Loading data…</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: activeView === "questions" ? "hidden" : "auto" }}>
              {/* ── DASHBOARD ── */}
              {activeView === "dashboard" && (
                <div className="page-in">
                  <PageTitle title="Command Center" sub="Real-time platform metrics and activity overview" />

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px", marginBottom: "28px" }}>
                    <StatCard label="Total Revenue" value={`₹${(users.filter(u => u.plan !== 'free').length * 299).toLocaleString()}`} sub="From paid subscriptions" icon="💰" accent={T.accent} />
                    <StatCard label="Students" value={users.length} sub={`${users.filter(u => u.plan !== 'free').length} on paid plans`} icon="👥" accent={T.purple} />
                    <StatCard label="Exams Live" value={exams.length} sub="Active configurations" icon="🏆" accent={T.blue} />
                    <StatCard label="Questions" value={stats.totalQuestions || 0} sub="Items in bank" icon="📝" accent={T.gold} />
                  </div>

                  {/* Chart + radar */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "18px", padding: "28px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                          <h3 style={{ fontSize: "17px", fontWeight: 800, color: T.textPrim, margin: 0 }}>Activity Trend</h3>
                          <p style={{ fontSize: "13px", color: T.textSec, margin: "4px 0 0" }}>Weekly student engagement</p>
                        </div>
                        <Badge label="↑ 12.5% this week" color={T.green} />
                      </div>
                      <div style={{ height: "240px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{ n: 'Mon', v: 10 }, { n: 'Tue', v: 25 }, { n: 'Wed', v: 18 }, { n: 'Thu', v: 45 }, { n: 'Fri', v: 35 }, { n: 'Sat', v: 52 }, { n: 'Sun', v: 40 }]}>
                            <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.accent} stopOpacity={0.3} /><stop offset="95%" stopColor={T.accent} stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="n" tick={{ fill: T.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: T.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", color: T.textPrim, fontSize: "13px" }} />
                            <Area type="monotone" dataKey="v" stroke={T.accent} fill="url(#ga)" strokeWidth={2.5} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <SubjectRadar data={[{ subject: 'Aptitude', A: 80 }, { subject: 'Verbal', A: 60 }, { subject: 'Technical', A: 90 }, { subject: 'Reasoning', A: 70 }]} />
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
                    {[
                      { label: "Pending Approvals", count: pendingCount, color: T.gold, icon: "✅", view: "approvals" },
                      { label: "Open Support Tickets", count: issues.filter(i => i.status !== 'resolved').length, color: T.red, icon: "🎫", view: "issues" },
                      { label: "Unapproved Reviews", count: reviews.filter(r => !r.approved).length, color: T.purple, icon: "⭐", view: "reviews" },
                    ].map(a => (
                      <div key={a.label} onClick={() => setActiveView(a.view)}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: "18px", transition: "0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHi; e.currentTarget.style.borderColor = `${a.color}40`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.border; }}
                      >
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${a.color}15`, border: `1px solid ${a.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{a.icon}</div>
                        <div>
                          <div style={{ fontSize: "28px", fontWeight: 900, color: a.color, lineHeight: 1 }}>{a.count}</div>
                          <div style={{ fontSize: "13px", color: T.textSec, fontWeight: 600, marginTop: "4px" }}>{a.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeView === "approvals"   && <ApprovalsManager submissions={submissions} processSubmission={processSubmission} sendCorrectionLink={() => showToast("Link sent! 📧")} setRejectionModal={setRejectionModal} showToast={showToast} />}
              {activeView === "questions"   && <QuestionBank questions={questions} activeCategory={activeCategory} setActiveCategory={setActiveCategory} qFilter={qFilter} setQFilter={setQFilter} categoryMap={categoryMap} searchTerm={searchTerm} setSearchTerm={setSearchTerm} deleteQuestion={deleteQuestion} setEditQ={setEditQ} setNewQModal={setNewQModal} qPage={qPage} setQPage={setQPage} qTotalPages={qTotalPages} showToast={showToast} />}
              {activeView === "trash"       && <TrashBin trashQuestions={trashQuestions} recoverTrashQuestion={recoverTrashQuestion} deleteTrashPermanently={deleteTrashPermanently} showToast={showToast} />}
              {activeView === "issues"      && <SupportTickets issues={issues} resolveIssue={resolveIssue} showToast={showToast} />}
              {activeView === "reviews"     && <ReviewManager reviews={reviews} toggleReviewApproval={toggleReviewApproval} deleteReview={deleteReview} setNewReviewModal={() => {}} showToast={showToast} />}
              {activeView === "leaderboard" && <LeaderboardView leaderboard={leaderboard} showToast={showToast} />}
              {activeView === "settings"    && <AdminSettings />}

              {/* ── EXAMS ── */}
              {activeView === "exams" && (
                <div className="page-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                    <PageTitle title="Exam Manager" sub={`${exams.length} exam clusters deployed`} />
                    <button onClick={() => setNewExam({ title: "", key: "", mode: "Mock", duration: 60, sections: [] })}
                      style={{ background: T.accent, color: "#000", border: "none", padding: "13px 24px", borderRadius: "13px", fontWeight: 800, cursor: "pointer", fontSize: "14px", boxShadow: `0 6px 20px ${T.accent}40` }}>
                      ⚡ New Exam
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {exams.map(ex => (
                      <div key={ex._id}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.accent}35`; e.currentTarget.style.background = T.surfaceHi; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(0,245,212,0.1)", border: `1px solid ${T.accentDim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🏆</div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: 800, color: T.textPrim }}>{ex.title}</div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "5px", alignItems: "center" }}>
                              <span style={{ fontSize: "12px", color: T.accent, fontFamily: "monospace", fontWeight: 700 }}>{ex.key}</span>
                              <span style={{ color: T.textMuted }}>·</span>
                              <span style={{ fontSize: "12px", color: T.textSec }}>{ex.mode || 'Mock'}</span>
                              <span style={{ color: T.textMuted }}>·</span>
                              <span style={{ fontSize: "12px", color: T.textSec }}>{(ex.sections || []).length} sections</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={() => setEditExam({ ...ex })} style={{ background: "rgba(0,245,212,0.1)", border: `1px solid ${T.accentDim}`, color: T.accent, padding: "9px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>✏️ Edit</button>
                          <button onClick={() => deleteExam(ex._id)} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: T.red, padding: "9px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                    {exams.length === 0 && (
                      <div style={{ background: T.surface, border: `1px dashed ${T.border}`, borderRadius: "18px", padding: "60px", textAlign: "center" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
                        <div style={{ color: T.textMuted, fontWeight: 700, fontSize: "15px" }}>No exams deployed yet.</div>
                        <div style={{ color: T.textMuted, fontSize: "13px", marginTop: "6px" }}>Click "New Exam" to get started.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SUBSCRIPTION HUB (PREMIUM) ── */}
              {activeView === "subscriptions" && (
                <div className="page-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                    <PageTitle title="Monetization Command" sub="Manage pricing tiers, rewards, and coupons" />
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => setPlanViewMode(p => p === 'cards' ? 'table' : 'cards')}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textSec, padding: "10px 20px", borderRadius: "11px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
                        {planViewMode === 'cards' ? '📋 List' : '🎴 Grid'}
                      </button>
                      <button onClick={handleSeedOffers}
                        style={{ background: "rgba(0,245,212,0.1)", border: `1px solid ${T.accent}40`, color: T.accent, padding: "10px 20px", borderRadius: "11px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
                        🚀 Seed Standard
                      </button>
                      <button onClick={() => setNewOfferModal(true)}
                        style={{ background: T.accent, color: "#000", border: "none", padding: "10px 22px", borderRadius: "11px", cursor: "pointer", fontWeight: 900, fontSize: "13px", boxShadow: `0 4px 15px ${T.accent}40` }}>
                        ✨ New Plan
                      </button>
                    </div>
                  </div>

                  {/* KPI Bar */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "32px" }}>
                    {[
                      { label: "Active Premium", val: subStats.activePremium, color: T.accent, icon: "💎" },
                      { label: "Expiring Soon", val: subStats.expiringSoon, color: T.red, icon: "⏳" },
                      { label: "Pro/Premium Mix", val: `${subStats.distribution.pro || 0}/${subStats.distribution.premium || 0}`, color: T.purple, icon: "📊" },
                      { label: "Est. Revenue", val: `₹${(subStats.totalRevenueEstimation || 0).toLocaleString()}`, color: T.green, icon: "💰" }
                    ].map(stat => (
                      <div key={stat.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "18px", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{ fontSize: "20px" }}>{stat.icon}</span>
                          <span style={{ fontSize: "10px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px" }}>HUB METRIC</span>
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 900, color: stat.color }}>{stat.val}</div>
                        <div style={{ fontSize: "12px", color: T.textSec, fontWeight: 700, marginTop: "4px" }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Management Tabs */}
                  <div style={{ display: "flex", gap: "30px", borderBottom: `1px solid ${T.border}`, marginBottom: "24px", paddingLeft: "10px" }}>
                    {[
                      { id: "plans", label: "Subscription Plans", icon: "💎" },
                      { id: "coupons", label: "Promo Coupons", icon: "🎟️" },
                      { id: "gamified", label: "Rewards Logic", icon: "🎡" }
                    ].map(tab => (
                      <div key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                        style={{ padding: "12px 4px", fontSize: "14px", fontWeight: 800, color: activeSubTab === tab.id ? T.accent : T.textMuted, cursor: "pointer", position: "relative", transition: "0.2s", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{tab.icon}</span>
                        {tab.label}
                        {activeSubTab === tab.id && <div style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "2px", background: T.accent, borderRadius: "2px" }} />}
                      </div>
                    ))}
                  </div>

                  {activeSubTab === "plans" && (
                    <>
                      {planViewMode === 'cards' ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "20px" }}>
                          {offers.map((offer, i) => {
                            const colors = [T.accent, T.purple, T.blue, T.gold];
                            const c = colors[i % colors.length];
                            return (
                              <div key={offer._id} style={{ background: T.surface, border: `1px solid ${c}25`, borderRadius: "24px", padding: "28px", position: "relative", overflow: "hidden", transition: "0.3s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                              >
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${c}, transparent)` }} />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                  <div>
                                    <div style={{ fontSize: "10px", fontWeight: 900, color: c, letterSpacing: "2px", marginBottom: "6px" }}>{offer.tierLevel?.toUpperCase()}</div>
                                    <h3 style={{ fontSize: "20px", fontWeight: 900, color: T.textPrim }}>{offer.title}</h3>
                                  </div>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button onClick={() => setEditOffer({ ...offer })} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: T.textSec, cursor: "pointer", fontSize: "14px" }}>✏️</button>
                                    <button onClick={() => deleteOffer(offer._id)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: T.red, cursor: "pointer", fontSize: "14px" }}>🗑️</button>
                                  </div>
                                </div>
                                
                                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "18px 0" }}>
                                  <span style={{ fontSize: "34px", fontWeight: 900, color: T.textPrim }}>₹{offer.priceOffer}</span>
                                  {offer.priceOriginal && <span style={{ fontSize: "16px", color: T.textMuted, textDecoration: "line-through" }}>₹{offer.priceOriginal}</span>}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "10px 14px", borderRadius: "12px", marginBottom: "20px" }}>
                                  <div style={{ fontSize: "12px", fontWeight: 700, color: offer.active ? T.green : T.red, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: offer.active ? T.green : T.red }} />
                                    {offer.active ? "LIVE" : "PAUSED"}
                                  </div>
                                  <button onClick={() => toggleOffer(offer._id)} style={{ background: "transparent", border: `1px solid ${offer.active ? T.red : T.green}40`, color: offer.active ? T.red : T.green, fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", cursor: "pointer" }}>
                                    {offer.active ? "PAUSE" : "ACTIVATE"}
                                  </button>
                                </div>

                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {offer.features?.map((f, fi) => (
                                    <li key={fi} style={{ fontSize: "13px", color: T.textSec, display: "flex", gap: "10px", alignItems: "center" }}>
                                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: `${c}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: c, fontWeight: 900 }}>✓</div> {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "20px", overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px" }}>
                                <th style={{ padding: "16px 24px" }}>TIER & PLAN</th>
                                <th style={{ padding: "16px 24px" }}>PRICE</th>
                                <th style={{ padding: "16px 24px" }}>DURATION</th>
                                <th style={{ padding: "16px 24px" }}>USAGE</th>
                                <th style={{ padding: "16px 24px" }}>ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {offers.map(offer => (
                                <tr key={offer._id} style={{ borderTop: `1px solid ${T.border}` }}>
                                  <td style={{ padding: "18px 24px" }}>
                                    <div style={{ fontWeight: 800, color: T.textPrim, fontSize: "15px" }}>{offer.title}</div>
                                    <div style={{ fontSize: "11px", color: T.accent, fontWeight: 700, marginTop: "4px" }}>{offer.tierLevel}</div>
                                  </td>
                                  <td style={{ padding: "18px 24px" }}>
                                    <div style={{ color: T.accent, fontWeight: 900, fontSize: "18px" }}>₹{offer.priceOffer}</div>
                                    <div style={{ fontSize: "11px", color: T.textMuted, textDecoration: "line-through" }}>₹{offer.priceOriginal}</div>
                                  </td>
                                  <td style={{ padding: "18px 24px", color: T.textSec, fontWeight: 700, fontSize: "14px" }}>{offer.durationDays} Days</td>
                                  <td style={{ padding: "18px 24px" }}>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: T.textPrim }}>{offer.usedCount || 0} / {offer.maxRedemptions || '∞'}</div>
                                    <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginTop: "6px" }}>
                                       <div style={{ width: `${Math.min(100, ((offer.usedCount || 0) / (offer.maxRedemptions || 100)) * 100)}%`, height: "100%", background: T.accent, borderRadius: "2px" }} />
                                    </div>
                                  </td>
                                  <td style={{ padding: "18px 24px" }}>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                      <button onClick={() => setEditOffer({ ...offer })} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "8px 12px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}>Edit</button>
                                      <button onClick={() => toggleOffer(offer._id)} style={{ background: offer.active ? "rgba(240,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${offer.active ? T.red : T.green}40`, color: offer.active ? T.red : T.green, padding: "8px 12px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}>{offer.active ? "Pause" : "Live"}</button>
                                      <button onClick={() => deleteOffer(offer._id)} style={{ background: "rgba(248,113,113,0.08)", border: `1px solid rgba(248,113,113,0.2)`, color: T.red, padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                  {activeSubTab === "coupons" && (
                    <div className="page-in" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "24px", overflow: "hidden" }}>
                      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
                         <div style={{ fontSize: "14px", fontWeight: 800, color: T.textPrim }}>Active Promo Codes</div>
                         <button onClick={() => setNewCouponModal(true)} style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}40`, color: T.accent, padding: "8px 16px", borderRadius: "8px", fontWeight: 800, cursor: "pointer", fontSize: "12px" }}>+ New Coupon</button>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "rgba(255,255,255,0.01)", textAlign: "left", fontSize: "11px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px" }}>
                            <th style={{ padding: "16px 24px" }}>CODE</th>
                            <th style={{ padding: "16px 24px" }}>TYPE</th>
                            <th style={{ padding: "16px 24px" }}>VALUE</th>
                            <th style={{ padding: "16px 24px" }}>USAGE</th>
                            <th style={{ padding: "16px 24px" }}>STATUS</th>
                            <th style={{ padding: "16px 24px" }}>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map(cp => (
                            <tr key={cp._id} style={{ borderTop: `1px solid ${T.border}` }}>
                              <td style={{ padding: "18px 24px" }}>
                                <div style={{ fontSize: "15px", fontWeight: 900, color: T.accent, letterSpacing: "1px", background: `${T.accent}10`, display: "inline-block", padding: "4px 10px", borderRadius: "6px" }}>{cp.code}</div>
                              </td>
                              <td style={{ padding: "18px 24px", color: T.textSec, fontWeight: 700, fontSize: "13px" }}>{cp.type?.toUpperCase()}</td>
                              <td style={{ padding: "18px 24px", color: T.textPrim, fontWeight: 900, fontSize: "16px" }}>{cp.type === 'percentage' ? `${cp.value}%` : `₹${cp.value}`}</td>
                              <td style={{ padding: "18px 24px" }}>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: T.textPrim }}>{cp.usedCount || 0} / {cp.usageLimit || '∞'}</div>
                              </td>
                              <td style={{ padding: "18px 24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: cp.active ? T.green : T.red, fontSize: "11px", fontWeight: 900 }}>
                                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cp.active ? T.green : T.red }} />
                                  {cp.active ? "ACTIVE" : "DISABLED"}
                                </div>
                              </td>
                              <td style={{ padding: "18px 24px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => setEditCoupon(cp)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px" }}>✏️</button>
                                  <button onClick={() => toggleCoupon(cp._id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px" }}>{cp.active ? "⏸️" : "▶️"}</button>
                                  <button onClick={() => deleteCoupon(cp._id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px" }}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {coupons.length === 0 && (
                            <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: T.textMuted }}>No active promo codes.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSubTab === "gamified" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                       {gamified.map(game => (
                         <div key={game._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "24px", padding: "28px", position: "relative" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                               <div style={{ fontSize: "10px", fontWeight: 900, color: T.purple, letterSpacing: "1px" }}>{game.gameType?.toUpperCase()} LOGIC</div>
                               <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => setEditGamified(game)} style={{ background: "transparent", border: "none", color: T.textSec, cursor: "pointer" }}>✏️</button>
                                  <button onClick={() => toggleGamified(game._id)} style={{ background: "transparent", border: "none", color: game.active ? T.green : T.red, cursor: "pointer" }}>{game.active ? "🟢" : "🔴"}</button>
                               </div>
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 900, color: T.textPrim, marginBottom: "8px" }}>{game.title}</h3>
                            <p style={{ fontSize: "13px", color: T.textMuted, marginBottom: "20px", lineHeight: 1.5 }}>{game.description}</p>
                            
                            <div style={{ fontSize: "11px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px", marginBottom: "12px" }}>PROBABILITY DASHBOARD</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                               {game.rewards?.map((rev, ri) => (
                                 <div key={ri} style={{ background: "rgba(0,0,0,0.2)", padding: "10px 14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "13px", color: T.textPrim, fontWeight: 700 }}>{rev.type === 'discount_coupon' ? "Coupon" : rev.type === 'token' ? "Tokens" : "Full Access"}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                       <div style={{ fontSize: "11px", color: T.textMuted }}>{rev.value}</div>
                                       <div style={{ fontSize: "13px", fontWeight: 900, color: T.accent }}>{rev.probability}%</div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}
                       <div onClick={() => setNewGamifiedModal(true)} 
                         style={{ background: "transparent", border: `2px dashed ${T.border}`, borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", cursor: "pointer", transition: "0.2s" }}
                         onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = "rgba(0,245,212,0.02)"; }}
                         onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
                       >
                         <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎡</div>
                         <div style={{ fontSize: "14px", fontWeight: 800, color: T.textMuted }}>Add New Gamified Logic</div>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── USERS ── */}
              {activeView === "users" && (() => {
                const USER_PAGE_SIZE = 15;
                const filteredUsers = users.filter(u =>
                  !userSearch ||
                  u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.code?.toLowerCase().includes(userSearch.toLowerCase())
                );
                const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USER_PAGE_SIZE));
                const safeUserPage   = Math.min(userPage, userTotalPages);
                const pagedUsers     = filteredUsers.slice((safeUserPage - 1) * USER_PAGE_SIZE, safeUserPage * USER_PAGE_SIZE);

                return (
                  <div className="page-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexShrink: 0 }}>
                      <div>
                        <h2 style={{ fontSize: "26px", fontWeight: 900, color: T.textPrim, margin: 0 }}>Student Directory</h2>
                        <p style={{ fontSize: "13px", color: T.textSec, margin: "5px 0 0", fontWeight: 500 }}>
                          {users.length} registered · {users.filter(u => u.plan !== 'free').length} on paid plans
                        </p>
                      </div>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "15px" }}>🔍</span>
                        <input
                          placeholder="Search by name or code…"
                          value={userSearch}
                          onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrim, padding: "10px 18px 10px 40px", borderRadius: "12px", outline: "none", fontSize: "14px", width: "240px" }}
                          onFocus={e => e.target.style.borderColor = `${T.accent}50`}
                          onBlur={e => e.target.style.borderColor = T.border}
                        />
                      </div>
                    </div>

                    {/* Table with sticky head */}
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "18px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ overflowX: "auto", flex: 1 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#1e1133" }}>
                            <tr>
                              {["Student", "Plan", "Attempts", "Joined", "Actions"].map(h => (
                                <th key={h} style={{
                                  padding: "13px 22px", textAlign: "left",
                                  fontSize: "11px", fontWeight: 900, color: T.textMuted, letterSpacing: "1px",
                                  background: "rgba(255,255,255,0.04)",
                                  borderBottom: `1px solid ${T.border}`,
                                  whiteSpace: "nowrap",
                                }}>{h.toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {pagedUsers.map(user => {
                              const pc = planColor[user.plan] || T.textMuted;
                              const initial = (user.name || "?")[0].toUpperCase();
                              return (
                                <tr key={user._id}
                                  style={{ borderTop: `1px solid ${T.border}`, transition: "background 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <td style={{ padding: "13px 22px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                      <div style={{ width: "37px", height: "37px", borderRadius: "10px", background: `${pc}20`, border: `1px solid ${pc}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 900, color: pc, flexShrink: 0 }}>{initial}</div>
                                      <div>
                                        <div style={{ fontWeight: 700, fontSize: "14px", color: T.textPrim }}>{user.name}</div>
                                        <div style={{ fontSize: "11px", color: T.accent, fontFamily: "monospace", marginTop: "2px" }}>{user.code}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: "13px 22px" }}>
                                    <Badge label={(user.plan || 'free').toUpperCase()} color={pc} />
                                  </td>
                                  <td style={{ padding: "13px 22px", fontSize: "16px", fontWeight: 800, color: user.attempts?.length > 0 ? T.blue : T.textMuted }}>
                                    {user.attempts?.length || 0}
                                  </td>
                                  <td style={{ padding: "13px 22px", fontSize: "13px", color: T.textSec, whiteSpace: "nowrap" }}>
                                    {fmtDate(user.createdAt)}
                                  </td>
                                  <td style={{ padding: "13px 22px" }}>
                                    <div style={{ display: "flex", gap: "7px" }}>
                                      <button onClick={() => setEditUser({ ...user })} style={{ background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.14)`, color: T.textPrim, padding: "7px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>Edit</button>
                                      <button onClick={() => deleteUser(user.code)} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: T.red, padding: "7px 13px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>Del</button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {pagedUsers.length === 0 && (
                              <tr>
                                <td colSpan={5} style={{ padding: "60px", textAlign: "center" }}>
                                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>👥</div>
                                  <div style={{ fontSize: "15px", fontWeight: 700, color: T.textMuted }}>No students found.</div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination footer */}
                      {userTotalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 22px", borderTop: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
                          <span style={{ fontSize: "13px", color: T.textMuted, fontWeight: 600 }}>
                            Showing {(safeUserPage - 1) * USER_PAGE_SIZE + 1}–{Math.min(safeUserPage * USER_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
                          </span>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={safeUserPage === 1}
                              style={{ padding: "7px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: safeUserPage === 1 ? T.textMuted : T.textPrim, cursor: safeUserPage === 1 ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: safeUserPage === 1 ? 0.4 : 1 }}>
                              ← Prev
                            </button>
                            {Array.from({ length: userTotalPages }, (_, i) => i + 1).filter(p => Math.abs(p - safeUserPage) <= 2).map(p => (
                              <button key={p} onClick={() => setUserPage(p)}
                                style={{ padding: "7px 13px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer", transition: "0.15s", background: p === safeUserPage ? T.accent : "rgba(255,255,255,0.05)", color: p === safeUserPage ? "#000" : T.textMuted, border: p === safeUserPage ? "none" : `1px solid ${T.border}` }}>
                                {p}
                              </button>
                            ))}
                            <button onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))} disabled={safeUserPage === userTotalPages}
                              style={{ padding: "7px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: safeUserPage === userTotalPages ? T.textMuted : T.textPrim, cursor: safeUserPage === userTotalPages ? "default" : "pointer", fontWeight: 700, fontSize: "13px", opacity: safeUserPage === userTotalPages ? 0.4 : 1 }}>
                              Next →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          )}
        </main>
      </div>

      {/* ══ EXAM CONFIGURATOR ══ */}
      <ExamConfigurator target={newExam || editExam} setTarget={newExam ? setNewExam : setEditExam} builderData={builderData} setBuilderData={setBuilderData} primarySectors={["Aptitude", "Reasoning", "Verbal", "Technical"]} categoryMap={categoryMap} topicsMap={topicsMap} norm={norm} fuzzyMatch={fuzzyMatch} handleSave={handleSaveExam} openManualSelection={openManualSelection} addAutoQs={addAutoQs} removeTopicFromConfig={removeTopicFromConfig} addTopicFromBuilder={addTopicFromBuilder} activeTab={activeTab} setActiveTab={setActiveTab} detailedStats={detailedStats} />
      <ManualSelector manualModal={manualModal} setManualModal={setManualModal} toggleManualSelect={toggleManualSelect} target={newExam || editExam} fuzzyMatch={fuzzyMatch} />
 
      {/* ══ QUESTION EDITOR MODAL ══ */}
      <QuestionEditorModal editQ={editQ} newQModal={newQModal} setEditQ={setEditQ} setNewQModal={setNewQModal} activeCategory={activeCategory} categoryMap={categoryMap} handleSaveQuestion={handleSaveQuestion} T={T} />

      {/* ══ TOAST ══ */}
      {toast.msg && (
        <div style={{
          position: "fixed", bottom: "30px", right: "30px", zIndex: 100000,
          background: toast.type === "error" ? "#7f1d1d" : "#064e3b",
          border: `1px solid ${toast.type === "error" ? "#f87171" : "#34d399"}40`,
          color: toast.type === "error" ? T.red : T.green,
          padding: "14px 22px", borderRadius: "14px", fontWeight: 700, fontSize: "14px",
          animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          display: "flex", alignItems: "center", gap: "10px",
          boxShadow: `0 12px 40px rgba(0,0,0,0.4)`
        }}>
          <span style={{ fontSize: "18px" }}>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ══ EDIT USER MODAL ══ */}
      {editUser && (
        <div onClick={e => { if (e.target === e.currentTarget) setEditUser(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: T.surface, border: `1px solid rgba(0,245,212,0.25)`, borderRadius: "24px", padding: "36px", width: "480px", animation: "slideUp 0.3s ease", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, #00f5d4, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>👤</div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, margin: 0, color: T.textPrim }}>Edit Student</h3>
                <p style={{ fontSize: "13px", color: T.textMuted, margin: "3px 0 0", fontFamily: "monospace" }}>{editUser.code}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[["Full Name", "name"], ["Email Address", "email"], ["Phone Number", "phone"]].map(([label, key]) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "12px", color: T.textMuted, marginBottom: "7px", fontWeight: 700, letterSpacing: "0.5px" }}>{label.toUpperCase()}</label>
                  <input value={editUser[key] || ''}
                    onChange={e => setEditUser({ ...editUser, [key]: e.target.value })}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px 16px", borderRadius: "12px", outline: "none", boxSizing: "border-box", fontSize: "15px", transition: "0.2s" }}
                    onFocus={e => e.target.style.borderColor = `${T.accent}60`}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "12px", color: T.textMuted, marginBottom: "7px", fontWeight: 700, letterSpacing: "0.5px" }}>SUBSCRIPTION PLAN</label>
                <select value={editUser.plan || 'free'} onChange={e => setEditUser({ ...editUser, plan: e.target.value })}
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, color: T.textPrim, padding: "12px 16px", borderRadius: "12px", outline: "none", fontSize: "14px", cursor: "pointer" }}>
                  {['free', 'basic', 'pro', 'premium', 'lifetime'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={handleUserSave} style={{ flex: 1, background: T.accent, color: "#000", border: "none", padding: "14px", borderRadius: "13px", fontWeight: 800, cursor: "pointer", fontSize: "15px" }}>Save Changes</button>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: T.textSec, border: `1px solid ${T.border}`, padding: "14px", borderRadius: "13px", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PLAN EDITOR MODAL ══ */}
      {(newOfferModal || editOffer) && (
        <PlanEditorModal 
          editOffer={editOffer} 
          newOfferModal={newOfferModal} 
          setEditOffer={setEditOffer} 
          setNewOfferModal={setNewOfferModal} 
          handleSaveOffer={handleSaveOffer} 
          T={T} 
        />
      )}

      {/* ══ COUPON EDITOR MODAL ══ */}
      {(newCouponModal || editCoupon) && (
        <CouponEditorModal 
          editCoupon={editCoupon} 
          newCouponModal={newCouponModal} 
          setEditCoupon={setEditCoupon} 
          setNewCouponModal={setNewCouponModal} 
          handleSaveCoupon={handleSaveCoupon} 
          T={T} 
        />
      )}

      {/* ══ GAMIFIED EDITOR MODAL ══ */}
      {(newGamifiedModal || editGamified) && (
        <GamifiedEditorModal 
          editGamified={editGamified} 
          newGamifiedModal={newGamifiedModal} 
          setEditGamified={setEditGamified} 
          setNewGamifiedModal={setNewGamifiedModal} 
          handleSaveGamified={handleSaveGamified} 
          T={T} 
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; }
        .page-in { animation: fadeUp 0.35s ease forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: scale(0.85) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,245,212,0.35); }
        input::placeholder { color: #5a4e6f; }
        select option { background: #1e1133; }
      `}</style>
    </div>
  );
}
