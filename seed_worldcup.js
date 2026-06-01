const db = require('./config/db');

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
  console.log('Seeding World Cup 2026 matches...');
  try {
    // Generate some matches (First Round Group Stage)
    // 48 teams = 12 groups of 4
    
    // We will shuffle teams
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    
    // Create groups
    const groups = [];
    for(let i = 0; i < 12; i++) {
        groups.push(shuffled.slice(i * 4, (i + 1) * 4));
    }
    
    let baseDate = new Date('2026-06-11T16:00:00Z'); // World Cup start date
    
    for (let i = 0; i < 12; i++) {
      const groupLetter = String.fromCharCode(65 + i);
      const team1 = groups[i][0];
      const team2 = groups[i][1];
      const team3 = groups[i][2];
      const team4 = groups[i][3];

      // Match 1
      await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time) VALUES ($1, $2, $3, $4)`,
        [`Group ${groupLetter}`, team1, team2, new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000))]
      );

      // Match 2
      await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time) VALUES ($1, $2, $3, $4)`,
        [`Group ${groupLetter}`, team3, team4, new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000))] // 4 hours later
      );
    }

    console.log('Seed completed. Inserted 24 matches.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding matches:', err);
    process.exit(1);
  }
}

seed();
