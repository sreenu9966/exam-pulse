const fs = require("fs");
const path = require("path");
const targetPath = "c:\\Users\\C H SREENU\\EXAM_PLUSE\\exam-pulse\\Exam_Pluse\\frontend\\src\\features\\admin\\AdminDashboard.jsx";

let content = fs.readFileSync(targetPath, "utf8");

const oldHeader = `                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                         <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent)" }}>Master Plan Templates</h3>`;

const newHeader = `                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent)" }}>Master Plan Templates</h3>
                            <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "10px" }}>
                               <button 
                                 onClick={() => setPlanViewMode("cards")}
                                 style={{ padding: "6px 12px", borderRadius: "8px", background: planViewMode === "cards" ? "var(--accent)" : "transparent", border: "none", color: planViewMode === "cards" ? "#000" : "var(--muted)", cursor: "pointer", fontSize: "11px", fontWeight: 800 }}
                               >🀄 Cards</button>
                               <button 
                                 onClick={() => setPlanViewMode("table")}
                                 style={{ padding: "6px 12px", borderRadius: "8px", background: planViewMode === "table" ? "var(--accent)" : "transparent", border: "none", color: planViewMode === "table" ? "#000" : "var(--muted)", cursor: "pointer", fontSize: "11px", fontWeight: 800 }}
                               >☰ Table</button>
                            </div>
                         </div>`;

// 1. Inject Header Toggle
if (content.includes(oldHeader)) {
    content = content.replace(oldHeader, newHeader);
    console.log("Header Toggle Injected! ✅");
} else {
    console.log("Could not find oldHeader - check indentation/spaces.");
}

// 2. Wrap Cards in Conditional
const gridStart = `<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>`;
if (content.includes(gridStart)) {
    content = content.replace(gridStart, `{planViewMode === "cards" ? (\n                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>`);
    console.log("Card Grid Wrapped! ✅");
}

// 3. Add Selection Circle to Cards
const cardStart = `const theme = TIER_THEMES[offer.tierLevel?.toUpperCase()] || TIER_THEMES.PRO;
                           return (
                            <div key={offer._id} className="glass-card reveal-item"`;

const cardSelectLogic = `const theme = TIER_THEMES[offer.tierLevel?.toUpperCase()] || TIER_THEMES.PRO;
                             const isSelected = selectedPlanIds.includes(offer._id);
                             return (
                              <div key={offer._id} className="glass-card reveal-item" style={{ 
                                padding: "32px", 
                                borderRadius: "32px", 
                                border: isSelected ? \`2px solid var(--accent)\` : \`1px solid \${theme.border}\`, 
                                background: \`linear-gradient(135deg, \${theme.bg}, rgba(11, 18, 33, 0.6))\`,
                                position: "relative",
                                boxShadow: isSelected ? "0 0 30px var(--accent-glow)" : theme.glow,
                                overflow: "hidden"
                              }}>
                                 {/* Selection Marker */}
                                 <div 
                                   onClick={() => setSelectedPlanIds(prev => isSelected ? prev.filter(id => id !== offer._id) : [...prev, offer._id])}
                                   style={{ position: "absolute", top: "16px", left: "16px", background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.05)", border: "1px solid var(--border2)", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                                 >
                                    {isSelected && <span style={{ color: "#000", fontSize: "12px" }}>✓</span>}
                                 </div>`;

if (content.includes(cardStart)) {
    content = content.replace(cardStart, cardSelectLogic);
    // Note: We need to remove the existing style block from the original code
    content = content.replace(`style={{ \n                                padding: "32px", \n                                borderRadius: "32px", \n                                border: \`1px solid \${theme.border}\`, \n                                background: \`linear-gradient(135deg, \${theme.bg}, rgba(11, 18, 33, 0.6))\`, \n                                position: "relative", \n                                boxShadow: theme.glow, \n                                overflow: "hidden"\n                              }}>`, "");
    console.log("Card Selection Logic Injected! ✅");
}

// 4. Close Conditional and Add Table View
const closingDiv = `                        );
                        })}
                     </div>
                   </div>`;

const tableViewCode = `                        );
                           })}
                        </div>
                      ) : (
                        <div key="plans-table-container" style={{ borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(11, 18, 33, 0.4)", overflow: "hidden" }}>
                           <div style={{ display: "flex", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                              <div style={{ width: "40px" }}>
                                 <input type="checkbox" checked={isAllPlansSelected} onChange={toggleSelectAllPlans} style={{ accentColor: "var(--accent)" }} />
                              </div>
                              <div style={{ width: "100px", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>STATUS</div>
                              <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>PLAN TITLE / TIER</div>
                              <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>PRICE</div>
                              <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>DUR (DAYS)</div>
                              <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>LIMIT</div>
                              <div style={{ width: "150px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>ACTIONS</div>
                           </div>
                           
                           {offers.map(offer => {
                              const theme = TIER_THEMES[offer.tierLevel?.toUpperCase()] || TIER_THEMES.PRO;
                              const isSelected = selectedPlanIds.includes(offer._id);
                              return (
                                <div key={offer._id} style={{ display: "flex", padding: "20px 32px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", background: isSelected ? "rgba(0, 245, 212, 0.03)" : "transparent" }}>
                                   <div style={{ width: "40px" }}>
                                      <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        onChange={() => setSelectedPlanIds(prev => isSelected ? prev.filter(id => id !== offer._id) : [...prev, offer._id])} 
                                        style={{ accentColor: "var(--accent)" }} 
                                      />
                                   </div>
                                   <div style={{ width: "100px" }}>
                                      <span style={{ fontSize: "9px", fontWeight: 900, color: offer.active ? "#10b981" : "#ef4444", background: offer.active ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: "6px", border: \`1px solid \${offer.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}\` }}>
                                        {offer.active ? "LIVE" : "DRAFT"}
                                      </span>
                                   </div>
                                   <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: theme.bg, color: theme.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{theme.icon}</div>
                                      <div>
                                         <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>{offer.title}</div>
                                         <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>{offer.tierLevel} LEVEL</div>
                                      </div>
                                   </div>
                                   <div style={{ width: "120px", textAlign: "center" }}>
                                      <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--accent)" }}>₹{offer.priceOffer}</div>
                                      <div style={{ fontSize: "9px", color: "var(--muted)", textDecoration: "line-through" }}>₹{offer.priceOriginal}</div>
                                   </div>
                                   <div style={{ width: "120px", textAlign: "center" }}>
                                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>{offer.durationDays}</div>
                                   </div>
                                   <div style={{ width: "120px", textAlign: "center" }}>
                                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>{offer.maxRedemptions}</div>
                                   </div>
                                   <div style={{ width: "150px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                      <button onClick={() => { setNewOffer(offer); setNewOfferModal(true); }} className="action-btn" style={{ padding: "6px 12px", fontSize: "10px" }}>EDIT</button>
                                      <button onClick={() => toggleOffer(offer._id)} className="action-btn" style={{ padding: "6px 12px", fontSize: "10px", color: offer.active ? "#f59e0b" : "#10b981" }}>{offer.active ? "STOP" : "START"}</button>
                                   </div>
                                </div>
                              );
                           })}
                        </div>
                      )}
                    </div>`;

if (content.includes(closingDiv)) {
    content = content.replace(closingDiv, tableViewCode);
    console.log("Table View Injected! ✅");
}

fs.writeFileSync(targetPath, content, "utf8");
console.log("Subscription Hub Modernized Successfully! 🚀");
