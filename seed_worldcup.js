const db = require('./config/db');
const bcrypt = require('bcrypt');

const groupsData = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curaçao', 'Côte d\'Ivoire', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Norway', 'Iraq'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama']
};

function getMatchDate(round, groupIndex, matchInRound) {
  const roundStartDays = [0, 5, 10]; // Round 1 starts June 11, Round 2 June 16, Round 3 June 21
  const baseDate = new Date('2026-06-11T12:00:00Z');
  
  let dayOffset = 0;
  if (groupIndex < 2) dayOffset = 0; // Groups A, B on Day 0
  else if (groupIndex < 4) dayOffset = 1; // Groups C, D on Day 1
  else if (groupIndex < 6) dayOffset = 2; // Groups E, F on Day 2
  else if (groupIndex < 9) dayOffset = 3; // Groups G, H, I on Day 3
  else dayOffset = 4; // Groups J, K, L on Day 4
  
  const totalDaysOffset = roundStartDays[round] + dayOffset;
  const date = new Date(baseDate.getTime() + totalDaysOffset * 24 * 60 * 60 * 1000);
  
  let hourOffset = 12;
  if (groupIndex < 6) {
    const relativeGroup = groupIndex % 2;
    const slot = relativeGroup * 2 + matchInRound; // 0, 1, 2, 3
    hourOffset = 12 + slot * 2; // 12:00, 14:00, 16:00, 18:00
  } else {
    const relativeGroup = (groupIndex - 6) % 3;
    const slot = relativeGroup * 2 + matchInRound; // 0, 1, 2, 3, 4, 5
    hourOffset = 10 + slot * 2; // 10:00, 12:00, 14:00, 16:00, 18:00, 20:00
  }
  
  date.setUTCHours(hourOffset, 0, 0, 0);
  return date;
}

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

    console.log('Generating 72 group stage matches...');
    const groupLetters = Object.keys(groupsData);
    let matchCount = 0;

    for (let g = 0; g < groupLetters.length; g++) {
      const letter = groupLetters[g];
      const teams = groupsData[letter];
      const stageName = `Group ${letter}`;

      // Round-robin pairings
      // Round 1: T0 vs T1, T2 vs T3
      const round1 = [
        [teams[0], teams[1]],
        [teams[2], teams[3]]
      ];
      // Round 2: T0 vs T2, T1 vs T3
      const round2 = [
        [teams[0], teams[2]],
        [teams[1], teams[3]]
      ];
      // Round 3: T0 vs T3, T1 vs T2
      const round3 = [
        [teams[0], teams[3]],
        [teams[1], teams[2]]
      ];

      const rounds = [round1, round2, round3];

      for (let r = 0; r < rounds.length; r++) {
        const roundPairings = rounds[r];
        for (let m = 0; m < roundPairings.length; m++) {
          const [home, away] = roundPairings[m];
          const kickoff = getMatchDate(r, g, m);

          await db.query(
            `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
             VALUES ($1, $2, $3, $4)`,
            [stageName, home, away, kickoff]
          );
          matchCount++;
        }
      }
    }

    console.log(`Successfully seeded ${matchCount} official Group Stage matches.`);
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
