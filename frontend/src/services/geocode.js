import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function searchAddress(query) {
  if (!query || query.length < 3) return [];
  const res = await axios.get(`${BASE_URL}/api/geocode`, {
    params: { q: query },
  });
  return res.data;
}
