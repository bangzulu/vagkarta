import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Sparade svar per söktext, så att samma sökning (t.ex. vid backsteg) är omedelbar.
const cache = new Map();

export async function searchAddress(query, signal) {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];
  if (cache.has(q)) return cache.get(q);

  const res = await axios.get(`${BASE_URL}/api/geocode`, { params: { q }, signal });
  cache.set(q, res.data);
  if (cache.size > 200) cache.delete(cache.keys().next().value);
  return res.data;
}
