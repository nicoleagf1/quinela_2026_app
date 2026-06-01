const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const Ranking = require('../models/Ranking');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalPredictions, finishedMatches, usersList, criticalMatches] = await Promise.all([
      User.countUsers(),
      Prediction.countPredictions(),
      Match.countFinishedMatches(),
      Ranking.getLeaderboard(),
      Match.getCriticalMatches()
    ]);

    const metrics = {
      totalUsers,
      totalPredictions,
      finishedMatches
    };

    res.render('admin/dashboard', {
      metrics,
      usersList,
      criticalMatches
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).send('Error interno en el servidor.');
  }
};
