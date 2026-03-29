import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL as API } from "../../config";
import AdminSettings from './AdminSettings';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";



export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [approvalTab, setApprovalTab] = useState("Approved");
  const [stats, setStats] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [daysFilter, setDaysFilter] = useState("7");
  const [analytics, setAnalytics] = useState({});
  const [activity, setActivity] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Aptitude");
  const [qFilter, setQFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [qLimit, setQLimit] = useState(15);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(25);
  const [examSections, setExamSections] = useState([]);
  const [detailedStats, setDetailedStats] = useState({});
  const [dbSections, setDbSections] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [disabledTopics, setDisabledTopics] = useState([]);
  const [editExam, setEditExam] = useState(null);
  const [newExam, setNewExam] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [profileEdit, setProfileEdit] = useState({});
  const [bulkJSON, setBulkJSON] = useState("");
  const [bulkModal, setBulkModal] = useState(false);
  const [editQ, setEditQ] = useState(null);
  const [newQ, setNewQ] = useState(null);
  const [trashQuestions, setTrashQuestions] = useState([]);
  const [selectedTrash, setSelectedTrash] = useState([]);
  const [visibleCountTrash, setVisibleCountTrash] = useState(50);
  const [issues, setIssues] = useState([]);
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [gamificationOffers, setGamificationOffers] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [transferModal, setTransferModal] = useState({ show: false, targetSection: "Aptitude", targetTopic: "" });
  const [couponModal, setCouponModal] = useState(null);
  const [newOfferModal, setNewOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: "", priceOriginal: 399, priceOffer: 199, discount: "50%", active: true });
  const [gamificationModal, setGamificationModal] = useState(null);
  const [pw, setPw] = useState({ current: "", newPw: "", msg: "", err: "" });
  const [fps, setFps] = useState(60);
  const [maintenanceCat, setMaintenanceCat] = useState("Aptitude");
  const [maintenanceQuestions, setMaintenanceQuestions] = useState([]);
  const [maintenanceTopics, setMaintenanceTopics] = useState([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "alert", title: "", message: "", onConfirm: null });

  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('admin_dashboard_layout');
    const defaultLayout = {
      left: ['plan_subs', 'top_exams'],
      center: ['q_dist', 'skills', 'trend'],
      right: ['multi_stats', 'sys_status', 'sys_tools']
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          left: parsed.left && parsed.left.length > 0 ? parsed.left : defaultLayout.left,
          center: parsed.center && parsed.center.length > 0 ? parsed.center : defaultLayout.center,
          right: parsed.right && parsed.right.length > 0 ? parsed.right : defaultLayout.right
        };
      } catch (e) { }
    }
    return defaultLayout;
  });
  const [draggedKey, setDraggedKey] = useState(null);
  const [manualModal, setManualModal] = useState(null);
  const [newQModal, setNewQModal] = useState(false);

  const handleDragStart = (e, key) => {
    setDraggedKey(key);
    e.dataTransfer.setData('widgetKey', key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCol, targetIdx) => {
    e.preventDefault();
    const key = e.dataTransfer.getData('widgetKey');
    if (!key) return;

    const newLayout = { ...layout };
    Object.keys(newLayout).forEach(col => {
      newLayout[col] = newLayout[col].filter(k => k !== key);
    });
    newLayout[targetCol].splice(targetIdx, 0, key);

    setLayout(newLayout);
    setDraggedKey(null);
  };

  const publishLayout = () => {
    localStorage.setItem('admin_dashboard_layout', JSON.stringify(layout));
    setIsEditMode(false);
    showToast('Dashboard Layout Published! 🚀');
  };

  const prevCountRef = useRef(0);
  const fuzzyMatch = (a, b) => (a || "").toLowerCase().trim() === (b || "").toLowerCase().trim();

  const token = sessionStorage.getItem("admin_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };


  // Hybrid Logic: Add Auto-Questions
  const addAutoQs = (secName, topName) => {
    const val = window.prompt(`How many auto-generated questions for ${topName}?`, "5");
    const count = parseInt(val);
    if (isNaN(count) || count < 0) return;

    const topicData = detailedStats.find(s => fuzzyMatch(s._id, topName)) || { count: 0 };
    const bankCount = topicData.count;

    const updater = (prevSections) =>
      prevSections.map((s) => {
        if (!fuzzyMatch(s.name, secName)) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (!fuzzyMatch(t.name, topName)) return t;
            const manualCount = (t.selectedQuestions || []).length;
            const totalRequested = manualCount + count;
            if (totalRequested > bankCount) {
              showToast(`⚠️ Only ${bankCount} available in ${topName}. (Requested ${totalRequested})`);
            }
            return { ...t, count: totalRequested };
          })
        };
      });

    if (editExam) {
      setEditExam(prev => ({ ...prev, sections: updater(prev.sections) }));
    } else {
      setExamSections(updater);
    }
  };

  const toggleTopicQuestion = (secName, topName, qId) =>
    setExamSections((p) =>
      p.map((s) => {
        if (!fuzzyMatch(s.name, secName)) return s;
        const newTopics = s.topics.map((t) => {
          if (!fuzzyMatch(t.name, topName)) return t;
          const sId = String(qId);
          const has = (t.selectedQuestions || []).some((id) => String(id) === sId);
          const newIds = has ? t.selectedQuestions.filter((id) => String(id) !== sId) : [...(t.selectedQuestions || []), sId];
          const newCount = t.mode === "manual" ? newIds.length : t.count || 5;
          showToast(has ? `🗑️ Removed from ${topName}` : `✅ Added to ${topName}`);
          return { ...t, selectedQuestions: newIds, count: newCount };
        });
        return { ...s, topics: newTopics };
      }),
    );

  const selectAllTopicQuestions = (secName, topName, questions, deselect = false) => {
    setExamSections((prev) =>
      prev.map((s) => {
        if (!fuzzyMatch(s.name, secName)) return s;
        const newTopics = s.topics.map((t) => {
          if (!fuzzyMatch(t.name, topName)) return t;
          const qIds = (questions || []).map((q) => String(q._id));
          let newIds = Array.isArray(t.selectedQuestions) ? [...t.selectedQuestions] : [];
          if (deselect) {
            newIds = newIds.filter((id) => !qIds.includes(String(id)));
          } else {
            newIds = Array.from(new Set([...newIds, ...qIds]));
          }
          return { ...t, selectedQuestions: newIds, count: newIds.length };
        });
        return { ...s, topics: newTopics };
      }),
    );
    showToast(deselect ? `🗑️ Cleared selections` : `✅ Selected visible questions`);
  };

  useEffect(() => {
    setLoading(true);
    setLoadProgress(0);
    const rawCalls = [fetchStats(), fetchMapping()];
    if (activeView === "approvals") rawCalls.push(fetchSubmissions());
    if (activeView === "users") { rawCalls.push(fetchUsers()); rawCalls.push(fetchExams()); }
    if (activeView === "questions") { rawCalls.push(fetchSections()); rawCalls.push(loadDetailedStats()); }
    if (activeView === "trash") rawCalls.push(fetchTrashQuestions());
    if (activeView === "dashboard") { rawCalls.push(fetchActivity()); rawCalls.push(fetchUsers()); rawCalls.push(fetchAnalytics()); }
    if (activeView === "issues") rawCalls.push(fetchIssues());
    if (activeView === "offers") rawCalls.push(fetchOffers());
    if (activeView === "leaderboard") rawCalls.push(fetchLeaderboard());
    if (activeView === "exams") { rawCalls.push(fetchExams()); rawCalls.push(loadDetailedStats()); }

    let completed = 0;
    const total = rawCalls.length;
    const calls = rawCalls.map((p) => p.catch(() => {}).finally(() => {
      completed++; setLoadProgress(Math.round((completed / total) * 100));
    }));
    Promise.all(calls).finally(() => { setTimeout(() => setLoading(false), 300); });
  }, [activeView, daysFilter]);

  useEffect(() => { 
    if (activeView === "questions") {
      setSelectedQIds([]); // NEW: Clear selection when changing categories/topics
      fetchQuestions(qFilter, 1);
    } 
  }, [activeView, activeCategory, qFilter, searchTerm]);

  const fetchStats = () => {
    return axios.get(`${API}/admin/stats`, config).then((r) => { setStats(r.data); }).catch((err) => { if (err.response?.status === 401) handleLogout(); });
  };
  const fetchMapping = () => axios.get(`${API}/admin/mapping`, config).then((r) => { if (r.data.CATEGORY_MAP) setCategoryMap(r.data.CATEGORY_MAP); });
  const fetchSubmissions = () => axios.get(`${API}/admin/submissions`, config).then((r) => setSubmissions(r.data));
  const fetchUsers = () => axios.get(`${API}/admin/users`, config).then((r) => setUsers(r.data));
  const fetchExams = () => axios.get(`${API}/admin/exams`, config).then((r) => setExams(r.data));
  const fetchSections = () => axios.get(`${API}/admin/sections`, config).then((r) => setDbSections(r.data));
  const loadDetailedStats = () => axios.get(`${API}/admin/stats/questions`, config).then((r) => setDetailedStats(r.data));
  const fetchActivity = () => axios.get(`${API}/admin/activity`, config).then((r) => setActivity(r.data));
  const fetchAnalytics = () => axios.get(`${API}/admin/analytics?days=${daysFilter}`, config).then((r) => setAnalytics(r.data));
  const fetchIssues = () => axios.get(`${API}/admin/issues`, config).then((r) => setIssues(r.data));
  const fetchOffers = () => Promise.all([axios.get(`${API}/admin/offers`, config).then(r => setOffers(r.data)), axios.get(`${API}/admin/coupons`, config).then(r => setCoupons(r.data))]);
  const fetchLeaderboard = () => axios.get(`${API}/leaderboard`, config).then((r) => setLeaderboard(r.data));
  const fetchTrashQuestions = () => axios.get(`${API}/admin/questions/trash`, config).then((r) => setTrashQuestions(r.data));

  const fetchQuestions = (topic = qFilter, page = 1) => {
    setQLoading(true);
    let url = `${API}/admin/questions?topic=${encodeURIComponent(topic)}&page=${page}&limit=15`;
    if (topic === "All") {
      const allTopics = categoryMap[activeCategory] || [];
      const enabledTopics = allTopics.filter((t) => !disabledTopics.includes(t));
      url += `&topics=${encodeURIComponent(JSON.stringify(enabledTopics))}`;
    }
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    return axios.get(url, config).then((r) => {
      setQuestions(r.data.questions || []);
      setQuestionsTotal(r.data.total || 0);
      setQPage(page);
      setQTotalPages(Math.ceil((r.data.total || 0) / (r.data.limit || 15)) || 1);
    }).finally(() => setQLoading(false));
  };


  const saveEditExam = async () => {
    try {
      await axios.put(`${API}/admin/exam/${editExam._id}`, editExam, config);
      showToast("Exam configuration saved! 💾");
      setEditExam(null);
      fetchExams();
    } catch (err) {
      showToast("Failed to save exam.");
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm("Permanently delete this exam?")) return;
    try {
      await axios.delete(`${API}/admin/exam/${id}`, config);
      showToast("Exam deleted 🗑️");
      fetchExams();
    } catch (err) {
      showToast("Deletion failed.");
    }
  };

  const deleteQuestion = (id) => axios.delete(`${API}/admin/question/${id}`, config).then(() => { fetchQuestions(); fetchStats(); fetchMapping(); loadDetailedStats(); showToast("Moved to Trash 🗑️"); });

  const deleteUser = async (code) => {
    if (!window.confirm(`Delete user ${code}? This will also delete their entire exam history.`)) return;
    try {
      await axios.delete(`${API}/admin/user/${code}`, config);
      showToast("User deleted 🗑️");
      fetchUsers(); fetchStats();
    } catch (err) { showToast("Failed to delete user."); }
  };

  const handleUserUpdate = async () => {
    try {
      await axios.put(`${API}/admin/user/${editUser.code}`, editUser, config);
      showToast("User updated successfully! 👤");
      setEditUser(null); fetchUsers();
    } catch (err) { showToast("Failed to update user."); }
  };

  const processSubmission = async (id, status, planType = 'premium') => {
    const action = status === 'approved' ? 'approve' : 'reject';
    try {
      await axios.post(`${API}/admin/${action}/${id}`, { planType }, config);
      showToast(`Submission ${status}! 🔔`);
      fetchSubmissions(); fetchStats(); fetchUsers();
    } catch (err) { showToast("Action failed."); }
  };

  const handleLogout = () => { sessionStorage.removeItem("admin_token"); navigate("/admin"); };

  const resolveIssue = async (id) => {
    try {
      await axios.post(`${API}/admin/issues/${id}/resolve`, {}, config);
      showToast("Issue marked as resolved! ✅");
      fetchIssues();
      fetchStats();
    } catch (err) { showToast("Failed to resolve issue."); }
  };

  const recoverTrashQuestion = async (id) => {
    try {
      await axios.post(`${API}/admin/questions/trash/${id}/recover`, {}, config);
      showToast("Question restored successfully! ↩");
      fetchTrashQuestions();
      fetchStats();
      fetchQuestions();
    } catch (err) { showToast("Restore failed."); }
  };

  const deleteTrashPermanently = async (id) => {
    if (!window.confirm("Permanently delete this question? This CANNOT be undone.")) return;
    try {
      await axios.delete(`${API}/admin/questions/trash/${id}`, config);
      showToast("Permanently deleted. 🗑️");
      fetchTrashQuestions();
    } catch (err) { showToast("Permanent deletion failed."); }
  };

  const toggleOfferStatus = async (id) => {
    try {
      await axios.post(`${API}/admin/offers/${id}/toggle`, {}, config);
      showToast("Offer status updated! 🏷️");
      fetchOffers();
    } catch (err) { showToast("Toggle failed."); }
  };

  const removeOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await axios.post(`${API}/admin/offers/${id}/delete`, {}, config);
      showToast("Offer deleted.");
      fetchOffers();
    } catch (err) { showToast("Delete failed."); }
  };

  const createOffer = async () => {
    try {
      if (!newOffer.title) return showToast("Title is required.");
      await axios.post(`${API}/admin/offers`, newOffer, config);
      showToast("Offer created! 🏷️");
      setNewOfferModal(false);
      setNewOffer({ title: "", priceOriginal: 399, priceOffer: 199, discount: "50%", active: true });
      fetchOffers();
    } catch (err) { showToast("Failed to create offer."); }
  };

  const saveEditQuestion = async () => {
    try {
      if (!editQ.qText && !editQ.q) return showToast("Question text is required.");
      await axios.put(`${API}/admin/question/${editQ._id}`, editQ, config);
      showToast("Question updated successfully! 📝");
      setEditQ(null); fetchQuestions(qFilter, qPage);
      fetchStats(); fetchMapping(); loadDetailedStats();
    } catch (err) { showToast("Failed to update question."); }
  };

  const handleBulkUpload = async () => {
    try {
      const data = JSON.parse(bulkJSON);
      if (!Array.isArray(data)) throw new Error();
      await axios.post(`${API}/admin/questions/bulk`, { questions: data }, config);
      showToast(`Successfully uploaded ${data.length} questions! 🚀`);
      setBulkModal(false); setBulkJSON(""); fetchQuestions();
    } catch (err) { showToast("Invalid JSON format or upload failed."); }
  };

  const openManualSelection = (section, topic) => {
    setQLoading(true);
    let url = `${API}/admin/questions?topic=${encodeURIComponent(topic)}&limit=100`;
    axios.get(url, config).then(r => {
      setManualModal({ section, topic, questions: r.data.questions || [] });
    }).catch(() => showToast("Failed to load questions."))
      .finally(() => setQLoading(false));
  };

  const toggleManualSelect = (qId) => {
    const newEx = { ...editExam };
    const sec = newEx.sections.find(s => s.name === manualModal.section);
    const top = sec.topics.find(t => t.name === manualModal.topic);
    if (!top.selectedQuestions) top.selectedQuestions = [];
    const isSelected = top.selectedQuestions.some(id => id === qId || (id._id === qId));
    if (isSelected) {
      top.selectedQuestions = top.selectedQuestions.filter(id => (typeof id === 'string' ? id : id._id) !== qId);
    } else {
      top.selectedQuestions.push(qId);
    }
    setEditExam(newEx);
  };



  const createNewQuestion = async () => {
    try {
      if (!newQ.qText || !newQ.topic) return showToast("Please fill all fields.");
      await axios.post(`${API}/admin/question`, newQ, config);
      showToast("Question Created! 🚀");
      setNewQModal(false); setNewQ(null); fetchQuestions();
    } catch (err) { showToast("Failed to create question."); }
  };



  const renderWidget = (key) => {
    const isDragging = draggedKey === key;
    const widgetStyle = {
      position: 'relative',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: isEditMode ? 'grab' : 'default',
      opacity: isDragging ? 0.4 : 1,
      border: isEditMode ? '1px dashed #00f5d4' : 'none',
      boxShadow: isEditMode ? '0 0 15px rgba(0, 245, 212, 0.1)' : 'none',
      borderRadius: '16px',
      zIndex: isDragging ? 20 : 1
    };

    switch (key) {
      case 'plan_subs':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
               <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "20px" }}>Plan Subscriptions</h3>
               <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ height: "180px", width: "60%" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Basic", value: stats.usersByPlan?.Basic || 0, color: "#64748b" },
                            { name: "Pro", value: stats.usersByPlan?.Pro || 0, color: "#8b5cf6" },
                            { name: "Enterprise", value: stats.usersByPlan?.Enterprise || 0, color: "#f59e0b" },
                          ]}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[0, 1, 2].map((i) => (
                            <Cell key={i} fill={["#64748b", "#8b5cf6", "#f59e0b", "#10b981"][i]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                   <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { n: "Basic", c: "#64748b" },
                        { n: "Pro", c: "#8b5cf6" },
                        { n: "Enterprise", c: "#f59e0b" },
                      ].map(p => (
                        <div key={p.n} style={{ fontSize: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                           <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: p.c }}></div>
                           <span style={{ color: "var(--muted)" }}>{p.n}</span>
                        </div>
                      ))}
                   </div>
               </div>
            </div>
          </div>
        );
      case 'top_exams':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div className="glass-card no-scrollbar" style={{ padding: "16px", borderRadius: "16px", height: "auto", overflowY: "auto" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "24px" }}>Top Performing Categories</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {analytics.examBreakdown && analytics.examBreakdown.length > 0 ? analytics.examBreakdown.slice(0, 5).map(item => (
                  <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                      <span style={{ color: "#fff" }}>{item.accuracy}% Avg</span>
                    </div>
                    <div style={{ height: "10px", background: "rgba(56, 189, 248, 0.1)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${item.accuracy}%`, height: "100%", background: "#38bdf8" }}></div>
                    </div>
                  </div>
                )) : [
                  { name: "Quantitative Aptitude", val: 50, pct: "80%" },
                  { name: "Logical Reasoning", val: 40, pct: "65%" },
                  { name: "Verbal Ability", val: 36, pct: "50%" },
                  { name: "Technical Programming", val: 30, pct: "40%" }
                ].map(item => (
                  <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)" }}>
                      <span>{item.name}</span>
                      <span style={{ color: "#fff" }}>{item.pct}</span>
                    </div>
                    <div style={{ height: "10px", background: "rgba(56, 189, 248, 0.1)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: item.pct, height: "100%", background: "#38bdf8" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'q_dist':
        const distData = detailedStats && detailedStats.sections ? Object.entries(detailedStats.sections).map(([name, value], i) => ({
          name, 
          value, 
          color: ["#00f5d4", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"][i % 5]
        })) : [
          { name: "Aptitude", value: 40, color: "#00f5d4" },
          { name: "Reasoning", value: 35, color: "#f59e0b" },
          { name: "Verbal", value: 25, color: "#3b82f6" },
        ];
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "20px" }}>Question Bank Distribution</h3>
              <div style={{ height: "180px", width: "100%", position: "relative" }}>
                 <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={distData}
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div style={{ position: "absolute", bottom: "10px", right: "0", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {distData.slice(0, 3).map(d => (
                      <div key={d.name} style={{ fontSize: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ color: d.color, fontWeight: 900 }}>{d.value}</span>
                        <span style={{ color: "var(--muted)" }}>{d.name.split(' ')[0]}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
               <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "20px" }}>Student Strengths Matrix</h3>
               <div style={{ height: "200px", width: "100%" }}>
                 <ResponsiveContainer>
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.strengths || [
                     { subject: 'Aptitude', A: 80, fullMark: 100 },
                     { subject: 'Reasoning', A: 70, fullMark: 100 },
                     { subject: 'Verbal', A: 60, fullMark: 100 },
                     { subject: 'Technical', A: 90, fullMark: 100 },
                     { subject: 'Logic', A: 50, fullMark: 100 },
                   ]}>
                     <PolarGrid stroke="rgba(255,255,255,0.1)" />
                     <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                     <Radar name="Student" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.6} />
                   </RadarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        );
      case 'trend':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                 <h3 style={{ fontSize: "14px", fontWeight: 800 }}>Exams Conducted & Registrations Trend</h3>
                 <select value={daysFilter} onChange={e => setDaysFilter(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", padding: "4px 8px", borderRadius: "8px", color: "var(--muted)", fontSize: "11px" }}>
                   <option value="7">7 Days</option>
                   <option value="30">30 Days</option>
                 </select>
              </div>
              <div style={{ display: "flex", gap: "40px" }}>
                 <div>
                   <div style={{ fontSize: "36px", fontWeight: 900 }}>{stats.totalUsers || 0} <span style={{ fontSize: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: "6px" }}>Active</span></div>
                   <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 700, marginTop: "8px" }}>● Total Users</div>
                 </div>
                 <div>
                   <div style={{ fontSize: "36px", fontWeight: 900 }}>{stats.totalAttempts || 0} <span style={{ fontSize: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: "6px" }}>Growing ↑</span></div>
                   <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 700, marginTop: "8px" }}>● Total Exams</div>
                 </div>
              </div>
              <div style={{ height: "200px", marginTop: "24px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeline || []} margin={{ left: -20, bottom: 0, right: 0, top: 20 }}>
                    <defs>
                      <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d?.split('-').slice(1).join('/')} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="attempts" name="Exams" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAttempts)" />
                    <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'multi_stats':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
               {[
                 { label: "Exams DB", val: stats.totalQuestions || 0, sub: "Total Questions", icon: "📚", color: "#38bdf8" },
                 { label: "Approvals", val: stats.pending || 0, sub: "Pending Review", icon: "✅", color: "#f59e0b" },
                 { label: "Students", val: stats.totalUsers || 0, sub: "Active Subs", icon: "👥", color: "#10b981" },
                 { label: "Sessions", val: stats.activeUsers || 16, sub: "Online Now", icon: "🌐", color: "#818cf8" },
                 { label: "System", val: fps + " fps", sub: "Monitoring...", icon: "⚡", color: "#00f5d4" },
                 { label: "Rating", val: "5.0", sub: "User Feedback", icon: "⭐", color: "#facc15" }
               ].map(s => (
                 <div key={s.label} className="glass-card" style={{ padding: "16px", borderRadius: "16px", borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>{s.label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 900 }}>{s.val}</div>
                    <div style={{ fontSize: "10px", color: "var(--muted)" }}>{s.sub}</div>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'success_fail':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
               {[
                 { label: "Approved", pct: 100, color: "var(--accent)" },
                 { label: "Rejected", pct: 0, color: "#f87171" },
                 { label: "Processing", pct: 0, color: "#f59e0b" },
               ].map(c => (
                 <div key={c.label} className="glass-card" style={{ padding: "12px", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "80px", height: "80px", position: "relative" }}>
                       <ResponsiveContainer>
                         <PieChart>
                            <Pie data={[{v: c.pct}, {v: 100-c.pct}]} innerRadius={25} outerRadius={35} startAngle={90} endAngle={-270} dataKey="v">
                               <Cell fill={c.color} />
                               <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                       <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "12px", fontWeight: 900 }}>{c.pct}%</div>
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--muted)", marginTop: "8px", fontWeight: 800 }}>{c.label.toUpperCase()}</div>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'sys_status':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
            <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                 <span style={{ fontSize: "12px", color: "var(--muted)" }}>System Status</span>
                 <span style={{ fontSize: "12px", color: "var(--muted)" }}>{new Date().toISOString().split('T')[0]}</span>
              </div>
              <div style={{ padding: "16px", background: "rgba(59, 130, 246, 0.05)", borderLeft: "4px solid #3b82f6", borderRadius: "8px" }}>
                 <div style={{ fontSize: "10px", color: "#60a5fa", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>Operations Control</div>
                 <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>TCS NQT 2026</div>
                 <div style={{ fontSize: "16px", fontWeight: 800, color: "#60a5fa" }}>Live Database</div>
                 <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "8px" }}>Interface: Admin Console</div>
              </div>
            </div>
          </div>
        );
      case 'sys_tools':
        return (
          <div key={key} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, key)} style={widgetStyle}>
             <div className="glass-card" style={{ padding: "20px", borderRadius: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "16px" }}>Core Utilities</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                   <button onClick={() => showToast('Cache Cleared! 🧹')} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", padding: "10px", borderRadius: "8px", color: "#fff", fontSize: "11px", cursor: "pointer" }}>🧹 Clear Cache</button>
                   <button onClick={() => showToast('Database Boosted! ⚡')} style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.3)", padding: "10px", borderRadius: "8px", color: "var(--accent)", fontSize: "11px", cursor: "pointer" }}>⚡ Boost DB</button>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  // ── RENDER SHELL ──
  return (
    <div
      className="admin-dashboard-root"
      style={{
        minHeight: "100vh",
        background: "#03040b",
        color: "#fff",
        fontFamily: "var(--font-body)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        :root {
          --accent: #00f5d4;
          --accent-glow: rgba(0, 245, 212, 0.4);
          --bg: #03040b;
          --bg2: #0b1221;
          --border: rgba(255,255,255,0.08);
          --border2: rgba(255,255,255,0.15);
          --text: #f8fafc;
          --muted: #94a3b8;
          --glass: rgba(15, 23, 42, 0.6);
          --blur: blur(20px);
          --shadow-lg: 0 20px 50px rgba(0,0,0,0.5);
          --font-heading: 'Outfit', sans-serif;
          --font-body: 'Inter', sans-serif;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-glow {
          0% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
          100% { opacity: 0.15; transform: scale(1); }
        }

        .ambient-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.2;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .glass-card:hover { border-color: rgba(0, 245, 212, 0.2); }

        .sidebar-item {
          display: flex;
          alignItems: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          color: #94a3b8;
          transition: 0.3s;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .sidebar-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
        .sidebar-item.active {
          background: rgba(0, 245, 212, 0.05);
          color: var(--accent);
          border: 1px solid rgba(0, 245, 212, 0.15);
          box-shadow: 0 0 20px rgba(0, 245, 212, 0.05);
        }

        .tab-chip {
          padding: 8px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .tab-chip.active {
          background: rgba(0, 245, 212, 0.1);
          border-color: rgba(0, 245, 212, 0.4);
          color: var(--accent);
        }

        .q-row-card {
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: 0.2s;
        }
        .q-row-card:hover { background: rgba(255,255,255,0.01); }

        .option-bubble {
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .option-bubble.correct {
          background: rgba(0, 245, 212, 0.05);
          border-color: rgba(0, 245, 212, 0.3);
          color: var(--accent);
        }

        .action-btn {
          font-size: 10px;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
          border: 1.5px solid transparent;
        }
        .edit-btn { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.1); }
        .edit-btn:hover { background: #fff; color: #000; }
        .delete-btn { background: rgba(239, 68, 68, 0.08); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
        .delete-btn:hover { background: #ef4444; color: #fff; }

        .rank-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11px;
          border: 1.5px solid rgba(255,255,255,0.1);
        }
        .rank-01 { border-color: #facc15; color: #facc15; box-shadow: 0 0 10px rgba(250, 204, 21, 0.2); }
        .rank-02 { border-color: #cbd5e1; color: #cbd5e1; }
        .rank-03 { border-color: #92400e; color: #92400e; }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--accent);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .status-pro { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }
        .status-free { background: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }

        .btn-glow {
          position: relative;
          overflow: hidden;
          transition: 0.3s;
        }
        .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 20px var(--accent-glow); }

        .badge-auto {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
        }
        .badge-manual {
          background: rgba(0, 245, 212, 0.1);
          color: var(--accent);
          border: 1px solid rgba(0, 245, 212, 0.3);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
        }
      `}</style>

      <div className="ambient-glow" style={{ top: '-10%', right: '-5%', background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', animation: 'pulse-glow 8s infinite ease-in-out' }}></div>
      <div className="ambient-glow" style={{ bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', animation: 'pulse-glow 10s infinite ease-in-out' }}></div>
      <div className="grid-bg" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.08, pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>

      {/* Header */}
      <header
        style={{
          height: "72px",
          background: "rgba(11, 18, 33, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "8px", background: "rgba(0, 245, 212, 0.1)", borderRadius: "12px", border: "1px solid rgba(0, 245, 212, 0.2)" }}>
            <span style={{ fontSize: "20px", color: "var(--accent)" }}>🛡️</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 900, letterSpacing: "1px", color: "var(--accent)" }}>ADMIN PANEL</h1>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)", fontWeight: 500, letterSpacing: "1px" }}>TCS NQT 2026</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {activeView === "dashboard" && (
             <button
               onClick={() => setIsEditMode(!isEditMode)}
               className="btn-glow"
               style={{
                 background: isEditMode ? "rgba(0, 245, 212, 0.1)" : "rgba(255,255,255,0.05)",
                 color: isEditMode ? "var(--accent)" : "var(--muted)",
                 border: `1px solid ${isEditMode ? "var(--accent)" : "var(--border)"}`,
                 padding: "8px 16px",
                 borderRadius: "10px",
                 fontSize: "11px",
                 fontWeight: 800,
                 cursor: "pointer",
                 display: "flex",
                 alignItems: "center",
                 gap: "8px"
               }}
             >
               <span>{isEditMode ? "🛠️ Stop Editing" : "🖱️ Edit Layout"}</span>
             </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0, 245, 212, 0.05)", padding: "6px 16px", borderRadius: "20px", border: "1px solid rgba(0, 245, 212, 0.3)" }}>
             <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }}></div>
             <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "var(--accent)" }}>SYSTEM ACTIVE</span>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "8px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <span style={{ fontSize: "18px" }}>⏻</span>
          </button>
        </div>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: sidebarOpen ? "260px" : "80px",
            background: "rgba(11, 18, 33, 0.95)",
            borderRight: "1px solid var(--border)",
            padding: "24px 12px",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 90,
          }}
        >
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "approvals", label: "Approval Users", icon: "👤" },
            { id: "users", label: "User Management", icon: "👥" },
            { id: "exams", label: "Exams Config", icon: "🏆" },
            { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
            { id: "questions", label: "Question Bank", icon: "📝" },
            { id: "trash", label: "Trash Bin", icon: "🗑️" },
            { id: "settings", label: "General Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
              style={{
                width: "100%",
                background: "none",
                textAlign: "left",
                padding: sidebarOpen ? "14px 20px" : "14px",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: 700 }}>{item.label}</span>}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
             <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--muted)", cursor: "pointer", fontSize: "12px" }}>
               {sidebarOpen ? "← Collapse Sidebar" : "→"}
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "32px", position: "relative", zIndex: 1, overflowY: "auto", maxHeight: "calc(100vh - 72px)" }}>
           {activeView === "dashboard" && (
             <div style={{ animation: "fadeIn 0.5s", background: '#0b1221', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
               <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
               
               {/* ── Dashboard Layout Columns ── */}
               <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) minmax(400px, 2fr) minmax(250px, 1fr)', gap: '24px' }}>
                 {['left', 'center', 'right'].map(col => (
                   <div key={col} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col, layout[col].length)} style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '200px' }}>
                     {layout[col].map((key, idx) => (
                       <div key={key} onDragOver={handleDragOver} onDrop={(e) => { e.stopPropagation(); handleDrop(e, col, idx); }}>
                         {renderWidget(key)}
                       </div>
                     ))}
                   </div>
                 ))}
               </div>

               {/* 💡 Support FAB */}
               <button className="btn-glow" style={{ position: "fixed", bottom: "32px", right: "32px", padding: "12px 24px", background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", border: "none", borderRadius: "24px", color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", zIndex: 1000, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}>
                 <span style={{ fontSize: "18px" }}>💡</span> Support
               </button>
             </div>
           )}


           {activeView === "exams" && (
             <div style={{ animation: "fadeIn 0.4s ease-out" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                 <div>
                   <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Exam Builder</h2>
                   <p style={{ color: "var(--muted)" }}>Configure exam sections, topics, and question selection modes.</p>
                 </div>
                 <button onClick={() => setNewExam({ key: "", title: "", category: "Aptitude", sections: [] })} className="btn-glow" style={{ background: "var(--accent)", color: "#000", border: "none", padding: "10px 24px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>+ Create New Exam</button>
               </div>

               {/* Exam List */}
               <div style={{ display: "grid", gap: "16px" }}>
                 {exams.map(exam => (
                   <div key={exam._id} className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{exam.title}</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px", color: "var(--muted)" }}>{exam.category}</span>
                          <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px", color: "var(--muted)" }}>{exam.key}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => setEditExam(exam)} style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Edit Config</button>
                        <button onClick={() => deleteExam(exam._id)} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                      </div>
                   </div>
                 ))}
               </div>

               {/* Configuration Modal (simplified for this step) */}
               {editExam && (
                 <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                   <div className="glass-card" style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", overflowY: "auto", padding: "32px", borderRadius: "24px", background: "#0b1221" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Editing: {editExam.title}</h2>
                        <button onClick={() => setEditExam(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}>✕</button>
                      </div>

                      {/* Sections & Topics */}
                      {(editExam.sections || []).map((sec, sIdx) => (
                        <div key={sIdx} style={{ marginBottom: "24px", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border)" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--accent)" }}>{sec.name}</h3>
                          <div style={{ display: "grid", gap: "12px" }}>
                            {sec.topics.map((top, tIdx) => {
                              const manualCount = (top.selectedQuestions || []).length;
                              const autoCount = Math.max(0, (top.count || 0) - manualCount);
                              return (
                                <div key={tIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>{top.name}</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                      {/* Manual Badges */}
                                      {(top.selectedQuestions || []).map((_, i) => (
                                        <span key={`q-${i}`} className="badge-manual">Q{i + 1}</span>
                                      ))}
                                      {/* Auto Badges */}
                                      {Array.from({ length: autoCount }).map((_, i) => (
                                        <span key={`a-${i}`} className="badge-auto">A{i + 1}</span>
                                      ))}
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{ textAlign: "right", marginRight: "16px" }}>
                                      <div style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700 }}>✅ {manualCount} Specific</div>
                                      <div style={{ fontSize: "11px", color: "#10b981", fontWeight: 700 }}>🤖 {autoCount} Auto</div>
                                      <div style={{ fontSize: "12px", color: "#fff", fontWeight: 800, borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "2px", paddingTop: "2px" }}>Σ {top.count || 0} Total</div>
                                    </div>
                                    
                                    <div style={{ display: "flex", gap: "8px" }}>
                                      {/* NEW: Add Auto Questions Interaction */}
                                      <button 
                                        onClick={() => addAutoQs(sec.name, top.name)}
                                        style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                      >
                                        (+) Auto
                                      </button>
                                      <button onClick={() => openManualSelection(sec.name, top.name)} style={{ background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", border: "1px solid rgba(0, 245, 212, 0.3)", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Manage Specific</button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "32px" }}>
                         <button onClick={() => setEditExam(null)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", padding: "12px 24px", borderRadius: "12px", cursor: "pointer" }}>Cancel</button>
                         <button onClick={saveEditExam} style={{ background: "var(--accent)", color: "#000", border: "none", padding: "12px 32px", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>Save Configuration</button>
                      </div>
                   </div>
                 </div>
               )}
             </div>
           )}


           {activeView === "questions" && (
             <div style={{ animation: "fadeIn 0.5s ease-out" }}>
               {/* ── QUESTION BANK HEADER ── */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                 <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                   <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                     📝
                   </div>
                   <div>
                     <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "4px" }}>Question Bank</h2>
                     <p style={{ color: "var(--muted)", fontSize: "14px" }}>Efficiently manage your repository of exam questions with real-time sync.</p>
                   </div>
                 </div>
                 
                 <div style={{ display: "flex", gap: "12px" }}>
                   <button onClick={() => setBulkModal(true)} style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "10px 20px", borderRadius: "10px", color: "#60a5fa", fontWeight: 700, fontSize: "12px", letterSpacing: "0.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                     <span style={{ fontSize: "16px" }}>🗂️</span> BULK UPLOAD
                   </button>
                   <button onClick={() => { setNewQModal(true); setNewQ({ qText: "", options: ["", "", "", ""], correct: 0, topic: "", category: activeCategory }); }} className="btn-glow" style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 800, fontSize: "12px", letterSpacing: "0.5px", cursor: "pointer" }}>
                     + CREATE QUESTION
                   </button>
                 </div>
               </div>

               {/* ── FILTER TABS ── */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                 <div style={{ display: "flex", gap: "12px" }}>
                   {Object.keys(categoryMap).map(cat => {
                     const count = detailedStats && detailedStats.sections ? detailedStats.sections[cat] || 0 : 0;
                     return (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)} 
                        className={`tab-chip ${activeCategory === cat ? 'active' : ''}`}
                      >
                        {cat} <span style={{ opacity: 0.5, marginLeft: "4px" }}>({count})</span>
                      </button>
                     );
                   })}
                 </div>

                 <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                   <select 
                     value={qFilter} 
                     onChange={(e) => setQFilter(e.target.value)} 
                     style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--border)", padding: "10px 16px", borderRadius: "10px", color: "#fff", fontSize: "13px", width: "220px", cursor: "pointer", outline: "none" }}
                   >
                     <option value="All">{`All Topics in ${activeCategory} (${questionsTotal})`}</option>
                     {(categoryMap[activeCategory] || []).map(topic => (
                       <option key={topic} value={topic}>{topic}</option>
                     ))}
                   </select>
                   <div style={{ position: "relative" }}>
                     <input 
                       type="text" 
                       placeholder="Search All Questions..." 
                       value={searchTerm} 
                       onChange={(e) => setSearchTerm(e.target.value)} 
                       style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--border)", padding: "10px 16px", borderRadius: "10px", color: "#fff", width: "300px", fontSize: "13px", outline: "none" }} 
                     />
                   </div>
                 </div>
               </div>

               {/* ── SUB HEADER ── */}
               <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderRadius: "16px", marginBottom: "32px", border: "1px solid rgba(0, 245, 212, 0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px", color: "var(--accent)" }}>🌐</span>
                    <span style={{ fontSize: "16px", fontWeight: 800 }}>All {activeCategory} Questions</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     {selectedQIds.length > 0 && (
                       <button 
                         onClick={async () => {
                           if (!window.confirm(`Delete ${selectedQIds.length} selected questions?`)) return;
                           await Promise.all(selectedQIds.map(id => axios.delete(`${API}/admin/question/${id}`, config)));
                           showToast("Bulk deletion complete 🗑️");
                           setSelectedQIds([]); fetchQuestions(); fetchStats(); loadDetailedStats();
                         }}
                         style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, cursor: "pointer", transition: "0.2s" }}
                       >
                         🗑️ DELETE SELECTED ({selectedQIds.length})
                       </button>
                     )}
                     <div style={{ background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, border: "1px solid rgba(0, 245, 212, 0.2)", cursor: "default" }}>
                       {questionsTotal} TOTAL
                     </div>
                  </div>
               </div>

               {/* ── QUESTIONS LIST ── */}
               <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                 {qLoading ? (
                   <div style={{ padding: "100px", textAlign: "center", color: "var(--muted)", animation: "pulse 1.5s infinite" }}>
                     <div style={{ fontSize: "32px", marginBottom: "16px" }}>📡</div>
                     <p style={{ fontSize: "14px", fontWeight: 700 }}>Synchronizing Database...</p>
                   </div>
                 ) : questions.length === 0 ? (
                    <div style={{ padding: "100px", textAlign: "center", color: "var(--muted)" }}>
                      <p style={{ fontSize: "16px", fontWeight: 600 }}>No questions found for this criteria.</p>
                    </div>
                 ) : (
                   <div style={{ width: "100%" }}>
                     {/* List Header */}
                     <div style={{ display: "flex", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                         <div style={{ width: "40px", display: "flex", justifyContent: "center" }}>
                            <input 
                              type="checkbox" 
                              checked={questions.length > 0 && questions.every(q => selectedQIds.includes(q._id))} 
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQIds(prev => Array.from(new Set([...prev, ...questions.map(q => q._id)])));
                                } else {
                                  setSelectedQIds(prev => prev.filter(id => !questions.some(q => q._id === id)));
                                }
                              }}
                              style={{ accentColor: "var(--accent)", cursor: "pointer" }} 
                            />
                         </div>
                        <div style={{ width: "60px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>#</div>
                        <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 800, marginLeft: "20px" }}>QUESTION DETAILS</div>
                        <div style={{ width: "180px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>ACTIONS</div>
                     </div>

                     {/* Rows */}
                     {questions.map((q, idx) => {
                       const indexNum = ((qPage - 1) * 15) + idx + 1;
                       const opts = q.options || q.o || [];
                       const correctIdx = q.correct_index !== undefined ? q.correct_index : q.a;

                       return (
                         <div key={q._id} className="q-row-card" style={{ display: "flex", padding: "24px", alignItems: "flex-start" }}>
                            {/* Checkbox */}
                            <div style={{ width: "40px", display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                               <input 
                                 type="checkbox" 
                                 checked={selectedQIds.includes(q._id)} 
                                 onChange={() => setSelectedQIds(prev => prev.includes(q._id) ? prev.filter(id => id !== q._id) : [...prev, q._id])}
                                 style={{ accentColor: "var(--accent)", cursor: "pointer" }} 
                               />
                            </div>

                            {/* Index */}
                            <div style={{ width: "60px", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "var(--muted)", paddingTop: "2px" }}>
                               {String(indexNum).padStart(2, '0')}
                            </div>

                            {/* Main Content */}
                            <div style={{ flex: 1, marginLeft: "20px" }}>
                               <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: "1.5", marginBottom: "8px", color: "#f8fafc" }}>
                                 {q.qText || (typeof q.q === 'object' ? q.q.text : q.q)}
                               </div>
                               
                               <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
                                 <span style={{ fontSize: "12px" }}>📁</span>
                                 <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700 }}>{q.topic}</span>
                               </div>

                               {/* Options Grid */}
                               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "600px" }}>
                                 {opts.map((opt, oIdx) => (
                                   <div key={oIdx} className={`option-bubble ${correctIdx === oIdx ? 'correct' : ''}`}>
                                      <span style={{ color: correctIdx === oIdx ? 'var(--accent)' : 'var(--muted)', fontWeight: 800 }}>{String.fromCharCode(65 + oIdx)}</span>
                                      <span>{typeof opt === 'string' ? opt : opt.text}</span>
                                   </div>
                                 ))}
                               </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ width: "180px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                               <button onClick={() => setEditQ(q)} className="action-btn edit-btn">EDIT</button>
                               <button onClick={() => deleteQuestion(q._id)} className="action-btn delete-btn">DELETE</button>
                            </div>
                         </div>
                       );
                     })}

                     {/* ── PAGINATION CONTROLS ── */}
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <button 
                          onClick={() => fetchQuestions(qFilter, qPage - 1)} 
                          disabled={qPage <= 1} 
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: qPage <= 1 ? "var(--muted)" : "#fff", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: qPage <= 1 ? "default" : "pointer" }}
                        >
                          ← Previous
                        </button>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>Page {qPage} of {qTotalPages}</span>
                        <button 
                          onClick={() => fetchQuestions(qFilter, qPage + 1)} 
                          disabled={qPage >= qTotalPages} 
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: qPage >= qTotalPages ? "var(--muted)" : "#fff", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: qPage >= qTotalPages ? "default" : "pointer" }}
                        >
                          Next →
                        </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           )}

            {/* 👥 USERS VIEW */}
            {activeView === "users" && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>👥</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px" }}>User Management</h2>
                      <p style={{ color: "var(--muted)", fontSize: "14px" }}>Manage registered students and their trial/pro subscription status.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderRadius: "16px", marginBottom: "32px", border: "1px solid rgba(0, 245, 212, 0.15)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "18px", color: "var(--accent)" }}>🌐</span>
                      <span style={{ fontSize: "16px", fontWeight: 800 }}>Student Database</span>
                    </div>
                    <div className="status-badge status-pro">{users.length} TOTAL USERS</div>
                </div>

                <div className="no-scrollbar" style={{ borderRadius: "16px", overflowY: "auto", maxHeight: "calc(100vh - 200px)", border: "1px solid rgba(255,255,255,0.05)", background: "transparent" }}>
                   <div style={{ display: "flex", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(11, 18, 33, 0.95)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
                      <div style={{ width: "60px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>INDEX</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 800, marginLeft: "20px", letterSpacing: "1px" }}>STUDENT INFORMATION</div>
                      <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>SUBSCRIPTION</div>
                      <div style={{ width: "150px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>ACTIONS</div>
                   </div>

                   {users.length === 0 ? (
                     <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.5s ease-out" }}>
                       <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "50%", marginBottom: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                         <span style={{ fontSize: "32px", opacity: 0.8 }}>👥</span>
                       </div>
                       <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>No Users Found</h3>
                       <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "300px", textAlign: "center" }}>There are currently no registered students in the database.</p>
                     </div>
                   ) : users.map((u, i) => (
                     <div 
                       key={u._id} 
                       style={{ display: "flex", padding: "20px 24px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", animation: `fadeIn 0.4s ease-out ${i * 0.05}s both`, borderLeft: "3px solid transparent" }}
                       onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderLeft = "3px solid " + (u.plan === 'Pro' ? '#10b981' : 'var(--accent)'); e.currentTarget.style.transform = "translateX(4px)"; }} 
                       onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeft = "3px solid transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
                     >
                        <div style={{ width: "60px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "var(--muted)" }}>{String(i + 1).padStart(2, '0')}</div>
                        <div style={{ flex: 1, marginLeft: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                           <div className="avatar-circle">{u.name?.charAt(0) || "S"}</div>
                           <div>
                              <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{u.name}</div>
                              <div style={{ fontSize: "12px", color: "var(--muted)" }}>{u.email}</div>
                           </div>
                        </div>
                        <div style={{ width: "120px", display: "flex", justifyContent: "center" }}>
                           <span className={`status-badge ${u.plan === 'Pro' ? 'status-pro' : 'status-free'}`}>{u.plan || 'Free'}</span>
                        </div>
                        <div style={{ width: "150px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                           <button onClick={() => setEditUser(u)} className="action-btn edit-btn" style={{ padding: "6px 12px", fontSize: "11px" }}>EDIT</button>
                           <button onClick={() => deleteUser(u.code)} className="action-btn delete-btn" style={{ padding: "6px 12px", fontSize: "11px" }}>DELETE</button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* ✅ APPROVALS VIEW */}
            {activeView === "approvals" && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "var(--accent)" }}>🛡️</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px" }}>Approval Users</h2>
                      <p style={{ color: "var(--muted)", fontSize: "14px" }}>Process and approve student premium access requests.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                     {['All', 'Pending', 'Approved', 'Rejected'].map(tab => {
                       const count = tab === 'All' ? submissions.length : submissions.filter(s => (s.status || 'pending').toLowerCase() === tab.toLowerCase()).length;
                       const getIcon = (t) => t === 'Pending' ? '⌛' : t === 'Approved' ? '✅' : t === 'Rejected' ? '❌' : '';
                       const isSelected = approvalTab === tab;
                       
                       let baseColor = 'rgba(255,255,255,0.5)';
                       let borderColor = 'rgba(255,255,255,0.1)';
                       let bg = 'transparent';
                       let badgeBg = '#334155';
                       let badgeColor = '#cbd5e1';

                       if (isSelected) {
                          if (tab === 'Approved') { baseColor = '#10b981'; borderColor = '#10b981'; bg = 'rgba(16, 185, 129, 0.05)'; badgeBg = '#10b981'; badgeColor = '#fff'; }
                          else if (tab === 'Rejected') { baseColor = '#ef4444'; borderColor = '#ef4444'; bg = 'rgba(239, 68, 68, 0.05)'; badgeBg = '#ef4444'; badgeColor = '#fff'; }
                          else if (tab === 'Pending') { baseColor = '#f59e0b'; borderColor = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.05)'; badgeBg = '#f59e0b'; badgeColor = '#fff'; }
                          else { baseColor = '#fff'; borderColor = 'rgba(255,255,255,0.3)'; bg = 'rgba(255,255,255,0.05)'; badgeBg = '#fff'; badgeColor = '#000'; }
                       }

                       return (
                         <button 
                           key={tab} 
                           onClick={() => setApprovalTab(tab)}
                           style={{ 
                             padding: "6px 16px", 
                             background: bg,
                             color: baseColor,
                             border: `1px solid ${borderColor}`,
                             borderRadius: "20px", 
                             fontSize: "13px", 
                             fontWeight: 600,
                             cursor: "pointer",
                             display: "flex",
                             gap: "8px",
                             alignItems: "center",
                             transition: "all 0.2s"
                           }}
                         >
                           {getIcon(tab)} {tab === 'All' ? 'All' : tab} <span style={{ background: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>{count}</span>
                         </button>
                       );
                     })}
                  </div>
                </div>

                <div className="no-scrollbar" style={{ borderRadius: "16px", overflowY: "auto", maxHeight: "calc(100vh - 200px)", border: "1px solid rgba(255,255,255,0.05)", background: "transparent" }}>
                   <div style={{ display: "flex", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(11, 18, 33, 0.95)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
                      <div style={{ width: "40px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>#</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 800, marginLeft: "20px", letterSpacing: "1px" }}>STUDENT</div>
                      <div style={{ width: "150px", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>UTR / CODE</div>
                      <div style={{ width: "80px", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>AMOUNT</div>
                      <div style={{ width: "100px", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>DATE</div>
                      <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>STATUS</div>
                      <div style={{ width: "180px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px" }}>ACTIONS</div>
                   </div>

                   {(() => {
                     const filtered = submissions.filter(s => approvalTab === 'All' ? true : (s.status || 'pending').toLowerCase() === approvalTab.toLowerCase());
                     if (filtered.length === 0) {
                       return (
                         <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.5s ease-out" }}>
                           <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "50%", marginBottom: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                             <span style={{ fontSize: "32px", opacity: 0.8 }}>📂</span>
                           </div>
                           <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>No {approvalTab} Users Found</h3>
                           <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "300px", textAlign: "center" }}>There are currently no student requests matching the "{approvalTab}" criteria.</p>
                         </div>
                       );
                     }
                     return filtered.map((sub, i) => (
                       <div key={sub._id} style={{ display: "flex", padding: "20px 24px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", animation: `fadeIn 0.4s ease-out ${i * 0.05}s both`, borderLeft: "3px solid transparent" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderLeft = "3px solid " + (approvalTab === 'Rejected' ? '#ef4444' : approvalTab === 'Approved' ? '#10b981' : 'var(--accent)'); e.currentTarget.style.transform = "translateX(4px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeft = "3px solid transparent"; e.currentTarget.style.transform = "translateX(0)"; }}>
                          <div style={{ width: "40px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "var(--muted)" }}>{String(i + 1).padStart(2, '0')}</div>
                          <div style={{ flex: 1, marginLeft: "20px" }}>
                             <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{sub.name || 'Unknown User'}</div>
                             <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{sub.email || '—'}</div>
                          </div>
                          <div style={{ width: "150px" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)", width: "fit-content", maxWidth: "100%" }}>
                                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
                                  {sub.generatedCode || sub.utr || '—'}
                                </span>
                                {(sub.generatedCode || sub.utr) && (
                                  <span style={{ cursor: "pointer", fontSize: "14px", opacity: 0.7, transition: "0.2s" }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7} onClick={() => { navigator.clipboard.writeText(sub.generatedCode || sub.utr); showToast("Copied to clipboard! 📋"); }} title="Copy Code">
                                    📋
                                  </span>
                                )}
                             </div>
                          </div>
                          <div style={{ width: "80px", fontSize: "14px", fontWeight: 800, color: "#fff" }}>₹{sub.amount || '—'}</div>
                          <div style={{ width: "100px", display: "flex", flexDirection: "column", gap: "4px" }}>
                             <div style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap" }}><strong style={{color:"#cbd5e1"}}>Req:</strong> {(sub.createdAt || sub.submittedAt || sub.date) ? new Date(sub.createdAt || sub.submittedAt || sub.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
                             {sub.processedAt && <div style={{ fontSize: "11px", color: "var(--accent)", whiteSpace: "nowrap" }}><strong style={{color:"#00f5d4"}}>Upd:</strong> {new Date(sub.processedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                          </div>
                          
                          <div style={{ width: "120px", display: "flex", justifyContent: "center" }}>
                             {(() => {
                               const st = (sub.status || 'pending').toLowerCase();
                               if (st === 'approved') return <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>✅ APPROVED</span>;
                               if (st === 'rejected') return <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>❌ REJECTED</span>;
                               return <span style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>⌛ PENDING</span>;
                             })()}
                          </div>

                          <div style={{ width: "180px", display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                             {(sub.status || 'pending').toLowerCase() === 'pending' ? (
                               <>
                                 <button onClick={() => processSubmission(sub._id, 'rejected')} className="action-btn delete-btn" style={{ padding: "6px 12px", fontSize: "11px" }}>REJECT</button>
                                 <button onClick={() => processSubmission(sub._id, 'approved', 'premium')} className="action-btn edit-btn" style={{ borderColor: '#10b981', color: '#10b981', padding: "6px 12px", fontSize: "11px" }}>APPROVE ✅</button>
                               </>
                             ) : (
                               <span style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic", paddingRight: "4px" }}>
                                 {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                               </span>
                             )}
                          </div>
                       </div>
                     ));
                   })()}
                </div>
              </div>
            )}

            {/* 🏆 LEADERBOARD VIEW */}
            {activeView === "leaderboard" && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🏆</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px" }}>Global Leaderboard</h2>
                      <p style={{ color: "var(--muted)", fontSize: "14px" }}>Tracking top performers across all TCS NQT simulation exams.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderRadius: "16px", marginBottom: "32px", border: "1px solid #facc15" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "18px", color: "#facc15" }}>🥇</span>
                      <span style={{ fontSize: "16px", fontWeight: 800 }}>System Champions</span>
                    </div>
                </div>

                <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                   <div style={{ display: "flex", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ width: "60px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>RANK</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 800, marginLeft: "20px" }}>PLAYER</div>
                      <div style={{ width: "150px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>ACCURACY</div>
                      <div style={{ width: "150px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>ATTEMPTS</div>
                   </div>

                   {!leaderboard || leaderboard.length === 0 ? (
                      <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>
                         <div style={{ fontSize: "24px", marginBottom: "12px" }}>🛋️</div>
                         <div>Waiting for student activity...</div>
                         <div style={{ fontSize: "11px", marginTop: "4px" }}>Leaderboard will populate once exams are submitted.</div>
                      </div>
                   ) : leaderboard.map((p, i) => {
                     const rankNum = String(i + 1).padStart(2, '0');
                     return (
                       <div key={i} className="q-row-card" style={{ display: "flex", padding: "20px 24px", alignItems: "center" }}>
                          <div style={{ width: "60px", display: "flex", justifyContent: "center" }}>
                             <div className={`rank-circle rank-${rankNum}`}>{rankNum}</div>
                          </div>
                          <div style={{ flex: 1, marginLeft: "20px" }}>
                             <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{p.name}</div>
                          </div>
                          <div style={{ width: "150px", textAlign: "center" }}>
                             <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--accent)" }}>{p.stats?.avgAccuracy || 0}%</div>
                          </div>
                          <div style={{ width: "150px", textAlign: "right" }}>
                             <span className="status-badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>{p.stats?.totalAttempts || 0} EXAMS</span>
                          </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}

            {/* 🗑️ TRASH VIEW */}
            {activeView === "trash" && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🗑️</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px" }}>Trash Bin</h2>
                      <p style={{ color: "var(--muted)", fontSize: "14px" }}>Recover or permanently delete questions. Records are stored for 30 days.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderRadius: "16px", marginBottom: "32px", border: "1px solid #f87171" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "18px", color: "#f87171" }}>🗑️</span>
                      <span style={{ fontSize: "16px", fontWeight: 800 }}>Inactive Records</span>
                    </div>
                </div>

                <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                   {trashQuestions.length === 0 ? (
                     <div style={{ padding: "80px", textAlign: "center", color: "var(--muted)" }}>Trash is empty. Stay organized! 🧹</div>
                   ) : (
                    trashQuestions.map((q, i) => (
                      <div key={q._id} className="q-row-card" style={{ display: "flex", padding: "24px", alignItems: "flex-start" }}>
                        <div style={{ width: "60px", textAlign: "center", fontSize: "14px", fontWeight: 900, color: "var(--muted)" }}>{String(i + 1).padStart(2, '0')}</div>
                        <div style={{ flex: 1, marginLeft: "20px" }}>
                           <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", lineHeight: "1.5" }}>{q.qText || (typeof q.q === 'object' ? q.q.text : q.q)}</div>
                           <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: 800 }}>SECTION: {q.section || 'General'} • TOPIC: {q.s || 'Other'}</div>
                        </div>
                        <div style={{ width: "250px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                           <button onClick={() => deleteTrashPermanently(q._id)} className="action-btn delete-btn">PURGE 💀</button>
                           <button onClick={() => recoverTrashQuestion(q._id)} className="action-btn edit-btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>RECOVER ↩</button>
                        </div>
                      </div>
                    ))
                   )}
                </div>
              </div>
            )}

            {/* 🏷️ OFFERS VIEW */}
            {activeView === "offers" && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🏷️</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px" }}>Campaign Manager</h2>
                      <p style={{ color: "var(--muted)", fontSize: "14px" }}>Create and manage discount coupons and promotional offers.</p>
                    </div>
                  </div>
                  <button onClick={() => setNewOfferModal(true)} className="btn-glow" style={{ background: "#f59e0b", color: "#000", border: "none", padding: "10px 24px", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>+ NEW CAMPAIGN</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                   {(offers || []).length === 0 ? (
                     <div style={{ gridColumn: "span 2", padding: "60px", textAlign: "center", color: "var(--muted)" }}>No active campaigns.</div>
                   ) : offers.map(o => (
                     <div key={o._id} className="glass-card" style={{ padding: "24px", borderRadius: "24px", position: "relative", overflow: "hidden", border: o.active ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
                        {o.active && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "var(--accent)" }}></div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                           <div style={{ fontSize: "10px", color: o.active ? "var(--accent)" : "var(--muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>{o.active ? "Live Campaign ●" : "Inactive"}</div>
                           <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => toggleOfferStatus(o._id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>{o.active ? "⏸️" : "▶️"}</button>
                              <button onClick={() => removeOffer(o._id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>🗑️</button>
                           </div>
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>{o.title}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px" }}>
                           <span style={{ fontSize: "24px", fontWeight: 900, color: "#fff" }}>₹{o.priceOffer}</span>
                           <span style={{ fontSize: "14px", color: "var(--muted)", textDecoration: "line-through" }}>₹{o.priceOriginal}</span>
                           <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 800 }}>{o.discount} OFF</span>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "12px", textAlign: "center", fontSize: "11px", color: "var(--muted)" }}>
                          Standard plan includes {o.title === 'Premium' ? 'Lifetime' : 'Basic'} Access
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* 🎫 ISSUES VIEW */}
            {activeView === "issues" && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🎫</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px" }}>Support Tickets</h2>
                      <p style={{ color: "var(--muted)", fontSize: "14px" }}>Manage and resolve student technical issues and queries.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                   <div style={{ display: "flex", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ width: "200px", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>STUDENT</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>MESSAGE / ISSUE</div>
                      <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>STATUS</div>
                      <div style={{ width: "120px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>ACTION</div>
                   </div>

                   {(!issues || issues.length === 0) ? (
                     <div style={{ padding: "80px", textAlign: "center", color: "var(--muted)" }}>All clear! No pending issues. 🍵</div>
                   ) : (
                    issues.map((iss) => (
                      <div key={iss._id} className="q-row-card" style={{ display: "flex", padding: "24px", alignItems: "flex-start", opacity: iss.status === 'resolved' ? 0.6 : 1 }}>
                        <div style={{ width: "200px" }}>
                           <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>{iss.userName}</div>
                           <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>{iss.userCode}</div>
                        </div>
                        <div style={{ flex: 1, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                           "{iss.message}"
                           <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "8px" }}>Reported on: {new Date(iss.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ width: "120px", textAlign: "center" }}>
                           <span className="status-badge" style={{ 
                             background: iss.status === 'resolved' ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                             color: iss.status === 'resolved' ? "#10b981" : "#f59e0b",
                             borderColor: iss.status === 'resolved' ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"
                           }}>
                             {iss.status?.toUpperCase() || 'PENDING'}
                           </span>
                        </div>
                        <div style={{ width: "120px", textAlign: "right" }}>
                           {iss.status !== 'resolved' && (
                             <button onClick={() => resolveIssue(iss._id)} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>RESOLVE</button>
                           )}
                        </div>
                      </div>
                    ))
                   )}
                </div>
              </div>
            )}

            {/* ⚙️ SETTINGS VIEW */}
            {activeView === "settings" && <AdminSettings config={config} />}
        </main>
      </div>

      {/* 📝 Edit Question Modal */}
      {editQ && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "600px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Edit Question</h2>
              <button onClick={() => setEditQ(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>QUESTION TEXT</label>
                <textarea 
                  value={editQ.qText || (typeof editQ.q === 'object' ? editQ.q.text : editQ.q)} 
                  onChange={e => setEditQ({...editQ, qText: e.target.value})}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "12px", minHeight: "80px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>OPTIONS & SELECT CORRECT</label>
                <div style={{ display: "grid", gap: "10px" }}>
                  {(editQ.options || editQ.o || []).map((opt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: editQ.correct === i || editQ.correct === opt ? "1px solid var(--accent)" : "1px solid transparent" }}>
                      <input 
                        type="radio" 
                        name="correct" 
                        checked={editQ.correct === i || editQ.correct === opt} 
                        onChange={() => setEditQ({...editQ, correct: i})}
                        style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontSize: "12px", width: "15px", color: "var(--muted)" }}>{String.fromCharCode(65 + i)}</span>
                      <input 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...(editQ.options || editQ.o)];
                          newOpts[i] = e.target.value;
                          setEditQ({...editQ, options: newOpts, o: newOpts});
                        }}
                        style={{ flex: 1, background: "none", border: "none", color: "#fff", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>TOPIC</label>
                <input 
                  value={editQ.topic || editQ.s || ""} 
                  onChange={e => setEditQ({...editQ, topic: e.target.value})}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button onClick={() => setEditQ(null)} style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveEditQuestion} style={{ flex: 1, padding: "12px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>Update Question</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Bulk Upload Modal */}
      {bulkModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "800px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Bulk Question Upload</h2>
              <button onClick={() => setBulkModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>Paste a JSON array of questions using the format: <code>{"[{ \"q\": \"Text\", \"o\": [\"A\", \"B\", \"C\", \"D\"], \"a\": index (0-3) }]"}</code></p>
            
            <textarea 
              value={bulkJSON} 
              onChange={e => setBulkJSON(e.target.value)}
              placeholder='[ { "q": "Sample?", "o": ["1", "2", "3", "4"], "a": 0 } ]'
              style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "12px", color: "#fff", padding: "16px", minHeight: "300px", outline: "none", fontFamily: "monospace", fontSize: "13px" }}
            />

            <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
              <button onClick={() => setBulkModal(false)} style={{ flex: 1, padding: "14px", background: "none", border: "1px solid var(--border2)", borderRadius: "12px", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleBulkUpload} disabled={!bulkJSON.trim()} style={{ flex: 1, padding: "14px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer", opacity: bulkJSON.trim() ? 1 : 0.5 }}>Upload to Bank 🚀</button>
            </div>
          </div>
        </div>
      )}

      {isEditMode && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 10000, display: "flex", gap: "16px", background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(20px)", padding: "12px 24px", borderRadius: "20px", border: "1px solid var(--accent)", boxShadow: "0 10px 40px rgba(0,245,212,0.2)" }}>
           <button onClick={() => setIsEditMode(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", padding: "10px 20px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
           <button onClick={publishLayout} style={{ background: "var(--accent)", color: "#000", border: "none", padding: "10px 30px", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>🚀 Publish Layout</button>
        </div>
      )}

      {/* ➕ Create Question Modal */}
      {newQModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "600px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Create New Question</h2>
              <button onClick={() => setNewQModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>QUESTION TEXT</label>
                <textarea 
                  value={newQ.qText} 
                  onChange={e => setNewQ({...newQ, qText: e.target.value})}
                  placeholder="Enter question text..."
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "12px", minHeight: "80px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>OPTIONS & SELECT CORRECT</label>
                <div style={{ display: "grid", gap: "10px" }}>
                  {newQ.options.map((opt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: newQ.correct === i ? "1px solid var(--accent)" : "1px solid transparent" }}>
                      <input 
                        type="radio" 
                        name="newCorrect" 
                        checked={newQ.correct === i} 
                        onChange={() => setNewQ({...newQ, correct: i})}
                        style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontSize: "12px", width: "15px", color: "var(--muted)" }}>{String.fromCharCode(65 + i)}</span>
                      <input 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...newQ.options];
                          newOpts[i] = e.target.value;
                          setNewQ({...newQ, options: newOpts});
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        style={{ flex: 1, background: "none", border: "none", color: "#fff", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>TOPIC</label>
                <input 
                  value={newQ.topic} 
                  onChange={e => setNewQ({...newQ, topic: e.target.value})}
                  placeholder="e.g., Geometry"
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button onClick={() => setNewQModal(false)} style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
                <button onClick={createNewQuestion} style={{ flex: 1, padding: "12px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>Create Question 🚀</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👤 Edit User Modal */}
      {editUser && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Edit User Profile</h2>
              <button onClick={() => setEditUser(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>NAME</label>
                <input 
                  value={editUser.name} 
                  onChange={e => setEditUser({...editUser, name: e.target.value})}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>PLAN STATUS</label>
                <select 
                  value={editUser.plan} 
                  onChange={e => setEditUser({...editUser, plan: e.target.value})}
                  style={{ width: "100%", background: "#000", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                >
                  <option value="Trial">Trial</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>ACCOUNT STATUS</label>
                <select 
                  value={editUser.status} 
                  onChange={e => setEditUser({...editUser, status: e.target.value})}
                  style={{ width: "100%", background: "#000", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                >
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleUserUpdate} style={{ flex: 1, padding: "12px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Manual Question Selection Modal */}
      {manualModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
           <div className="glass-card" style={{ width: "100%", maxWidth: "900px", maxHeight: "85vh", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                 <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Select Specific Questions</h2>
                    <p style={{ color: "var(--muted)", fontSize: "12px" }}>{manualModal.section} • {manualModal.topic}</p>
                 </div>
                 <button onClick={() => setManualModal(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "24px" }}>✕</button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }} className="no-scrollbar">
                {manualModal.questions.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>No questions available for this topic yet.</div>
                ) : (
                  manualModal.questions.map((q, i) => {
                    const isSelected = editExam.sections.find(s => s.name === manualModal.section).topics.find(t => t.name === manualModal.topic).selectedQuestions?.some(id => (typeof id === 'string' ? id : id._id) === q._id);
                    return (
                      <div key={q._id} style={{ display: "flex", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", marginBottom: "12px", border: isSelected ? "1px solid var(--accent)" : "1px solid transparent", transition: "0.2s" }}>
                         <div style={{ width: "40px", textAlign: "center", fontSize: "12px", fontWeight: 800, color: "var(--muted)" }}>{String(i + 1).padStart(2, '0')}</div>
                         <div style={{ flex: 1, marginLeft: "16px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 700 }}>{q.qText || q.q}</div>
                         </div>
                         <button 
                           onClick={() => toggleManualSelect(q._id)} 
                           style={{ background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.05)", color: isSelected ? "#000" : "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                         >
                           {isSelected ? "✅ Selected" : "Add Specific"}
                         </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
                 <button onClick={() => setManualModal(null)} style={{ padding: "12px 40px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>Close & Save</button>
              </div>
           </div>
        </div>
      )}

      {/* 🏷️ New Offer Modal */}
      {newOfferModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Create Promotional Campaign</h2>
              <button onClick={() => setNewOfferModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>CAMPAIGN TITLE</label>
                <input 
                  value={newOffer.title} 
                  onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                  placeholder="e.g., Summer Special Premium"
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>ORIGINAL PRICE (₹)</label>
                  <input 
                    type="number"
                    value={newOffer.priceOriginal} 
                    onChange={e => setNewOffer({...newOffer, priceOriginal: Number(e.target.value)})}
                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>OFFER PRICE (₹)</label>
                  <input 
                    type="number"
                    value={newOffer.priceOffer} 
                    onChange={e => setNewOffer({...newOffer, priceOffer: Number(e.target.value)})}
                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>DISCOUNT LABEL</label>
                <input 
                  value={newOffer.discount} 
                  onChange={e => setNewOffer({...newOffer, discount: e.target.value})}
                  placeholder="e.g., 50% OFF"
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button onClick={() => setNewOfferModal(false)} style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
                <button onClick={createOffer} style={{ flex: 1, padding: "12px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>Launch Campaign 🚀</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", top: "24px", right: "24px", background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderLeft: "3px solid #00f5d4", color: "#fff", borderRadius: "8px", padding: "10px 16px", fontSize: "12px", zIndex: 11000 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
