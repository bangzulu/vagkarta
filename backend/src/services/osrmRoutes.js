import axios from "axios";

const GH_URL = "https://graphhopper.com/api/1/route";

export async function getRoute(from, to) {
  const API_KEY = process.env.GRAPHHOPPER_API;
  if (!API_KEY) throw new Error("GRAPHHOPPER_API saknas i .env");

  const params = new URLSearchParams({
    key: API_KEY,
    vehicle: "car",
    points_encoded: "false",
  });
  params.append("point", `${from[1]},${from[0]}`);
  params.append("point", `${to[1]},${to[0]}`);

  const res = await axios.get(`${GH_URL}?${params.toString()}`);
  const path = res.data.paths[0];
  if (!path) return null;

  return {
    geometry: path.points,
    distance: path.distance,
    duration: path.time,
  };
}
