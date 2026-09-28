import i18next from "i18next";

const formatUnit = (unit: "hours" | "minutes" | "seconds", count: number) =>
  i18next.t(`duration_${unit}_${count === 1 ? "one" : "other"}` as const, {
    count,
  });

// exported for testing
export function formatRelativeDay(d: Date): string {
  const getDateString = (epochMs: number) =>
    new Date(epochMs).toLocaleDateString();

  const now = new Date().getTime();
  const offsets = {
    Today: getDateString(now),
    Yesterday: getDateString(now - 24 * 60 * 60 * 1000),
    Tomorrow: getDateString(now + 24 * 60 * 60 * 1000),
  };

  const s = d.toLocaleDateString();
  let result = s;

  Object.entries(offsets).forEach(([prefix, formattedString]) => {
    if (s === formattedString) result = prefix;
  });

  return result;
}

// renders a duration in words, e.g. "2 hours 30 minutes", so that it is not
// mistaken for a clock time. only the two most significant units are shown,
// seconds are dropped once the duration is at least an hour.
export function formatDuration(secs: number): string {
  const total = Math.max(0, Math.floor(secs));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(formatUnit("hours", hours));
    if (minutes > 0) parts.push(formatUnit("minutes", minutes));
  } else if (minutes > 0) {
    parts.push(formatUnit("minutes", minutes));
    if (seconds > 0) parts.push(formatUnit("seconds", seconds));
  } else {
    parts.push(formatUnit("seconds", seconds));
  }

  return parts.join(" ");
}
