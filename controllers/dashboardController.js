const Match = require('../models/Match');
const User = require('../models/User');
const Ranking = require('../models/Ranking');
const Prediction = require('../models/Prediction');
const teamData = require('../utils/teamData');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all required data in parallel
    const [
      totalMatches,
      totalUsers,
      upcomingMatches,
      recentMatches,
      topLeaderboard,
      userPositionData,
      userStats
    ] = await Promise.all([
      Match.getTotalCount(),
      User.countUsers(),
      Match.getUpcomingMatches(3),
      Match.getRecentResults(3),
      Ranking.getTop(5),
      Ranking.getUserPosition(userId),
      Prediction.getUserStats(userId)
    ]);

    const stats = {
      totalMatches,
      totalUsers,
      userPoints: userPositionData.total_points,
      userPosition: userPositionData.position,
      userStats
    };

    res.render('dashboard', {
      user: req.user,
      stats,
      upcomingMatches,
      recentMatches,
      topLeaderboard,
      teamData,
      activePage: 'dashboard'
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.render('error', { mensaje: 'Error al cargar el panel principal.' });
  }
};
