const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 2000
});

const JSON_DB_PATH = path.join(__dirname, '../ia_mock_db.json');
let useMock = false;

function loadJSONDb() {
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify({
      users: [],
      matches: [],
      predictions: [],
      leaderboards: [],
      auditoria: []
    }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
  } catch (e) {
    return { users: [], matches: [], predictions: [], leaderboards: [], auditoria: [] };
  }
}

function saveJSONDb(data) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Test PG connection on startup (with 2s timeout)
const checkPromise = pool.query('SELECT NOW()')
  .then(() => {
    console.log('PostgreSQL connection successful.');
  })
  .catch(() => {
    console.warn('\n⚠️  [DB WARNING] PostgreSQL connection failed. Falling back to local JSON database (ia_mock_db.json).\n');
    useMock = true;
  });

async function mockQuery(text, params = []) {
  await checkPromise;
  
  if (!useMock) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn('PostgreSQL query failed. Retrying with local JSON DB...', err.message);
      useMock = true;
    }
  }

  const data = loadJSONDb();
  const queryText = text.replace(/\s+/g, ' ').trim();

  // 1. SELECT NOW()
  if (queryText.includes('SELECT NOW()')) {
    return { rows: [{ now: new Date() }] };
  }

  // 2. CREATE TABLE / INDEX
  if (queryText.startsWith('CREATE TABLE') || queryText.startsWith('CREATE INDEX') || queryText.startsWith('CREATE EXTENSION')) {
    return { rows: [] };
  }

  // 3. TRUNCATE TABLE
  if (queryText.startsWith('TRUNCATE TABLE')) {
    data.users = [];
    data.matches = [];
    data.predictions = [];
    data.leaderboards = [];
    data.auditoria = [];
    saveJSONDb(data);
    return { rows: [] };
  }

  // 4. INSERT INTO users
  if (queryText.startsWith('INSERT INTO users')) {
    const newUser = {
      id: uuidv4(),
      first_name: params[0],
      last_name: params[1],
      email: params[2],
      password_hash: params[3],
      role: params[4] || 'user',
      created_at: new Date()
    };
    data.users.push(newUser);
    saveJSONDb(data);
    return { rows: [newUser] };
  }

  // 5. SELECT FROM users BY email
  if (queryText.includes('FROM users WHERE email = $1')) {
    const user = data.users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // 6. SELECT FROM users BY id
  if (queryText.includes('FROM users WHERE id = $1')) {
    const user = data.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [] };
  }

  // 7. COUNT users
  if (queryText.includes('SELECT COUNT(*) FROM users')) {
    return { rows: [{ count: data.users.length.toString() }] };
  }

  // 8. SELECT ALL users
  if (queryText.includes('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC')) {
    const sortedUsers = [...data.users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: sortedUsers };
  }

  // 9. UPDATE users
  if (queryText.startsWith('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3')) {
    const idx = data.users.findIndex(u => u.email === params[2]);
    if (idx !== -1) {
      data.users[idx].password_hash = params[0];
      data.users[idx].role = params[1];
      saveJSONDb(data);
    }
    return { rows: [] };
  }

  if (queryText.startsWith('UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4 WHERE id = $5')) {
    const idx = data.users.findIndex(u => u.id === params[4]);
    if (idx !== -1) {
      data.users[idx].first_name = params[0];
      data.users[idx].last_name = params[1];
      data.users[idx].email = params[2];
      data.users[idx].role = params[3];
      saveJSONDb(data);
    }
    return { rows: [] };
  }

  if (queryText.startsWith('UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, password_hash = $5 WHERE id = $6')) {
    const idx = data.users.findIndex(u => u.id === params[5]);
    if (idx !== -1) {
      data.users[idx].first_name = params[0];
      data.users[idx].last_name = params[1];
      data.users[idx].email = params[2];
      data.users[idx].role = params[3];
      data.users[idx].password_hash = params[4];
      saveJSONDb(data);
    }
    return { rows: [] };
  }

  // 10. INSERT INTO matches
  if (queryText.startsWith('INSERT INTO matches')) {
    const newMatch = {
      id: data.matches.length + 1,
      stage: params[0],
      home_team: params[1],
      away_team: params[2],
      kickoff_time: params[3],
      home_score_actual: null,
      away_score_actual: null,
      status: 'scheduled',
      updated_at: new Date()
    };
    data.matches.push(newMatch);
    saveJSONDb(data);
    return { rows: [newMatch] };
  }

  // 11. SELECT matches left join predictions
  if (queryText.includes('LEFT JOIN predictions p ON m.id = p.match_id AND p.user_id = $1')) {
    const userId = params[0];
    const rows = data.matches.map(m => {
      const pred = data.predictions.find(p => p.match_id === m.id && p.user_id === userId);
      return {
        ...m,
        id: m.id,
        home_score_predicted: pred ? pred.home_score_predicted : null,
        away_score_predicted: pred ? pred.away_score_predicted : null
      };
    }).sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));
    return { rows };
  }

  // 12. SELECT match by id
  if (queryText.includes('FROM matches WHERE id = $1')) {
    const match = data.matches.find(m => m.id === parseInt(params[0], 10));
    return { rows: match ? [match] : [] };
  }

  // 13. UPDATE match status
  if (queryText.startsWith('UPDATE matches SET status = $1')) {
    const id = parseInt(params[1], 10);
    const idx = data.matches.findIndex(m => m.id === id);
    if (idx !== -1) {
      data.matches[idx].status = params[0];
      data.matches[idx].updated_at = new Date();
      saveJSONDb(data);
    }
    return { rows: [] };
  }

  // 14. COUNT finished matches
  if (queryText.includes("FROM matches WHERE status = 'finished'")) {
    const count = data.matches.filter(m => m.status === 'finished').length;
    return { rows: [{ count: count.toString() }] };
  }

  // 14a. COUNT all matches
  if (queryText === 'SELECT COUNT(*) FROM matches') {
    return { rows: [{ count: data.matches.length.toString() }] };
  }

  // 14b. SELECT upcoming matches
  if (queryText.includes("FROM matches WHERE status = 'scheduled' ORDER BY kickoff_time ASC LIMIT")) {
    const limit = params[0] || 3;
    const upcoming = data.matches.filter(m => m.status === 'scheduled')
      .sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time))
      .slice(0, limit);
    return { rows: upcoming };
  }

  // 14c. SELECT recent matches results
  if (queryText.includes("FROM matches WHERE status = 'finished' ORDER BY updated_at DESC LIMIT")) {
    const limit = params[0] || 3;
    const finished = data.matches.filter(m => m.status === 'finished')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, limit);
    return { rows: finished };
  }

  // 15. SELECT critical matches
  if (queryText.includes("status IN ('live', 'scheduled') ORDER BY kickoff_time ASC LIMIT 5")) {
    const active = data.matches.filter(m => m.status === 'live' || m.status === 'scheduled')
      .sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time))
      .slice(0, 5);
    return { rows: active };
  }

  // 16. SELECT all matches
  if (queryText.includes('FROM matches ORDER BY kickoff_time ASC')) {
    const sorted = [...data.matches].sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));
    return { rows: sorted };
  }

  // 17. SELECT scheduled and live matches
  if (queryText.includes("status IN ('scheduled', 'live') ORDER BY kickoff_time ASC")) {
    const active = data.matches.filter(m => m.status === 'scheduled' || m.status === 'live')
      .sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));
    return { rows: active };
  }

  // 18. UPDATE match score
  if (queryText.startsWith('UPDATE matches SET home_score_actual = $1')) {
    const id = parseInt(params[2], 10);
    const idx = data.matches.findIndex(m => m.id === id);
    if (idx !== -1) {
      data.matches[idx].home_score_actual = parseInt(params[0], 10);
      data.matches[idx].away_score_actual = parseInt(params[1], 10);
      data.matches[idx].status = 'finished';
      data.matches[idx].updated_at = new Date();
      saveJSONDb(data);
    }
    return { rows: [] };
  }

  // 19. INSERT OR UPDATE prediction (upsert)
  if (queryText.startsWith('INSERT INTO predictions')) {
    const userId = params[0];
    const matchId = parseInt(params[1], 10);
    const homeScore = parseInt(params[2], 10);
    const awayScore = parseInt(params[3], 10);

    const idx = data.predictions.findIndex(p => p.user_id === userId && p.match_id === matchId);
    if (idx !== -1) {
      data.predictions[idx].home_score_predicted = homeScore;
      data.predictions[idx].away_score_predicted = awayScore;
      data.predictions[idx].updated_at = new Date();
    } else {
      data.predictions.push({
        id: uuidv4(),
        user_id: userId,
        match_id: matchId,
        home_score_predicted: homeScore,
        away_score_predicted: awayScore,
        points_awarded: 0,
        is_calculated: false,
        updated_at: new Date()
      });
    }
    saveJSONDb(data);
    return { rows: [] };
  }

  // 20. SELECT predictions by match_id
  if (queryText.includes('FROM predictions WHERE match_id = $1')) {
    const matchId = parseInt(params[0], 10);
    const preds = data.predictions.filter(p => p.match_id === matchId);
    return { rows: preds };
  }

  // 21. COUNT predictions
  if (queryText.includes('SELECT COUNT(*) FROM predictions')) {
    return { rows: [{ count: data.predictions.length.toString() }] };
  }

  // 21a. SELECT predictions user stats
  if (queryText.includes('total_predictions') && queryText.includes('FROM predictions WHERE user_id = $1')) {
    const userId = params[0];
    const userPreds = data.predictions.filter(p => p.user_id === userId);
    const total = userPreds.length;
    const exact = userPreds.filter(p => p.points_awarded === 3).length;
    const outcome = userPreds.filter(p => p.points_awarded === 1).length;
    const correct = userPreds.filter(p => p.points_awarded > 0).length;
    return {
      rows: [{
        total_predictions: total.toString(),
        exact_matches: exact.toString(),
        outcome_matches: outcome.toString(),
        correct_predictions: correct.toString()
      }]
    };
  }

  // 22. UPDATE prediction points
  if (queryText.startsWith('UPDATE predictions SET points_awarded = $1')) {
    const id = params[1];
    const points = parseInt(params[0], 10);
    const idx = data.predictions.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.predictions[idx].points_awarded = points;
      data.predictions[idx].is_calculated = true;
      data.predictions[idx].updated_at = new Date();
      saveJSONDb(data);
    }
    return { rows: [] };
  }

  // 23. INSERT OR UPDATE leaderboard standing (upsert)
  if (queryText.startsWith('INSERT INTO leaderboards')) {
    const userId = params[0];
    const points = parseInt(params[1], 10);
    const exact = parseInt(params[2], 10);
    const outcome = parseInt(params[3], 10);

    const idx = data.leaderboards.findIndex(l => l.user_id === userId);
    if (idx !== -1) {
      data.leaderboards[idx].total_points += points;
      data.leaderboards[idx].exact_matches_count += exact;
      data.leaderboards[idx].outcome_matches_count += outcome;
      data.leaderboards[idx].updated_at = new Date();
    } else {
      data.leaderboards.push({
        user_id: userId,
        total_points: points,
        exact_matches_count: exact,
        outcome_matches_count: outcome,
        updated_at: new Date()
      });
    }
    saveJSONDb(data);
    return { rows: [] };
  }

  // 23b. SELECT user position rank
  if (queryText.includes('RankedUsers')) {
    const userId = params[0];
    const leaderboard = data.users.map(u => {
      const l = data.leaderboards.find(entry => entry.user_id === u.id);
      return {
        user_id: u.id,
        total_points: l ? l.total_points : 0,
        exact_matches_count: l ? l.exact_matches_count : 0,
        first_name: u.first_name
      };
    }).sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.exact_matches_count !== a.exact_matches_count) return b.exact_matches_count - a.exact_matches_count;
      return a.first_name.localeCompare(b.first_name);
    });

    const idx = leaderboard.findIndex(entry => entry.user_id === userId);
    const position = idx !== -1 ? idx + 1 : 0;
    const points = idx !== -1 ? leaderboard[idx].total_points : 0;

    return {
      rows: [{
        position: position,
        total_points: points
      }]
    };
  }

  // 24. SELECT leaderboard left join users
  if (queryText.includes('FROM users u LEFT JOIN leaderboards l ON u.id = l.user_id')) {
    const rows = data.users.map(u => {
      const l = data.leaderboards.find(entry => entry.user_id === u.id);
      return {
        user_id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        total_points: l ? l.total_points : 0,
        exact_matches_count: l ? l.exact_matches_count : 0,
        outcome_matches_count: l ? l.outcome_matches_count : 0
      };
    }).sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.exact_matches_count !== a.exact_matches_count) return b.exact_matches_count - a.exact_matches_count;
      return a.first_name.localeCompare(b.first_name);
    });
    if (queryText.includes('LIMIT $1') && params[0] !== undefined) {
      return { rows: rows.slice(0, params[0]) };
    }
    return { rows };
  }

  // 25. INSERT INTO auditoria
  if (queryText.startsWith('INSERT INTO auditoria')) {
    if (!data.auditoria) data.auditoria = [];
    const newAudit = {
      id: data.auditoria.length + 1,
      user_id: params[0],
      match_id: params[1],
      home_score: params[2],
      away_score: params[3],
      action_type: 'UPSERT',
      created_at: new Date()
    };
    data.auditoria.push(newAudit);
    saveJSONDb(data);
    return { rows: [newAudit] };
  }

  // 26. SELECT FROM auditoria JOIN users JOIN matches
  if (queryText.includes('FROM auditoria a JOIN users u ON a.user_id = u.id JOIN matches m ON a.match_id = m.id')) {
    if (!data.auditoria) data.auditoria = [];
    const rows = data.auditoria.map(a => {
      const u = data.users.find(user => user.id === a.user_id);
      const m = data.matches.find(match => match.id === a.match_id);
      return {
        id: a.id,
        user_id: a.user_id,
        match_id: a.match_id,
        home_score: a.home_score,
        away_score: a.away_score,
        created_at: a.created_at,
        first_name: u ? u.first_name : 'Usuario',
        last_name: u ? u.last_name : 'Desconocido',
        home_team: m ? m.home_team : 'Local',
        away_team: m ? m.away_team : 'Visitante'
      };
    }).sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
    return { rows };
  }

  console.warn(`Unmatched mock query: ${queryText}`);
  return { rows: [] };
}

module.exports = {
  query: mockQuery,
};
