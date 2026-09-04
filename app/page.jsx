function LiveClock() {
  const [now, setNow] = useState(null); // null until mounted, avoids SSR/client time mismatch

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <div style={{ width: "160px", height: "160px", margin: "0 auto 2rem" }} />;
  }

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = (hours + minutes / 60) * 30; // 360/12
  const minuteAngle = (minutes + seconds / 60) * 6; // 360/60
  const secondAngle = seconds * 6;

  const center = 80;

  const hand = (angle, length, width, color) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    const x2 = center + length * Math.cos(rad);
    const y2 = center + length * Math.sin(rad);
    return (
      <line
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const rad = ((angle - 90) * Math.PI) / 180;
    const outer = 72;
    const inner = i % 3 === 0 ? 62 : 66;
    return (
      <line
        key={i}
        x1={center + inner * Math.cos(rad)}
        y1={center + inner * Math.sin(rad)}
        x2={center + outer * Math.cos(rad)}
        y2={center + outer * Math.sin(rad)}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={i % 3 === 0 ? 2 : 1}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div style={{ margin: "0 auto 2rem", width: "160px", height: "160px" }}>
      <svg viewBox="0 0 160 160" width="160" height="160">
        <circle
          cx={center}
          cy={center}
          r="75"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        {ticks}
        {hand(hourAngle, 40, 3, "#f2f2f2")}
        {hand(minuteAngle, 56, 2, "#f2f2f2")}
        {hand(secondAngle, 62, 1, "#8f8fff")}
        <circle cx={center} cy={center} r="3" fill="#8f8fff" />
      </svg>
      <div
        style={{
          textAlign: "center",
          marginTop: "0.6rem",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          color: "rgba(242,242,242,0.5)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
      </div>
    </div>
  );
}
