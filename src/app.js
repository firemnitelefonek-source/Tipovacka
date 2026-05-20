import { useState, useEffect } from "react";

// ✅ Nastav si vlastní Supabase údaje (zdarma na supabase.com)
const SUPABASE_URL = "https://bcfohzblwjrjsjisbvgc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZm9oemJsd2pyanNqaXNidmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODA2MzEsImV4cCI6MjA5NDg1NjYzMX0.nre93MtfapvEkOpZKREUCZQMcWgoSWbUpb3ZzclFlBE";

const matchesData = [
  { id: 1, name: "Česko vs Kanada", deadline: "2026-05-20T18:00:00" },
  { id: 2, name: "Švédsko vs Finsko", deadline: "2026-05-21T20:00:00" },
];

export default function App() {
  const [name, setName] = useState("");
  const [tips, setTips] = useState({});
  const [locked, setLocked] = useState({});
  const [allTips, setAllTips] = useState([]);
  useEffect(() => {
    const checkLocks = () => {
      const now = new Date();
      const newLocks = {};
      matchesData.forEach((m) => {
        newLocks[m.id] = now > new Date(m.deadline);
      });
      setLocked(newLocks);
    };

    checkLocks();
    fetchTips();

    const interval = setInterval(() => {
      checkLocks();
      fetchTips();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (matchId, value) => {
    setTips({ ...tips, [matchId]: value });
  };

  const saveTips = async () => {
    if (!name) {
      alert("Zadej jméno");
      return;
    }

    const data = {
      name,
      tips,
      created_at: new Date().toISOString(),
    };

    await fetch(`${SUPABASE_URL}/rest/v1/tips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(data),
    });
    alert("Tip uložen!");
    fetchTips();
  };

  const fetchTips = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tips?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    const data = await res.json();
    setAllTips(data);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <h1>🏒 Tipovačka MS</h1>
           {" "}
      <input
        placeholder="Tvoje jméno"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      {matchesData.map((match) => (
        <div
          key={match.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <strong>{match.name}</strong>
                   {" "}
          <div>
            Deadline: {new Date(match.deadline).toLocaleString()}
                     {" "}
          </div>
                   {" "}
          <input
            placeholder="např. 3:2"
            disabled={locked[match.id]}
            onChange={(e) => handleChange(match.id, e.target.value)}
          />
                   {" "}
          {locked[match.id] && (
            <div style={{ color: "red" }}>Tipování uzavřeno</div>
          )}
                 {" "}
        </div>
      ))}
      <button onClick={saveTips}>Uložit tip</button>
            <h2>📊 Tipy všech</h2>
           {" "}
      {allTips.map((t, i) => (
        <div key={i} style={{ borderBottom: "1px solid #ddd", marginTop: 5 }}>
                    <strong>{t.name}</strong>: {JSON.stringify(t.tips)}
                 {" "}
        </div>
      ))}
    </div>
  );
}
