import { Recording, loadLocalStore } from "./store";

export const availableRecordings = (): Readonly<Record<string, Recording>> => {
  //  return loadLocalStore().availableRecordings();
  return {
    "https://api-vo.jitsi.net/jaas-recordings/us-east-1/vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe/sadhmoyugkkruwbc":
      {
        roomName: "6aIv-_iMz2gCaDVQzjVyMOYZrSNO3iK-WppDIxN3w999",
        createdAt: 1638283948,
        ttl: 86400,
        expiresAt: 1638370380,
      },
    "https://api-vo.jitsi.net/jaas-recordings/us-east-1/vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe/sadhmoyugkkruwbd":
      {
        roomName: "6aIv-_iMz2gCaDVQzjVyMOYZrSNO3iK-WppDIxN3999",
        createdAt: 1638283948 - 86400,
        ttl: 86400,
        expiresAt: 1638370380,
      },
    "https://api-vo.jitsi.net/jaas-recordings/us-east-1/vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe/sadhmoyugkkruwbe":
      {
        roomName: "6aIv-_iMz2gCaDVQzjVyMOYZrSNO3iK-WppDIxN3999",
        createdAt: 1638283948 + 86400,
        ttl: 86400,
        expiresAt: 1638370380,
      },
  };
};

export const upsertRecordingForRoom = (
  url: string,
  roomName: string,
  ttl: number | undefined
) => {
  return loadLocalStore().upsertRecordingForRoom(url, roomName, ttl);
};
