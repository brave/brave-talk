import { loadLocalStore } from "./store";
import "./js/jwt-decode";

afterAll(() => {
  // set the system time back to normal
  jest.setSystemTime();
});

test("mau calculation behaves as we expect", () => {
  jest.useFakeTimers();

  const s = loadLocalStore();

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

function createDummyJWTWithExpiry(name: string, exp: Date): string {
  // we only need to create enough of a jwt to exercise our expiry time checking -
  // this is clearly not a fully valid jwt!
  const dummyJwtValue = {
    exp: Math.floor(exp.valueOf() / 1000),
  };

  return `header.${btoa(JSON.stringify(dummyJwtValue))}.(${name})`;
}

test.only("jwt expiry works as expected", () => {
  jest.useFakeTimers();

  jest.setSystemTime(new Date("2021-04-01T00:00:00Z"));
  const s = loadLocalStore(true);

  const nonExpiredJwt = createDummyJWTWithExpiry(
    "nonExpiredJwt",
    new Date("2021-04-01T03:00:00Z")
  );

  const nonExpiredRefresh = createDummyJWTWithExpiry(
    "nonExpiredRefresh",
    new Date("2021-04-02T00:00:00Z")
  );

  const expiredJwt = createDummyJWTWithExpiry(
    "expiredJwt",
    new Date("2021-03-01T00:00:00Z")
  );

  const expiredRefresh = createDummyJWTWithExpiry(
    "expiredRefresh",
    new Date("2021-03-02T00:00:00Z")
  );

  s.storeJwtForRoom("ok", nonExpiredJwt, nonExpiredRefresh);
  s.storeJwtForRoom("expired", expiredJwt, expiredRefresh);
  s.storeJwtForRoom("okNoRefresh", nonExpiredJwt);

  // check that local storage has now been updated - no expiry checking is done on write
  const confabs = JSON.parse(window.localStorage.getItem("confabs")!);
  expect(confabs.JWTs).toEqual({
    ok: nonExpiredJwt,
    expired: expiredJwt,
    okNoRefresh: nonExpiredJwt,
  });
  expect(confabs.refresh).toEqual({
    ok: nonExpiredRefresh,
    expired: expiredRefresh,
  });

  // now reload:
  //  this should remove the expired entries, both in memory and in local storage
  const reloaded = loadLocalStore(true);
  expect(reloaded.findJwtForRoom("ok")).toBe(nonExpiredJwt);
  expect(reloaded.findJwtForRoom("expired")).toBeUndefined();
  expect(reloaded.findJwtForRoom("okNoRefresh")).toBe(nonExpiredJwt);

  expect(reloaded.findRefreshTokenForRoom("ok")).toBe(nonExpiredRefresh);
  // temporarily: the expired refresh token should not be removed
  expect(reloaded.findRefreshTokenForRoom("expired")).toBe(expiredRefresh);
  expect(reloaded.findRefreshTokenForRoom("okNoRefresh")).toBeUndefined();
  const confabs2 = JSON.parse(window.localStorage.getItem("confabs")!);

  // expired entries should be removed from jwts
  expect(confabs2.JWTs).toEqual({
    ok: nonExpiredJwt,
    okNoRefresh: nonExpiredJwt,
  });

  // temporarily, the expired refresh token should remain
  expect(confabs2.refresh).toEqual({
    ok: nonExpiredRefresh,
    expired: expiredRefresh,
  });
});
