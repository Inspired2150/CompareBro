const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'wcl-config.json'), 'utf8'));

async function getToken() {
  const res = await fetch('https://www.warcraftlogs.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }).toString(),
  });
  return (await res.json()).access_token;
}

async function gql(token, query, variables = {}) {
  const res = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()).data;
}

async function main() {
  const token = await getToken();
  console.log('Token OK');

  // Player: Armor (sourceID 3, fight 5)
  const d1 = await gql(token, `query {
    reportData { report(code: "P8CzWtpJHbjTGn7K") {
      events(fightIDs: [5], dataType: CombatantInfo, sourceID: 3, limit: 1) { data }
    }}
  }`);

  const ev1 = d1.reportData.report.events.data[0];
  console.log('\n=== PLAYER (Armor) ===');
  console.log('Has talents:', !!ev1.talents);
  console.log('Talents type:', typeof ev1.talents, Array.isArray(ev1.talents));
  console.log('Talents length:', ev1.talents?.length);
  if (ev1.talents?.length) {
    console.log('\nFirst 3 talents:');
    ev1.talents.slice(0, 3).forEach((t, i) => {
      console.log(`  [${i}]`, JSON.stringify(t));
    });
    console.log('\nAll talent keys from first:', Object.keys(ev1.talents[0]));
    console.log('\nAll talent names:');
    ev1.talents.forEach((t, i) => {
      const name = t.name || t.talentName || t.id || '(no name)';
      console.log(`  ${i}: ${name} (id: ${t.id || t.talentID || t.guid || '?'})`);
    });
  }

  // Also check: talentTree, customPowerSet, pvpTalents
  console.log('\nHas talentTree:', !!ev1.talentTree);
  console.log('talentTree length:', ev1.talentTree?.length);
  if (ev1.talentTree?.length) {
    console.log('\nFirst 3 talentTree entries:');
    ev1.talentTree.slice(0, 3).forEach((t, i) => {
      console.log(`  [${i}]`, JSON.stringify(t));
    });
    console.log('\nAll talentTree names:');
    ev1.talentTree.forEach((t, i) => {
      const name = t.name || t.talentName || '(no name)';
      console.log(`  ${i}: ${name}`);
    });
  }

  // Opponent: Gillick (sourceID 6, fight 2)
  const d2 = await gql(token, `query {
    reportData { report(code: "bzrhBMd8kytN1qLc") {
      events(fightIDs: [2], dataType: CombatantInfo, sourceID: 6, limit: 1) { data }
    }}
  }`);

  const ev2 = d2.reportData.report.events.data[0];
  console.log('\n=== OPPONENT (Gillick) ===');
  console.log('Has talents:', !!ev2.talents);
  console.log('Talents length:', ev2.talents?.length);
  console.log('Has talentTree:', !!ev2.talentTree);
  console.log('talentTree length:', ev2.talentTree?.length);
  if (ev2.talentTree?.length) {
    console.log('\nAll talentTree names:');
    ev2.talentTree.forEach((t, i) => {
      const name = t.name || t.talentName || '(no name)';
      console.log(`  ${i}: ${name}`);
    });
  }

  // Print all keys in the event we might have missed
  const allKeys = Object.keys(ev1).filter(k => k.toLowerCase().includes('talent') || k.toLowerCase().includes('power') || k.toLowerCase().includes('pvp') || k.toLowerCase().includes('tree'));
  console.log('\nTalent-related top-level keys:', allKeys);
}

main().catch(e => console.error(e));
