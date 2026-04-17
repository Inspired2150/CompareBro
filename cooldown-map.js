/**
 * Offensive Cooldown Map
 * specID → array of major offensive / throughput cooldowns
 *
 * Each entry: { id: spellID, name: string, cd: seconds }
 *   - id:   WoW spell ID (matches abilityGameID in WCL events)
 *   - name: display name
 *   - cd:   base cooldown in seconds (used to calculate theoretical max casts)
 *
 * Covers all 38 specs as of The War Within Season 2.
 * Hero-talent CDs are included — if the player didn't talent them, they simply
 * won't appear in the cast log and will show 0 uses.
 */

module.exports = {

  /* ────────────────────────── WARRIOR ────────────────────────── */

  // Arms
  71: [
    { id: 107574, name: 'Avatar',           cd: 90  },
    { id: 167105, name: 'Colossus Smash',   cd: 45  },
    { id: 262161, name: 'Warbreaker',       cd: 45  },
    { id: 227847, name: 'Bladestorm',       cd: 90  },
    { id: 384318, name: 'Thunderous Roar',  cd: 90  },
    { id: 376079, name: "Champion's Spear", cd: 90  },
    { id: 436358, name: 'Demolish',         cd: 90  },  // Colossus hero
  ],

  // Fury
  72: [
    { id: 1719,   name: 'Recklessness',     cd: 90  },
    { id: 107574, name: 'Avatar',            cd: 90  },
    { id: 46924,  name: 'Bladestorm',        cd: 60  },
    { id: 228920, name: 'Ravager',           cd: 90  },
    { id: 384318, name: 'Thunderous Roar',   cd: 90  },
    { id: 376079, name: "Champion's Spear",  cd: 90  },
    { id: 385059, name: "Odyn's Fury",       cd: 45  },
  ],

  // Protection
  73: [
    { id: 107574, name: 'Avatar',            cd: 90  },
    { id: 228920, name: 'Ravager',           cd: 90  },
    { id: 384318, name: 'Thunderous Roar',   cd: 90  },
    { id: 376079, name: "Champion's Spear",  cd: 90  },
    { id: 436358, name: 'Demolish',          cd: 90  },
    { id: 1160,   name: 'Demoralizing Shout',cd: 45  },
  ],

  /* ────────────────────────── DEATH KNIGHT ───────────────────── */

  // Blood
  250: [
    { id: 49028,  name: 'Dancing Rune Weapon', cd: 120 },
    { id: 383269, name: 'Abomination Limb',    cd: 120 },
    { id: 455395, name: 'Raise Dead',           cd: 120 },
  ],

  // Frost
  251: [
    { id: 51271,  name: 'Pillar of Frost',       cd: 60  },
    { id: 47568,  name: 'Empower Rune Weapon',   cd: 120 },
    { id: 152279, name: 'Breath of Sindragosa',   cd: 120 },
    { id: 383269, name: 'Abomination Limb',       cd: 120 },
    { id: 279302, name: 'Frostwyrm\'s Fury',      cd: 180 },
  ],

  // Unholy
  252: [
    { id: 42650,  name: 'Army of the Dead',    cd: 480 },
    { id: 49206,  name: 'Summon Gargoyle',      cd: 180 },
    { id: 63560,  name: 'Dark Transformation',  cd: 45  },
    { id: 207289, name: 'Unholy Assault',        cd: 90  },
    { id: 275699, name: 'Apocalypse',            cd: 45  },
    { id: 383269, name: 'Abomination Limb',      cd: 120 },
  ],

  /* ────────────────────────── PALADIN ────────────────────────── */

  // Holy
  65: [
    { id: 31884,  name: 'Avenging Wrath',    cd: 120 },
    { id: 31821,  name: 'Aura Mastery',       cd: 180 },
    { id: 105809, name: 'Holy Avenger',        cd: 180 },
    { id: 414170, name: 'Daybreak',            cd: 60  },
    { id: 216331, name: 'Avenging Crusader',   cd: 120 },
  ],

  // Protection
  66: [
    { id: 31884,  name: 'Avenging Wrath',     cd: 120 },
    { id: 389539, name: 'Sentinel',            cd: 120 },
    { id: 387174, name: 'Eye of Tyr',          cd: 60  },
    { id: 327193, name: 'Moment of Glory',     cd: 90  },
    { id: 375576, name: 'Divine Toll',          cd: 60  },
  ],

  // Retribution
  70: [
    { id: 31884,  name: 'Avenging Wrath',      cd: 120 },
    { id: 231895, name: 'Crusade',              cd: 120 },
    { id: 343721, name: 'Final Reckoning',      cd: 60  },
    { id: 343527, name: 'Execution Sentence',   cd: 60  },
    { id: 255937, name: 'Wake of Ashes',         cd: 30  },
    { id: 375576, name: 'Divine Toll',            cd: 60  },
  ],

  /* ────────────────────────── HUNTER ─────────────────────────── */

  // Beast Mastery
  253: [
    { id: 19574,  name: 'Bestial Wrath',     cd: 90  },
    { id: 359844, name: 'Call of the Wild',    cd: 120 },
    { id: 321530, name: 'Bloodshed',           cd: 60  },
    { id: 201430, name: 'Stampede',             cd: 120 },
    { id: 120679, name: 'Dire Beast',           cd: 20  },
  ],

  // Marksmanship
  254: [
    { id: 288613, name: 'Trueshot',          cd: 120 },
    { id: 260243, name: 'Volley',             cd: 45  },
    { id: 400456, name: 'Salvo',              cd: 45  },
    { id: 53209,  name: 'Lone Wolf',          cd: 0   },
  ],

  // Survival
  255: [
    { id: 360952, name: 'Coordinated Assault', cd: 120 },
    { id: 360966, name: 'Spearhead',            cd: 90  },
    { id: 203415, name: 'Fury of the Eagle',    cd: 45  },
    { id: 259489, name: 'Kill Command',          cd: 0   },
  ],

  /* ────────────────────────── ROGUE ──────────────────────────── */

  // Assassination
  259: [
    { id: 360194, name: 'Deathmark',              cd: 120 },
    { id: 385627, name: 'Kingsbane',               cd: 60  },
    { id: 381802, name: 'Indiscriminate Carnage',  cd: 45  },
    { id: 360194, name: 'Shiv (empowered)',         cd: 25  },
  ],

  // Outlaw
  260: [
    { id: 13750,  name: 'Adrenaline Rush',    cd: 180 },
    { id: 51690,  name: 'Killing Spree',       cd: 90  },
    { id: 381989, name: 'Keep it Rolling',      cd: 420 },
    { id: 196937, name: 'Ghostly Strike',       cd: 35  },
    { id: 315341, name: 'Between the Eyes',     cd: 45  },
  ],

  // Subtlety
  261: [
    { id: 121471, name: 'Shadow Blades',     cd: 180 },
    { id: 185313, name: 'Shadow Dance',       cd: 60  },
    { id: 280719, name: 'Secret Technique',   cd: 45  },
    { id: 384631, name: 'Flagellation',        cd: 90  },
  ],

  /* ────────────────────────── PRIEST ─────────────────────────── */

  // Discipline
  256: [
    { id: 10060,  name: 'Power Infusion',     cd: 120 },
    { id: 246287, name: 'Evangelism',           cd: 90  },
    { id: 47536,  name: 'Rapture',              cd: 90  },
    { id: 34433,  name: 'Shadowfiend',          cd: 180 },
    { id: 200174, name: 'Mindbender',            cd: 60  },
  ],

  // Holy
  257: [
    { id: 64843,  name: 'Divine Hymn',          cd: 180 },
    { id: 265202, name: 'Holy Word: Salvation',  cd: 720 },
    { id: 200183, name: 'Apotheosis',             cd: 120 },
    { id: 10060,  name: 'Power Infusion',         cd: 120 },
    { id: 34433,  name: 'Shadowfiend',             cd: 180 },
  ],

  // Shadow
  258: [
    { id: 228260, name: 'Void Eruption',       cd: 120 },
    { id: 391109, name: 'Dark Ascension',       cd: 60  },
    { id: 10060,  name: 'Power Infusion',       cd: 120 },
    { id: 34433,  name: 'Shadowfiend',           cd: 180 },
    { id: 200174, name: 'Mindbender',             cd: 60  },
    { id: 263165, name: 'Void Torrent',            cd: 45  },
  ],

  /* ────────────────────────── SHAMAN ─────────────────────────── */

  // Elemental
  262: [
    { id: 114050, name: 'Ascendance',            cd: 180 },
    { id: 191634, name: 'Stormkeeper',            cd: 60  },
    { id: 198067, name: 'Fire Elemental',          cd: 150 },
    { id: 192249, name: 'Storm Elemental',          cd: 150 },
    { id: 192222, name: 'Liquid Magma Totem',       cd: 30  },
  ],

  // Enhancement
  263: [
    { id: 51533,  name: 'Feral Spirit',       cd: 90  },
    { id: 114051, name: 'Ascendance',          cd: 180 },
    { id: 384352, name: 'Doom Winds',           cd: 60  },
    { id: 197214, name: 'Sundering',             cd: 40  },
  ],

  // Restoration
  264: [
    { id: 108280, name: 'Healing Tide Totem',  cd: 180 },
    { id: 98008,  name: 'Spirit Link Totem',    cd: 180 },
    { id: 114052, name: 'Ascendance',            cd: 180 },
    { id: 207399, name: 'Ancestral Protection',  cd: 300 },
  ],

  /* ────────────────────────── MAGE ───────────────────────────── */

  // Arcane
  62: [
    { id: 365350, name: 'Arcane Surge',       cd: 90  },
    { id: 321507, name: 'Touch of the Magi',  cd: 45  },
    { id: 12051,  name: 'Evocation',           cd: 90  },
    { id: 153626, name: 'Arcane Orb',           cd: 40  },
  ],

  // Fire
  63: [
    { id: 190319, name: 'Combustion',          cd: 120 },
    { id: 257541, name: 'Phoenix Flames',       cd: 25  },
    { id: 153561, name: 'Meteor',                cd: 45  },
  ],

  // Frost
  64: [
    { id: 12472,  name: 'Icy Veins',          cd: 120 },
    { id: 84714,  name: 'Frozen Orb',          cd: 60  },
    { id: 153595, name: 'Comet Storm',          cd: 30  },
    { id: 205021, name: 'Ray of Frost',          cd: 60  },
  ],

  /* ────────────────────────── WARLOCK ────────────────────────── */

  // Affliction
  265: [
    { id: 205180, name: 'Summon Darkglare',  cd: 120 },
    { id: 386997, name: 'Soul Rot',           cd: 60  },
    { id: 278350, name: 'Vile Taint',          cd: 25  },
  ],

  // Demonology
  266: [
    { id: 265187, name: 'Summon Demonic Tyrant', cd: 90  },
    { id: 267217, name: 'Nether Portal',          cd: 180 },
    { id: 111898, name: 'Grimoire: Felguard',     cd: 120 },
  ],

  // Destruction
  267: [
    { id: 1122,   name: 'Summon Infernal',       cd: 180 },
    { id: 196447, name: 'Channel Demonfire',      cd: 25  },
    { id: 152108, name: 'Cataclysm',              cd: 30  },
  ],

  /* ────────────────────────── MONK ───────────────────────────── */

  // Brewmaster
  268: [
    { id: 132578, name: 'Invoke Niuzao',        cd: 120 },
    { id: 386276, name: 'Bonedust Brew',          cd: 60  },
    { id: 387184, name: 'Weapons of Order',       cd: 120 },
    { id: 325153, name: 'Exploding Keg',           cd: 60  },
  ],

  // Windwalker
  269: [
    { id: 137639, name: 'Storm, Earth, and Fire', cd: 90  },
    { id: 123904, name: 'Invoke Xuen',             cd: 120 },
    { id: 152173, name: 'Serenity',                 cd: 90  },
    { id: 386276, name: 'Bonedust Brew',             cd: 60  },
    { id: 392983, name: 'Strike of the Windlord',   cd: 40  },
  ],

  // Mistweaver
  270: [
    { id: 115310, name: 'Revival',               cd: 180 },
    { id: 325197, name: 'Invoke Chi-Ji',           cd: 180 },
    { id: 322118, name: 'Invoke Yu\'lon',           cd: 180 },
    { id: 116849, name: 'Life Cocoon',              cd: 120 },
    { id: 388615, name: 'Restoral',                  cd: 180 },
  ],

  /* ────────────────────────── DRUID ──────────────────────────── */

  // Balance
  102: [
    { id: 194223, name: 'Celestial Alignment',           cd: 180 },
    { id: 102560, name: 'Incarnation: Chosen of Elune',  cd: 180 },
    { id: 202770, name: 'Fury of Elune',                  cd: 60  },
    { id: 391528, name: 'Convoke the Spirits',             cd: 120 },
    { id: 202425, name: 'Warrior of Elune',                cd: 45  },
  ],

  // Feral
  103: [
    { id: 106951, name: 'Berserk',                           cd: 180 },
    { id: 102543, name: 'Incarnation: Avatar of Ashamane',   cd: 180 },
    { id: 391528, name: 'Convoke the Spirits',                cd: 60  },
    { id: 274837, name: 'Feral Frenzy',                        cd: 45  },
    { id: 106839, name: 'Skull Bash',                          cd: 15  },
  ],

  // Guardian
  104: [
    { id: 50334,  name: 'Berserk',                            cd: 180 },
    { id: 102558, name: 'Incarnation: Guardian of Ursoc',     cd: 180 },
    { id: 200851, name: 'Rage of the Sleeper',                 cd: 90  },
    { id: 391528, name: 'Convoke the Spirits',                  cd: 120 },
  ],

  // Restoration
  105: [
    { id: 740,    name: 'Tranquility',                        cd: 180 },
    { id: 33891,  name: 'Incarnation: Tree of Life',           cd: 180 },
    { id: 391528, name: 'Convoke the Spirits',                  cd: 120 },
    { id: 197721, name: 'Flourish',                              cd: 60  },
  ],

  /* ────────────────────────── DEMON HUNTER ───────────────────── */

  // Havoc
  577: [
    { id: 191427, name: 'Metamorphosis',     cd: 240 },
    { id: 370965, name: 'The Hunt',           cd: 90  },
    { id: 258860, name: 'Essence Break',       cd: 40  },
    { id: 390163, name: 'Elysian Decree',      cd: 60  },
    { id: 198013, name: 'Eye Beam',             cd: 30  },
  ],

  // Vengeance
  581: [
    { id: 187827, name: 'Metamorphosis',     cd: 180 },
    { id: 204021, name: 'Fiery Brand',        cd: 60  },
    { id: 212084, name: 'Fel Devastation',     cd: 40  },
    { id: 370965, name: 'The Hunt',             cd: 90  },
    { id: 390163, name: 'Elysian Decree',       cd: 60  },
  ],

  /* ────────────────────────── EVOKER ─────────────────────────── */

  // Devastation
  1467: [
    { id: 375087, name: 'Dragonrage',        cd: 120 },
    { id: 370553, name: 'Tip the Scales',     cd: 120 },
    { id: 357210, name: 'Deep Breath',         cd: 120 },
  ],

  // Preservation
  1468: [
    { id: 359816, name: 'Dream Flight',       cd: 120 },
    { id: 363534, name: 'Rewind',              cd: 240 },
    { id: 370553, name: 'Tip the Scales',       cd: 120 },
    { id: 370537, name: 'Stasis',                cd: 90  },
  ],

  // Augmentation
  1473: [
    { id: 403631, name: 'Breath of Eons',      cd: 120 },
    { id: 370553, name: 'Tip the Scales',        cd: 120 },
    { id: 395152, name: 'Ebon Might',             cd: 30  },
    { id: 409311, name: 'Prescience',              cd: 12  },
  ],
};
