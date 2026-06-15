const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const Audit = require('../models/Audit');
const teamData = require('../utils/teamData');

exports.submitPrediction = async (req, res) => {
    const { matchId, homeScore, awayScore } = req.body;
    const userId = req.user.id;

    try {
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).render('error', { mensaje: 'El partido no existe.' });
        }

        const isClosed = match.status === 'finished' || (
            match.prediction_deadline 
                ? (new Date() >= new Date(match.prediction_deadline)) 
                : (match.status === 'live' || new Date() >= new Date(match.kickoff_time))
        );

        if (isClosed) {
            return res.status(400).render('matches', { 
                error: 'Error: El período de predicciones para este partido ha cerrado.',
                groupedMatches: await Match.getGroupedMatchesForUser(userId),
                teamData,
                success: false
            });
        }

        await Prediction.upsertUserPrediction(userId, matchId, homeScore, awayScore);
        
        // Log to Audit table
        await Audit.logPrediction(userId, matchId, homeScore, awayScore);
        
        res.redirect('/matches?status=success');
    } catch (error) {
        console.error(`Execution error inside prediction sub-routine: ${error.message}`);
        res.status(500).render('error', { mensaje: 'Error interno en el servidor.' });
    }
};
