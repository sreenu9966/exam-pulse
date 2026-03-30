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

import { 
  AccuracyMatrix, 
  SubjectRadar, 
  MetricCircle, 
  StrategicRoadmap, 
  StatMiniCard 
} from './DashboardComponents';



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
  const [examFilter, setExamFilter] = useState({ primary: "All", secondary: null }); // NEW: Hierarchical Filter logic
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
  const [viewAttempts, setViewAttempts] = useState(null);
  const [editSubmission, setEditSubmission] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
    } else if (newExam) {
      setNewExam(prev => ({ ...prev, sections: updater(prev.sections) }));
    } else {
      setExamSections(updater);
    }
  };

  const toggleTopicQuestion = (secName, topName, qId) => {
    const updater = (prevSections) =>
      prevSections.map((s) => {
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
      });

    if (editExam) {
       setEditExam(prev => ({ ...prev, sections: updater(prev.sections) }));
    } else if (newExam) {
       setNewExam(prev => ({ ...prev, sections: updater(prev.sections) }));
    } else {
       setExamSections(updater);
    }
  };

  const selectAllTopicQuestions = (secName, topName, questions, deselect = false) => {
    const updater = (prevSections) =>
      prevSections.map((s) => {
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
      });

    if (editExam) {
       setEditExam(prev => ({ ...prev, sections: updater(prev.sections) }));
    } else if (newExam) {
       setNewExam(prev => ({ ...prev, sections: updater(prev.sections) }));
    } else {
       setExamSections(updater);
    }
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

  // SMART INITIALIZATION for New Deployment
  useEffect(() => {
    if (newExam && (!newExam.sections || newExam.sections.length === 0)) {
      // Use subCategory topics if available, else primary category
      const lookup = newExam.subCategory || newExam.category;
      const defaultTopics = categoryMap[lookup] || categoryMap[newExam.category] || [];
      
      const sections = [{
         name: "Main Section",
         topics: defaultTopics.map(t => ({
            name: t,
            count: 0,
            selectedQuestions: [],
            mode: "hybrid"
         }))
      }];
      setNewExam(prev => ({ ...prev, sections }));
    }
  }, [newExam?.category, newExam?.subCategory, categoryMap]);

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

  const saveNewExam = async () => {
    try {
      if (!newExam.key || !newExam.title) return showToast("Key and Title are required.");
      await axios.post(`${API}/admin/exam`, newExam, config);
      showToast("New exam deployed successfully! 🚀");
      setNewExam(null);
      fetchExams();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to deploy exam.");
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

  const processSubmission = (id, status, planType = 'premium', reason = '') => {
    const url = `${API}/admin/${status === 'approved' ? 'approve' : 'reject'}/${id}`;
    axios.post(url, { planType, reason }, config)
      .then(() => {
        showToast(`Request ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`);
        loadSubmissions();
        loadStats();
        setRejectionModal(null);
        setRejectionReason("");
      })
      .catch((e) => showToast(e.response?.data?.error || "Error processing request"));
  };

  const handleUpdateSubmission = () => {
    if (!editSubmission) return;
    axios.put(`${API}/admin/submissions/${editSubmission._id}`, editSubmission, config)
      .then(() => {
        showToast("Submission Updated! 📝");
        setEditSubmission(null);
        loadSubmissions();
      })
      .catch((e) => showToast(e.response?.data?.error || "Failed to update"));
  };

  const sendCorrectionLink = (id) => {
    showToast("Sending correction email... ⏳");
    axios.post(`${API}/admin/submissions/${id}/send-link`, {}, config)
      .then(() => showToast("Correction Link Sent! 📧"))
      .catch((e) => showToast(e.response?.data?.error || "Failed to send link"));
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
    const target = editExam || newExam;
    if (!target) return;

    const newEx = { ...(editExam || newExam) };
    const sec = newEx.sections.find(s => s.name === manualModal.section);
    const top = sec.topics.find(t => t.name === manualModal.topic);
    if (!top.selectedQuestions) top.selectedQuestions = [];
    const isSelected = top.selectedQuestions.some(id => id === qId || (id._id === qId));
    if (isSelected) {
      top.selectedQuestions = top.selectedQuestions.filter(id => (typeof id === 'string' ? id : id._id) !== qId);
    } else {
      top.selectedQuestions.push(qId);
    }
    
    if (editExam) setEditExam(newEx);
    else setNewExam(newEx);
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

        .topic-hub {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .topic-hub:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .metric-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
        }

        .config-sidebar {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @keyframes pulse-amber {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        .glow-amber { animation: pulse-amber 2s infinite; }

        /* Full Screen Expansion & Optic Visibility */
        .dash-container-full {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 40px !important;
          flex: 1;
        }
        .dash-layout-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.6fr 1.1fr;
          gap: 32px;
          width: 100%;
        }
        .glass-select {
          background: #0a0b14 !important;
          color: #fff !important; 
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          padding: 10px 16px !important;
          outline: none !important;
          cursor: pointer !important;
        }
        .glass-select option {
          background: #0a0b14 !important;
          color: #fff !important;
          padding: 12px !important;
        }
      `}</style>



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

      <div style={{ display: "flex", minHeight: "calc(100vh - 72px)", width: "100%" }}>
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
                {/* ── HIGH FIDELITY DASHBOARD LAYOUT (MATCHING SCREENSHOT) ── */}
                {activeView === "dashboard" && (
                  <>
                    <div className="premium-mesh"></div>
                    <div className="ambient-glow" style={{ top: '-10%', right: '-5%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)', animation: 'pulse-glow 8s infinite ease-in-out' }}></div>
                    <div className="ambient-glow" style={{ bottom: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', animation: 'pulse-glow 12s infinite ease-in-out' }}></div>
                    <div className="ambient-glow" style={{ top: '40%', left: '30%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)', animation: 'pulse-glow 15s infinite ease-in-out alternate' }}></div>
                    <div className="grid-bg" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.08, pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
                    
                    <div className="dash-layout-grid" style={{ position: 'relative', zIndex: 1 }}>
                   
                   {/* LEFT COLUMN: PROFICIENCY MATRIX, PERFORMANCE RADAR, SYSTEM ACTIVITY */}
                   <div className="dash-col">
                     <AccuracyMatrix data={{
                       aptitude: analytics.strengths?.find(s => s.subject === "Aptitude")?.A || 0,
                       reasoning: analytics.strengths?.find(s => s.subject === "Reasoning")?.A || 0,
                       verbal: analytics.strengths?.find(s => s.subject === "Verbal")?.A || 0
                     }} />
                     
                     <SubjectRadar data={analytics.strengths} />
                     
                     <div className="dash-card" style={{ flex: 1, minHeight: '300px' }}>
                       <h3 className="dash-card-title">System Activity Feed</h3>
                       <div className="no-scrollbar" style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
                         {activity.slice(0, 5).map((act, i) => (
                            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                              <span style={{ fontSize: '18px' }}>⚡</span>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 700 }}>{act.userCode || 'System'}</div>
                                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{act.action} — {new Date(act.timestamp).toLocaleTimeString()}</div>
                              </div>
                            </div>
                         ))}
                       </div>
                     </div>
                   </div>

                   {/* CENTER COLUMN: PLATFORM PROGRESSION, STATS, GLOBAL METRICS */}
                   <div className="dash-col" style={{ gap: '32px' }}>
                     <div className="dash-card" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                           <div>
                             <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>Platform Progression</h2>
                             <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                   <span style={{ fontSize: '24px', fontWeight: 900 }}>{stats.totalAttempts || 0}</span> 
                                   <span style={{ background: '#00f5d4', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 }}>Total Attempts</span>
                                </div>
                                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                   <span style={{ fontSize: '24px', fontWeight: 900 }}>{stats.totalUsers || 0}</span> 
                                   <span style={{ background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 }}>Registered Users</span>
                                </div>
                             </div>
                           </div>
                           <select 
                             value={daysFilter}
                             onChange={(e) => setDaysFilter(e.target.value)}
                             className="glass-select" 
                             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '11px', padding: '6px 12px' }}
                           >
                              <option value="7">Last 7 Days</option>
                              <option value="30">Last 30 Days</option>
                              <option value="90">Last 90 Days</option>
                              <option value="0">All Time</option>
                           </select>
                        </div>
                     </div>

                     <div className="stat-horizontal-grid">
                       <StatMiniCard label="Total Users" value={stats.totalUsers || 0} sub="Registered Students" />
                       <StatMiniCard label="Question Bank" value={stats.totalQuestions || 0} sub="Live Questions" />
                       <StatMiniCard label="Avg Attempts" value={((stats.totalAttempts || 0) / (stats.totalUsers || 1)).toFixed(1)} sub="Per User Ratio" />
                       <StatMiniCard label="Success Rate" value="72%" sub="Platform Average" />
                       <StatMiniCard label="System Load" value="Normal" sub="Active Server Nodes" />
                     </div>

                      <div className="dash-card core-metrics-grid" style={{ padding: '40px' }}>
                        <MetricCircle label="Avg Proficiency" subLabel="Global Proficiency Across All Subject Categories" value={Math.round((analytics.strengths || []).reduce((a,b) => a + (b.A || 0), 0) / (analytics.strengths?.length || 1))} color="#00f5d4" brand="Platform Analytics" />
                        <MetricCircle label="Content Index" subLabel="Question Bank Sourcing & Validation Status Profile" value={Math.min(100, Math.round((stats.totalQuestions || 0) / 10))} color="#f59e0b" brand="Question Repository" />
                        <MetricCircle label="Test Reliability" subLabel="Consistency & Validation Ranking Across All Tiers" value={98} color="#00f5d4" brand="Reliability Engine" />
                      </div>
                     
                     <div style={{ textAlign: 'center', marginTop: '-16px' }}>
                        <button 
                          onClick={() => setActiveView("users")}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', fontWeight: 800, cursor: 'pointer', borderBottom: '1px solid var(--accent)' }}
                        >
                          View Full User Management Dashboard →
                        </button>
                     </div>
                   </div>

                   {/* RIGHT COLUMN: ADMIN PROFILE, CONTENT DIST, BANK HEALTH */}
                   <div className="dash-col">
                     <div className="dash-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                           <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Administrator Access</span>
                           <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800 }}>Level 5 Root</span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                           <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Security Identifier</div>
                           <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>System</div>
                           <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>Administrator</div>
                           <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>Auth: Verified Superadmin</div>
                        </div>
                     </div>

                     <div className="dash-card" style={{ height: '300px' }}>
                       <h3 className="dash-card-title">Content Distribution</h3>
                       <ResponsiveContainer width="100%" height="80%">
                         <PieChart>
                           <Pie
                             data={[
                               { name: 'Aptitude', value: 40, color: '#00f5d4' },
                               { name: 'Reasoning', value: 30, color: '#ec4899' },
                               { name: 'Verbal', value: 30, color: '#8b5cf6' },
                             ]}
                             innerRadius={45}
                             outerRadius={65}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             <Cell fill="#00f5d4" />
                             <Cell fill="#ec4899" />
                             <Cell fill="#8b5cf6" />
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 </div>
               </>
             )}
             {activeView === "exams" && (
               <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                {/* ── EXAM MANAGEMENT HEADER ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                       <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }}></span>
                       <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)", letterSpacing: "1px" }}>EXAM CONTROL CENTER</span>
                    </div>
                    <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Manage Exams</h2>
                    <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px" }}>Create and organize your exams here easily.</p>
                  </div>
                  <button onClick={() => setNewExam({ key: "", title: "", category: "Aptitude", subCategory: "", mode: "Mock", sections: [] })} className="btn-glow" style={{ background: "var(--accent)", color: "#000", border: "none", padding: "12px 28px", borderRadius: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>+</span> CREATE NEW EXAM
                  </button>
                </div>

                {/* ── CATEGORY LIST ── */}
                <div style={{ marginBottom: "40px" }}>
                   <div style={{ display: "flex", gap: "20px", marginBottom: "20px", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {["All", "State", "Central", "IT", "Banks", "Companies"].map(cat => (
                         <button
                            key={cat}
                            onClick={() => setExamFilter({ primary: cat, secondary: null })}
                            style={{
                               padding: "12px 24px",
                               borderRadius: "14px",
                               background: examFilter.primary === cat ? "var(--accent)" : "transparent",
                               color: examFilter.primary === cat ? "#000" : "var(--muted)",
                               border: "none",
                               fontWeight: 900,
                               fontSize: "12px",
                               cursor: "pointer",
                               transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                               letterSpacing: "0.5px"
                            }}
                         >
                            {cat.toUpperCase()}
                         </button>
                      ))}
                   </div>

                   {/* Dynamic Level 2 Selector */}
                   {examFilter.primary !== "All" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", animation: "slideRight 0.4s ease" }}>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)" }}>SUB-CATEGORY:</span>
                         <select 
                            value={examFilter.secondary || ""}
                            onChange={(e) => setExamFilter({ ...examFilter, secondary: e.target.value })}
                            className="glass-select"
                            style={{ minWidth: "240px" }}
                         >
                            <option value="">All {examFilter.primary} Exams</option>
                            {examFilter.primary === "State" && ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "Uttar Pradesh"].map(s => <option key={s} value={s}>{s}</option>)}
                            {examFilter.primary === "Central" && ["SSC", "UPSC", "RRB", "IBPS", "Insurance"].map(s => <option key={s} value={s}>{s}</option>)}
                            {examFilter.primary === "IT" && ["MNCs", "Product Based", "Service Based", "Startups", "Top 100"].map(s => <option key={s} value={s}>{s}</option>)}
                            {examFilter.primary === "Banks" && ["SBI", "IBPS PO", "IBPS Clerk", "RRB Banks", "Private Banks"].map(s => <option key={s} value={s}>{s}</option>)}
                            {examFilter.primary === "Companies" && ["FAANG", "Big 4", "Fortune 500", "BPO/KPO"].map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>
                   )}
                </div>

                {/* ── EXAM GRID ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "32px" }}>
                  {exams
                    .filter(exam => {
                       if (examFilter.primary === "All") return true;
                       const matchPrimary = exam.category?.toLowerCase() === examFilter.primary.toLowerCase();
                       if (!examFilter.secondary) return matchPrimary;
                       // Level 2 filtering logic (assumes sub-categories are stored or mapped)
                       return matchPrimary && (exam.subCategory === examFilter.secondary || exam.title.includes(examFilter.secondary));
                    })
                    .map(exam => {
                    const totalQs = (exam.sections || []).reduce((acc, sec) => acc + (sec.topics || []).reduce((tAcc, top) => tAcc + (top.count || 0), 0), 0);
                    const totalSecs = (exam.sections || []).length;
                    return (
                      <div key={exam._id} className="glass-card" style={{ padding: "28px", borderRadius: "28px", position: "relative", overflow: "hidden", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "22px", background: "rgba(11, 18, 33, 0.4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                               <span style={{ fontSize: "10px", background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", padding: "3px 10px", borderRadius: "20px", fontWeight: 900, border: "1px solid rgba(0, 245, 212, 0.2)" }}>{exam.category?.toUpperCase() || "EXAM"}</span>
                               <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 800, fontFamily: "monospace", opacity: 0.7 }}>EXAM CODE: {exam.key}</span>
                            </div>
                            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: "1.2" }}>{exam.title}</h3>
                          </div>
                          <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", transition: "0.3s" }}>
                             {exam.category === "Technical" ? "💻" : exam.category === "Aptitude" ? "🧠" : "📄"}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                           <div className="metric-pill" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <span style={{ opacity: 0.5, fontSize: "10px", textTransform: "uppercase" }}>Sections</span>
                              <span style={{ color: "#fff", fontWeight: 900 }}>{totalSecs}</span>
                           </div>
                           <div className="metric-pill" style={{ background: "rgba(0, 245, 212, 0.03)", border: "1px solid rgba(0, 245, 212, 0.1)" }}>
                              <span style={{ opacity: 0.5, fontSize: "10px", textTransform: "uppercase" }}>Questions</span>
                              <span style={{ color: "var(--accent)", fontWeight: 900 }}>{totalQs}</span>
                           </div>
                           <div className="metric-pill" style={{ background: "rgba(250, 204, 21, 0.03)", border: "1px solid rgba(250, 204, 21, 0.1)" }}>
                              <span style={{ opacity: 0.5, fontSize: "10px", textTransform: "uppercase" }}>Total Time</span>
                              <span style={{ color: "#facc15", fontWeight: 900 }}>{totalQs * 1.5}m</span>
                           </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
                          <button onClick={() => setEditExam(exam)} className="btn-glow" style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid var(--border2)", padding: "14px", borderRadius: "16px", fontSize: "12px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", letterSpacing: "1px" }}>
                            <span>⚙️</span> EDIT EXAM
                          </button>
                          <button onClick={() => deleteExam(exam._id)} style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "16px", color: "#f87171", cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(239, 68, 68, 0.15)"} onMouseLeave={e => e.target.style.background = "rgba(239, 68, 68, 0.03)"}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── UPGRADED CONFIGURATION MODAL ── */}
                {editExam && (
                  <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(3, 4, 11, 0.9)", backdropFilter: "blur(20px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                    <div className="glass-card" style={{ width: "100%", maxWidth: "1200px", height: "85vh", display: "grid", gridTemplateColumns: "1fr 340px", borderRadius: "32px", overflow: "hidden", border: "1px solid var(--border2)", background: "#05060e", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}>
                       
                       {/* Left: Main Editor */}
                       <div className="no-scrollbar" style={{ padding: "40px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                             <div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)", marginBottom: "4px" }}>CALIBRATING ENGINE</div>
                                <h2 style={{ fontSize: "28px", fontWeight: 900 }}>{editExam.title}</h2>
                             </div>
                              <button onClick={() => setEditExam(null)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(239, 68, 68, 0.2)"} onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.05)"}>✕</button>
                           </div>
                           
                           <div style={{ marginBottom: "24px" }}>
                              <label style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: "8px" }}>CONDUCT EXAM MODE</label>
                              <select 
                                 value={editExam.mode || "Mock"}
                                 onChange={e => setEditExam({...editExam, mode: e.target.value})}
                                 className="glass-select"
                                 style={{ width: "300px" }}
                              >
                                 <option value="Mock">Mock Test</option>
                                 <option value="Final">Final Exam</option>
                                 <option value="Practice">Practice</option>
                              </select>
                           </div>

                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
                              <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>CHOOSE EXAM SECTIONS</div>
                              <button 
                                 onClick={() => {
                                    const secName = window.prompt("Enter new section name:", "New Section");
                                    if (secName) {
                                       setEditExam({...editExam, sections: [...(editExam.sections || []), { name: secName, topics: [] }]});
                                    }
                                 }}
                                 style={{ background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", border: "1px solid rgba(0, 245, 212, 0.3)", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                              >
                                 + ADD SECTION
                              </button>
                           </div>

                          {(editExam.sections || []).map((sec, sIdx) => {
                             const secTotal = (sec.topics || []).reduce((acc, t) => acc + (t.count || 0), 0);
                             return (
                                <div key={sIdx} style={{ marginBottom: "48px" }}>
                                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                                      <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
                                         <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>SECTION {String(sIdx + 1).padStart(2, '0')}</span>
                                         {sec.name}
                                      </h3>
                                      <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent)" }}>{secTotal} TOTAL QUESTIONS</div>
                                   </div>

                                   <div style={{ display: "grid", gap: "12px" }}>
                                      {sec.topics.map((top, tIdx) => {
                                         const manualCount = (top.selectedQuestions || []).length;
                                         const autoCount = Math.max(0, (top.count || 0) - manualCount);
                                         const isUnderPowered = (top.count || 0) === 0;

                                         return (
                                            <div key={tIdx} className={`topic-hub ${isUnderPowered ? 'glow-amber' : ''}`}>
                                               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                  <div style={{ flex: 1 }}>
                                                     <div style={{ fontWeight: 800, fontSize: "15px", color: "#fff", marginBottom: "8px" }}>{top.name}</div>
                                                     <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                        {manualCount > 0 && Array.from({ length: manualCount }).map((_, i) => (
                                                           <span key={`m-${i}`} className="badge-manual" title="Specifically selected questions">Q{i + 1}</span>
                                                        ))}
                                                        {autoCount > 0 && Array.from({ length: autoCount }).map((_, i) => (
                                                           <span key={`a-${i}`} className="badge-auto" title="Randomly sourced questions">A{i + 1}</span>
                                                        ))}
                                                        {isUnderPowered && <span style={{ color: "#facc15", fontSize: "10px", fontWeight: 800 }}>⚠️ NO QUESTIONS ASSIGNED</span>}
                                                     </div>
                                                  </div>

                                                  <div style={{ display: "flex", gap: "10px" }}>
                                                     <button 
                                                        onClick={() => addAutoQs(sec.name, top.name)}
                                                        style={{ background: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "8px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                                                     >
                                                        (+) AUTO
                                                     </button>
                                                     <button 
                                                        onClick={() => openManualSelection(sec.name, top.name)}
                                                        style={{ background: "rgba(0, 245, 212, 0.08)", color: "var(--accent)", border: "1px solid rgba(0, 245, 212, 0.2)", padding: "8px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                                                     >
                                                        MANAGE SPECIFIC
                                                     </button>
                                                  </div>
                                               </div>
                                            </div>
                                         );
                                      })}
                                   </div>
                                </div>
                             );
                          })}
                       </div>

                       {/* Right: Summary Sidebar */}
                       <div className="config-sidebar">
                          <div style={{ flex: 1 }}>
                             <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "32px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", marginBottom: "16px", letterSpacing: "1px" }}>LIVE CONFIG SUMMARY</div>
                                
                                {(() => {
                                   let totalS = 0;
                                   let totalA = 0;
                                   let totalQ = 0;
                                   (editExam.sections || []).forEach(s => {
                                      (s.topics || []).forEach(t => {
                                         totalS += (t.selectedQuestions || []).length;
                                         totalQ += (t.count || 0);
                                      });
                                   });
                                   totalA = totalQ - totalS;

                                   return (
                                      <div style={{ display: "grid", gap: "20px" }}>
                                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Total Questions</span>
                                            <span style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>{totalQ}</span>
                                         </div>
                                         <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", display: "flex" }}>
                                            <div style={{ width: `${(totalS / totalQ) * 100}%`, background: "var(--accent)" }}></div>
                                            <div style={{ width: `${(totalA / totalQ) * 100}%`, background: "#60a5fa" }}></div>
                                         </div>
                                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                            <div style={{ background: "rgba(0, 245, 212, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0, 245, 212, 0.1)" }}>
                                               <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--accent)", marginBottom: "4px" }}>SPECIFIC</div>
                                               <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>{totalS}</div>
                                            </div>
                                            <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                                               <div style={{ fontSize: "9px", fontWeight: 800, color: "#60a5fa", marginBottom: "4px" }}>AUTO</div>
                                               <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>{totalA}</div>
                                            </div>
                                         </div>
                                      </div>
                                   );
                                })()}
                             </div>

                             <div style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--muted)", padding: "0 10px" }}>
                                <p style={{ marginBottom: "12px" }}>🤖 <strong>Auto Questions</strong> are randomly sourced from the Bank during exam generation to ensure variety.</p>
                                <p>✅ <strong>Specific Questions</strong> are hard-pinned to every student's paper for standardization.</p>
                             </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                             <button onClick={saveEditExam} className="btn-glow" style={{ padding: "16px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "16px", fontWeight: 900, cursor: "pointer", fontSize: "14px", letterSpacing: "0.5px" }}>PUBLISH CONFIGURATION</button>
                             <button onClick={() => setEditExam(null)} style={{ padding: "16px", background: "rgba(255,255,255,0.03)", color: "var(--muted)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", fontWeight: 800, cursor: "pointer", fontSize: "12px" }}>CANCEL CHANGES</button>
                          </div>
                       </div>
                    </div>
                   </div>
                )}

                {/* ── NEW DEPLOYMENT CREATOR ── */}
                {newExam && (
                  <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(3, 4, 11, 0.9)", backdropFilter: "blur(20px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                    <div className="glass-card" style={{ width: "100%", maxWidth: "1200px", height: "85vh", display: "grid", gridTemplateColumns: "1fr 340px", borderRadius: "32px", overflow: "hidden", border: "1px solid var(--border2)", background: "#05060e", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}>
                       
                       {/* Left: Metadata & Section Config */}
                       <div className="no-scrollbar" style={{ padding: "40px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                             <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)", marginBottom: "4px" }}>NEW DEPLOYMENT PROTOCOL</div>
                                <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "24px" }}>System Entry: {newExam.title || "Untitled Deployment"}</h2>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px" }}>
                                   <div>
                                      <label style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: "8px" }}>UNIQUE KEY</label>
                                      <input 
                                         value={newExam.key} 
                                         onChange={e => setNewExam({...newExam, key: e.target.value})}
                                         placeholder="e.g., tcs-nqt-2026"
                                         style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border2)", borderRadius: "12px", color: "#fff", padding: "12px", outline: "none" }}
                                      />
                                   </div>
                                   <div>
                                      <label style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: "8px" }}>DISPLAY TITLE</label>
                                      <input 
                                         value={newExam.title} 
                                         onChange={e => setNewExam({...newExam, title: e.target.value})}
                                         placeholder="e.g., TCS NQT Prime"
                                         style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border2)", borderRadius: "12px", color: "#fff", padding: "12px", outline: "none" }}
                                      />
                                   </div>
                                   <div>
                                      <label style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: "8px" }}>PRIMARY SECTOR</label>
                                      <select 
                                         value={newExam.category}
                                         onChange={e => setNewExam({...newExam, category: e.target.value, subCategory: "", sections: []})}
                                         className="glass-select"
                                         style={{ width: "100%" }}
                                      >
                                         {["Aptitude", "Technical", "State", "Central", "IT", "Banks", "Companies"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                      </select>
                                   </div>
                                   <div>
                                      <label style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: "8px" }}>SUB-SECTOR / STATE</label>
                                      <select 
                                         value={newExam.subCategory || ""}
                                         onChange={e => setNewExam({...newExam, subCategory: e.target.value, sections: []})}
                                         className="glass-select"
                                         style={{ width: "100%" }}
                                      >
                                         <option value="">None (Generic {newExam.category})</option>
                                         {newExam.category === "State" && ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "Uttar Pradesh"].map(s => <option key={s} value={s}>{s}</option>)}
                                         {newExam.category === "Central" && ["SSC", "UPSC", "RRB", "IBPS", "Insurance"].map(s => <option key={s} value={s}>{s}</option>)}
                                         {newExam.category === "IT" && ["MNCs", "Product Based", "Service Based", "Startups", "Top 100"].map(s => <option key={s} value={s}>{s}</option>)}
                                         {newExam.category === "Banks" && ["SBI", "IBPS PO", "IBPS Clerk", "RRB Banks", "Private Banks"].map(s => <option key={s} value={s}>{s}</option>)}
                                         {newExam.category === "Companies" && ["FAANG", "Big 4", "Fortune 500", "BPO/KPO"].map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                   </div>
                                </div>
                             </div>
                             <button onClick={() => setNewExam(null)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "20px" }}>✕</button>
                          </div>

                          {(newExam.sections || []).map((sec, sIdx) => {
                             const secTotal = (sec.topics || []).reduce((acc, t) => acc + (t.count || 0), 0);
                             return (
                                <div key={sIdx} style={{ marginBottom: "48px" }}>
                                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                                      <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
                                         <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 800 }}>SECTION {String(sIdx + 1).padStart(2, '0')}</span>
                                         {sec.name}
                                      </h3>
                                      <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent)" }}>{secTotal} TOTAL QUESTIONS</div>
                                   </div>

                                   <div style={{ display: "grid", gap: "12px" }}>
                                      {sec.topics.map((top, tIdx) => {
                                         const manualCount = (top.selectedQuestions || []).length;
                                         const autoCount = Math.max(0, (top.count || 0) - manualCount);
                                         
                                         return (
                                            <div key={tIdx} className="topic-hub">
                                               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                  <div style={{ flex: 1 }}>
                                                     <div style={{ fontWeight: 800, fontSize: "15px", color: "#fff", marginBottom: "8px" }}>{top.name}</div>
                                                     <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                        {manualCount > 0 && Array.from({ length: manualCount }).map((_, i) => (
                                                           <span key={`m-${i}`} className="badge-manual" title="Specifically selected questions">Q{i + 1}</span>
                                                        ))}
                                                        {autoCount > 0 && Array.from({ length: autoCount }).map((_, i) => (
                                                           <span key={`a-${i}`} className="badge-auto" title="Randomly sourced questions">A{i + 1}</span>
                                                        ))}
                                                        {(top.count || 0) === 0 && <span style={{ color: "#facc15", fontSize: "10px", fontWeight: 800 }}>⚠️ NO QUESTIONS ASSIGNED</span>}
                                                     </div>
                                                  </div>

                                                  <div style={{ display: "flex", gap: "10px" }}>
                                                     <button 
                                                        onClick={() => addAutoQs(sec.name, top.name)}
                                                        style={{ background: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "8px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                                                     >
                                                        (+) AUTO
                                                     </button>
                                                     <button 
                                                        onClick={() => openManualSelection(sec.name, top.name)}
                                                        style={{ background: "rgba(0, 245, 212, 0.08)", color: "var(--accent)", border: "1px solid rgba(0, 245, 212, 0.2)", padding: "8px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                                                     >
                                                        MANAGE SPECIFIC
                                                     </button>
                                                  </div>
                                               </div>
                                            </div>
                                         );
                                      })}
                                   </div>
                                </div>
                             );
                          })}
                       </div>

                       {/* Right: Summary & Action */}
                       <div className="config-sidebar">
                          <div style={{ flex: 1 }}>
                             <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "32px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", marginBottom: "16px", letterSpacing: "1px" }}>DEPLOYMENT SUMMARY</div>
                                
                                {(() => {
                                   let totalS = 0;
                                   let totalA = 0;
                                   let totalQ = 0;
                                   (newExam.sections || []).forEach(s => {
                                      (s.topics || []).forEach(t => {
                                         totalS += (t.selectedQuestions || []).length;
                                         totalQ += (t.count || 0);
                                      });
                                   });
                                   totalA = totalQ - totalS;

                                   return (
                                      <div style={{ display: "grid", gap: "20px" }}>
                                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Total Questions</span>
                                            <span style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>{totalQ}</span>
                                         </div>
                                         <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", display: "flex" }}>
                                            <div style={{ width: `${totalQ > 0 ? (totalS / totalQ) * 100 : 0}%`, background: "var(--accent)" }}></div>
                                            <div style={{ width: `${totalQ > 0 ? (totalA / totalQ) * 100 : 0}%`, background: "#60a5fa" }}></div>
                                         </div>
                                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                            <div style={{ background: "rgba(0, 245, 212, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0, 245, 212, 0.1)" }}>
                                               <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--accent)", marginBottom: "4px" }}>SPECIFIC</div>
                                               <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>{totalS}</div>
                                            </div>
                                            <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                                               <div style={{ fontSize: "9px", fontWeight: 800, color: "#60a5fa", marginBottom: "4px" }}>AUTO</div>
                                               <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>{totalA}</div>
                                            </div>
                                         </div>
                                      </div>
                                   );
                                })()}
                             </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                             <button onClick={saveNewExam} className="btn-glow" style={{ padding: "16px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "16px", fontWeight: 900, cursor: "pointer", fontSize: "14px", letterSpacing: "0.5px" }}>PUBLISH DEPLOYMENT 🚀</button>
                             <button onClick={() => setNewExam(null)} style={{ padding: "16px", background: "rgba(255,255,255,0.03)", color: "var(--muted)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", fontWeight: 800, cursor: "pointer", fontSize: "12px" }}>SCRUB CONFIG</button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

           {activeView === "questions" && (
             <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
               {/* ── QUESTION BANK HEADER ── */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                 <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                   <div style={{ width: "64px", height: "64px", background: "rgba(0, 245, 212, 0.05)", borderRadius: "20px", border: "1px solid rgba(0, 245, 212, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(0, 245, 212, 0.1)" }}>
                     📝
                   </div>
                   <div>
                     <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "4px" }}>Question Bank</h2>
                     <p style={{ color: "var(--muted)", fontSize: "14px" }}>Manage all your exam questions here.</p>
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
                       placeholder="Search Questions..." 
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
                    <span style={{ fontSize: "16px", fontWeight: 800 }}>List of {activeCategory} Questions</span>
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
                     <p style={{ fontSize: "14px", fontWeight: 700 }}>Updating, please wait...</p>
                   </div>
                 ) : questions.length === 0 ? (
                    <div style={{ padding: "100px", textAlign: "center", color: "var(--muted)" }}>
                      <p style={{ fontSize: "16px", fontWeight: 600 }}>No questions found.</p>
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
                        <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 800, marginLeft: "20px" }}>QUESTION TEXT</div>
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
              <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", background: "rgba(0, 245, 212, 0.05)", borderRadius: "20px", border: "1px solid rgba(0, 245, 212, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(0, 245, 212, 0.1)" }}>👥</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                         <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 10px #00f5d4" }}></span>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "#00f5d4", letterSpacing: "1px" }}>STUDENT LIST</span>
                      </div>
                      <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>User Management</h2>
                      <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px" }}>Manage all your students here.</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderRadius: "20px", marginBottom: "32px", background: "rgba(0, 245, 212, 0.05)", border: "1px solid rgba(0, 245, 212, 0.15)", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div className="pulse-cyan" style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#00f5d4" }}></div>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>Live List: <span style={{ color: "var(--accent)" }}>Student Records</span></span>
                    </div>
                    <div className="status-badge status-pro" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>{users.length} TOTAL USERS</div>
                </div>

                <div className="no-scrollbar" style={{ borderRadius: "16px", overflowY: "auto", maxHeight: "calc(100vh - 200px)", border: "1px solid rgba(255,255,255,0.05)", background: "transparent" }}>
                   <div style={{ display: "flex", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", position: "sticky", top: 0, zIndex: 10 }}>
                      <div style={{ width: "60px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>RANK</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 900, marginLeft: "24px", letterSpacing: "1px" }}>STUDENT NAME</div>
                      <div style={{ width: "120px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>PLAN TYPE</div>
                      <div style={{ width: "180px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>CODE</div>
                      <div style={{ width: "140px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>EXAMS DONE</div>
                      <div style={{ width: "90px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>LIMIT</div>
                      <div style={{ width: "150px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>ACTIONS</div>
                   </div>

                   {users.length === 0 ? (
                     <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.5s ease-out" }}>
                       <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "50%", marginBottom: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                         <span style={{ fontSize: "32px", opacity: 0.8 }}>👥</span>
                       </div>
                       <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>No Students Found</h3>
                       <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "300px", textAlign: "center" }}>There are currently no students in the database.</p>
                     </div>
                   ) : users.map((u, i) => (
                     <div 
                       key={u._id} 
                       style={{ display: "flex", padding: "20px 24px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", animation: `fadeIn 0.4s ease-out ${i * 0.05}s both`, borderLeft: "3px solid transparent" }}
                       onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderLeft = "3px solid " + (u.plan === 'Pro' || u.plan === 'premium' ? '#10b981' : 'var(--accent)'); e.currentTarget.style.transform = "translateX(4px)"; }} 
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
                           <span className={`status-badge ${u.plan === 'Pro' || u.plan === 'premium' ? 'status-pro' : 'status-free'}`}>{u.plan || 'Free'}</span>
                        </div>
                        <div style={{ width: "180px", display: "flex", justifyContent: "center" }}>
                           <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)", width: "fit-content", maxWidth: "100%" }}>
                              <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px", textAlign: "center" }}>
                                {u.code || '—'}
                              </span>
                              {u.code && (
                                <span style={{ cursor: "pointer", fontSize: "14px", opacity: 0.7, transition: "0.2s" }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7} onClick={() => { navigator.clipboard.writeText(u.code); showToast("Copied Access Code! 📋"); }} title="Copy Code">
                                  📋
                                </span>
                              )}
                           </div>
                        </div>
                        <div style={{ width: "140px", textAlign: "center" }}>
                           <div style={{ fontSize: "13px", fontWeight: 800, color: (u.attempts || []).length > 0 ? "var(--accent)" : "var(--muted)" }}>{(u.attempts || []).length} Exams Done</div>
                           {(u.attempts || []).length > 0 && (
                             <button onClick={() => setViewAttempts(u)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "10px", fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: "4px 0" }}>📊 View Details</button>
                           )}
                        </div>
                        <div style={{ width: "90px", textAlign: "center" }}>
                           <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--gold)" }}>{u.subscription?.maxAttempts || 2} <span style={{ fontSize: "10px", opacity: 0.6 }}>Max</span></div>
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
            {activeView === "approvals" && (
              <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", background: "rgba(245, 158, 11, 0.05)", borderRadius: "20px", border: "1px solid rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)" }}>🛡️</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                         <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px #f59e0b" }}></span>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "#f59e0b", letterSpacing: "1px" }}>PAYMENT CHECKS</span>
                      </div>
                      <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Student Approvals</h2>
                      <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px" }}>Check and approve student payments for premium access.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "6px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                     {['All', 'Pending', 'Approved', 'Rejected'].map(tab => {
                       const count = tab === 'All' ? submissions.length : submissions.filter(s => (s.status || 'pending').toLowerCase() === tab.toLowerCase()).length;
                       const isSelected = approvalTab === tab;
                       return (
                         <button 
                           key={tab} 
                           onClick={() => setApprovalTab(tab)}
                           style={{ 
                             padding: "10px 20px", 
                             background: isSelected ? "rgba(255,255,255,0.08)" : "transparent",
                             color: isSelected ? "#fff" : "var(--muted)",
                             border: "none",
                             borderRadius: "12px", 
                             fontSize: "12px", 
                             fontWeight: 800,
                             cursor: "pointer",
                             display: "flex",
                             gap: "8px",
                             alignItems: "center",
                             transition: "0.2s"
                           }}
                         >
                           {tab} <span style={{ background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.1)", color: isSelected ? "#000" : "var(--muted)", padding: "2px 8px", borderRadius: "8px", fontSize: "10px" }}>{count}</span>
                         </button>
                       );
                     })}
                  </div>
                </div>

                <div className="no-scrollbar" style={{ borderRadius: "24px", overflowY: "auto", maxHeight: "calc(100vh - 300px)", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(11, 18, 33, 0.4)" }}>
                   <div style={{ display: "flex", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", position: "sticky", top: 0, zIndex: 10 }}>
                      <div style={{ width: "40px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>#</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 900, marginLeft: "20px", letterSpacing: "1px" }}>STUDENT NAME</div>
                      <div style={{ width: "200px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>PAYMENT ID</div>
                      <div style={{ width: "100px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>AMOUNT</div>
                      <div style={{ width: "140px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>DATE</div>
                      <div style={{ width: "140px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>STATUS</div>
                      <div style={{ width: "180px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>ACTIONS</div>
                   </div>

                   {(() => {
                     const filtered = submissions.filter(s => approvalTab === 'All' ? true : (s.status || 'pending').toLowerCase() === approvalTab.toLowerCase());
                     if (filtered.length === 0) {
                       return (
                         <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.5s ease-out" }}>
                           <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "50%", marginBottom: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                             <span style={{ fontSize: "32px", opacity: 0.8 }}>📂</span>
                           </div>
                           <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Empty List</h3>
                           <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "300px", textAlign: "center" }}>No student payments found for "{approvalTab}".</p>
                         </div>
                       );
                     }
                     return filtered.map((sub, i) => (
                       <div key={sub._id} style={{ display: "flex", padding: "20px 24px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", animation: `fadeIn 0.4s ease-out ${i * 0.05}s both`, borderLeft: "3px solid transparent" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderLeft = "3px solid " + (approvalTab === 'Rejected' ? '#ef4444' : approvalTab === 'Approved' ? '#10b981' : 'var(--accent)'); e.currentTarget.style.transform = "translateX(4px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeft = "3px solid transparent"; e.currentTarget.style.transform = "translateX(0)"; }}>
                          <div style={{ width: "40px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "var(--muted)" }}>{String(i + 1).padStart(2, '0')}</div>
                          <div style={{ flex: 1, marginLeft: "20px" }}>
                             <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{sub.name || 'Unknown User'}</div>
                             <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span>📧 {sub.email || '—'}</span>
                                <span style={{ color: "var(--accent)" }}>📱 {sub.phone || 'No Mobile Provided'}</span>
                             </div>
                          </div>
                          <div style={{ width: "180px", display: "flex", justifyContent: "center" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)", width: "fit-content", maxWidth: "100%" }}>
                                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px", textAlign: "center" }}>
                                  {sub.utr || '—'}
                                </span>
                                {sub.utr && (
                                  <span style={{ cursor: "pointer", fontSize: "14px", opacity: 0.7, transition: "0.2s" }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7} onClick={() => { navigator.clipboard.writeText(sub.utr); showToast("Copied ID! 📋"); }} title="Copy Code">
                                    📋
                                  </span>
                                )}
                             </div>
                          </div>
                          <div style={{ width: "80px", textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#fff" }}>₹{sub.amount || '—'}</div>
                          <div style={{ width: "100px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px" }}>
                             <div style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap" }}><strong style={{color:"#cbd5e1"}}>Req:</strong> {(sub.createdAt || sub.submittedAt || sub.date) ? new Date(sub.createdAt || sub.submittedAt || sub.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
                             {sub.processedAt && <div style={{ fontSize: "11px", color: "var(--accent)", whiteSpace: "nowrap" }}><strong style={{color:"#00f5d4"}}>Upd:</strong> {new Date(sub.processedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                          </div>
                          
                          <div style={{ width: "120px", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                             {(() => {
                               const st = (sub.status || 'pending').toLowerCase();
                               if (st === 'approved') return <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>✅ APPROVED</span>;
                               if (st === 'rejected') return (
                                 <>
                                   <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>❌ REJECTED</span>
                                   {sub.rejectionReason && <div style={{ fontSize: "9px", color: "#ef4444", textAlign: "center", maxWidth: "100px" }}>{sub.rejectionReason}</div>}
                                 </>
                               );
                               return <span style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>⌛ PENDING</span>;
                             })()}
                          </div>

                          <div style={{ width: "220px", display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                             {(sub.status || 'pending').toLowerCase() === 'pending' ? (
                               <>
                                 <button onClick={() => setEditSubmission(sub)} className="action-btn edit-btn" style={{ padding: "6px 12px", fontSize: "11px" }}>EDIT</button>
                                 <button onClick={() => setRejectionModal(sub)} className="action-btn delete-btn" style={{ padding: "6px 12px", fontSize: "11px" }}>REJECT</button>
                                 <button onClick={() => processSubmission(sub._id, 'approved', 'premium')} className="action-btn edit-btn" style={{ borderColor: '#10b981', color: '#10b981', padding: "6px 12px", fontSize: "11px" }}>APPROVE ✅</button>
                               </>
                             ) : (
                               <div style={{ display: 'flex', gap: '8px' }}>
                                 {sub.status === 'rejected' && (
                                   <button onClick={() => sendCorrectionLink(sub._id)} className="action-btn edit-btn" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa', padding: "6px 12px", fontSize: "11px" }}>📧 SEND LINK</button>
                                 )}
                                 <span style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic", paddingRight: "4px" }}>
                                   {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                 </span>
                               </div>
                             )}
                          </div>
                       </div>
                     ));
                   })()}
                </div>
              </div>
            )}

            {activeView === "leaderboard" && (
              <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                {/* 🏆 LEADERBOARD HEADER (SIMPLE) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div className="rank-01" style={{ width: "64px", height: "64px", background: "rgba(250, 204, 21, 0.05)", borderRadius: "20px", border: "1px solid rgba(250, 204, 21, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(250, 204, 21, 0.1)" }}>🏆</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                         <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 15px #facc15" }}></span>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "#facc15", letterSpacing: "2px" }}>TOP STUDENTS LIST</span>
                      </div>
                      <h2 style={{ fontSize: "36px", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px" }}>Student Ranking</h2>
                      <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px", fontSize: "14px" }}>A list of the best students based on their exam marks and accuracy.</p>
                    </div>
                  </div>
                </div>

                {!leaderboard || leaderboard.length === 0 ? (
                  <div className="glass-card" style={{ padding: "120px", textAlign: "center", color: "var(--muted)", borderRadius: "32px" }}>
                     <div style={{ fontSize: "48px", marginBottom: "24px", opacity: 0.5 }}>⏳</div>
                     <p style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.5px" }}>Loading students, please wait...</p>
                  </div>
                ) : (
                  <>
                    {/* 🥇 Hall of Fame Spotlight (Top 3) */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px", alignItems: "flex-end" }}>
                       {/* 🥈 2nd Place */}
                       {leaderboard[1] && (
                         <div className="glass-card spotlight-2nd" style={{ padding: "32px", borderRadius: "28px", border: "1px solid rgba(226, 232, 240, 0.2)", background: "linear-gradient(180deg, rgba(226, 232, 240, 0.05) 0%, transparent 100%)", textAlign: "center", position: "relative", animation: "scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.2) both", animationDelay: "0.2s" }}>
                            <div style={{ position: "absolute", top: "20px", right: "20px", fontSize: "14px", fontWeight: 900, color: "#e2e8f0" }}>2nd</div>
                            <div className="avatar-circle-lg" style={{ border: "4px solid #e2e8f0", margin: "0 auto 20px auto", background: "rgba(255,255,255,0.05)" }}>{leaderboard[1].name?.charAt(0)}</div>
                            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>{leaderboard[1].name}</h3>
                            <button onClick={() => setSelectedStudent({...leaderboard[1], rank: 2})} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px 16px", borderRadius: "10px", fontSize: "11px", fontWeight: 900, letterSpacing: "1px", cursor: "pointer", marginTop: "12px", transition: "0.3s" }} className="hover-accent">VIEW FULL RESULTS</button>
                            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px" }}>
                               <div><div style={{ color: "#e2e8f0", fontWeight: 900, fontSize: "18px" }}>{leaderboard[1].stats?.avgAccuracy || 0}%</div><div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 800 }}>ACCURACY</div></div>
                               <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
                               <div><div style={{ color: "#fff", fontWeight: 900, fontSize: "18px" }}>{leaderboard[1].stats?.totalAttempts || 0}</div><div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 800 }}>EXAMS DONE</div></div>
                            </div>
                         </div>
                       )}

                       {/* 🥇 1st Place Champion */}
                       {leaderboard[0] && (
                         <div className="glass-card spotlight-1st" style={{ padding: "48px 32px", borderRadius: "32px", border: "1px solid #facc15", background: "linear-gradient(180deg, rgba(250, 204, 21, 0.1) 0%, transparent 100%)", textAlign: "center", position: "relative", transform: "scale(1.05)", zIndex: 10, boxShadow: "0 20px 60px rgba(250, 204, 21, 0.15)", animation: "scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
                            <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", background: "#facc15", color: "#000", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 900, boxShadow: "0 0 20px #facc15" }}>1st PLACE 👑</div>
                            <div className="avatar-circle-xl" style={{ border: "6px solid #facc15", margin: "0 auto 24px auto", background: "rgba(250, 204, 21, 0.1)", boxShadow: "0 0 30px rgba(250, 204, 21, 0.3)" }}>{leaderboard[0].name?.charAt(0)}</div>
                            <h3 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>{leaderboard[0].name}</h3>
                            <button onClick={() => setSelectedStudent({...leaderboard[0], rank: 1})} className="btn-glow" style={{ background: "var(--accent)", color: "#000", border: "none", padding: "10px 24px", borderRadius: "14px", fontSize: "11px", fontWeight: 900, letterSpacing: "1px", cursor: "pointer", marginBottom: "20px" }}>VIEW FULL RESULTS</button>
                            <p style={{ color: "var(--accent)", fontSize: "11px", fontWeight: 800, letterSpacing: "1px", marginBottom: "20px" }}>EXPERT STUDENT</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                               <div><div style={{ color: "#facc15", fontWeight: 900, fontSize: "24px" }}>{leaderboard[0].stats?.avgAccuracy || 0}%</div><div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 800 }}>ACCURACY</div></div>
                               <div><div style={{ color: "#fff", fontWeight: 900, fontSize: "24px" }}>{leaderboard[0].stats?.totalAttempts || 0}</div><div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 800 }}>EXAMS DONE</div></div>
                            </div>
                         </div>
                       )}

                       {/* 🥉 3rd Place */}
                       {leaderboard[2] && (
                         <div className="glass-card spotlight-3rd" style={{ padding: "32px", borderRadius: "28px", border: "1px solid rgba(194, 65, 12, 0.3)", background: "linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, transparent 100%)", textAlign: "center", position: "relative", animation: "scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.2) both", animationDelay: "0.3s" }}>
                            <div style={{ position: "absolute", top: "20px", right: "20px", fontSize: "14px", fontWeight: 900, color: "#c2410c" }}>3rd</div>
                            <div className="avatar-circle-lg" style={{ border: "4px solid #c2410c", margin: "0 auto 20px auto", background: "rgba(255,255,255,0.05)" }}>{leaderboard[2].name?.charAt(0)}</div>
                            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>{leaderboard[2].name}</h3>
                            <button onClick={() => setSelectedStudent({...leaderboard[2], rank: 3})} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px 16px", borderRadius: "10px", fontSize: "11px", fontWeight: 900, letterSpacing: "1px", cursor: "pointer", marginTop: "12px", transition: "0.3s" }} className="hover-accent">VIEW FULL RESULTS</button>
                            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px" }}>
                               <div><div style={{ color: "#c2410c", fontWeight: 900, fontSize: "18px" }}>{leaderboard[2].stats?.avgAccuracy || 0}%</div><div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 800 }}>ACCURACY</div></div>
                               <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
                               <div><div style={{ color: "#fff", fontWeight: 900, fontSize: "18px" }}>{leaderboard[2].stats?.totalAttempts || 0}</div><div style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 800 }}>EXAMS DONE</div></div>
                            </div>
                         </div>
                       )}
                    </div>

                    {/* 📊 Detailed Ranking List */}
                    <div className="glass-card" style={{ borderRadius: "32px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                       <div style={{ display: "flex", padding: "24px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ width: "60px", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>RANK</div>
                          <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px", marginLeft: "20px" }}>STUDENT NAME</div>
                          <div style={{ width: "250px", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px", textAlign: "center" }}>ACCURACY</div>
                          <div style={{ width: "180px", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px", textAlign: "right" }}>EXAMS DONE</div>
                          <div style={{ width: "100px", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px", textAlign: "right" }}>ACTIONS</div>
                       </div>

                       <div className="no-scrollbar" style={{ maxHeight: "600px", overflowY: "auto" }}>
                          {leaderboard.map((p, i) => {
                            const rankNum = i + 1;
                            const accuracy = p.stats?.avgAccuracy || 0;
                            
                            return (
                              <div key={i} className="leaderboard-row stagger-in" style={{ display: "flex", padding: "20px 40px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)", animationDelay: `${i * 0.05}s` }}>
                                 <div style={{ width: "60px", display: "flex", alignItems: "center" }}>
                                    <div style={{ fontSize: "18px", fontWeight: 900, color: rankNum <= 3 ? "#facc15" : "var(--muted)", opacity: rankNum <= 3 ? 1 : 0.5 }}>{rankNum}</div>
                                 </div>

                                 <div style={{ flex: 1, marginLeft: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div className="avatar-circle-sm" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 800, fontSize: "14px" }}>{p.name?.charAt(0)}</div>
                                    <div>
                                       <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>{p.name}</div>
                                       <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 800 }}>ID: {p._id?.slice(-6).toUpperCase()}</div>
                                    </div>
                                 </div>

                                 <div style={{ width: "250px", padding: "0 20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                       <span style={{ fontSize: "11px", fontWeight: 900, color: accuracy > 80 ? "var(--accent)" : "#fff" }}>{accuracy}% ACCURATE</span>
                                    </div>
                                    <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                                       <div className="accuracy-fill" style={{ width: `${accuracy}%`, height: "100%", background: accuracy > 80 ? "var(--accent)" : "var(--muted)", borderRadius: "3px", boxShadow: accuracy > 80 ? "0 0 10px rgba(0, 245, 212, 0.3)" : "none" }}></div>
                                    </div>
                                 </div>

                                 <div style={{ width: "180px", textAlign: "right" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                       <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff" }}>{p.stats?.totalAttempts || 0}</span>
                                       <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", letterSpacing: "1px" }}>EXAMS</span>
                                       <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 5px var(--accent)" }}></span>
                                    </div>
                                 </div>

                                 <div style={{ width: "100px", textAlign: "right" }}>
                                    <button onClick={() => setSelectedStudent({...p, rank: rankNum})} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted)", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>VIEW</button>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    {/* 🕵️ STUDENT FULL RESULTS MODAL */}
                    {selectedStudent && (
                      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(3, 4, 11, 0.9)", backdropFilter: "blur(20px)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }} onClick={() => setSelectedStudent(null)}>
                        <div className="glass-card" style={{ width: "100%", maxWidth: "600px", padding: "48px", borderRadius: "32px", border: "1px solid var(--border2)", background: "#05060e", boxShadow: "0 40px 100px rgba(0,0,0,0.8)", position: "relative", animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) both" }} onClick={e => e.stopPropagation()}>
                           <button onClick={() => setSelectedStudent(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.05)", border: "none", color: "var(--muted)", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", cursor: "pointer", transition: "0.3s" }} className="hover-rotate">×</button>
                           
                           <div style={{ textAlign: "center", marginBottom: "40px" }}>
                              <div className="avatar-circle-xl" style={{ border: `6px solid ${selectedStudent.rank <= 3 ? '#facc15' : 'var(--accent)'}`, margin: "0 auto 24px auto", background: "rgba(255,255,255,0.05)", boxShadow: `0 0 30px ${selectedStudent.rank <= 3 ? 'rgba(250,204,21,0.2)' : 'rgba(0,245,212,0.1)'}` }}>{selectedStudent.name?.charAt(0)}</div>
                              <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>{selectedStudent.name}</h2>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                                 <span className="status-badge" style={{ background: "rgba(0,245,212,0.1)", color: "var(--accent)", border: "1px solid rgba(0,245,212,0.2)" }}>RANK #{selectedStudent.rank}</span>
                                 <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted)", letterSpacing: "1px" }}>STUDENT ID: {selectedStudent._id?.toUpperCase()}</span>
                              </div>
                           </div>

                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
                              <div style={{ background: "rgba(255,255,255,0.02)", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                                 <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", letterSpacing: "2px", marginBottom: "8px", textTransform: "uppercase" }}>Rank Percentage</div>
                                 <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>Top {Math.max(1, 100 - selectedStudent.rank)}%</div>
                              </div>
                              <div style={{ background: "rgba(255,255,255,0.02)", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                                 <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", letterSpacing: "2px", marginBottom: "8px", textTransform: "uppercase" }}>Exams Done</div>
                                 <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>{selectedStudent.stats?.totalAttempts || 0}</div>
                              </div>
                           </div>

                           <div style={{ background: "rgba(255,255,255,0.02)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                 <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff", letterSpacing: "1px" }}>ACCURACY SCORE</div>
                                 <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--accent)" }}>{selectedStudent.stats?.avgAccuracy || 0}%</div>
                              </div>
                              <div style={{ height: "12px", background: "rgba(0,0,0,0.4)", borderRadius: "6px", overflow: "hidden" }}>
                                 <div className="accuracy-fill" style={{ width: `${selectedStudent.stats?.avgAccuracy || 0}%`, height: "100%", background: "var(--accent)", borderRadius: "6px", boxShadow: "0 0 20px rgba(0, 245, 212, 0.4)" }}></div>
                              </div>
                              <p style={{ marginTop: "16px", color: "var(--muted)", fontSize: "12px", textAlign: "center" }}>This score shows how many questions the student answered correctly.</p>
                           </div>

                           <button onClick={() => setSelectedStudent(null)} className="btn-glow" style={{ width: "100%", marginTop: "40px", padding: "18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#fff", fontWeight: 900, fontSize: "14px", letterSpacing: "2px", cursor: "pointer" }}>CLOSE THIS BOX</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 🗑️ TRASH VIEW (MODERNIZED) */}
            {activeView === "trash" && (
              <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "20px", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(239, 68, 68, 0.1)" }}>🗑️</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                         <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}></span>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "#ef4444", letterSpacing: "1px" }}>RECOVER DELETED QUESTIONS</span>
                      </div>
                      <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Trash Bin</h2>
                      <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px" }}>Manage your deleted records here.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                   <div style={{ display: "flex", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(239, 68, 68, 0.02)" }}>
                      <div style={{ width: "60px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>#</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 900, marginLeft: "20px", letterSpacing: "1px" }}>QUESTION TEXT</div>
                      <div style={{ width: "250px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>RECOVERY ACTIONS</div>
                   </div>
                   
                   {trashQuestions.length === 0 ? (
                     <div style={{ padding: "100px", textAlign: "center", color: "var(--muted)" }}>
                        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🧹</div>
                        <p style={{ fontSize: "14px", fontWeight: 700 }}>Trash bin is currently empty.</p>
                     </div>
                   ) : (
                    trashQuestions.map((q, i) => (
                      <div key={q._id} className="q-row-card" style={{ display: "flex", padding: "24px 32px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ width: "60px", textAlign: "center", fontSize: "14px", fontWeight: 900, color: "var(--muted)" }}>{String(i + 1).padStart(2, '0')}</div>
                        <div style={{ flex: 1, marginLeft: "20px" }}>
                           <div style={{ fontSize: "15px", fontWeight: 700, color: "#94a3b8", lineHeight: "1.5" }}>{q.qText || (typeof q.q === 'object' ? q.q.text : q.q)}</div>
                           <div style={{ fontSize: "10px", color: "rgba(239, 68, 68, 0.6)", marginTop: "8px", fontWeight: 800, textTransform: "uppercase" }}>SECTION: {q.section || 'General'} • TOPIC: {q.s || 'Other'}</div>
                        </div>
                        <div style={{ width: "250px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                           <button onClick={() => deleteTrashPermanently(q._id)} className="action-btn delete-btn">PERMANENT PURGE 💀</button>
                           <button onClick={() => recoverTrashQuestion(q._id)} className="action-btn edit-btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>RESTORE ASSET ↩</button>
                        </div>
                      </div>
                    ))
                   )}
                </div>
              </div>
            )}

            {/* 🏷️ OFFERS VIEW (MODERNIZED) */}
            {activeView === "offers" && (
              <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", background: "rgba(245, 158, 11, 0.05)", borderRadius: "20px", border: "1px solid rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)" }}>🏷️</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                         <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px #f59e0b" }}></span>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "#f59e0b", letterSpacing: "1px" }}>PROMOTIONAL ENGINE</span>
                      </div>
                      <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Campaign Manager</h2>
                      <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px" }}>Deploy and calibrate subscription tiers and limited-time promotional pricing.</p>
                    </div>
                  </div>
                  <button onClick={() => setNewOfferModal(true)} className="btn-glow" style={{ background: "var(--accent)", color: "#000", border: "none", padding: "12px 28px", borderRadius: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>+</span> NEW CAMPAIGN
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                   {(offers || []).length === 0 ? (
                     <div style={{ gridColumn: "span 2", padding: "100px", textAlign: "center", color: "var(--muted)" }}>No active campaigns detected.</div>
                   ) : offers.map(o => (
                     <div key={o._id} className="glass-card" style={{ padding: "32px", borderRadius: "32px", position: "relative", overflow: "hidden", border: o.active ? "1px solid var(--accent)" : "1px solid var(--border)", background: "rgba(11, 18, 33, 0.4)" }}>
                        {o.active && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "6px", background: "var(--accent)", boxShadow: "0 0 20px var(--accent-glow)" }}></div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: o.active ? "var(--accent)" : "var(--muted)" }}></div>
                              <span style={{ fontSize: "10px", color: o.active ? "var(--accent)" : "var(--muted)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>{o.active ? "Live Campaign" : "Inactive State"}</span>
                           </div>
                           <div style={{ display: "flex", gap: "12px" }}>
                              <button onClick={() => toggleOfferStatus(o._id)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer" }}>{o.active ? "⏸️" : "▶️"}</button>
                              <button onClick={() => removeOffer(o._id)} style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer" }}>🗑️</button>
                           </div>
                        </div>
                        <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>{o.title}</h3>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "24px" }}>
                           <span style={{ fontSize: "32px", fontWeight: 900, color: "var(--accent)" }}>₹{o.priceOffer}</span>
                           <span style={{ fontSize: "16px", color: "var(--muted)", textDecoration: "line-through" }}>₹{o.priceOriginal}</span>
                           <span style={{ fontSize: "11px", background: "rgba(0, 245, 212, 0.1)", color: "var(--accent)", padding: "2px 8px", borderRadius: "6px", fontWeight: 800 }}>{o.discount} SAVINGS</span>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
                           Tier-specific features: {o.title === 'Premium' ? 'Full Question Access + Unlimited Mock Deployments' : 'Core Simulation Features'}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* 🎫 ISSUES VIEW (MODERNIZED) */}
            {activeView === "issues" && (
              <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", background: "rgba(96, 165, 250, 0.05)", borderRadius: "20px", border: "1px solid rgba(96, 165, 250, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 20px rgba(96, 165, 250, 0.1)" }}>🎫</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                         <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 10px #60a5fa" }}></span>
                         <span style={{ fontSize: "11px", fontWeight: 800, color: "#60a5fa", letterSpacing: "1px" }}>STUDENT SUPPORT MATRIX</span>
                      </div>
                      <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Service Tickets</h2>
                      <p style={{ color: "var(--muted)", maxWidth: "500px", marginTop: "4px" }}>Resolve student technical queries and system-level issue reports with precision.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                   <div style={{ display: "flex", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ width: "200px", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>STUDENT IDENTITY</div>
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>TRANSMITTAL CONTENT</div>
                      <div style={{ width: "140px", textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>RESOLUTION STATE</div>
                      <div style={{ width: "120px", textAlign: "right", fontSize: "11px", color: "var(--muted)", fontWeight: 900, letterSpacing: "1px" }}>COMMANDS</div>
                   </div>

                   {(!issues || issues.length === 0) ? (
                     <div style={{ padding: "100px", textAlign: "center", color: "var(--muted)" }}>
                        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🍵</div>
                        <p style={{ fontSize: "14px", fontWeight: 700 }}>System clear. No pending support requests.</p>
                     </div>
                   ) : (
                    issues.map((iss) => (
                      <div key={iss._id} className="q-row-card" style={{ display: "flex", padding: "24px 32px", alignItems: "flex-start", opacity: iss.status === 'resolved' ? 0.6 : 1 }}>
                        <div style={{ width: "200px", display: "flex", alignItems: "center", gap: "12px" }}>
                           <div className="avatar-circle" style={{ background: "rgba(96, 165, 250, 0.1)", color: "#60a5fa" }}>{iss.userName?.charAt(0) || "S"}</div>
                           <div>
                              <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{iss.userName}</div>
                              <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>{iss.userCode}</div>
                           </div>
                        </div>
                        <div style={{ flex: 1, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", paddingRight: "32px" }}>
                           "{iss.message}"
                           <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "12px", fontWeight: 800 }}>TIMESTAMP: {new Date(iss.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ width: "140px", textAlign: "center" }}>
                           <span className="status-badge" style={{ 
                             background: iss.status === 'resolved' ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                             color: iss.status === 'resolved' ? "#10b981" : "#f59e0b",
                             border: `1px solid ${iss.status === 'resolved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                           }}>
                             {iss.status?.toUpperCase() || 'PENDING'}
                           </span>
                        </div>
                        <div style={{ width: "120px", textAlign: "right" }}>
                           {iss.status !== 'resolved' && (
                             <button onClick={() => resolveIssue(iss._id)} className="action-btn edit-btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>RESOLVE</button>
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

      {/* 📊 Exam History Modal */}
      {viewAttempts && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "800px", maxHeight: "85vh", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Exam History: <span style={{ color: "var(--accent)" }}>{viewAttempts.name}</span></h2>
                <p style={{ color: "var(--muted)", fontSize: "11px" }}>Viewing complete activity log for {viewAttempts.email}</p>
              </div>
              <button onClick={() => setViewAttempts(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }} className="no-scrollbar">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, background: "rgba(11, 18, 33, 0.98)", zIndex: 5 }}>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ padding: "12px", textAlign: "left", color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>#</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>EXAM TYPE</th>
                    <th style={{ padding: "12px", textAlign: "center", color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>SCORE</th>
                    <th style={{ padding: "12px", textAlign: "center", color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>ACCURACY</th>
                    <th style={{ padding: "12px", textAlign: "center", color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>TIME</th>
                    <th style={{ padding: "12px", textAlign: "right", color: "var(--muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewAttempts.attempts && viewAttempts.attempts.length > 0) ? (
                    [...viewAttempts.attempts].reverse().map((att, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                        <td style={{ padding: "12px", color: "var(--muted)" }}>{String(viewAttempts.attempts.length - i).padStart(2, '0')}</td>
                        <td style={{ padding: "12px", fontWeight: 700 }}>{att.examType || 'Regular Test'}</td>
                        <td style={{ padding: "12px", textAlign: "center", fontWeight: 800, color: att.pct >= 75 ? "#10b981" : att.pct >= 40 ? "#f59e0b" : "#ef4444" }}>
                          {att.score} / {att.total}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                           <div style={{ display: "inline-block", padding: "2px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", fontSize: "11px", fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)" }}>{att.pct}%</div>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center", color: "var(--muted)" }}>
                          {Math.floor(att.timeUsed / 60)}m {att.timeUsed % 60}s
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "var(--muted)" }}>
                          {new Date(att.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>No exam data found for this student.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewAttempts(null)} className="btn-glow" style={{ padding: "10px 32px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>Close History</button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Edit Submission Modal */}
      {editSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Edit Pending Request</h2>
              <button onClick={() => setEditSubmission(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>STUDENT NAME</label>
                <input 
                  value={editSubmission.name} 
                  onChange={e => setEditSubmission({...editSubmission, name: e.target.value})}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>EMAIL ADDRESS</label>
                <input 
                  value={editSubmission.email} 
                  onChange={e => setEditSubmission({...editSubmission, email: e.target.value})}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>PHONE NUMBER</label>
                  <input 
                    value={editSubmission.phone || ''} 
                    onChange={e => setEditSubmission({...editSubmission, phone: e.target.value})}
                    placeholder="e.g., 9966XXXXXX"
                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>AMOUNT (₹)</label>
                  <input 
                    type="number"
                    value={editSubmission.amount || 0} 
                    onChange={e => setEditSubmission({...editSubmission, amount: Number(e.target.value)})}
                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "8px" }}>TRANSACTION ID / UTR</label>
                <input 
                  value={editSubmission.utr} 
                  onChange={e => setEditSubmission({...editSubmission, utr: e.target.value})}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "10px", color: "#fff", padding: "10px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button onClick={() => setEditSubmission(null)} style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border2)", borderRadius: "10px", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleUpdateSubmission} style={{ flex: 1, padding: "12px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>Save Changes 📝</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ❌ Rejection Reason Modal */}
      {rejectionModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
           <div className="glass-card" style={{ width: "100%", maxWidth: "450px", padding: "32px", borderRadius: "24px", background: "#0b1221", border: "1px solid var(--border2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                 <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ef4444" }}>Reject Request ❌</h2>
                 <button onClick={() => { setRejectionModal(null); setRejectionReason(""); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "20px" }}>✕</button>
              </div>
              
              <div style={{ marginBottom: "24px" }}>
                 <p style={{ fontSize: "13px", color: "#fff", marginBottom: "16px" }}>Why are you rejecting <span style={{ fontWeight: 800 }}>{rejectionModal.name}</span>'s request?</p>
                 <textarea 
                   autoFocus
                   value={rejectionReason}
                   onChange={e => setRejectionReason(e.target.value)}
                   placeholder="e.g., Mismatched UTR number, Amount difference, Invalid screenshot..."
                   style={{ width: "100%", height: "100px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border2)", borderRadius: "12px", color: "#fff", padding: "12px", fontSize: "14px", outline: "none", resize: "none" }}
                 />
                 
                 <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                   {["Mismatched UTR", "Amount Difference", "Invalid Screenshot", "Fake Payment Proof"].map(t => (
                     <button key={t} onClick={() => setRejectionReason(t)} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", fontSize: "10px", color: "var(--muted)", cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.05)"}>
                       {t}
                     </button>
                   ))}
                 </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                 <button onClick={() => { setRejectionModal(null); setRejectionReason(""); }} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                 <button 
                   onClick={() => processSubmission(rejectionModal._id, 'rejected', null, rejectionReason)} 
                   disabled={!rejectionReason.trim()}
                   style={{ flex: 1, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer", opacity: rejectionReason.trim() ? 1 : 0.5 }}
                 >
                   Confirm Reject
                 </button>
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
