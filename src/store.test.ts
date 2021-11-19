import { loadLocalJwtStore } from "./store";

afterAll(() => {
  // set the system time back to normal
  jest.setSystemTime();
});

test("mau calculation behaves as we expect", () => {
  jest.useFakeTimers();

  const s = loadLocalJwtStore();

  jest.setSystemTime(new Date("2010-12-02T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(true);
  expect(s.isNewMonthlyActiveUser()).toBe(false);
  expect(s.isNewMonthlyActiveUser()).toBe(false);

  jest.setSystemTime(new Date("2010-12-04T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(false);

  jest.setSystemTime(new Date("2010-12-31T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(false);

  jest.setSystemTime(new Date("2011-01-01T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(true);
  expect(s.isNewMonthlyActiveUser()).toBe(false);

  jest.setSystemTime(new Date("2011-01-02T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(false);

  jest.setSystemTime(new Date("2011-01-05T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(false);

  jest.setSystemTime(new Date("2011-04-01T13:24:00Z"));
  expect(s.isNewMonthlyActiveUser()).toBe(true);
  expect(s.isNewMonthlyActiveUser()).toBe(false);
});
