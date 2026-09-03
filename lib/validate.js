const MAX_TEXT_LENGTH = 20000;
const MAX_TITLE_LENGTH = 500;

export function sanitizeContentPayload(body) {
  const clamp = (val, max) => (typeof val === "string" ? val.slice(0, max) : "");

  const images = Array.isArray(body.images)
    ? body.images.filter((x) => typeof x === "string").slice(0, 200).map((x) => x.slice(0, 2000))
    : [];

  const plannerInput = Array.isArray(body.planner) ? body.planner : [];
  const planner = Array.from({ length: 8 }, (_, i) => {
    const row = plannerInput[i] || {};
    return {
      label: clamp(row.label, 200),
      text: clamp(row.text, MAX_TEXT_LENGTH),
    };
  });

  return {
    header1_title: clamp(body.header1_title, MAX_TITLE_LENGTH),
    header1: clamp(body.header1, MAX_TEXT_LENGTH),
    text1_title: clamp(body.text1_title, MAX_TITLE_LENGTH),
    text1: clamp(body.text1, MAX_TEXT_LENGTH),
    header2_title: clamp(body.header2_title, MAX_TITLE_LENGTH),
    header2: clamp(body.header2, MAX_TEXT_LENGTH),
    text2_title: clamp(body.text2_title, MAX_TITLE_LENGTH),
    text2: clamp(body.text2, MAX_TEXT_LENGTH),
    images_title: clamp(body.images_title, MAX_TITLE_LENGTH),
    images,
    planner,
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function sanitizeEventPayload(body) {
  if (typeof body.event_date !== "string" || !DATE_RE.test(body.event_date)) {
    return { error: "event_date must be in YYYY-MM-DD format" };
  }
  if (typeof body.title !== "string" || !body.title.trim()) {
    return { error: "title is required" };
  }

  return {
    value: {
      event_date: body.event_date,
      title: body.title.slice(0, MAX_TITLE_LENGTH),
      notes: typeof body.notes === "string" ? body.notes.slice(0, MAX_TEXT_LENGTH) : "",
    },
  };
}
