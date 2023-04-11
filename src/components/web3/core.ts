/* work in progress


questions/tasks for GT:

- add SIMPLEHASH_API_KEY to environment (see 1P4T)
- how to pass domain name to web3Prove?
- use web3NFTs2 instead of web3NFTs, note that this returns an any[] (look for tooltip and thumbnail)
- to get the NFT collections for the user, call web3NFTcollections
- do we still need web3RestoreAuth? if not, we can get rid of that and STORAGE_KEY

for production:
- remove web3NFTs & Alchemy API key
- get minimized web3 library
- CSP: add api.poap.tech, api.simplehash.com, cdn.simplehash.com, lh3.googleusercontent.com, previews.simplehash.com
*/

declare let window: any;

export interface POAP {
  event: {
    id: number;
    name: string;
    image_url: string;
  };
  tokenId: string;
}

export interface NFTcollection {
  id: string;
  name: string;
  image_url: string;
}

const AVATAR_URL_SESSION_KEY = "avatar_url";

/**
 * Sets or clears avatar url from session based on passed value. Null/Undefined clears any value
 * currently set, string values are set as the new value.
 * @param {string|undefined|null} url - The url to set, if present
 * @returns {void}
 */
export function rememberAvatarUrl(url: string | undefined | null) {
  if (url) {
    window.sessionStorage.setItem(AVATAR_URL_SESSION_KEY, url);
  } else {
    window.sessionStorage.removeItem(AVATAR_URL_SESSION_KEY);
  }
}

/**
 * Gets the currently set avatar url, if any
 * @returns {string|null} - The avatar url value or a null value
 */
export function getAvatarUrl(): string | null {
  return window.sessionStorage.getItem(AVATAR_URL_SESSION_KEY);
}

/*
export const web3join = () => {
  const auth = web3RestoreAuth();

  if (auth) {
    console.log("!!! restoring", auth);
    web3Authentication = auth;
    web3Address = web3Authentication.proof.signer;
  }

  if (web3Address) {
    web3Participants = {};
    web3Participants[""] = web3Address;
  }
};

export const web3DataChannelOpened = () => {
  if (!web3Authentication) {
    return;
  }

  JitsiMeetJS.executeCommand(
    "sendEndpointTextMessage",
    "",
    JSON.stringify({ web3: { type: "broadcast", payload: web3Authentication } })
  );
};

export const web3EndpointTextMessageReceived = async (params: any) => {
  if (!web3Participants) {
    return;
  }

  let displayName = "";
  try {
    const sender = params.data.senderInfo.id;
    displayName = await participantDisplayName(sender);
    const message = JSON.parse(params.data.eventData.text);
    if (!message.web3) {
      return;
    }

    const type = message.web3.type;
    const payload = message.web3.payload;

    if (type === "broadcast") {
      JitsiMeetJS.executeCommand(
        "sendEndpointTextMessage",
        sender,
        JSON.stringify({
          web3: { type: "unicast", payload: web3Authentication },
        })
      );
    }

    if (payload.method !== "EIP-4361-json") {
      console.log("!!! payload", payload);
      throw new Error(
        `unsupported method in payload: ${web3Authentication.method}`
      );
    }

    const proof = payload.proof;
    const signer = ethers.verifyMessage(proof.payload, proof.signature);
    if (signer.toLowerCase() != proof.signer.toLowerCase()) {
      console.log("!!! payload", payload);
      throw new Error(`address mismatch in payload, got ${signer}`);
    }

    // timestamp is irrelevant in this context...

    web3Participants[sender] = proof.signer;
    notice(`${sender} participant ${displayName}: web3 ${proof.signer}`);
    reportAction("web3 participants", web3Participants);
  } catch (error: any) {
    notice("${sender} participant ${displayName}: web3 " + error.message);
    console.error("!!! web3 " + error.message);
  }
};

const participantDisplayName = async (
  participantID: string
): Promise<string> => {
  let name = "";
  try {
    const info: any = await JitsiMeetJS.getRoomsInfo();
    info.rooms.forEach((room: any) => {
      room.participants.forEach((participant: any) => {
        if (participant.id === participantID) {
          name = participant.displayName;
        }
      });
    });
  } catch (error: any) {
    console.error(`!!! participantName: participantID=${participantID}`, error);
  }
  return name;
};

export const web3participantKickedOut = (params: any) => {
  if (!web3Participants) {
    return;
  }

  delete web3Participants[params.id];
  reportAction("web3 participants", web3Participants);
};

export const web3participantLeft = (params: any) => {
  if (!web3Participants) {
    return;
  }

  delete web3Participants[params.id];
  reportAction("web3 participants", web3Participants);
};

// invoked when the user clicks the "Web3 login" button
interface StartCallParams {
  web3Address: string;
  nft?: string;
  participantPoaps: number[];
  moderatorPoaps: number[];
  auth: Web3Auth;
  feedback: (msg: string) => void;
}

export const startCall = async (params: StartCallParams) => {
  console.log("!!! startCall", params);
  // now we're starting the call, move the parameters into the global variables
  web3Address = params.web3Address;
  web3Authentication = params.auth;

  try {
    const result1 = await fetchJWTMock(true, {
      web3Authentication: web3Authentication,
      web3Authorization: {
        method: "POAP",
        POAPs: {
          participantADs: {
            allow: params.participantPoaps,
            deny: [],
          },
          moderatorADs: {
            allow: params.moderatorPoaps,
          },
        },
      },
      avatarURL:
        "https://res.cloudinary.com/alchemyapi/image/upload/thumbnail/eth-mainnet/242d069360eae0345ea98e1082bcbd2f",
    });
    console.log("!!! web3 mock1", result1);

    const result2 = await fetchJWTMock(false, {
      web3Authentication: web3Authentication,
    });
    console.log("!!! web3 mock2", result2);

    // temporarily: just start a normal call with a standard JWT!
    const roomName = generateRoomName();
    const result = await fetchJWT(roomName, true, params.feedback);
    window.history.pushState({}, "", "/" + roomName);
    renderConferencePage(roomName, result.jwt);
  } catch (error: any) {
    console.error("!!! web3 fetchJWTMock", error);
    notice("mock: " + error.message);
  }
};

interface JoinCallParams {
  roomName: string;
  web3Address: string;
  nft?: string;
  auth: Web3Auth;
  feedback: (msg: string) => void;
}
export const joinCall = async (params: JoinCallParams) => {
  try {
    console.log("!!! joinCall", params);
    // now we're starting the call, move the parameters into the global variables
    web3Address = params.web3Address;
    web3Authentication = params.auth;

    // temporarily: just start a normal call with a standard JWT!
    const result = await fetchJWT(params.roomName, false, params.feedback);
    renderConferencePage(params.roomName, result.jwt);
  } catch (error: any) {
    params.feedback("Failed to join call: " + error.message);
  }
};

// here is the mock subscriptions service for the demo...

interface FetchJWTMockResult {
  participant: boolean;
  moderator: boolean;
}
const fetchJWTMock = async (
  createP: boolean,
  web3: any
): Promise<FetchJWTMockResult> => {
  if (!web3 || !web3.web3Authentication || !web3.web3Authentication.proof) {
    throw new Error("!!! web3 missing proof");
  }

  const method = web3.web3Authentication.method;
  if (method !== "EIP-4361-json") {
    throw new Error(
      `!!! web3 unsupported authentication method, got ${method}`
    );
  }

  const proof = web3.web3Authentication.proof;
  const signer = ethers.verifyMessage(proof.payload, proof.signature);
  if (signer.toLowerCase() != proof.signer.toLowerCase()) {
    console.error("!!! web3Authentication", proof);
    throw new Error(`address mismatch in proof, got ${signer}`);
  }

  let payload = "";
  try {
    const now = new Date().getTime();
    const then = now - 5 * 60 * 1000;
    payload = window.web3.utils.hexToUtf8(proof.payload);
    const message = parseEIP4361Message(payload);
    console.log("!!! EIP-4361 message", message);

    const version = message.version;
    if (version !== "1") {
      throw new Error(`invalid EIP-4361 message version: ${version}`);
    }

    const issuedAt = new Date(message.issuedAt).getTime();
    if (issuedAt < then || now < issuedAt) {
      throw new Error(
        `untimely payload: issued-at=${issuedAt} (now is ${now})`
      );
    }

    if (typeof message.expirationTime !== "undefined") {
      const expiresAt = new Date(message.expirationTime).getTime();
      if (expiresAt < now) {
        throw new Error(
          `untimely payload: expires-at=${expiresAt} (now is ${now})`
        );
      }
    }

    if (typeof message.notBefore !== "undefined") {
      const notBefore = new Date(message.notBefore).getTime();
      if (now < notBefore) {
        throw new Error(
          `untimely payload: not-before=${notBefore} (now is ${now})`
        );
      }
    }
  } catch (error: any) {
    if (payload) {
      console.error("!!! web3 payload", payload);
    } else {
      console.error("!!! web3Authentication", proof);
    }
    throw new Error("parse error in proof");
  }

  const address = proof.signer;
  const result: FetchJWTMockResult = {
    participant: false,
    moderator: false,
  };

  if (createP) {
    if (!web3.web3Authorization || !web3.web3Authorization.POAPs) {
      throw new Error("!!! web3 missing authorization");
    }

    const method = web3.web3Authorization.method;
    if (method !== "POAP") {
      throw new Error(
        `!!! web3 unsupported authorization method, got ${method}`
      );
    }

    const POAPs = web3.web3Authorization.POAPs;
    if (POAPs.participantADs) {
      const errorPOAP = await web3POAPvalidateADs(POAPs.participantADs);
      if (errorPOAP !== 0) {
        throw new Error(
          `unable to validate participant POAP event ${errorPOAP}`
        );
      }
    }

    if (POAPs.moderatorADs) {
      const errorPOAP = await web3POAPvalidateADs(POAPs.moderatorADs);
      if (errorPOAP !== 0) {
        throw new Error(`unable to validate moderator POAP event ${errorPOAP}`);
      }
    }

    result.participant = result.moderator = true;
  } else {
    const POAPs = await web3POAPs(address);
    const eventIDs: number[] = [];
    POAPs.forEach((poap) => {
      const eventID = poap.event?.id;

      if (eventID) {
        eventIDs.push(eventID);
      }
    });

    // for the mock...
    // 32820: BAT community
    // 42588: Brave Together Lisbon
    // 95783: Brave Talk Test Participants
    // 95784: Brave Talk test Moderators
    const participantPOAPsAD = {
      allow: [32820, 42588, 95783, 95784],
      deny: [],
    };
    const moderatorPOAPsAD = {
      allow: [95784],
    };

    result.participant = web3POAPauthorized(participantPOAPsAD, eventIDs);
    result.moderator = web3POAPauthorized(moderatorPOAPsAD, eventIDs);
    if (!result.participant) {
      throw new Error(`${address} isn't allowed as a participant POAPs AD`);
    }

    console.log(`!!! web3 ${address} is authorized to join`);
    if (result.moderator) {
      console.log(`!!! web3 ${address} is authorized to moderate`);
    } else {
      console.log(`!!! web3 ${address} is not authorized to moderate`);
    }
  }
  if (web3.avatarURL) {
    console.log(`!!! web3 set JWT's context.user.avatar to ${web3.avatarURL}`);
  }

  return result;
};

interface POAPsAD {
  allow: number[];
  deny?: number[];
}
const web3POAPvalidateADs = async (pair: POAPsAD): Promise<number> => {
  let errorPOAP = 0;

  try {
    if (pair.allow) {
      errorPOAP = await web3POAPsvalidate(pair.allow);
    }
    if (pair.deny && errorPOAP !== 0) {
      errorPOAP = await web3POAPsvalidate(pair.deny);
    }
  } catch {
    // ignore
  }
  return errorPOAP;
};

const web3POAPsvalidate = async (events: number[]): Promise<number> => {
  let errorID = 0;
  await Promise.all(
    events.map(async (event) => {
      let success = false;
      try {
        success = await web3POAPevent(event);
      } catch {
        // ignore
      }
      if (!success) {
        errorID = event;
      }
    })
  );

  return errorID;
};

const web3POAPauthorized = (pair: POAPsAD, eventIDs: number[]): boolean => {
  console.log("!!! authorization check", eventIDs, pair);
  if (pair.deny) {
    if (pair.deny.filter((value) => eventIDs.includes(value)).length !== 0)
      return false;
  }
  if (!pair.allow) {
    return false;
  }
  return pair.allow.filter((value) => eventIDs.includes(value)).length !== 0;
};

const web3NFTcollectionsvalidate_ = async (
  collectionIDs: string[]
): Promise<string> => {
  let errorID = "";
  await Promise.all(
    collectionIDs.map(async (collectionID) => {
      let success = false;
      try {
        success = await web3NFTcollection(collectionID);
      } catch {
        // ignore
      }
      if (!success) {
        errorID = collectionID;
      }
    })
  );

  return errorID;
};
*/
