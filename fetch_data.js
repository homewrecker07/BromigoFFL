const https = require('https');
const fs = require('fs');

function fetchGviz(sheet) {
  return new Promise((resolve, reject) => {
    const url = 'https://docs.google.com/spreadsheets/d/1y1aEqvUtd6qn7v3MpNHGQXKK8xbPgXDQRGH68fWVS2E/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(sheet);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonStr = data.slice(data.indexOf('{'), data.lastIndexOf('}') + 1);
          resolve(JSON.parse(jsonStr));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const sheets = ['H2HMatchupdata', 'standings', 'Owner Names', 'Draftresults'];
  const result = {};
  for (const s of sheets) {
    console.log('Fetching:', s);
    try {
      result[s] = await fetchGviz(s);
      console.log(s, 'rows:', result[s].table.rows.length, 'cols:', result[s].table.cols.map(c=>c.label).join(', '));
    } catch(e) {
      console.log(s, 'error:', e.message);
    }
  }
  fs.writeFileSync('sheet_data_fresh.json', JSON.stringify(result, null, 2));
  console.log('Done. Saved to sheet_data_fresh.json');
  console.log('File size:', fs.statSync('sheet_data_fresh.json').size, 'bytes');
}
main();
