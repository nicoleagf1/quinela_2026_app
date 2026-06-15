const db = require('../config/db');

class Match {
  static async getAllAvailableForUser(userId) {
    const result = await db.query(
      `SELECT m.*, p.home_score_predicted, p.away_score_predicted
       FROM matches m
       LEFT JOIN predictions p ON m.id = p.match_id AND p.user_id = $1
       ORDER BY m.kickoff_time ASC`,
      [userId]
    );
    return result.rows;
  }

  static async getGroupedMatchesForUser(userId) {
    const matches = await this.getAllAvailableForUser(userId);
    const groupedMatches = {};
    matches.forEach(match => {
      const dateKey = new Date(match.kickoff_time).toLocaleDateString('es-VE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const capitalizedKey = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
      
      if (!groupedMatches[capitalizedKey]) {
        groupedMatches[capitalizedKey] = [];
      }
      groupedMatches[capitalizedKey].push(match);
    });
    return groupedMatches;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM matches WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE matches SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
  }

  static async updatePredictionDeadline(id, deadline) {
    await db.query(
      'UPDATE matches SET prediction_deadline = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [deadline, id]
    );
  }

  static async countFinishedMatches() {
    const result = await db.query("SELECT COUNT(*) FROM matches WHERE status = 'finished'");
    return parseInt(result.rows[0].count, 10);
  }

  static async getCriticalMatches() {
    const result = await db.query(
      `SELECT * FROM matches 
       WHERE status IN ('live', 'scheduled') 
       ORDER BY kickoff_time ASC 
       LIMIT 5`
    );
    return result.rows;
  }

  static async getAll() {
    const result = await db.query('SELECT * FROM matches ORDER BY kickoff_time ASC');
    return result.rows;
  }

  static async getScheduledAndLive() {
    const result = await db.query(
      `SELECT * FROM matches 
       WHERE status IN ('scheduled', 'live') 
       ORDER BY kickoff_time ASC`
    );
    return result.rows;
  }

  static async updateScore(id, homeScore, awayScore, winnerTeam) {
    await db.query(
      `UPDATE matches 
       SET home_score_actual = $1, away_score_actual = $2, winner_team = $3, status = 'finished', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [homeScore, awayScore, winnerTeam, id]
    );
  }

  static async getTotalCount() {
    const result = await db.query('SELECT COUNT(*) FROM matches');
    return parseInt(result.rows[0].count, 10);
  }

  static async getUpcomingMatches(limit = 3) {
    const result = await db.query(
      `SELECT * FROM matches 
       WHERE status = 'scheduled' 
       ORDER BY kickoff_time ASC 
       LIMIT $1`, [limit]
    );
    return result.rows;
  }

  static async getRecentResults(limit = 3) {
    const result = await db.query(
      `SELECT * FROM matches 
       WHERE status = 'finished' 
       ORDER BY updated_at DESC 
       LIMIT $1`, [limit]
    );
    return result.rows;
  }
}

module.exports = Match;
