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

async function gql(token, query) {
  const res = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ query }),
  });
  const j = await res.json();
  if (j.errors) console.log('ERRORS:', j.errors);
  return j.data;
}

async function main() {
  const token = await getToken();
  console.log('Token OK');

  // Try gameData ability lookup for a known talent ID
  // 112116 is the first talent ID from Armor's tree
  const sampleIds = [112116, 112149, 112151, 112128, 112179];

  // Method 1: gameData.ability
  for (const id of sampleIds.slice(0, 2)) {
    try {
      const d = await gql(token, `query { gameData { ability(id: ${id}) { id name icon } } }`);
      console.log(`ability(${id}):`, d?.gameData?.ability);
    } catch (e) {
      console.log(`ability(${id}) error:`, e.message);
    }
  }

  // Method 2: check masterData.abilities from the report
  const d2 = await gql(token, `query {
    reportData { report(code: "P8CzWtpJHbjTGn7K") {
      masterData {
        abilities { gameID name icon type }
      }
    }}
  }`);
  const abilities = d2?.reportData?.report?.masterData?.abilities || [];
  console.log('\nmasterData abilities count:', abilities.length);

  // Check if talent IDs appear in abilities list
  for (const id of sampleIds) {
    const found = abilities.find(a => a.gameID === id);
    console.log(`  ID ${id} in abilities:`, found ? found.name : 'NOT FOUND');
  }

  // Method 3: Try using the WCL playerDetails which might have talentTree info
  const d3 = await gql(token, `query {
    reportData { report(code: "P8CzWtpJHbjTGn7K") {
      playerDetails(fightIDs: [5])
    }}
  }`);
  let pd = d3?.reportData?.report?.playerDetails;
  if (typeof pd === 'string') pd = JSON.parse(pd);
  const details = pd?.data?.playerDetails || pd;
  
  // Look for talent data in playerDetails
  for (const role of ['tanks', 'healers', 'dps']) {
    const list = details?.[role] || [];
    for (const p of list) {
      if (p.name === 'Armor') {
        console.log('\nPlayerDetails for Armor:');
        console.log('  Has talents:', !!p.talents);
        console.log('  Has talentTree:', !!p.talentTree);
        console.log('  Keys:', Object.keys(p));
        if (p.talents?.length) {
          console.log('  First 3 talents:', p.talents.slice(0, 3));
        }
        if (p.talentTree?.length) {
          console.log('  First 3 talentTree:', p.talentTree.slice(0, 3));
        }
      }
    }
  }

  // Method 4: Try gameData.class for warrior (id 1)
  const d4 = await gql(token, `query {
    gameData { class(id: 1) {
      id name
      specs { id name }
    }}
  }`);
  console.log('\ngameData.class(1):', JSON.stringify(d4?.gameData?.class));
}

main().catch(e => console.error(e));
