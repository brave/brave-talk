import i18next from "i18next";

// `expiresAt` is an absolute unix time, so the time left is the distance to now.
export function secondsUntilExpiry(expiresAt: number, nowSecs: number): number {
  return expiresAt - nowSecs;
}

// transcript offsets look like "12m34s", counted from the start of the call.
export function parseTimeOffsetSecs(timeOffset: string): number | undefined {
  const match = timeOffset.match(/^(\d+)m(\d\d)s$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
}

export function transcriptDurationSecs(
  events: { timeOffset: string }[],
): number | undefined {
  return events.length
    ? parseTimeOffsetSecs(events[events.length - 1].timeOffset)
    : undefined;
}

// the unit key is resolved through i18next's plural handling so each locale
// picks the form its plural rules ask for. english declares both
// `duration_hours_one` and `duration_hours_other`, while japanese only
// declares `duration_hours_other` and has no distinct singular form, so
// appending a `_one`/`_other` suffix by hand falls back to english.
const formatUnit = (unit: "hours" | "minutes" | "seconds", count: number) =>
  i18next.t(`duration_${unit}` as const, {
    count,
  });

// exported for testing
export function formatRelativeDay(d: Date): string {
  const getDateString = (epochMs: number) =>
    new Date(epochMs).toLocaleDateString();

  const now = new Date().getTime();
  const day = 24 * 60 * 60 * 1000;
  const s = d.toLocaleDateString();

  if (s === getDateString(now)) return i18next.t("relative_day_today");
  if (s === getDateString(now - day))
    return i18next.t("relative_day_yesterday");
  if (s === getDateString(now + day)) return i18next.t("relative_day_tomorrow");

  return s;
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
