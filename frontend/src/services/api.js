import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function checkRoute(from, to) {
  const res = await axios.post(`${BASE_URL}/api/route-check`, { from, to });
  return res.data;
}
