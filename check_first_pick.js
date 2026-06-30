const data = require('./dashboard_compact_data.json');
const posList = ['QB','RB','WR','TE','K','DEF'];

function getRound(pick) {
  if (!pick) return null;
  const parts = String(pick).split('.');
  return parts.length >= 1 ? parseInt(parts[0]) : null;
}

// For each owner+year, find the round of their FIRST pick at each position
// Then average those first-pick rounds across all years
const ownerFirstPick = {};
data.drafts.forEach(d => {
  const owner = data.ownerMap[d.team] || d.team;
  if (!owner || !d.pos || !d.pick || !d.yr) return;
  const round = getRound(d.pick);
  if (round === null) return;
  
  if (!ownerFirstPick[owner]) ownerFirstPick[owner] = {};
  if (!ownerFirstPick[owner][d.yr]) ownerFirstPick[owner][d.yr] = {};
  const yearData = ownerFirstPick[owner][d.yr];
  
  // Only keep if this is the earliest round for this pos this year
  if (!yearData[d.pos] || round < yearData[d.pos]) {
    yearData[d.pos] = round;
  }
});

// Now average across years
const ownerAvgFirstRound = {};
Object.entries(ownerFirstPick).forEach(([owner, years]) => {
  ownerAvgFirstRound[owner] = {};
  posList.forEach(pos => {
    const rounds = [];
    Object.values(years).forEach(yearData => {
      if (yearData[pos]) rounds.push(yearData[pos]);
    });
    if (rounds.length > 0) {
      const avg = rounds.reduce((a,b) => a+b, 0) / rounds.length;
      ownerAvgFirstRound[owner][pos] = { avg, count: rounds.length };
    }
  });
});

// Print sample
const owners = Object.keys(ownerAvgFirstRound).sort();
console.log('Avg round of FIRST pick at each position:\n');
const header = 'Owner                 ' + posList.map(p=>p.padStart(8)).join('');
console.log(header);
console.log('-'.repeat(header.length));
owners.forEach(o => {
  const name = o.padEnd(20);
  const vals = posList.map(pos => {
    const d = ownerAvgFirstRound[o]?.[pos];
    if (!d) return '    —'.padStart(8);
    return d.avg.toFixed(1).padStart(8);
  });
  console.log(name + vals.join(''));
});
