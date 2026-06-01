const db = require('../config/db');

class Ranking {
  static async aggregateUserStandings(userId, points, type) {
    const isExact = type === 'exact' ? 1 : 0;
    const isOutcome = type === 'outcome' ? 1 : 0;

    await db.query(
      `INSERT INTO leaderboards (user_id, total_points, exact_matches_count, outcome_matches_count)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) 
       DO UPDATE SET total_points = leaderboards.total_points + EXCLUDED.total_points,
                     exact_matches_count = leaderboards.exact_matches_count + EXCLUDED.exact_matches_count,
                     outcome_matches_count = leaderboards.outcome_matches_count + EXCLUDED.outcome_matches_count,
                     updated_at = CURRENT_TIMESTAMP`,
      [userId, points, isExact, isOutcome]
    );
  }

  static async getLeaderboard() {
    const result = await db.query(
      `SELECT u.id as user_id, u.first_name, u.last_name, l.total_points, l.exact_matches_count, l.outcome_matches_count
       FROM leaderboards l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.total_points DESC, l.exact_matches_count DESC`
    );
    return result.rows;
  }
}

module.exports = Ranking;
