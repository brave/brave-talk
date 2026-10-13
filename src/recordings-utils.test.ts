import i18next from "i18next";
import {
  formatDuration,
  formatRelativeDay,
  parseTimeOffsetSecs,
  secondsUntilExpiry,
  transcriptDurationSecs,
} from "./recordings-utils";
import { RECORDING_TTL_SECS } from "./recordings-store";
import "./i18n/i18next";

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2021-12-01T12:00:00"));
});

afterAll(() => {
  // set the system time back to normal
  jest.setSystemTime();
});

test.each([
  ["2021-12-01T11:00:00", "Today"],
  ["2021-12-01T10:00:00", "Today"],
  ["2021-11-30T21:00:00", "Yesterday"],
  ["2021-11-30T09:00:00", "Yesterday"],
  ["2021-11-29T09:00:00", new Date("2021-11-29T09:00:00").toLocaleDateString()],
])("format relative day works as expected for %s", (dateString, expected) => {
  expect(formatRelativeDay(new Date(dateString))).toEqual(expected);
});

test("format relative day is localized", () => {
  i18next.changeLanguage("ja");
  try {
    expect(formatRelativeDay(new Date("2021-12-01T11:00:00"))).toEqual("今日");
    expect(formatRelativeDay(new Date("2021-11-30T21:00:00"))).toEqual("昨日");
  } finally {
    i18next.changeLanguage("en");
  }
});

test.each([
  [0, "0 seconds"],
  [1, "1 second"],
  [45, "45 seconds"],
  [60, "1 minute"],
  [90, "1 minute 30 seconds"],
  [330, "5 minutes 30 seconds"],
  [3600, "1 hour"],
  [3660, "1 hour 1 minute"],
  [9000, "2 hours 30 minutes"],
  [86400, "24 hours"],
  // expired recordings can briefly report a negative remainder
  [-120, "0 seconds"],
])("format duration renders %s secs as %s", (secs, expected) => {
  expect(formatDuration(secs)).toEqual(expected);
});

test("format duration is localized", () => {
  i18next.changeLanguage("ja");
  try {
    expect(formatDuration(9000)).toEqual("2時間 30分");
  } finally {
    i18next.changeLanguage("en");
  }
});

// japanese has no distinct singular plural category, so only the `_other`
// forms are declared. resolving the suffix by hand used to miss them and
// silently fall back to the english strings.
test.each([
  [1, "1秒"],
  [45, "45秒"],
  [60, "1分"],
  [90, "1分 30秒"],
  [3600, "1時間"],
  [3660, "1時間 1分"],
])("format duration renders %s secs in japanese as %s", (secs, expected) => {
  i18next.changeLanguage("ja");
  try {
    expect(formatDuration(secs)).toEqual(expected);
  } finally {
    i18next.changeLanguage("en");
  }
});

describe("secondsUntilExpiry", () => {
  const createdAt = 1_700_000_000;
  // this is exactly how the store builds an entry: expiresAt = createdAt + TTL
  const recording = { createdAt, expiresAt: createdAt + RECORDING_TTL_SECS };

  test("reports the full TTL for a recording created just now", () => {
    expect(secondsUntilExpiry(recording.expiresAt, createdAt)).toEqual(
      RECORDING_TTL_SECS,
    );
  });

  test("counts down as time passes", () => {
    expect(
      secondsUntilExpiry(recording.expiresAt, createdAt + 23 * 60 * 60),
    ).toEqual(60 * 60);
  });

  test("goes negative once the recording has expired", () => {
    expect(
      secondsUntilExpiry(
        recording.expiresAt,
        createdAt + RECORDING_TTL_SECS + 5,
      ),
    ).toEqual(-5);
  });
});

test.each([
  ["0m00s", 0],
  ["1m30s", 90],
  ["12m34s", 12 * 60 + 34],
  ["2h00m", undefined],
  ["", undefined],
])("parseTimeOffsetSecs(%s) is %s", (input, expected) => {
  expect(parseTimeOffsetSecs(input)).toEqual(expected);
});

test("transcript duration uses the last offset", () => {
  expect(transcriptDurationSecs([])).toBeUndefined();
  expect(
    transcriptDurationSecs([{ timeOffset: "0m10s" }, { timeOffset: "1m30s" }]),
  ).toEqual(90);
});
