const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const initCronJobs = require('./utils/cronJobs');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/questions', require('./routes/questions'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected — tcsnqt2026');
    initCronJobs(); // 🕒 Start Daily Automated Tasks
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB Connection Error:', err); process.exit(1); });
