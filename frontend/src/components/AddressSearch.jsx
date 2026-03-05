import { useEffect, useState, useRef } from "react";
import { searchAddress } from "../services/geocode";

export default function AddressSearch({ label, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const justSelectedRef = useRef(false); // ref istället för state – triggar inte re-render

  // Stäng dropdown vid klick utanför
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // Om användaren just valde ett alternativ – skippa sökning
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }

      if (query.length < 4) {
        setResults([]);
        return;
      }

      try {
        const res = await searchAddress(query);
        setResults(res);
      } catch (err) {
        console.error("Geocode error:", err);
        setResults([]);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelect(r) {
    justSelectedRef.current = true;
    setQuery(r.label);
    setResults([]);
    onSelect([r.lon, r.lat]);
  }

  return (
    <div className="address-search" ref={wrapperRef}>
      <label>{label}</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Skriv adress…"
      />

      {results.length > 0 && (
        <ul className="suggestions">
          {results.map((r, i) => (
            <li key={i} onMouseDown={() => handleSelect(r)}>
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}