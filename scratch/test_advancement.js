const db = require('../config/db');
const Match = require('../models/Match');
const TournamentService = require('../services/tournamentService');

async function runTest() {
  console.log('--- STARTING TOURNAMENT ADVANCEMENT INTEGRATION TEST ---');
  try {
    // 1. Get all matches
    const allMatchesInitial = await Match.getAll();
    let groupMatches = allMatchesInitial.filter(m => m.stage.startsWith('Group '));
    console.log(`Found ${groupMatches.length} group stage matches.`);

    if (groupMatches.length === 0) {
      console.error('No group matches found! Please run node seed_worldcup.js first.');
      process.exit(1);
    }

    // 2. Simulate random scores for all group stage matches
    console.log('Simulating results for all group stage matches...');
    for (let m of groupMatches) {
      const hs = Math.floor(Math.random() * 4);
      const as = Math.floor(Math.random() * 4);
      let winner = null;
      if (hs > as) winner = m.home_team;
      else if (as > hs) winner = m.away_team;
      
      // Use Match model to update score
      await Match.updateScore(m.id, hs, as, winner);
    }
    console.log('All group stage match scores updated.');

    // 3. Trigger advancement check
    await TournamentService.checkAndAdvanceStage();

    // 4. Verify R32 matches exist
    const allMatchesAfter = await Match.getAll();
    const r32Matches = allMatchesAfter.filter(m => m.stage === 'Round of 32');
    console.log(`Result: Found ${r32Matches.length} matches in stage 'Round of 32'.`);

    if (r32Matches.length === 16) {
      console.log('SUCCESS: All 16 Round of 32 matches were successfully generated!');
      console.log('Sample Round of 32 matches:');
      r32Matches.slice(0, 4).forEach(m => {
        console.log(`- Match #${m.id} [${m.stage}]: ${m.home_team} vs ${m.away_team} at ${m.kickoff_time}`);
      });
    } else {
      console.error(`FAILURE: Expected 16 matches, but found ${r32Matches.length}.`);
    }

  } catch (err) {
    console.error('Test encountered an error:', err);
  }
}

runTest();
