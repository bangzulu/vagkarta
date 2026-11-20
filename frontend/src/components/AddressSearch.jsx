import { useEffect, useState, useRef, useId } from "react";
import axios from "axios";
import { searchAddress } from "../services/geocode";

export default function AddressSearch({ label, placeholder, marker, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const justSelectedRef = useRef(false); // ref istället för state – triggar inte re-render
  const id = useId();
  const listId = `${id}-list`;

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

    // Om användaren just valde ett alternativ – skippa sökning
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (query.trim().length < 3) return;

    // Avbryt förra förfrågan så att ett gammalt svar aldrig skriver över ett nyare
    const controller = new AbortController();

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAddress(query, controller.signal);
        setResults(res);
        setHighlight(-1);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Geocode error:", err);
        setResults([]);
      }
    }, 200);

    return () => {
      clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query]);

  function handleSelect(r) {
    justSelectedRef.current = true;
    setQuery(r.label);
    setResults([]);
    setHighlight(-1);
    onSelect([r.lon, r.lat]);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    if (e.target.value.trim().length < 3) setResults([]);
    onSelect(null); // texten matchar inte längre den valda platsen
  }

  function handleKeyDown(e) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      handleSelect(results[highlight]);
    } else if (e.key === "Escape") {
      setResults([]);
    }
  }

  const open = results.length > 0;

  return (
    <div className={`address-search marker-${marker}`} ref={wrapperRef}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
      />

      {open && (
        <ul className="suggestions" id={listId} role="listbox">
          {results.map((r, i) => (
            <li
              key={i}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlight}
              className={i === highlight ? "is-highlighted" : ""}
              onMouseDown={() => handleSelect(r)}
              onMouseEnter={() => setHighlight(i)}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
