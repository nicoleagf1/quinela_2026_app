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
      `SELECT u.id as user_id, u.first_name, u.last_name, 
              COALESCE(l.total_points, 0) as total_points, 
              COALESCE(l.exact_matches_count, 0) as exact_matches_count, 
              COALESCE(l.outcome_matches_count, 0) as outcome_matches_count
       FROM users u
       LEFT JOIN leaderboards l ON u.id = l.user_id
       ORDER BY total_points DESC, l.exact_matches_count DESC, u.first_name ASC`
    );
    return result.rows;
  }
}

module.exports = Ranking;
