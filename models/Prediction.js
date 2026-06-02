const db = require('../config/db');

class Prediction {
  static async upsertUserPrediction(userId, matchId, homeScore, awayScore) {
    const result = await db.query(
      `INSERT INTO predictions (user_id, match_id, home_score_predicted, away_score_predicted)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ON CONSTRAINT unique_user_match_prediction 
       DO UPDATE SET home_score_predicted = EXCLUDED.home_score_predicted,
                     away_score_predicted = EXCLUDED.away_score_predicted,
                     updated_at = CURRENT_TIMESTAMP`,
      [userId, matchId, homeScore, awayScore]
    );
    return result;
  }

  static async findByMatchId(matchId) {
    const result = await db.query('SELECT * FROM predictions WHERE match_id = $1', [matchId]);
    return result.rows;
  }

  static async countPredictions() {
    const result = await db.query('SELECT COUNT(*) FROM predictions');
    return parseInt(result.rows[0].count, 10);
  }

  static async getUserStats(userId) {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_predictions,
        SUM(CASE WHEN points_awarded = 3 THEN 1 ELSE 0 END) as exact_matches,
        SUM(CASE WHEN points_awarded = 1 THEN 1 ELSE 0 END) as outcome_matches,
        SUM(CASE WHEN points_awarded > 0 THEN 1 ELSE 0 END) as correct_predictions
       FROM predictions 
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  static async updatePointsAwarded(id, points) {
    await db.query(
      'UPDATE predictions SET points_awarded = $1, is_calculated = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [points, id]
    );
  }
}

module.exports = Prediction;
