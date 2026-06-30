const fs = require('fs');
const html = fs.readFileSync('dashboard_v3.html', 'utf8');
const data = require('./dashboard_compact_data.json');
const output = html.replace('/*DATA_PLACEHOLDER*/{}', JSON.stringify(data));
fs.writeFileSync('dashboard.html', output);
console.log('Built dashboard.html. Size:', fs.statSync('dashboard.html').size, 'bytes');
console.log('Howard titles:', data.championships['Howard Lew'] || 'NONE');
