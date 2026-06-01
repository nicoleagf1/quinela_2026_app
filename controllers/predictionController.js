const Match = require('../models/Match');
const Prediction = require('../models/Prediction');

exports.submitPrediction = async (req, res) => {
    const { matchId, homeScore, awayScore } = req.body;
    const userId = req.user.id;

    try {
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).render('error', { mensaje: 'El partido no existe.' });
        }

        const currentTime = new Date();
        const kickoffTime = new Date(match.kickoff_time);

        if (currentTime >= kickoffTime) {
            return res.status(400).render('matches', { 
                error: 'Error: El partido ya ha comenzado. Predicción bloqueada.',
                groupedMatches: await Match.getGroupedMatchesForUser(userId),
                success: false
            });
        }

        await Prediction.upsertUserPrediction(userId, matchId, homeScore, awayScore);
        
        res.redirect('/matches?status=success');
    } catch (error) {
        console.error(`Execution error inside prediction sub-routine: ${error.message}`);
        res.status(500).render('error', { mensaje: 'Error interno en el servidor.' });
    }
};
