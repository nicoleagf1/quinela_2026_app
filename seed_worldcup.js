const db = require('./config/db');
const bcrypt = require('bcrypt');

const teams = [
  'Canada', 'Mexico', 'United States',
  'Algeria', 'Cabo Verde', 'Congo DR', 'Côte d\'Ivoire', 'Egypt', 'Ghana', 'Morocco', 'Senegal', 'South Africa', 'Tunisia',
  'Australia', 'IR Iran', 'Iraq', 'Japan', 'Jordan', 'Korea Republic', 'Qatar', 'Saudi Arabia', 'Uzbekistan',
  'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Croatia', 'Czechia', 'England', 'France', 'Germany', 'Netherlands', 'Norway', 'Portugal', 'Scotland', 'Spain', 'Sweden', 'Switzerland', 'Türkiye',
  'Curaçao', 'Haiti', 'Panama',
  'New Zealand',
  'Argentina', 'Brazil', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay'
];

async function seed() {
  console.log('Clearing database tables...');
  try {
    await db.query('TRUNCATE TABLE leaderboards, predictions, matches, users CASCADE');
    console.log('Tables cleared.');

    console.log('Seeding admin and test users...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('adminpassword', salt);
    const userHash = await bcrypt.hash('userpassword', salt);

    // Create Admin
    const adminRes = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Admin', 'Quiniela', 'admin@quiniela2026.com', adminHash, 'admin']
    );
    const adminId = adminRes.rows[0].id;

    // Create User 1
    const user1Res = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Juan', 'Pérez', 'user1@quiniela2026.com', userHash, 'user']
    );
    const user1Id = user1Res.rows[0].id;

    // Create User 2
    const user2Res = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['María', 'Rodríguez', 'user2@quiniela2026.com', userHash, 'user']
    );
    const user2Id = user2Res.rows[0].id;

    console.log('Users seeded:');
    console.log('- Admin: admin@quiniela2026.com / adminpassword');
    console.log('- User 1: user1@quiniela2026.com / userpassword');
    console.log('- User 2: user2@quiniela2026.com / userpassword');

    // Seed Matches
    console.log('Seeding matches...');
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const groups = [];
    for(let i = 0; i < 12; i++) {
        groups.push(shuffled.slice(i * 4, (i + 1) * 4));
    }
    
    let baseDate = new Date('2026-06-11T16:00:00Z');
    const matchIds = [];
    
    for (let i = 0; i < 12; i++) {
      const groupLetter = String.fromCharCode(65 + i);
      const team1 = groups[i][0];
      const team2 = groups[i][1];
      const team3 = groups[i][2];
      const team4 = groups[i][3];

      // Match 1
      const res1 = await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time) VALUES ($1, $2, $3, $4) RETURNING id`,
        [`Group ${groupLetter}`, team1, team2, new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000))]
      );
      matchIds.push(res1.rows[0].id);

      // Match 2
      const res2 = await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time) VALUES ($1, $2, $3, $4) RETURNING id`,
        [`Group ${groupLetter}`, team3, team4, new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000))] // 4 hours later
      );
      matchIds.push(res2.rows[0].id);
    }
    console.log(`Inserted ${matchIds.length} matches.`);

    // Seed Predictions
    console.log('Seeding user predictions...');
    // User 1 predicts first 5 matches
    for (let i = 0; i < 5; i++) {
      await db.query(
        `INSERT INTO predictions (user_id, match_id, home_score_predicted, away_score_predicted)
         VALUES ($1, $2, $3, $4)`,
        [user1Id, matchIds[i], Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)]
      );
    }
    // User 2 predicts first 5 matches
    for (let i = 0; i < 5; i++) {
      await db.query(
        `INSERT INTO predictions (user_id, match_id, home_score_predicted, away_score_predicted)
         VALUES ($1, $2, $3, $4)`,
        [user2Id, matchIds[i], Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)]
      );
    }
    console.log('Predictions seeded.');

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
