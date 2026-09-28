import i18next from "i18next";
import { formatDuration, formatRelativeDay } from "./recordings-utils";
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
