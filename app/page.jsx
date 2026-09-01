"use client";

import { useEffect, useState } from "react";

const SECRET = "kirbydreamland1";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [header1, setHeader1] = useState("");
  const [text1, setText1] = useState("");
  const [header2, setHeader2] = useState("");
  const [text2, setText2] = useState("");
  const [imageText, setImageText] = useState(""); // newline-separated URLs

  useEffect(() => {
    if (!unlocked) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/content");
        const data = await res.json();
        if (res.ok) {
          setHeader1(data.header1 || "");
          setText1(data.text1 || "");
          setHeader2(data.header2 || "");
          setText2(data.text2 || "");
          setImageText((data.images || []).join("\n"));
        } else {
          setError(data.error || "Failed to load content");
        }
      } catch (e) {
        setError("Network error while loading content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [unlocked]);

  const handleUnlock = () => {
    if (input.trim() === SECRET) {
      setUnlocked(true);
    } else {
      setError("Incorrect phrase.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const images = imageText
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header1,
          text1,
          header2,
          text2,
          images
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      }
    } catch (e) {
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        padding: "2rem"
      }}
    >
      {!unlocked ? (
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>
            doom access
          </h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="enter phrase"
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "4px",
              border: "1px solid #444",
              backgroundColor: "#111",
              color: "#fff",
              marginBottom: "0.75rem"
            }}
          />
          <button
            onClick={handleUnlock}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#fff",
              color: "#000",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            unlock
          </button>
          {error && (
            <p style={{ marginTop: "0.75rem", color: "#f87171" }}>{error}</p>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "800px", width: "100%" }}>
          <h1 style={{ marginBottom: "1rem" }}>kirby dreamland panel</h1>
          {loading && <p>Loading content…</p>}
          {error && (
            <p style={{ marginBottom: "0.75rem", color: "#f87171" }}>{error}</p>
          )}

          <section style={{ marginBottom: "1.5rem" }}>
            <h2>Header 1</h2>
            <input
              value={header1}
              onChange={(e) => setHeader1(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#111",
                color: "#fff",
                marginTop: "0.25rem"
              }}
            />
            <h3 style={{ marginTop: "0.75rem" }}>Text 1</h3>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#111",
                color: "#fff",
                marginTop: "0.25rem",
                resize: "vertical"
              }}
            />
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h2>Header 2</h2>
            <input
              value={header2}
              onChange={(e) => setHeader2(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#111",
                color: "#fff",
                marginTop: "0.25rem"
              }}
            />
            <h3 style={{ marginTop: "0.75rem" }}>Text 2</h3>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#111",
                color: "#fff",
                marginTop: "0.25rem",
                resize: "vertical"
              }}
            />
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h2>Image URLs</h2>
            <p style={{ fontSize: "0.85rem", color: "#aaa" }}>
              One direct image link per line.
            </p>
            <textarea
              value={imageText}
              onChange={(e) => setImageText(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#111",
                color: "#fff",
                marginTop: "0.25rem",
                resize: "vertical"
              }}
            />
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: saving ? "#555" : "#fff",
              color: "#000",
              fontWeight: "600",
              cursor: saving ? "default" : "pointer"
            }}
          >
            {saving ? "saving…" : "save"}
          </button>
        </div>
      )}
    </div>
  );
}
