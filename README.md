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

