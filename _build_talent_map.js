// Downloads talent mapping tables from wago.tools and builds a
// TraitNodeEntryID → SpellName lookup JSON file.

const fs = require('fs');
const path = require('path');

const TABLES = {
  traitNodeEntry:  'https://wago.tools/db2/TraitNodeEntry/csv',
  traitDefinition: 'https://wago.tools/db2/TraitDefinition/csv',
  spellName:       'https://wago.tools/db2/SpellName/csv',
};

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',');
    if (vals.length < headers.length) continue;
    const obj = {};
    headers.forEach((h, idx) => obj[h] = vals[idx]?.trim());
    rows.push(obj);
  }
  return { headers, rows };
}

async function main() {
  // Step 1: Fetch TraitNodeEntry → get TraitDefinitionID for each entry
  console.log('Fetching TraitNodeEntry...');
  const entryRes = await fetch(TABLES.traitNodeEntry);
  console.log('  Status:', entryRes.status, 'Size:', entryRes.headers.get('content-length'));
  const entryText = await entryRes.text();
  console.log('  Text length:', entryText.length);
  const entryCSV = parseCSV(entryText);
  console.log('  Headers:', entryCSV.headers);
  console.log('  Rows:', entryCSV.rows.length);
  if (entryCSV.rows.length) console.log('  First row:', entryCSV.rows[0]);

  // Step 2: Fetch TraitDefinition → get SpellID
  console.log('\nFetching TraitDefinition...');
  const defRes = await fetch(TABLES.traitDefinition);
  console.log('  Status:', defRes.status, 'Size:', defRes.headers.get('content-length'));
  const defText = await defRes.text();
  console.log('  Text length:', defText.length);
  const defCSV = parseCSV(defText);
  console.log('  Headers:', defCSV.headers);
  console.log('  Rows:', defCSV.rows.length);
  if (defCSV.rows.length) console.log('  First row:', defCSV.rows[0]);

  // Step 3: Fetch SpellName → get Name
  console.log('\nFetching SpellName...');
  const spellRes = await fetch(TABLES.spellName);
  console.log('  Status:', spellRes.status, 'Size:', spellRes.headers.get('content-length'));
  const spellText = await spellRes.text();
  console.log('  Text length:', spellText.length);
  const spellCSV = parseCSV(spellText);
  console.log('  Headers:', spellCSV.headers);
  console.log('  Rows:', spellCSV.rows.length);
  if (spellCSV.rows.length) console.log('  First row:', spellCSV.rows[0]);

  // Build chain: entryID → defID → spellID → name
  // entry: ID → TraitDefinitionID
  const entryToDef = {};
  for (const row of entryCSV.rows) {
    const id = row['ID'] || row['id'];
    const defId = row['TraitDefinitionID'] || row[entryCSV.headers[1]];
    if (id && defId) entryToDef[id] = defId;
  }

  // def: ID → SpellID (or OverridesSpellID)
  const defToSpell = {};
  for (const row of defCSV.rows) {
    const id = row['ID'] || row['id'];
    const spellId = row['SpellID'] || row['OverridesSpellID'] || row[defCSV.headers[1]];
    if (id && spellId && spellId !== '0') defToSpell[id] = spellId;
  }

  // spell: ID → Name_lang
  const spellNames = {};
  for (const row of spellCSV.rows) {
    const id = row['ID'] || row['id'];
    const name = row['Name_lang'] || row[spellCSV.headers[1]];
    if (id && name) spellNames[id] = name;
  }

  // Build final mapping: TraitNodeEntryID → talent name
  const mapping = {};
  let resolved = 0;
  for (const [entryId, defId] of Object.entries(entryToDef)) {
    const spellId = defToSpell[defId];
    if (spellId && spellNames[spellId]) {
      mapping[entryId] = spellNames[spellId];
      resolved++;
    }
  }

  console.log(`\nResolved ${resolved} / ${Object.keys(entryToDef).length} talent entries`);

  // Test with our known IDs
  const testIds = [112116, 112149, 112151, 112152, 112154];
  for (const id of testIds) {
    console.log(`  ${id} → ${mapping[id] || 'NOT FOUND'}`);
  }

  // Save mapping
  const outPath = path.join(__dirname, 'talent-map.json');
  fs.writeFileSync(outPath, JSON.stringify(mapping, null, 0));
  console.log(`\nSaved ${Object.keys(mapping).length} entries to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
}

main().catch(e => console.error(e));
