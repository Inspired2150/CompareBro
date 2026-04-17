<p align="center">
  <img src="https://img.shields.io/badge/World%20of%20Warcraft-Comparison%20Tool-c79c6e?style=for-the-badge&logo=battle.net&logoColor=white" alt="CompareBro Badge"/>
</p>

<h1 align="center">⚔️ CompareBro</h1>

<p align="center">
  <strong>Side-by-side WCL character comparison tool for World of Warcraft</strong><br/>
  <em>Compare stats, talents, and damage breakdowns from Warcraft Logs reports</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js" alt="Node 18+"/>
  <img src="https://img.shields.io/badge/dependencies-zero-blue?style=flat-square" alt="Zero Dependencies"/>
  <img src="https://img.shields.io/badge/API-Warcraft%20Logs%20v2-orange?style=flat-square" alt="WCL API v2"/>
</p>

---

## 🚀 Quick Start

### 1. Get WCL API Credentials

Go to [warcraftlogs.com/api/clients](https://www.warcraftlogs.com/api/clients) and create a new client.  
Use `http://localhost` as the redirect URL.

### 2. Configure

```bash
cp wcl-config.example.json wcl-config.json
```

Edit `wcl-config.json` with your credentials:

```json
{
  "clientId":     "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}
```

### 3. Run

```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **Stat Comparison** | Side-by-side primary & secondary stats with visual ring charts |
| **Talent Trees** | Full talent build comparison with shared/unique highlighting |
| **Damage Breakdown** | Top 10 abilities with crit %, avg hit, and damage share |
| **Cooldown Tracking** | Offensive CD efficiency (used vs theoretical max), expandable cast timeline |
| **Hero Spec Detection** | Auto-detects hero talent specialization from talent data |
| **All Classes** | Supports every class and spec in The War Within |

## 🏗️ How It Works

```
Browser  ──►  Node.js Server (port 3000)  ──►  Warcraft Logs API v2 (GraphQL)
              │
              ├─ GET /                → serves warcraft-stats.html
              └─ GET /api/wcl?url=... → fetches & parses WCL report data
```

1. Paste two Warcraft Logs URLs into the UI  
2. The server authenticates via OAuth2 and queries the WCL GraphQL API  
3. Stats, talents, and damage data are parsed and returned as JSON  
4. The frontend renders a beautiful side-by-side comparison

## 📁 Project Structure

```
CompareBro/
├── wcl-server.js            # Node.js server — API proxy & static host
├── warcraft-stats.html      # Single-page frontend (self-contained)
├── cooldown-map.js          # specID → offensive cooldown definitions (all 38 specs)
├── talent-map.json          # TraitNodeEntryID → spell name lookup
├── _build_talent_map.js     # Script to regenerate talent-map.json
├── wcl-config.example.json  # Template for API credentials
├── wcl-config.json          # Your credentials (git-ignored)
└── package.json
```

## 🔧 Rebuilding the Talent Map

The talent name map is pre-built, but if WoW updates talent IDs:

```bash
npm run build-talents
```

This fetches data from [wago.tools](https://wago.tools) and rebuilds `talent-map.json`.

---

<p align="center">
  <sub>Built with ☕ and too many M+ keys</sub>
</p>
