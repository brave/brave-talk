import { Recording, loadLocalStore } from "./store";

export const availableRecordings = (): Readonly<Record<string, Recording>> => {
  return loadLocalStore().availableRecordings();
};

export const upsertRecordingForRoom = (
  url: string,
  roomName: string,
  ttl: number | undefined
) => {
  return loadLocalStore().upsertRecordingForRoom(url, roomName, ttl);
};
