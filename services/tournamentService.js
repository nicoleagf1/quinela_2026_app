const db = require('../config/db');
const Match = require('../models/Match');

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

class TournamentService {
  static async checkAndAdvanceStage() {
    console.log('[TournamentService] Checking if current stage is complete...');
    
    // Fetch all matches
    const matches = await Match.getAll();
    
    if (matches.length === 0) return;

    // 1. Group Stage -> Round of 32
    const groupMatches = matches.filter(m => m.stage.startsWith('Group '));
    const roundOf32MatchesExist = matches.some(m => m.stage === 'Round of 32');
    
    if (groupMatches.length > 0 && !roundOf32MatchesExist) {
      const allGroupsFinished = groupMatches.every(m => m.status === 'finished');
      if (allGroupsFinished) {
        await this.generateRoundOf32(groupMatches);
        return;
      }
    }

    // 2. Round of 32 -> Round of 16
    const r32Matches = matches.filter(m => m.stage === 'Round of 32');
    const roundOf16MatchesExist = matches.some(m => m.stage === 'Round of 16');
    
    if (r32Matches.length > 0 && !roundOf16MatchesExist) {
      const allR32Finished = r32Matches.every(m => m.status === 'finished');
      if (allR32Finished) {
        await this.generateRoundOf16(r32Matches);
        return;
      }
    }

    // 3. Round of 16 -> Quarterfinals
    const r16Matches = matches.filter(m => m.stage === 'Round of 16');
    const qfMatchesExist = matches.some(m => m.stage === 'Quarterfinals');
    
    if (r16Matches.length > 0 && !qfMatchesExist) {
      const allR16Finished = r16Matches.every(m => m.status === 'finished');
      if (allR16Finished) {
        await this.generateQuarterfinals(r16Matches);
        return;
      }
    }

    // 4. Quarterfinals -> Semifinals
    const qfMatches = matches.filter(m => m.stage === 'Quarterfinals');
    const sfMatchesExist = matches.some(m => m.stage === 'Semifinals');
    
    if (qfMatches.length > 0 && !sfMatchesExist) {
      const allQFFinished = qfMatches.every(m => m.status === 'finished');
      if (allQFFinished) {
        await this.generateSemifinals(qfMatches);
        return;
      }
    }

    // 5. Semifinals -> Final / Third Place
    const sfMatches = matches.filter(m => m.stage === 'Semifinals');
    const finalMatchesExist = matches.some(m => m.stage === 'Final' || m.stage === 'Third Place');
    
    if (sfMatches.length > 0 && !finalMatchesExist) {
      const allSFFinished = sfMatches.every(m => m.status === 'finished');
      if (allSFFinished) {
        await this.generateFinals(sfMatches);
        return;
      }
    }
  }

  static async generateRoundOf32(groupMatches) {
    console.log('[TournamentService] Advancing to Round of 32...');
    
    const groupStandings = {};
    
    // Initialize standings for all groups
    const letters = Object.keys(groupsData);
    letters.forEach(letter => {
      groupStandings[letter] = groupsData[letter].map(team => ({
        team,
        points: 0,
        gd: 0,
        gf: 0
      }));
    });

    // Calculate standings based on matches
    groupMatches.forEach(m => {
      const groupLetter = m.stage.replace('Group ', '');
      const standings = groupStandings[groupLetter];
      if (!standings) return;

      const homeRecord = standings.find(t => t.team === m.home_team);
      const awayRecord = standings.find(t => t.team === m.away_team);

      if (homeRecord && awayRecord) {
        const hs = m.home_score_actual;
        const as = m.away_score_actual;

        homeRecord.gf += hs;
        homeRecord.gd += (hs - as);
        awayRecord.gf += as;
        awayRecord.gd += (as - hs);

        if (hs > as) {
          homeRecord.points += 3;
        } else if (as > hs) {
          awayRecord.points += 3;
        } else {
          homeRecord.points += 1;
          awayRecord.points += 1;
        }
      }
    });

    // Sort each group standings
    letters.forEach(letter => {
      groupStandings[letter].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
    });

    // Gather third place teams
    const thirds = [];
    letters.forEach(letter => {
      const standings = groupStandings[letter];
      thirds.push({
        group: letter,
        ...standings[2] // 3rd place team
      });
    });

    // Sort thirds
    thirds.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    // Top 8 thirds qualify
    const bestThirds = thirds.slice(0, 8).map(t => t.team);

    // Helpers to get Winner and Runner Up
    const W = (letter) => groupStandings[letter][0].team;
    const R = (letter) => groupStandings[letter][1].team;

    // Define pairings chronologically starting June 29, 2026
    const pairings = [
      { home: R('A'), away: R('B'), date: '2026-06-29T12:00:00Z' }, // Match 1
      { home: W('C'), away: R('F'), date: '2026-06-29T15:00:00Z' }, // Match 2
      { home: W('E'), away: bestThirds[0], date: '2026-06-29T18:00:00Z' }, // Match 3
      { home: W('F'), away: R('C'), date: '2026-06-29T21:00:00Z' }, // Match 4
      
      { home: R('E'), away: R('I'), date: '2026-06-30T12:00:00Z' }, // Match 5
      { home: W('I'), away: bestThirds[1], date: '2026-06-30T15:00:00Z' }, // Match 6
      { home: W('A'), away: bestThirds[2], date: '2026-06-30T18:00:00Z' }, // Match 7
      { home: W('L'), away: bestThirds[3], date: '2026-06-30T21:00:00Z' }, // Match 8
      
      { home: W('G'), away: bestThirds[4], date: '2026-07-01T12:00:00Z' }, // Match 9
      { home: W('D'), away: bestThirds[5], date: '2026-07-01T15:00:00Z' }, // Match 10
      { home: W('H'), away: R('J'), date: '2026-07-01T18:00:00Z' }, // Match 11
      { home: R('K'), away: R('L'), date: '2026-07-01T21:00:00Z' }, // Match 12
      
      { home: W('B'), away: bestThirds[6], date: '2026-07-02T12:00:00Z' }, // Match 13
      { home: R('D'), away: R('G'), date: '2026-07-02T15:00:00Z' }, // Match 14
      { home: W('J'), away: R('H'), date: '2026-07-02T18:00:00Z' }, // Match 15
      { home: W('K'), away: bestThirds[7], date: '2026-07-02T21:00:00Z' }  // Match 16
    ];

    // Insert Round of 32 matches
    for (let i = 0; i < pairings.length; i++) {
      const p = pairings[i];
      await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
         VALUES ($1, $2, $3, $4)`,
        ['Round of 32', p.home, p.away, new Date(p.date)]
      );
    }
    console.log('[TournamentService] Created 16 Round of 32 matches successfully.');
  }

  static async generateRoundOf16(r32Matches) {
    console.log('[TournamentService] Advancing to Round of 16...');
    
    // Sort matches by ID to correspond to Match 1 to Match 16
    r32Matches.sort((a, b) => a.id - b.id);
    const win = (m) => m.winner_team;

    const pairings = [
      { home: win(r32Matches[0]), away: win(r32Matches[1]), date: '2026-07-04T12:00:00Z' }, // Match 17
      { home: win(r32Matches[2]), away: win(r32Matches[3]), date: '2026-07-04T16:00:00Z' }, // Match 18
      { home: win(r32Matches[4]), away: win(r32Matches[5]), date: '2026-07-05T12:00:00Z' }, // Match 19
      { home: win(r32Matches[6]), away: win(r32Matches[7]), date: '2026-07-05T16:00:00Z' }, // Match 20
      { home: win(r32Matches[8]), away: win(r32Matches[9]), date: '2026-07-06T12:00:00Z' }, // Match 21
      { home: win(r32Matches[10]), away: win(r32Matches[11]), date: '2026-07-06T16:00:00Z' }, // Match 22
      { home: win(r32Matches[12]), away: win(r32Matches[13]), date: '2026-07-07T12:00:00Z' }, // Match 23
      { home: win(r32Matches[14]), away: win(r32Matches[15]), date: '2026-07-07T16:00:00Z' }  // Match 24
    ];

    for (let i = 0; i < pairings.length; i++) {
      const p = pairings[i];
      await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
         VALUES ($1, $2, $3, $4)`,
        ['Round of 16', p.home, p.away, new Date(p.date)]
      );
    }
    console.log('[TournamentService] Created 8 Round of 16 matches successfully.');
  }

  static async generateQuarterfinals(r16Matches) {
    console.log('[TournamentService] Advancing to Quarterfinals...');
    
    r16Matches.sort((a, b) => a.id - b.id);
    const win = (m) => m.winner_team;

    const pairings = [
      { home: win(r16Matches[0]), away: win(r16Matches[1]), date: '2026-07-10T14:00:00Z' }, // Match 25
      { home: win(r16Matches[2]), away: win(r16Matches[3]), date: '2026-07-10T18:00:00Z' }, // Match 26
      { home: win(r16Matches[4]), away: win(r16Matches[5]), date: '2026-07-11T14:00:00Z' }, // Match 27
      { home: win(r16Matches[6]), away: win(r16Matches[7]), date: '2026-07-11T18:00:00Z' }  // Match 28
    ];

    for (let i = 0; i < pairings.length; i++) {
      const p = pairings[i];
      await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
         VALUES ($1, $2, $3, $4)`,
        ['Quarterfinals', p.home, p.away, new Date(p.date)]
      );
    }
    console.log('[TournamentService] Created 4 Quarterfinal matches successfully.');
  }

  static async generateSemifinals(qfMatches) {
    console.log('[TournamentService] Advancing to Semifinals...');
    
    qfMatches.sort((a, b) => a.id - b.id);
    const win = (m) => m.winner_team;

    const pairings = [
      { home: win(qfMatches[0]), away: win(qfMatches[1]), date: '2026-07-14T18:00:00Z' }, // Match 29
      { home: win(qfMatches[2]), away: win(qfMatches[3]), date: '2026-07-15T18:00:00Z' }  // Match 30
    ];

    for (let i = 0; i < pairings.length; i++) {
      const p = pairings[i];
      await db.query(
        `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
         VALUES ($1, $2, $3, $4)`,
        ['Semifinals', p.home, p.away, new Date(p.date)]
      );
    }
    console.log('[TournamentService] Created 2 Semifinal matches successfully.');
  }

  static async generateFinals(sfMatches) {
    console.log('[TournamentService] Advancing to Finals...');
    
    sfMatches.sort((a, b) => a.id - b.id);
    const win = (m) => m.winner_team;
    
    // Determine losers for the 3rd place match
    const getLoser = (m) => {
      return m.winner_team === m.home_team ? m.away_team : m.home_team;
    };

    // Third Place Match
    await db.query(
      `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
       VALUES ($1, $2, $3, $4)`,
      ['Third Place', getLoser(sfMatches[0]), getLoser(sfMatches[1]), new Date('2026-07-18T16:00:00Z')]
    );

    // Grand Final Match
    await db.query(
      `INSERT INTO matches (stage, home_team, away_team, kickoff_time)
       VALUES ($1, $2, $3, $4)`,
      ['Final', win(sfMatches[0]), win(sfMatches[1]), new Date('2026-07-19T16:00:00Z')]
    );
    
    console.log('[TournamentService] Created Third Place and Grand Final matches successfully.');
  }
}

module.exports = TournamentService;
