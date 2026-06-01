const Match = require('../models/Match');
const teamData = require('../utils/teamData');

exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupedMatches = await Match.getGroupedMatchesForUser(userId);
    res.render('matches', { groupedMatches, teamData, error: null, success: req.query.status === 'success' });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.render('error', { mensaje: 'Error al cargar los partidos.' });
  }
};
