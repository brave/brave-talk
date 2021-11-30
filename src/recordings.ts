import { LocalStore, Recording, loadLocalStore } from "./store";

let _singleton: LocalStore | undefined;

const singleton = () => {
  if (!_singleton) {
    _singleton = loadLocalStore();
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
