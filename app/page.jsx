"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1);
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

  const [planner, setPlanner] = useState(
    Array.from({ length: 8 }, () => ({ label: "", text: "" }))
  );

  useEffect(() => {
    if (step !== 3) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/content");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Unauthorized");
          setLoading(false);
          return;
        }

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

        setPlanner(
          data.planner ||
            Array.from({ length: 8 }, () => ({ label: "", text: "" }))
        );
      } catch (e) {
        setError("Failed to load content");
      }
      setLoading(false);
    };

    load();
  }, [step]);

  const handleUnlock = async () => {
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, phrase: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Auth failed");
        return;
      }

      if (data.nextStep === 2) {
        setStep(2);
        setInput("");
      } else if (data.unlocked) {
        setStep(3);
        setInput("");
      }
    } catch (e) {
      setError("Network error");
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
          images,
          planner,
        }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to save");
    } catch (e) {
      setError("Network error");
    }

    setSaving(false);
  };

  const glass = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 25px rgba(0,0,0,0.4)",
    borderRadius: "12px",
  };

  const baseInputStyle = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: "8px",
    outline: "none",
    transition: "0.2s",
  };

  const inputFocusStyle = {
    border: "1px solid #6f6fff",
    boxShadow: "0 0 10px #6f6fff55",
  };

  const applyFocus = (e) => {
    Object.assign(e.target.style, inputFocusStyle);
  };

  const removeFocus = (e) => {
    Object.assign(e.target.style, {
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "none",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #000 0%, #0a0a0f 40%, #0f0f1a 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {step !== 3 ? (
        <div style={{ maxWidth: "420px", width: "100%", padding: "2rem", ...glass }}>
          <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {step === 1 ? "doom access" : "secondary access"}
          </h1>

          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUnlock();
            }}
            placeholder={step === 1 ? "enter first phrase" : "enter second phrase"}
            style={baseInputStyle}
            onFocus={applyFocus}
            onBlur={removeFocus}
          />

          <button
            onClick={handleUnlock}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.75rem",
              background: "linear-gradient(90deg, #6f6fff, #9f9fff)",
              color: "#000",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            unlock
          </button>

          {error && (
            <p style={{ color: "#ff6f6f", marginTop: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "900px", width: "100%", padding: "2rem", ...glass }}>
          {loading && <p>Loading…</p>}
          {error && <p style={{ color: "#ff6f6f" }}>{error}</p>}

          {/* HEADER 1 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={header1Title}
              onChange={(e) => setHeader1Title(e.target.value)}
              style={baseInputStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
            <textarea
              value={header1}
              onChange={(e) => setHeader1(e.target.value)}
              rows={3}
              style={{ ...baseInputStyle, marginTop: "0.5rem" }}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
          </section>

          {/* TEXT 1 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={text1Title}
              onChange={(e) => setText1Title(e.target.value)}
              style={baseInputStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              rows={4}
              style={{ ...baseInputStyle, marginTop: "0.5rem" }}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
          </section>

          {/* HEADER 2 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={header2Title}
              onChange={(e) => setHeader2Title(e.target.value)}
              style={baseInputStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
            <textarea
              value={header2}
              onChange={(e) => setHeader2(e.target.value)}
              rows={3}
              style={{ ...baseInputStyle, marginTop: "0.5rem" }}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
          </section>

          {/* TEXT 2 */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={text2Title}
              onChange={(e) => setText2Title(e.target.value)}
              style={baseInputStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              rows={4}
              style={{ ...baseInputStyle, marginTop: "0.5rem" }}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
          </section>

          {/* IMAGES */}
          <section style={{ marginBottom: "2rem" }}>
            <input
              value={imagesTitle}
              onChange={(e) => setImagesTitle(e.target.value)}
              style={baseInputStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
            <textarea
              value={imageText}
              onChange={(e) => setImageText(e.target.value)}
              rows={6}
              style={{ ...baseInputStyle, marginTop: "0.5rem" }}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
          </section>

          {/* PLANNER */}
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Planner</h2>

            {planner.map((row, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <input
                  value={row.label}
                  onChange={(e) => {
                    const updated = [...planner];
                    updated[index].label = e.target.value;
                    setPlanner(updated);
                  }}
                  placeholder={`Label ${index + 1}`}
                  style={{ ...baseInputStyle, width: "25%" }}
                  onFocus={applyFocus}
                  onBlur={removeFocus}
                />

                <input
                  value={row.text}
                  onChange={(e) => {
                    const updated = [...planner];
                    updated[index].text = e.target.value;
                    setPlanner(updated);
                  }}
                  placeholder={`Text ${index + 1}`}
                  style={{ ...baseInputStyle, width: "75%" }}
                  onFocus={applyFocus}
                  onBlur={removeFocus}
                />
              </div>
            ))}
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 1.5rem",
              background: saving
                ? "rgba(255,255,255,0.2)"
                : "linear-gradient(90deg, #6f6fff, #9f9fff)",
              color: "#000",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              cursor: saving ? "default" : "pointer",
              transition: "0.2s",
            }}
          >
            {saving ? "saving…" : "save"}
          </button>
        </div>
      )}
    </div>
  );
}
