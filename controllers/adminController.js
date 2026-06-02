const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const Ranking = require('../models/Ranking');
const rankingController = require('./rankingController');
const teamData = require('../utils/teamData');

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
      criticalMatches,
      teamData,
      activePage: 'dashboard'
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).send('Error interno en el servidor.');
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('admin/users', { users });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).send('Error interno en el servidor.');
  }
};

exports.getUserEdit = async (req, res) => {
  try {
    const userToEdit = await User.findById(req.params.id);
    if (!userToEdit) {
      return res.status(404).send('Usuario no encontrado.');
    }
    res.render('admin/edit_user', { userToEdit, error: null });
  } catch (error) {
    console.error('Error getting user edit form:', error);
    res.status(500).send('Error interno en el servidor.');
  }
};

exports.postUserEdit = async (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  try {
    const userId = req.params.id;
    await User.update(userId, { firstName, lastName, email, role });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error saving user edit:', error);
    res.status(500).send('Error interno al guardar los cambios.');
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.getAll();
    res.render('admin/matches', { matches });
  } catch (error) {
    console.error('Error fetching matches for admin:', error);
    res.status(500).send('Error interno en el servidor.');
  }
};

exports.getMatchesCenter = async (req, res) => {
  try {
    const activeMatches = await Match.getScheduledAndLive();
    res.render('admin/matches_center', { activeMatches, success: req.query.status === 'success' });
  } catch (error) {
    console.error('Error loading matches center for admin:', error);
    res.status(500).send('Error interno en el servidor.');
  }
};

exports.postMatchScore = async (req, res) => {
  const { matchId, homeScore, awayScore } = req.body;
  try {
    const id = parseInt(matchId, 10);
    const hs = parseInt(homeScore, 10);
    const as = parseInt(awayScore, 10);

    if (isNaN(id) || isNaN(hs) || isNaN(as) || hs < 0 || as < 0) {
      return res.status(400).send('Datos de puntuación inválidos.');
    }

    // 1. Update the actual score of the match in the DB and set it to finished
    await Match.updateScore(id, hs, as);

    // 2. Process all user predictions for this match and update scores in DB
    await rankingController.processMatchScoresAndRankings(id, hs, as);

    res.redirect('/admin/matches/center?status=success');
  } catch (error) {
    console.error('Error posting match score:', error);
    res.status(500).send('Error interno al registrar el marcador.');
  }
};
