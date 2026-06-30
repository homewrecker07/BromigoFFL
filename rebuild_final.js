const fs = require('fs');
const data = require('./sheet_data_fresh.json');

// Build ownerMap
const ownerMap = {};
data['Owner Names'].table.rows.forEach(r => {
  const team = r.c[0]?.v;
  const owner = r.c[1]?.v;
  if (team && owner) { ownerMap[team] = owner; ownerMap[team.toLowerCase()] = owner; }
});

function resolve(team) {
  if (!team) return null;
  if (ownerMap[team]) return ownerMap[team];
  const low = team.toLowerCase();
  if (ownerMap[low]) return ownerMap[low];
  if (team.endsWith('...')) {
    const prefix = team.slice(0, -3);
    for (const full of Object.keys(ownerMap)) { if (full.startsWith(prefix)) return ownerMap[full]; }
  }
  return null;
}

// H2H — resolve owners, remove corrupt
const h2h = data.H2HMatchupdata.table.rows.map(r => ({
  y: r.c[0]?.v, t: r.c[1]?.v, w: r.c[2]?.v, o: r.c[3]?.v, r: r.c[4]?.v,
  s: r.c[5]?.v, os: r.c[6]?.v,
  on: r.c[7]?.v || resolve(r.c[1]?.v),
  oon: r.c[8]?.v || resolve(r.c[3]?.v)
}));

let removed = 0;
const cleanH2H = h2h.filter(m => {
  if (!m.on || !m.oon) { removed++; return false; }
  if (String(m.on).includes('\n') || String(m.oon).includes('\n')) { removed++; return false; }
  if (m.on === 'Team' || m.oon === 'Team') { removed++; return false; }
  return true;
});
console.log('H2H: ' + cleanH2H.length + ' / ' + h2h.length + ' (removed ' + removed + ' corrupt)');

// Standings
const standings = data.standings.table.rows.map(r => ({
  y: r.c[0]?.v, rk: r.c[1]?.v, t: r.c[2]?.v, w: r.c[3]?.v, l: r.c[4]?.v,
  t2: r.c[5]?.v, pf: r.c[6]?.v, pa: r.c[7]?.v, st: r.c[8]?.v, wb: r.c[9]?.v, wm: r.c[10]?.v
}));

const standingsByYear = {};
standings.forEach(s => {
  if (!standingsByYear[s.y]) standingsByYear[s.y] = [];
  const owner = ownerMap[s.t] || s.t;
  standingsByYear[s.y].push({...s, owner});
});

// OwnerStats
const ownerStats = {};
cleanH2H.forEach(m => {
  const owner = m.on, opp = m.oon;
  if (!ownerStats[owner]) ownerStats[owner] = {wins:0, losses:0, pf:0, pa:0, matchups:{}};
  const s = ownerStats[owner];
  if (m.r === 'Win') s.wins++; else if (m.r === 'Loss') s.losses++;
  s.pf += (m.s || 0); s.pa += (m.os || 0);
  if (!s.matchups[opp]) s.matchups[opp] = {wins:0, losses:0};
  if (m.r === 'Win') s.matchups[opp].wins++; else if (m.r === 'Loss') s.matchups[opp].losses++;
});

// Championships
const championships = {};
standings.filter(s => s.rk === 1).forEach(s => {
  const owner = ownerMap[s.t] || s.owner;
  if (!championships[owner]) championships[owner] = [];
  championships[owner].push(s.y);
});

// Drafts — check for IDP positions to exclude
const allPos = [...new Set(data.Draftresults.table.rows.map(r=>r.c[5]?.v).filter(Boolean))].sort();
console.log('Draft positions:', allPos.join(', '));

// Filter out IDP positions
const idpPositions = new Set(['DL','LB','DB','DE','DT','CB','S','EDGE','IDP']);
const drafts = data.Draftresults.table.rows
  .filter(r => !idpPositions.has(r.c[5]?.v))
  .map(r => ({
    pick: r.c[0]?.v, player: r.c[1]?.v, team: r.c[2]?.v, yr: r.c[3]?.v,
    nfl: r.c[4]?.v, pos: r.c[5]?.v, pts: r.c[6]?.v
  }));

const compactData = { ownerMap, h2h: cleanH2H, standings, standingsByYear, drafts, ownerStats, championships };
fs.writeFileSync('dashboard_compact_data.json', JSON.stringify(compactData));

const owners = Object.keys(ownerStats).sort((a,b) => ownerStats[b].wins - ownerStats[a].wins);
console.log('\nOwners (' + owners.length + '):');
owners.forEach(o => {
  const s = ownerStats[o], total = s.wins + s.losses;
  const wpct = total > 0 ? (s.wins/total*100).toFixed(1) : '0.0';
  const titles = championships[o] ? championships[o].length : 0;
  const badKeys = Object.keys(s.matchups).filter(k => !owners.includes(k));
  console.log('  ' + o + ': ' + s.wins + '-' + s.losses + ' (' + wpct + '%) T:' + titles + (badKeys.length ? ' BAD:' + badKeys.join(',') : ''));
});

// Draft analysis quick check
const rosterSlots = {QB:1, RB:2, WR:3, TE:1, K:1, DEF:1};
const validPos = new Set(Object.keys(rosterSlots));
const draftPos = [...new Set(drafts.map(d=>d.pos).filter(Boolean))].sort();
console.log('\nFiltered draft positions:', draftPos.join(', '));
console.log('Drafts total:', drafts.length);

// Check K picks now
const kPicks = drafts.filter(d => d.pos === 'K');
console.log('K picks:', kPicks.length, '(sample:', kPicks.slice(0,2).map(d=>d.player+' '+d.yr).join(', '), ')');
