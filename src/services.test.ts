import { resolveService } from "./services";

it("should correctly resolve subscription services", () => {
  expect(
    resolveService("subscriptions.bsg", "dev.talk.brave.software"),
  ).toEqual("https://subscriptions.bsg.brave.software");

  expect(resolveService("subscriptions.bsg", "talk.brave.software")).toEqual(
    "https://subscriptions.bsg.brave.software",
  );

  expect(resolveService("subscriptions.bsg", "localhost:8080")).toEqual(
    "https://subscriptions.bsg.brave.software",
  );

  expect(resolveService("subscriptions.bsg", "talk.bravesoftware.com")).toEqual(
    "https://subscriptions.bsg.bravesoftware.com",
  );

  expect(resolveService("subscriptions.bsg", "talk.brave.com")).toEqual(
    "https://subscriptions.bsg.brave.com",
  );
});

it("should correctly resolve account services", () => {
  expect(resolveService("account", "dev.talk.brave.software")).toEqual(
    "https://account.brave.software",
  );

  expect(resolveService("account", "talk.brave.software")).toEqual(
    "https://account.brave.software",
  );

  expect(resolveService("account", "localhost:8080")).toEqual(
    "https://account.brave.software",
  );

  expect(resolveService("account", "talk.bravesoftware.com")).toEqual(
    "https://account.bravesoftware.com",
  );

  expect(resolveService("account", "talk.brave.com")).toEqual(
    "https://account.brave.com",
  );
});
