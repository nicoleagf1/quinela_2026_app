const Ranking = require('../models/Ranking');
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');

exports.getLeaderboard = async (req, res) => {
  try {
    const rankings = await Ranking.getLeaderboard();
    res.render('leaderboard', { rankings });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.render('error', { mensaje: 'Error al cargar la tabla de posiciones.' });
  }
};

exports.processMatchScoresAndRankings = async (matchId, actualHomeScore, actualAwayScore) => {
    try {
        const allPredictions = await Prediction.findByMatchId(matchId);

        for (let prediction of allPredictions) {
            let allocatedPoints = 0;
            let type = 'miss';

            const isExactMatch = (prediction.home_score_predicted === actualHomeScore) && 
                                 (prediction.away_score_predicted === actualAwayScore);

            if (isExactMatch) {
                allocatedPoints = 3;
                type = 'exact';
            } else {
                const predictedSign = Math.sign(prediction.home_score_predicted - prediction.away_score_predicted);
                const actualSign = Math.sign(actualHomeScore - actualAwayScore);
                
                if (predictedSign === actualSign) {
                    allocatedPoints = 1;
                    type = 'outcome';
                }
            }

            await Prediction.updatePointsAwarded(prediction.id, allocatedPoints);
            await Ranking.aggregateUserStandings(prediction.user_id, allocatedPoints, type);
        }
        
        await Match.updateStatus(matchId, 'finished');
    } catch (error) {
        console.error(`Failed execution sequence inside calculation matrix: ${error.message}`);
        throw error;
    }
};
