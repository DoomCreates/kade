"use client";

import { useEffect, useState } from "react";

const SECRET = "kirbydreamland1";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [header1Title, setHeader1Title] = useState("Header 1");
  const [header1, setHeader1] = useState("");

  const [text1Title, setText1Title] = useState("Text 1");
  const [text1, setText1] = useState("");

  const [header2Title, setHeader2Title] = useState("Header 2");
  const [header2, setHeader2] = useState("");

  const [text2Title, setText2Title] = useState("Text 2");
  const [text2, setText2] = useState("");

  const [imagesTitle, setImagesTitle] = useState("Images");
  const [imageText, setImageText] = useState("");

  useEffect(() => {
    if (!unlocked) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/content");
        const data = await res.json();

        setHeader1Title(data.header1_title);
        setHeader1(data.header1);

        setText1Title(data.text1_title);
        setText1(data.text1);

        setHeader2Title(data.header2_title);
        setHeader2(data.header2);

        setText2Title(data.text2_title);
        setText2(data.text2);

        setImagesTitle(data.images_title);
        setImageText((data.images || []).join("\n"));
      } catch (e) {
        setError("Failed to load content");
      }
      setLoading(false);
    };

    load();
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

    const images = imageText
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header1_title: header1Title,
          header1,
          text1_title: text1Title,
          text1,
          header2_title: header2Title,
          header2,
          text2_title: text2Title,
          text2,
          images_title: imagesTitle,
          images
        })
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to save");
    } catch (e) {
      setError("Network error");
    }

    setSaving(false);
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
        padding: "2rem"
      }}
    >
      {!unlocked ? (
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <h1 style={{ textAlign: "center" }}>doom access</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="enter phrase"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#111",
              border: "1px solid #444",
              color: "#fff",
              marginBottom: "1rem"
            }}
          />
          <button
            onClick={handleUnlock}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#fff",
              color: "#000",
              fontWeight: "bold"
            }}
          >
            unlock
          </button>
          {error && <p style={{ color: "#f55" }}>{error}</p>}
        </div>
      ) : (
        <div style={{ maxWidth: "800px", width: "100%" }}>
          {loading && <p>Loading…</p>}
          {error && <p style={{ color: "#f55" }}>{error}</p>}

          {/* HEADER 1 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={header1Title}
              onChange={(e) => setHeader1Title(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff",
                fontWeight: "bold"
              }}
            />
            <textarea
              value={header1}
              onChange={(e) => setHeader1(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff"
              }}
            />
          </section>

          {/* TEXT 1 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={text1Title}
              onChange={(e) => setText1Title(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff",
                fontWeight: "bold"
              }}
            />
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff"
              }}
            />
          </section>

          {/* HEADER 2 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={header2Title}
              onChange={(e) => setHeader2Title(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff",
                fontWeight: "bold"
              }}
            />
            <textarea
              value={header2}
              onChange={(e) => setHeader2(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff"
              }}
            />
          </section>

          {/* TEXT 2 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={text2Title}
              onChange={(e) => setText2Title(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff",
                fontWeight: "bold"
              }}
            />
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff"
              }}
            />
          </section>

          {/* IMAGES */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={imagesTitle}
              onChange={(e) => setImagesTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff",
                fontWeight: "bold"
              }}
            />
            <textarea
              value={imageText}
              onChange={(e) => setImageText(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#111",
                border: "1px solid #444",
                color: "#fff"
              }}
            />
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: saving ? "#555" : "#fff",
              color: "#000",
              fontWeight: "bold",
              border: "none",
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
