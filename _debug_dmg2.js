const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'wcl-config.json'), 'utf8'));

async function go() {
  const tokRes = await fetch('https://www.warcraftlogs.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }).toString(),
  });
  const tok = await tokRes.json();

  // Replicate exactly what the server does
  const q = `query {
    reportData { report(code: "P8CzWtpJHbjTGn7K") {
      fights { id name }
      damageTable: table(fightIDs: [5], dataType: DamageDone, sourceID: 3)
    }}
  }`;

  const r = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + tok.access_token,
    },
    body: JSON.stringify({ query: q }),
  });

  const j = await r.json();
  if (j.errors) {
    console.log('ERRORS:', j.errors);
    return;
  }

  const dt = j.data?.reportData?.report?.damageTable;
  console.log('Type:', typeof dt);
  if (!dt) { console.log('damageTable is null/undefined'); return; }

  // The table field can return a JSON object directly or as a string
  let parsed = dt;
  if (typeof dt === 'string') {
    parsed = JSON.parse(dt);
    console.log('Was string, parsed');
  }

  console.log('Top-level keys:', Object.keys(parsed));
  if (parsed.data) {
    console.log('data keys:', Object.keys(parsed.data));
    console.log('data.entries count:', parsed.data.entries?.length);
    if (parsed.data.entries?.length) {
      const e = parsed.data.entries[0];
      console.log('First entry:', e.name, e.total);
    }
  }
  if (parsed.entries) {
    console.log('entries count:', parsed.entries.length);
    if (parsed.entries.length) {
      const e = parsed.entries[0];
      console.log('First entry:', e.name, e.total);
    }
  }

  // Check totalTime
  console.log('totalTime:', parsed.totalTime);
  console.log('Full structure (truncated):', JSON.stringify(parsed).substring(0, 500));
}

go().catch(e => console.error(e));
