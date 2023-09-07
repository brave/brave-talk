import { IJitsiMeetApi } from "./types";

export const getDisplayNameFromParticipantId = async (
  jitsi: IJitsiMeetApi,
  id: string
) => {
  const info = (await jitsi.getRoomsInfo()).rooms;
  const room = info.filter((r: any) => r.isMainRoom)[0];
  const match = room.participants.filter((p: any) => p.id === id);

  if (match.length === 0) {
    return null;
  }

  return match[0].displayName;
};
