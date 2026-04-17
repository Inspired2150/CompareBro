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
  return (await res.json()).data;
}

async function main() {
  const token = await getToken();

  // Check playerDetails.combatantInfo
  const d = await gql(token, `query {
    reportData { report(code: "P8CzWtpJHbjTGn7K") {
      playerDetails(fightIDs: [5])
    }}
  }`);
  let pd = d?.reportData?.report?.playerDetails;
  if (typeof pd === 'string') pd = JSON.parse(pd);
  const details = pd?.data?.playerDetails || pd;

  for (const role of ['tanks', 'healers', 'dps']) {
    for (const p of (details?.[role] || [])) {
      if (p.name === 'Armor') {
        console.log('combatantInfo keys:', Object.keys(p.combatantInfo || {}));
        const ci = p.combatantInfo || {};
        console.log('has talentTree:', !!ci.talentTree);
        console.log('talentTree length:', ci.talentTree?.length);
        if (ci.talentTree?.length) {
          console.log('First 5:', ci.talentTree.slice(0, 5).map(t => JSON.stringify(t)));
        }
        // Check all keys that might contain talent info
        for (const [k, v] of Object.entries(ci)) {
          if (typeof v === 'object' && v !== null) {
            const isArr = Array.isArray(v);
            console.log(`  ci.${k}: ${isArr ? 'array[' + v.length + ']' : 'object'}`);
          }
        }
      }
    }
  }

  // Try to look up talent IDs via wowhead (just one)
  // Let's try the Blizzard talent-tree API style lookup
  // Actually, let's try to query for GameAbility by the spellID
  // Talent entries have {id, rank, nodeID} - the id might be a spell ID
  // Let's check common Prot Warrior spells
  // Shield Slam = 23922, Thunder Clap = 6343, Devastator = 228000
  // Let's see if any of the talentTree IDs match known spell IDs
  const ev = await gql(token, `query {
    reportData { report(code: "P8CzWtpJHbjTGn7K") {
      events(fightIDs: [5], dataType: CombatantInfo, sourceID: 3, limit: 1) { data }
    }}
  }`);
  const talents = ev.reportData.report.events.data[0].talentTree;
  console.log('\n=== All talent IDs ===');
  const ids = talents.map(t => t.id);
  console.log(ids.join(', '));
  console.log('\n=== All nodeIDs ===');
  const nodeIds = talents.map(t => t.nodeID);
  console.log(nodeIds.join(', '));

  // Check if IDs are in the hundreds of thousands range (spell IDs are usually in that range)
  // Or check Wowhead for a known one
  // Let's try fetching ability data for a known spell ID
  const knownSpells = [23922, 6343, 228000, 1160, 2565, 871];
  for (const sid of knownSpells) {
    const r = await gql(token, `query { gameData { ability(id: ${sid}) { id name icon } } }`);
    const ab = r?.gameData?.ability;
    if (ab) console.log(`spell ${sid}: ${ab.name}`);
    else console.log(`spell ${sid}: NOT FOUND`);
  }

  // Try a couple talent IDs as spell IDs
  for (const sid of ids.slice(0, 5)) {
    const r = await gql(token, `query { gameData { ability(id: ${sid}) { id name icon } } }`);
    const ab = r?.gameData?.ability;
    if (ab) console.log(`talentID ${sid}: ${ab.name} (${ab.icon})`);
    else console.log(`talentID ${sid}: NOT IN gameData`);
  }

  // Maybe these are WoW talent entry IDs which need Blizzard API
  // Let's try fetching talent info from Blizzard API
  // First try Wowhead URL approach
  console.log('\nSample wowhead URLs to try:');
  console.log(`https://www.wowhead.com/talent-calc/blizzard/${ids.slice(0, 3).join(',')}`);
  console.log(`https://www.wowhead.com/spell=${ids[0]}`);
}

main().catch(e => console.error(e));
