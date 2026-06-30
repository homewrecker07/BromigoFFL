# 🏈 BromigosFFL Fantasy Football League Dashboard

A comprehensive, fact-checked dashboard for the **BromigosFFL** fantasy football league, covering **15 seasons (2010–2025)** with **11 owners**.

**Live site:** https://homewrecker07.github.io/BromigoFFL/

---

## 📊 Dashboard Features

### 6 Tabs
| Tab | What It Shows |
|-----|---------------|
| **Overview** | Championships, win records, titles per owner |
| **Standings** | Year-by-year final rankings, wins/losses |
| **Head-to-Head** | All-time matchup records between every pair of owners |
| **Rivalries** | Most-played matchups & closest rivalries |
| **Drafts** | Draft analysis: avg round of first pick per position, ideal roster scores, NFL team preferences |
| **Records** | League records, biggest blowouts, highest scores |

---

## 🔧 Build Pipeline

The dashboard is built from Google Sheet data → JSON → self-contained HTML.

```
fetch_data.js         → Pulls live data from Google Sheets (H2H, Standings, Drafts)
  ↓
sheet_data_fresh.json → Raw exported data
  ↓
rebuild_final.js      → Cleans, resolves owners, computes championships & stats
  ↓
dashboard_compact_data.json  → Processed data bundle
  ↓
build_v3.js           → Injects data into HTML template
  ↓
index.html            → Self-contained dashboard (no external dependencies)
```

### To rebuild from scratch:

```bash
# 1. Fetch fresh data from Google Sheets
node fetch_data.js

# 2. Rebuild compact data
node rebuild_final.js

# 3. Generate dashboard HTML
node build_v3.js
# then rename: copy dashboard.html index.html
```

### Files

| File | Purpose |
|------|---------|
| `index.html` | The live dashboard (self-contained, ~550KB) |
| `dashboard_v3.html` | HTML template with `DATA` placeholder |
| `dashboard_compact_data.json` | Processed data bundle |
| `sheet_data_fresh.json` | Raw Google Sheet export |
| `fetch_data.js` | Fetches data via Google Sheets CSV API |
| `rebuild_final.js` | Cleans data, computes championships from Rank column |
| `build_v3.js` | Injects JSON into template → final HTML |
| `check_first_pick.js` | Draft strategy analysis (first pick per position) |

---

## 📋 Data Sources

All data comes from the official BromigosFFL Google Sheets:
- **H2HMatchupdata** — Every head-to-head matchup (2,056 rows)
- **Standings** — Year-by-year records and final rankings (Rank = 1 is champion)
- **Draftresults** — Full draft history with owner, player, position, round, NFL team
- **Owner Names** — Maps owner names to team names

---

## 🏆 Championship Rules

Championships are determined by the **"Rank" column in the standings sheet** (Rank 1 = league champion). This is the single source of truth — **not** re-sorted by win count.

### All-Time Champions (2010–2025)

| Year | Champion |
|------|----------|
| 2010 | Son Trinh |
| 2011 | Heng Chhour |
| 2012 | Heng Chhour |
| 2013 | Henry Chhour |
| 2014 | Brian Chai |
| 2015 | Minh Trinh |
| 2016 | Michael Luckenbill |
| 2017 | Son Trinh |
| 2018 | Heng Chhour |
| 2019 | Johnny Wong |
| 2020 | Calvin Fong |
| 2022 | Calvin Fong |
| 2023 | Minh Trinh |
| 2024 | Michael Luckenbill |
| 2025 | Brian Abrams |

Howard Lew has **0 titles**.

---

## 👥 Owners (All-Time)

| Owner | Years Active | All-Time Record |
|-------|-------------|-----------------|
| Johnny Wong | 2010–2025 | 144–70 |
| Heng Chhour | 2010–2025 | 122–92 |
| Henry Chhour | 2010–2025 | 117–97 |
| Calvin Fong | 2010–2025 | 110–104 |
| Howard Lew | 2010–2025 | 97–117 |
| Minh Trinh | 2010–2025 | 92–122 |
| Michael Luckenbill | 2010–2025 | 90–124 |
| Brian Chai | 2010–2018 | 86–100 |
| Brian Abrams | 2010–2025 | 82–90 |
| Son Trinh | 2010–2017 | 71–99 |
| Mercede Tran | 2010–2012 | 15–15 |

---

## ⚠️ Known Quirks

- **Draft team names** are sometimes truncated in the source sheet (e.g., "YourFace is..."). Fuzzy matching resolves these to the correct owner.
- **IDP positions** (DL, LB, DB, DE, DT, CB, S, EDGE) are excluded from draft analysis — only QB, RB, WR, TE, K, DEF are included.
- **2 corrupt H2H rows** were removed (newline-separated team names, unresolvable).

---

## 🔄 Deployment

The site is served via **GitHub Pages** from this repo's `main` branch. The `index.html` file is the entire dashboard — no build step needed for visitors. Just push to `main` and GitHub Pages handles the rest.

---

*Built with ❤️ by the BromigosFFL tech team (Kel & friends).*
