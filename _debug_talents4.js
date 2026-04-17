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
  return await res.json();
}

async function main() {
  const token = await getToken();

  // 1. Try introspection to find talent-related types
  const intro = await gql(token, `{
    __schema { queryType { fields { name description } } }
  }`);
  console.log('Top-level query fields:');
  for (const f of intro.data.__schema.queryType.fields) {
    console.log(`  ${f.name}: ${f.description || ''}`);
  }

  // 2. Check gameData type
  const gd = await gql(token, `{
    __type(name: "GameData") { fields { name type { name kind ofType { name } } } }
  }`);
  console.log('\nGameData fields:');
  for (const f of gd.data.__type.fields) {
    const tn = f.type.name || f.type.ofType?.name || f.type.kind;
    console.log(`  ${f.name}: ${tn}`);
  }

  // 3. Check if there's a way to look up talents through WCL's character endpoint
  const charType = await gql(token, `{
    __type(name: "Character") { fields { name type { name kind ofType { name } } } }
  }`);
  if (charType.data?.__type) {
    console.log('\nCharacter fields:');
    for (const f of charType.data.__type.fields) {
      const tn = f.type.name || f.type.ofType?.name || f.type.kind;
      console.log(`  ${f.name}: ${tn}`);
    }
  }

  // 4. Check characterData
  const cdType = await gql(token, `{
    __type(name: "CharacterData") { fields { name type { name kind ofType { name } } } }
  }`);
  if (cdType.data?.__type) {
    console.log('\nCharacterData fields:');
    for (const f of cdType.data.__type.fields) {
      const tn = f.type.name || f.type.ofType?.name || f.type.kind;
      console.log(`  ${f.name}: ${tn}`);
    }
  }

  // 5. Try to fetch character profile (might have talents)
  const charData = await gql(token, `{
    characterData {
      character(name: "Armor", serverSlug: "kazzak", serverRegion: "eu") {
        name classID
      }
    }
  }`);
  console.log('\ncharacterData.character:', JSON.stringify(charData.data?.characterData?.character));
}

main().catch(e => console.error(e));
