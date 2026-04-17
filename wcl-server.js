/**
 * WCL Comparison Server
 * A tiny zero-dependency Node.js server that proxies Warcraft Logs API v2
 * and serves the comparison HTML page.
 *
 * Usage:
 *   1. Create a WCL API client at https://www.warcraftlogs.com/api/clients
 *   2. Copy wcl-config.example.json → wcl-config.json and fill in your credentials
 *   3. Run: node wcl-server.js
 *   4. Open http://localhost:3000 in your browser
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;

// ── Load talent name mapping ──────────────────────────────
let TALENT_MAP = {};
try {
  TALENT_MAP = JSON.parse(fs.readFileSync(path.join(__dirname, 'talent-map.json'), 'utf8'));
  console.log(`Loaded ${Object.keys(TALENT_MAP).length} talent name mappings.`);
} catch (_) {
  console.warn('⚠  talent-map.json not found – talent names will show as IDs.');
  console.warn('   Run: node _build_talent_map.js   to generate it.');
}

// ── Load credentials ────────────────────────────────────────
let CLIENT_ID     = process.env.WCL_CLIENT_ID     || '';
let CLIENT_SECRET = process.env.WCL_CLIENT_SECRET || '';

try {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'wcl-config.json'), 'utf8'));
  if (!CLIENT_ID)     CLIENT_ID     = cfg.clientId     || '';
  if (!CLIENT_SECRET) CLIENT_SECRET = cfg.clientSecret || '';
} catch (_) { /* file not found — rely on env vars */ }

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('');
  console.error('  ✖  Missing WCL API credentials.');
  console.error('');
  console.error('  1. Go to  https://www.warcraftlogs.com/api/clients');
  console.error('  2. Create a new client (any name, http://localhost as redirect)');
  console.error('  3. Copy  wcl-config.example.json  →  wcl-config.json');
  console.error('  4. Paste your Client ID and Client Secret');
  console.error('');
  process.exit(1);
}

// ── OAuth2 token ────────────────────────────────────────────
let accessToken  = '';
let tokenExpires = 0;

async function getToken() {
  if (accessToken && Date.now() < tokenExpires - 60_000) return accessToken;

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch('https://www.warcraftlogs.com/oauth/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(data.error_description || 'Token request failed');

  accessToken  = data.access_token;
  tokenExpires = Date.now() + (data.expires_in || 3600) * 1000;
  return accessToken;
}

// ── GraphQL helper ──────────────────────────────────────────
async function gql(query, variables = {}) {
  const token = await getToken();
  const res = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
  return json.data;
}

// ── Parse a WCL URL ─────────────────────────────────────────
function parseWCLUrl(urlStr) {
  const url = new URL(urlStr);
  const code = url.pathname.split('/').filter(Boolean).pop();
  // fight & source can be in query string (?fight=18) or hash (#fight=18)
  const params = new URLSearchParams(url.search + '&' + (url.hash || '').replace('#', ''));
  return {
    code,
    fight:  params.get('fight')  || 'last',
    source: params.get('source') ? parseInt(params.get('source')) : null,
  };
}

// ── Spec ID map (WCL specID → readable names) ──────────────
const SPEC_MAP = {
  62: ['Mage','Arcane'],        63: ['Mage','Fire'],            64: ['Mage','Frost'],
  65: ['Paladin','Holy'],       66: ['Paladin','Protection'],   70: ['Paladin','Retribution'],
  71: ['Warrior','Arms'],       72: ['Warrior','Fury'],         73: ['Warrior','Protection'],
  102:['Druid','Balance'],      103:['Druid','Feral'],          104:['Druid','Guardian'],     105:['Druid','Restoration'],
  250:['DeathKnight','Blood'],  251:['DeathKnight','Frost'],    252:['DeathKnight','Unholy'],
  253:['Hunter','BeastMastery'],254:['Hunter','Marksmanship'],  255:['Hunter','Survival'],
  256:['Priest','Discipline'],  257:['Priest','Holy'],          258:['Priest','Shadow'],
  259:['Rogue','Assassination'],260:['Rogue','Outlaw'],         261:['Rogue','Subtlety'],
  262:['Shaman','Elemental'],   263:['Shaman','Enhancement'],   264:['Shaman','Restoration'],
  265:['Warlock','Affliction'],  266:['Warlock','Demonology'],   267:['Warlock','Destruction'],
  268:['Monk','Brewmaster'],    269:['Monk','Windwalker'],      270:['Monk','Mistweaver'],
  577:['DemonHunter','Havoc'],  581:['DemonHunter','Vengeance'],
  1467:['Evoker','Devastation'],1468:['Evoker','Preservation'], 1473:['Evoker','Augmentation'],
};

// ── Fetch character data from a WCL report ──────────────────
async function fetchCharacter(urlStr) {
  const { code, fight: fightParam, source: sourceId } = parseWCLUrl(urlStr);

  /* Step 1 — resolve fight ID (handle "last") */
  let fightId;
  if (fightParam === 'last' || isNaN(parseInt(fightParam))) {
    const { reportData } = await gql(`
      query($code: String!) {
        reportData { report(code: $code) {
          fights { id }
        }}
      }`, { code });
    const fights = reportData.report.fights;
    fightId = fights[fights.length - 1].id;
  } else {
    fightId = parseInt(fightParam);
  }

  /* Step 2 — get fight info, actors, playerDetails, combatantinfo events AND damage table */
  const { reportData } = await gql(`
    query($code: String!, $fightIDs: [Int!], $sourceID: Int) {
      reportData { report(code: $code) {
        fights(fightIDs: $fightIDs) {
          id  name  keystoneLevel  difficulty
          gameZone { name }
        }
        masterData {
          actors(type: "Player") { id  name  server  type  subType }
        }
        playerDetails(fightIDs: $fightIDs)
        events(fightIDs: $fightIDs, dataType: CombatantInfo, sourceID: $sourceID, limit: 1) {
          data
        }
        damageTable: table(fightIDs: $fightIDs, dataType: DamageDone, sourceID: $sourceID)
      }}
    }`, { code, fightIDs: [fightId], sourceID: sourceId });

  const report = reportData.report;
  const fight  = report.fights[0];
  const actors = report.masterData.actors;

  // Resolve source actor
  const actor = sourceId ? actors.find(a => a.id === sourceId) : null;
  const playerName = actor?.name;

  // playerDetails — for class/spec/ilvl info
  let pd = report.playerDetails;
  if (pd && typeof pd === 'string') pd = JSON.parse(pd);
  const details = pd?.data?.playerDetails || pd;

  let playerInfo = null;
  for (const role of ['tanks', 'healers', 'dps']) {
    const list = details?.[role] || [];
    const found = list.find(p =>
      (playerName && p.name === playerName) || p.id === sourceId
    );
    if (found) { playerInfo = found; break; }
  }

  // combatantInfo events — the real stat data
  const evData = report.events?.data || [];
  const ev = evData[0] || {};

  // Resolve class/spec from specID or playerDetails
  const specInfo = SPEC_MAP[ev.specID] || [];
  const className = playerInfo?.type  || specInfo[0] || actor?.type || 'Unknown';
  const specName  = specInfo[1] || '';

  // Detect hero spec from talents in event data
  let heroSpec = '';
  const talentTree = ev.talents || [];
  const heroSpecs = {
    'Mountain Thane': ['Thunder Blast', 'Flashing Skies', "Thorim's Might", 'Storm Bolts', 'Keep Your Feet on the Ground'],
    'Colossus':       ['Demolish', 'Colossal Might', 'No Stranger to Pain', 'Mountain of Muscle and Scars'],
    'Slayer':         ['Slayer\'s Dominance', 'Vicious Agility', 'Culling Cyclone', 'Brutal Finish'],
    'Deathbringer':   ['Reapers Mark', 'Wave of Souls', 'Blood Fever'],
    'Rider of the Apocalypse': ['Rider\'s Champion', 'Horsemen\'s Aid'],
    'San\'layn':      ['Vampiric Strike', 'Gift of the San\'layn'],
    'Herald of the Sun': ['Dawnlight', 'Sun Sear', 'Aurora'],
    'Lightsmith':     ['Holy Bulwark', 'Sacred Weapon', 'Rite of Sanctification'],
    'Templar':        ['Templar\'s Verdict', 'Light\'s Guidance'],
    'Keeper of the Grove': ['Force of Nature', 'Grove Guardians', 'Power of Nature'],
    'Elune\'s Chosen': ['Boundless Moonlight', 'Lunar Insight'],
    'Wildstalker':    ['Bloodseeker Vines', 'Root Network'],
    'Dark Ranger':    ['Black Arrow', 'Smoke Screen'],
    'Pack Leader':    ['Vicious Hunt', 'Pack Coordination'],
    'Sentinel':       ['Sentinel', 'Catch Out'],
    'Diabolist':      ['Diabolic Ritual', 'Cloven Souls'],
    'Hellcaller':     ['Wither', 'Xalan\'s Cruelty'],
    'Soul Harvester': ['Demonic Soul', 'Soul Anathema'],
    'Frostfire':      ['Frostfire Bolt', 'Excess Frost', 'Excess Fire'],
    'Spellslinger':   ['Splinterstorm', 'Controlled Instincts'],
    'Sunfury':        ['Spellfire Sphere', 'Burden of Firepower'],
    'Conduit of the Celestials': ['Celestial Conduit', 'Heart of the Jade Serpent'],
    'Master of Harmony': ['Aspect of Harmony', 'Purified Spirit'],
    'Shado-Pan':      ['Flurry Strikes', 'Wisdom of the Wall'],
    'Stormbringer':   ['Tempest', 'Unlimited Power'],
    'Totemic':        ['Surging Totem', 'Lively Totems'],
    'Farseer':        ['Ancestral Swiftness', 'Elemental Reverb'],
    'Archon':         ['Power of the Archon', 'Resonant Energy'],
    'Oracle':         ['Premonition', 'Clairvoyance'],
    'Voidweaver':     ['Entropic Rift', 'Void Blast'],
    'Trickster':      ['Unseen Blade', 'Coup de Grace'],
    'Deathstalker':   ['Deathstalker\'s Mark', 'Follow the Blood'],
    'Scalecommander': ['Engulf', 'Melt Armor'],
    'Flameshaper':    ['Engulf', 'Titanic Precision'],
    'Chronowarden':   ['Warp', 'Temporal Burst'],
    'Aldrachi Reaver':['Art of the Glaive', 'Fury of the Aldrachi'],
    'Fel-Scarred':    ['Demonsurge', 'Burning Blades'],
  };

  if (talentTree.length > 0) {
    const talentNames = talentTree.map(t =>
      typeof t === 'string' ? t : t.name || t.talentName || ''
    );
    for (const [spec, keywords] of Object.entries(heroSpecs)) {
      if (keywords.some(kw => talentNames.some(tn =>
        tn.toLowerCase().includes(kw.toLowerCase())
      ))) {
        heroSpec = spec;
        break;
      }
    }
  }

  // Build the primary stat name based on class
  const mainStat = (ev.intellect > ev.strength && ev.intellect > ev.agility)
    ? { name: 'Intellect', value: ev.intellect || 0 }
    : (ev.agility > ev.strength)
      ? { name: 'Agility', value: ev.agility || 0 }
      : { name: 'Strength', value: ev.strength || 0 };
  // Parse damage table — top abilities sorted by total damage
  const rawTable = report.damageTable?.data || report.damageTable || {};
  const dmgEntries = (rawTable.entries || [])
    .filter(e => e.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(e => {
      const totalHits = (e.hitCount || 0) + (e.tickCount || 0);
      const totalCrits = (e.critHitCount || 0) + (e.critTickCount || 0);
      const critPct = totalHits > 0 ? +(totalCrits / totalHits * 100).toFixed(1) : 0;
      const avgHit = totalHits > 0 ? Math.round(e.total / totalHits) : 0;
      const maxHit = (e.hitdetails || []).reduce((mx, d) => Math.max(mx, d.max || 0), 0);
      return {
        name:    e.name,
        total:   e.total,
        uses:    e.uses || 0,
        hits:    totalHits,
        critPct,
        avgHit,
        maxHit,
        icon:    e.abilityIcon || '',
      };
    });

  // Total damage for percentage calculations
  const totalDamage = dmgEntries.reduce((s, e) => s + e.total, 0);
  return {
    log:         urlStr,
    name:        playerName || playerInfo?.name || 'Unknown',
    server:      actor?.server || playerInfo?.server || '',
    class:       className,
    spec:        specName,
    heroSpec,
    guild:       '',
    dungeon:     fight?.gameZone?.name || fight?.name || '',
    keyLevel:    fight?.keystoneLevel || 0,
    ilvl:        playerInfo?.maxItemLevel || playerInfo?.minItemLevel || 0,
    mainStat,
    stamina:     ev.stamina     || 0,
    crit:        ev.critMelee   || ev.critSpell  || 0,
    haste:       ev.hasteMelee  || ev.hasteSpell || 0,
    mastery:     ev.mastery     || 0,
    versatility: ev.versatilityDamageDone || 0,
    armor:       ev.armor       || 0,
    avoidance:   ev.avoidance   || 0,
    leech:       ev.leech       || 0,
    damageAbilities: dmgEntries,
    totalDamage,
    talents: (ev.talentTree || []).map(t => ({
      id:     t.id,
      nodeID: t.nodeID,
      rank:   t.rank || 1,
      name:   TALENT_MAP[String(t.id)] || `Unknown (${t.id})`,
    })),
  };
}

// ── HTTP server ─────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Serve the HTML page ──
  if (url.pathname === '/' || url.pathname === '/warcraft-stats.html') {
    try {
      const html = fs.readFileSync(path.join(__dirname, 'warcraft-stats.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Could not read warcraft-stats.html');
    }
    return;
  }

  // ── API: fetch & parse a WCL report URL ──
  if (url.pathname === '/api/wcl') {
    const wclUrl = url.searchParams.get('url');
    if (!wclUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing ?url= parameter' }));
      return;
    }

    try {
      const data = await fetchCharacter(wclUrl);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error('API error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

// ── Start ───────────────────────────────────────────────────
(async () => {
  console.log('🔑 Authenticating with Warcraft Logs API…');
  await getToken();
  console.log('✔  Token acquired.');

  server.listen(PORT, () => {
    console.log('');
    console.log(`🌐 Server ready → http://localhost:${PORT}`);
    console.log('   Open the URL above in your browser.');
    console.log('');
  });
})().catch(err => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
