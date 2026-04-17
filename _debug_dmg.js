const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'wcl-config.json'), 'utf8'));

async function go() {
  // Get token
  const tok = await (await fetch('https://www.warcraftlogs.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${cfg.clientId}&client_secret=${cfg.clientSecret}`,
  })).json();
  console.log('Token OK');

  // Query damage done table for Armor (source=3, fight=last which is 5)
  const query = `query {
    reportData {
      report(code: "P8CzWtpJHbjTGn7K") {
        table(fightIDs: [5], dataType: DamageDone, sourceID: 3)
      }
    }
  }`;

  const r = await (await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tok.access_token}`,
    },
    body: JSON.stringify({ query }),
  })).json();

  const table = r.data?.reportData?.report?.table;
  console.log('Table type:', typeof table);
  console.log('Table keys:', Object.keys(table?.data || table || {}));

  // Show entries
  const entries = table?.data?.entries || [];
  console.log('\nEntries count:', entries.length);
  console.log('\nFirst entry keys:', entries[0] ? Object.keys(entries[0]) : 'none');

  // Show top 5 entries
  entries.slice(0, 8).forEach((e, i) => {
    console.log(`\n#${i+1}: ${e.name}`);
    console.log(`  Total: ${e.total?.toLocaleString()}`);
    console.log(`  Uses/Casts: ${e.uses ?? e.casts ?? e.hitCount ?? 'N/A'}`);
    console.log(`  Icon: ${e.icon}`);
    console.log(`  Type: ${e.type}`);
    // Print all keys to see what's available
    const { name, total, icon, type, ...rest } = e;
    console.log(`  Other keys:`, Object.keys(rest));
    if (i === 0) console.log('  Full first entry:', JSON.stringify(e, null, 2).substring(0, 1500));
  });
}

go().catch(e => console.error(e));
