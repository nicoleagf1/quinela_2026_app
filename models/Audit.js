const db = require('../config/db');

class Audit {
  static async logPrediction(userId, matchId, homeScore, awayScore) {
    // In PostgreSQL this will insert. In mock JSON it will just append.
    const result = await db.query(
      `INSERT INTO auditoria (user_id, match_id, home_score, away_score, action_type)
       VALUES ($1, $2, $3, $4, 'UPSERT')`,
      [userId, matchId, homeScore, awayScore]
    );
    return result;
  }

  static async getAuditLogs() {
    // In PostgreSQL we would join. In mock JSON, the mock handler will have to construct the joined data.
    const result = await db.query(
      `SELECT a.id, a.user_id, a.match_id, a.home_score, a.away_score, a.created_at, 
              u.first_name, u.last_name, m.home_team, m.away_team
       FROM auditoria a
       JOIN users u ON a.user_id = u.id
       JOIN matches m ON a.match_id = m.id
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  }
}

module.exports = Audit;
