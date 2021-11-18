import { Recording, loadLocalJwtStore } from "./jwt-store";

export const availableRecordings = () => {
  return loadLocalJwtStore().availableRecordings();
};

export const upsertRecordingForRoom = (
  url: string,
  roomName: string,
  expiresAt: number | undefined
) => {
  return loadLocalJwtStore().upsertRecordingForRoom(url, roomName, expiresAt);
};

export const refreshRecording = async (url: string): Promise<boolean> => {
  const recording = loadLocalJwtStore().findRecordingAtURL(url);

  if (!recording) {
    return false;
  }

  // async call to https://api-vo.jitsi.net/jaas-recordings/link/details?url={{url}}
  // on success, upsertRecordingForRoom(url, recording.roomName, result.expiresAt);

  return false;
};
