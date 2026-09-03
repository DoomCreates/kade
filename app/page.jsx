"use client";

import { useEffect, useMemo, useState } from "react";
import { parseNaturalDate, toISODate, formatFriendly } from "../lib/dateParser";

const theme = {
  bg: "#050505",
  panel: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.10)",
  borderFocus: "rgba(255,255,255,0.35)",
  text: "#f2f2f2",
  textDim: "rgba(242,242,242,0.5)",
  accent: "#8f8fff",
  accentSoft: "rgba(143,143,255,0.18)",
  danger: "#ff6f6f",
  radius: "10px",
};

const inputBase = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: `1px solid ${theme.border}`,
  color: theme.text,
  borderRadius: theme.radius,
  outline: "none",
  fontSize: "0.95rem",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function applyFocus(e) {
  e.target.style.border = `1px solid ${theme.borderFocus}`;
  e.target.style.boxShadow = `0 0 0 3px rgba(255,255,255,0.06)`;
}
function removeFocus(e) {
  e.target.style.border = `1px solid ${theme.border}`;
  e.target.style.boxShadow = "none";
}

function Label({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: theme.textDim,
        marginBottom: "0.4rem",
      }}
    >
      {children}
    </label>
  );
}

function Card({ children, style }) {
  return (
    <section
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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

  // --- Calendar / events state ---
  const [events, setEvents] = useState([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dateQuery, setDateQuery] = useState("");
  const [dateQueryError, setDateQueryError] = useState(null);
  const [parsedDate, setParsedDate] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    if (step !== 3) return;

    const load = async () => {
      setLoading(true);
      try {
        const [contentRes, eventsRes] = await Promise.all([
          fetch("/api/content"),
          fetch("/api/events"),
        ]);

        const contentData = await contentRes.json();
        if (!contentRes.ok) {
          setError(contentData.error || "Unauthorized");
          setLoading(false);
          return;
        }

        setHeader1Title(contentData.header1_title);
        setHeader1(contentData.header1);
        setText1Title(contentData.text1_title);
        setText1(contentData.text1);
        setHeader2Title(contentData.header2_title);
        setHeader2(contentData.header2);
        setText2Title(contentData.text2_title);
        setText2(contentData.text2);
        setImagesTitle(contentData.images_title);
        setImageText((contentData.images || []).join("\n"));
        setPlanner(
          contentData.planner || Array.from({ length: 8 }, () => ({ label: "", text: "" }))
        );

        if (eventsRes.ok) {
          setEvents(await eventsRes.json());
        }
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

    const images = imageText.split("\n").map((x) => x.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header1_title: header1Title, header1,
          text1_title: text1Title, text1,
          header2_title: header2Title, header2,
          text2_title: text2Title, text2,
          images_title: imagesTitle, images,
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

  // --- Calendar helpers ---

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      (map[ev.event_date] ||= []).push(ev);
    }
    return map;
  }, [events]);

  const alerts = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const windowEnd = new Date(startOfToday);
    windowEnd.setDate(windowEnd.getDate() + 3);

    return events
      .filter((ev) => !ev.done)
      .filter((ev) => {
        const d = new Date(ev.event_date + "T00:00:00");
        return d >= startOfToday && d <= windowEnd;
      })
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events]);

  const monthCells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const refreshEvents = async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  };

  const handleDateQueryChange = (value) => {
    setDateQuery(value);
    setDateQueryError(null);

    if (!value.trim()) {
      setParsedDate(null);
      return;
    }

    const parsed = parseNaturalDate(value);
    if (parsed) {
      setParsedDate(parsed);
      setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    } else {
      setParsedDate(null);
    }
  };

  const handleSaveEvent = async () => {
    if (!parsedDate) {
      setDateQueryError("Couldn't understand that date — try \"September 3rd\" or \"Sep 3, 2027\".");
      return;
    }
    if (!newTitle.trim()) {
      setDateQueryError("Give the reminder a title.");
      return;
    }

    setSavingEvent(true);
    setDateQueryError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_date: toISODate(parsedDate),
          title: newTitle.trim(),
          notes: newNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDateQueryError(data.error || "Failed to save reminder");
      } else {
        await refreshEvents();
        setSelectedDay(parsedDate);
        setShowAddForm(false);
        setDateQuery("");
        setParsedDate(null);
        setNewTitle("");
        setNewNotes("");
      }
    } catch (e) {
      setDateQueryError("Network error");
    }
    setSavingEvent(false);
  };

  const toggleDone = async (id, done) => {
    await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
    refreshEvents();
  };

  const deleteEvent = async (id) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    refreshEvents();
  };

  const selectedDayEvents = selectedDay
    ? eventsByDate[toISODate(selectedDay)] || []
    : [];

  // --- Render ---

  if (step !== 3) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "0.15em", marginBottom: "2rem", color: theme.text }}>
            {step === 1 ? "ACCESS REQUIRED" : "SECOND PHRASE"}
          </h1>

          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder={step === 1 ? "enter first phrase" : "enter second phrase"}
            autoFocus
            style={{ ...inputBase, backgroundColor: "#000", border: "1px solid #fff", textAlign: "center" }}
            onFocus={applyFocus}
            onBlur={removeFocus}
          />

          <button
            onClick={handleUnlock}
            style={{
              marginTop: "1rem", width: "100%", padding: "0.75rem",
              backgroundColor: "#fff", color: "#000", fontWeight: 600,
              borderRadius: theme.radius, border: "none", cursor: "pointer",
            }}
          >
            unlock
          </button>

          {error && <p style={{ color: theme.danger, marginTop: "1rem", fontSize: "0.9rem" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        {loading && <p style={{ color: theme.textDim }}>Loading…</p>}
        {error && <p style={{ color: theme.danger }}>{error}</p>}

        {/* ALERTS STRIP */}
        <Card>
          <Label>Upcoming</Label>
          {alerts.length === 0 ? (
            <p style={{ color: theme.textDim, fontSize: "0.9rem", margin: 0 }}>Nothing due in the next few days.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {alerts.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.6rem 0.8rem", borderRadius: theme.radius,
                    background: theme.accentSoft, border: `1px solid ${theme.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{ev.title}</div>
                    <div style={{ fontSize: "0.75rem", color: theme.textDim }}>
                      {formatFriendly(new Date(ev.event_date + "T00:00:00"))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button onClick={() => toggleDone(ev.id, true)} title="Mark done" style={pillButton}>✓</button>
                    <button onClick={() => deleteEvent(ev.id)} title="Delete" style={pillButton}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CALENDAR */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={navButton}>‹</button>
            <div style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={navButton}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.4rem" }}>
            {WEEKDAYS.map((w, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: "0.7rem", color: theme.textDim }}>{w}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
            {monthCells.map((day, i) => {
              if (!day) return <div key={i} />;
              const iso = toISODate(day);
              const hasEvents = !!eventsByDate[iso]?.length;
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    aspectRatio: "1", borderRadius: "8px", border: `1px solid ${isSelected ? theme.borderFocus : "transparent"}`,
                    background: isToday ? theme.accentSoft : "rgba(255,255,255,0.02)",
                    color: theme.text, cursor: "pointer", fontSize: "0.85rem",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
                  }}
                >
                  {day.getDate()}
                  {hasEvents && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: theme.accent }} />}
                </button>
              );
            })}
          </div>

          {selectedDay && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${theme.border}` }}>
              <Label>{formatFriendly(selectedDay)}</Label>
              {selectedDayEvents.length === 0 ? (
                <p style={{ color: theme.textDim, fontSize: "0.85rem" }}>No reminders on this day.</p>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.85rem", opacity: ev.done ? 0.5 : 1 }}>
                    <span>{ev.title}{ev.notes ? ` — ${ev.notes}` : ""}</span>
                    <button onClick={() => deleteEvent(ev.id)} style={pillButton}>×</button>
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              marginTop: "1rem", padding: "0.6rem 1rem", borderRadius: theme.radius,
              border: `1px solid ${theme.border}`, background: "transparent", color: theme.text, cursor: "pointer", fontSize: "0.85rem",
            }}
          >
            {showAddForm ? "cancel" : "+ add reminder"}
          </button>

          {showAddForm && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <Label>Date</Label>
                <input
                  value={dateQuery}
                  onChange={(e) => handleDateQueryChange(e.target.value)}
                  placeholder='e.g. "thursday, september 3rd"'
                  style={inputBase}
                  onFocus={applyFocus}
                  onBlur={removeFocus}
                />
                {parsedDate && (
                  <p style={{ fontSize: "0.8rem", color: theme.accent, marginTop: "0.4rem" }}>
                    → {formatFriendly(parsedDate)}
                  </p>
                )}
              </div>

              <div>
                <Label>Title</Label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
              </div>

              <div>
                <Label>Notes</Label>
                <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
              </div>

              {dateQueryError && <p style={{ color: theme.danger, fontSize: "0.85rem" }}>{dateQueryError}</p>}

              <button
                onClick={handleSaveEvent}
                disabled={savingEvent}
                style={{
                  padding: "0.65rem", borderRadius: theme.radius, border: "none",
                  background: savingEvent ? "rgba(255,255,255,0.2)" : theme.text,
                  color: "#000", fontWeight: 600, cursor: savingEvent ? "default" : "pointer",
                }}
              >
                {savingEvent ? "saving…" : "save reminder"}
              </button>
            </div>
          )}
        </Card>

        {/* VAULT CONTENT */}
        <Card>
          <Label>{header1Title}</Label>
          <input value={header1Title} onChange={(e) => setHeader1Title(e.target.value)} style={{ ...inputBase, marginBottom: "0.5rem" }} onFocus={applyFocus} onBlur={removeFocus} />
          <textarea value={header1} onChange={(e) => setHeader1(e.target.value)} rows={3} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
        </Card>

        <Card>
          <input value={text1Title} onChange={(e) => setText1Title(e.target.value)} style={{ ...inputBase, marginBottom: "0.5rem" }} onFocus={applyFocus} onBlur={removeFocus} />
          <textarea value={text1} onChange={(e) => setText1(e.target.value)} rows={4} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
        </Card>

        <Card>
          <input value={header2Title} onChange={(e) => setHeader2Title(e.target.value)} style={{ ...inputBase, marginBottom: "0.5rem" }} onFocus={applyFocus} onBlur={removeFocus} />
          <textarea value={header2} onChange={(e) => setHeader2(e.target.value)} rows={3} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
        </Card>

        <Card>
          <input value={text2Title} onChange={(e) => setText2Title(e.target.value)} style={{ ...inputBase, marginBottom: "0.5rem" }} onFocus={applyFocus} onBlur={removeFocus} />
          <textarea value={text2} onChange={(e) => setText2(e.target.value)} rows={4} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
        </Card>

        <Card>
          <input value={imagesTitle} onChange={(e) => setImagesTitle(e.target.value)} style={{ ...inputBase, marginBottom: "0.5rem" }} onFocus={applyFocus} onBlur={removeFocus} />
          <textarea value={imageText} onChange={(e) => setImageText(e.target.value)} rows={5} style={inputBase} onFocus={applyFocus} onBlur={removeFocus} />
        </Card>

        <Card>
          <Label>Planner</Label>
          {planner.map((row, index) => (
            <div key={index} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <input
                value={row.label}
                onChange={(e) => {
                  const updated = [...planner];
                  updated[index].label = e.target.value;
                  setPlanner(updated);
                }}
                placeholder={`Label ${index + 1}`}
                style={{ ...inputBase, width: "28%" }}
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
                style={{ ...inputBase, width: "72%" }}
                onFocus={applyFocus}
                onBlur={removeFocus}
              />
            </div>
          ))}
        </Card>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: theme.radius, border: "none",
            background: saving ? "rgba(255,255,255,0.2)" : theme.text,
            color: "#000", fontWeight: 600, cursor: saving ? "default" : "pointer",
          }}
        >
          {saving ? "saving…" : "save vault"}
        </button>
      </div>
    </div>
  );
}

const navButton = {
  background: "transparent", border: "none", color: theme.text,
  fontSize: "1.2rem", cursor: "pointer", padding: "0.2rem 0.6rem",
};

const pillButton = {
  background: "rgba(255,255,255,0.08)", border: "none", color: theme.text,
  borderRadius: "6px", width: "24px", height: "24px", cursor: "pointer", fontSize: "0.8rem",
};
