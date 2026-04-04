const cron = require('node-cron');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const Leaderboard = require('../models/Leaderboard');

// 🕒 Scheduled to run every day at Midnight (00:00 IST)
// This is when exams close and results are calculated
const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🚀 Running Midnight Task: Calculating Results & Awarding Points...');
    
    try {
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0,0,0,0);

      const yesterdayEnd = new Date();
      yesterdayEnd.setHours(23,59,59,999);

      // 1. Fetch all attempts from yesterday
      const submissions = await Submission.find({ 
        createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        weightedScore: { $exists: true }
      });

      // Group by ExamType
      const examsMap = {};
      submissions.forEach(sub => {
        if (!examsMap[sub.examType]) examsMap[sub.examType] = [];
        examsMap[sub.examType].push(sub);
      });

      for (const examKey of Object.keys(examsMap)) {
        const subs = examsMap[examKey].sort((a, b) => b.weightedScore - a.weightedScore);
        
        let leaderboardRankings = [];

        for (let i = 0; i < subs.length; i++) {
          const sub = subs[i];
          const rank = i + 1;
          let pointsAwarded = 50; // default for "others"

          if (rank === 1) pointsAwarded = 500;
          else if (rank === 2) pointsAwarded = 400;
          else if (rank === 3) pointsAwarded = 300;

          // 👤 1. Update Student's points
          const student = await User.findOne({ code: sub.userCode });
          if (student) {
            student.totalPoints += pointsAwarded;
            student.pointsHistory.push({ amount: pointsAwarded, reason: `Exam Rank #${rank} (${examKey})` });
            await student.save();

            // 🔗 2. DISTRIBUTE REFERRAL POINTS (3 Levels)
            if (student.referralPath && student.referralPath.length > 0) {
              const payouts = [100, 50, 25]; // Level 1 (Parent), Level 2 (Grandparent), Level 3
              for (let level = 0; level < student.referralPath.length; level++) {
                const referrerId = student.referralPath[level];
                const amount = payouts[level];
                
                await User.findByIdAndUpdate(referrerId, {
                  $inc: { totalPoints: amount },
                  $push: { pointsHistory: { amount, reason: `Referral L${level+1} Bonus: ${student.name}'s Exam` } }
                });
              }
            }

            leaderboardRankings.push({
              rank,
              userId: student._id,
              name: student.name,
              score: sub.weightedScore,
              accuracy: sub.accuracy,
              speed: sub.speedScore,
              pointsAwarded
            });
          }
        }

        // 3. Save Leaderboard Snapshot
        await Leaderboard.create({
          examKey,
          snapshotDate: new Date(),
          snapshotType: 'exam',
          rankings: leaderboardRankings
        });
      }

      console.log('✅ Midnight Ranking & Payouts Completed Successfully.');
    } catch (err) {
      console.error('❌ Cron Job Error:', err);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
};

module.exports = initCronJobs;
