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
  expiresAt: number | undefined
) => {
  return singleton().upsertRecordingForRoom(url, roomName, expiresAt);
};

/* most likely OBE

export const refreshRecording = async (url: string): Promise<boolean> => {
  const recording = singleton().findRecordingAtURL(url);

  if (!recording) {
    return false;
  }

  // async call to https://api-vo.jitsi.net/jaas-recordings/link/details?url={{url}}
  // on success, upsertRecordingForRoom(url, recording.roomName, result.expiresAt);

  return false;
};

*/
