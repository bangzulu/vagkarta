# Trafikvarning Karta

Visar vägförhållanden längs en valfri rutt i Sverige. Rutten ritas ut på en karta och färgkodas baserat på Trafikverkets aktuella väglagsdata.

## Stack

- **Frontend** – React + Vite + Leaflet
- **Backend** – Node.js + Express
- **Routing** – Graphhopper API
- **Geocoding** – Geoapify Autocomplete
- **Väglagsdata** – Trafikverkets öppna API

## Kom igång

### Krav

- Node.js 20+
- API-nycklar för Trafikverket, Graphhopper och Geoapify (se nedan)

### API-nycklar

| Tjänst | Registrering | Gratistier |
|--------|-------------|-----------|
| Trafikverket | [api.trafikinfo.trafikverket.se](https://api.trafikinfo.trafikverket.se) | Gratis |
| Graphhopper | [graphhopper.com](https://graphhopper.com) | 500 req/dag |
| Geoapify | [geoapify.com](https://geoapify.com) | 3000 req/dag |

### Installation

```bash
# Backend
cd backend
cp .env.example .env
# Fyll i dina nycklar i .env
npm install
npm run dev

# Frontend (nytt terminalfönster)
cd frontend
npm install
npm run dev
```

Frontend körs på `http://localhost:5173`, backend på `http://localhost:3001`.

## Deploy

### Frontend → Cloudflare Pages (gratis)

1. Pusha projektet till GitHub
2. Gå till [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project → Connect to Git**
3. Välj ditt repo och sätt:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. Lägg till miljövariabel under **Settings → Environment variables**:
   ```
   VITE_API_URL = https://din-backend.fly.dev
   ```

### Backend → Fly.io (gratis / ~$3/mån)

```bash
# Installera Fly CLI
brew install flyctl
fly auth signup

# I backend/-mappen
fly launch  # välj Amsterdam (ams), nej till PostgreSQL/Redis

# Lägg till miljövariabler
fly secrets set TRAFIKVERKET_API_KEY=xxx
fly secrets set GRAPHHOPPER_API=xxx
fly secrets set GEOAPIFY_API_KEY=xxx

fly deploy
```

## Färgkodning

| Färg | Trafikverket ConditionCode | Innebörd |
|------|---------------------------|----------|
| Svart | – | Ingen data |
| Grön | 1 | Normalt väglag |
| Gul | 2 | Risk för besvärligt väglag |
| Röd | 3 | Besvärligt väglag |
| Blå | 4 | Snö- och isvägbana |
