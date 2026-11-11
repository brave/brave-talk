import { fetchJWT } from "./rooms";

jest.mock("./subscriptions", () => ({
  setTemporaryCredentialCookie: jest.fn(),
}));

const ROOM_NAME = "abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE";

// respond to the csrf token preflight, and then fail the actual request
// with the given status and body
const mockFailingRoomsRequest = (status: number, body: string) => {
  global.fetch = jest.fn(
    async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "OPTIONS") {
        return {
          status: 200,
          headers: new Headers({ "x-csrf-token": "token" }),
        } as Response;
      }
      return {
        status,
        statusText: "Bad Request",
        text: async () => body,
      } as Response;
    },
  );
};

const INVALID_ROOM_NAME_BODY = JSON.stringify({
  message:
    "Not a valid room name; error id: 13bb1d39-eed1-4988-a438-e0ef6c40a9c9: Not a valid room name",
  code: 400,
});

const originalFetch = global.fetch;

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("an invalid room name is reported as such when joining", async () => {
  mockFailingRoomsRequest(400, INVALID_ROOM_NAME_BODY);

  await expect(fetchJWT(ROOM_NAME, false, jest.fn())).rejects.toThrow(
    "Sorry, that is not a valid room name",
  );
});

test("an invalid room name is reported as such when creating", async () => {
  mockFailingRoomsRequest(400, INVALID_ROOM_NAME_BODY);

  await expect(fetchJWT(ROOM_NAME, true, jest.fn())).rejects.toThrow(
    "Sorry, that is not a valid room name",
  );
});

test("other 400 failures are still reported using the status", async () => {
  mockFailingRoomsRequest(400, "{}");
  await expect(fetchJWT(ROOM_NAME, false, jest.fn())).rejects.toThrow(
    "Sorry, the call is already full",
  );

  mockFailingRoomsRequest(400, "{}");
  await expect(fetchJWT(ROOM_NAME, true, jest.fn())).rejects.toThrow(
    "Sorry, you are not a subscriber",
  );
});
