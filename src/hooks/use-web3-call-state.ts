import { useState } from "react";
import { TranslationKeys } from "../i18n/i18next";
import {
  Web3RequestBody,
  Web3Authentication,
  web3Prove,
  web3SolProve,
  Web3PermissionType,
} from "../components/web3/api";
import { POAP, NFTcollection, NFT } from "../components/web3/core";
import { generateRoomName } from "../lib";
import { fetchJWT } from "../rooms";

interface Web3CallState {
  web3Address?: string;
  permissionType: Web3PermissionType;
  nft: NFT | null;
  participantPoaps: POAP[];
  moderatorPoaps: POAP[];
  participantNFTCollections: NFTcollection[];
  moderatorNFTCollections: NFTcollection[];
  setWeb3Address: (web3Address: string, event: string) => void;
  setPermissionType: (permissionType: Web3PermissionType) => void;
  setNft: (nft: NFT | null) => void;
  setParticipantPoaps: (participanPoaps: POAP[]) => void;
  setModeratorPoaps: (moderatorPoaps: POAP[]) => void;
  setParticipantNFTCollections: (
    participantNFTCollections: NFTcollection[]
  ) => void;
  setModeratorNFTCollections: (
    moderatorNFTCollections: NFTcollection[]
  ) => void;
  startCall: () => Promise<[string, string, Web3Authentication] | undefined>;
  joinCall: (
    roomName: string
  ) => Promise<[string, Web3Authentication] | undefined>;
}

export function useWeb3CallState(
  setFeedbackMessage: (message: TranslationKeys) => void,
  web3Account: "ETH" | "SOL" | null,
  setWeb3Account: (web3Account: "ETH" | "SOL") => void
): Web3CallState {
  const [web3Address, _setWeb3Address] = useState<string>();
  const [permissionType, setPermissionType] =
    useState<Web3PermissionType>("NFT-collection");
  const [nft, setNft] = useState<NFT | null>(null);
  const [participantPoaps, setParticipantPoaps] = useState<POAP[]>([]);
  const [moderatorPoaps, setModeratorPoaps] = useState<POAP[]>([]);
  const [participantNFTCollections, setParticipantNFTCollections] = useState<
    NFTcollection[]
  >([]);
  const [moderatorNFTCollections, setModeratorNFTCollections] = useState<
    NFTcollection[]
  >([]);

  const setWeb3Address = (address: string, event: string) => {
    _setWeb3Address((prevAddress) => {
      switch (event) {
        case "login": {
          if (prevAddress) return prevAddress;
          return address;
        }
        case "accountsChanged": {
          return address;
        }
        case "accountChanged": {
          return address;
        }
        default: {
          return address;
        }
      }
    });
  };

  window.ethereum?.on("accountsChanged", (accounts: string[]) => {
    console.log("!!! ETH accountsChanged", accounts);
    setWeb3Account("ETH");
    setWeb3Address(accounts[0], "accountsChanged");
  });

  try {
    window.braveSolana?.on("accountChanged", (account: any) => {
      setWeb3Account("SOL");
      if (account) {
        console.log("!!! SOL accountChanged", account.toBase58());
        setWeb3Address(account.toBase58(), "accountsChanged");
      } else {
        console.log("!!! SOL accountChanged", account);
        setWeb3Address(account, "accountsChanged");
      }
    });
  } catch {
    console.warn("!!! Brave Wallet does not exists");
  }

  try {
    window.phantom?.solana.on("accountChanged", (account: any) => {
      setWeb3Account("SOL");
      console.log(account);
      if (account) {
        console.log("!!! SOL accountChanged", account.toBase58());
        setWeb3Address(account.toBase58(), "accountsChanged");
      } else {
        console.log("!!! SOL accountChanged", account);
        setWeb3Address(account, "accountsChanged");
      }
    });
  } catch {
    console.warn("!!! Phantom Wallet does not exists");
  }

  const joinCall = async (
    roomName: string
  ): Promise<[string, Web3Authentication] | undefined> => {
    let web3: Web3RequestBody | null = null;
    let auth: Web3Authentication | null = null;
    let jwt = "";
    try {
      if (web3Account === "ETH") {
        auth = await web3Prove(web3Address as string);
      } else {
        auth = await web3SolProve(web3Address as string);
      }
      web3 = {
        web3Authentication: auth,
        avatarURL: nft != null ? nft.image_url : "",
      };
    } catch (e: any) {
      console.error(e.message);

      if (e.message.includes("user rejected action")) {
        setFeedbackMessage("sign_request_cancelled");
      } else {
        setFeedbackMessage("sign_request_error");
      }
      return;
    }

    try {
      const { jwt: jwtResponse } = await fetchJWT(
        roomName,
        false,
        setFeedbackMessage,
        web3
      );
      jwt = jwtResponse;
    } catch (e: any) {
      console.error(e);

      if (e.message.includes("no-token")) {
        setFeedbackMessage("invalid_token_error");
      } else if (e.message.includes("no-currency")) {
        setFeedbackMessage("not_enough_currency_error");
      } else {
        setFeedbackMessage("not_participant_error");
      }
      return;
    }

    window.history.pushState({}, "", "/" + roomName);
    return [jwt, auth];
  };

  const startCall = async (): Promise<
    [string, string, Web3Authentication] | undefined
  > => {
    try {
      let auth: Web3Authentication | null = null;
      if (web3Account === "ETH") {
        auth = await web3Prove(web3Address as string);
      } else {
        auth = await web3SolProve(web3Address as string);
      }
      const roomName = generateRoomName();
      const web3 = {
        web3Authentication: auth,
        web3Authorization: {
          method: permissionType,
          account: web3Account,
          POAPs: {
            participantADs: {
              allow: participantPoaps.map((p) => p.event.id.toString()),
              deny: [],
            },
            moderatorADs: {
              allow: moderatorPoaps.map((p) => p.event.id.toString()),
              deny: [],
            },
          },
          Collections: {
            participantADs: {
              allow: participantNFTCollections.map((c) => c.id),
              deny: [],
            },
            moderatorADs: {
              allow: moderatorNFTCollections.map((c) => c.id),
              deny: [],
            },
          },
          Balances: {
            participants: {
              network: "ETH" as const,
              token: "BAT",
              minimum: "1",
            },
            moderators: {
              network: "ETH" as const,
              token: "BAT",
              minimum: "1",
            },
          },
        },
        avatarURL: nft != null ? nft.image_url : "",
      };

      const { jwt } = await fetchJWT(roomName, true, setFeedbackMessage, web3);
      window.history.pushState({}, "", "/" + roomName);
      return [roomName, jwt, auth];
    } catch (e: any) {
      console.error(e.message);
      if (e.message.includes("user rejected action")) {
        setFeedbackMessage("sign_request_cancelled");
      } else {
        setFeedbackMessage("sign_request_error");
      }
    }
  };

  return {
    web3Address,
    permissionType,
    nft,
    participantPoaps,
    moderatorPoaps,
    participantNFTCollections,
    moderatorNFTCollections,
    setWeb3Address,
    setPermissionType,
    setNft,
    setParticipantPoaps,
    setModeratorPoaps,
    setParticipantNFTCollections,
    setModeratorNFTCollections,
    startCall,
    joinCall,
  };
}
