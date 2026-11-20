import { useEffect, useState } from "react";

const query = "(prefers-color-scheme: dark)";

// Följer systemets ljust/mörkt läge och uppdateras om det byts.
export default function useColorScheme() {
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return dark ? "dark" : "light";
}
