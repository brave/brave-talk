import { JwtStore, Recording, loadLocalJwtStore } from "./store";

let _singleton: JwtStore | undefined;

const singleton = () => {
  if (!_singleton) {
    _singleton = loadLocalJwtStore();
  }
  return _singleton;
};

export const availableRecordings = () => {
  return singleton().availableRecordings();
};

export const upsertRecordingForRoom = (
  url: string,
  roomName: string,
  ttl: number | undefined
) => {
  return singleton().upsertRecordingForRoom(url, roomName, ttl);
};
