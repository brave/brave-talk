import Web3 from "web3";
import { fetchWithTimeout } from "../../lib";
import { NFTcollection, POAP } from "./core";
import { EIP4361Message, createEIP4361Message } from "./EIP4361";

declare let window: any;

export interface Web3Auth {
  method: string;
  proof: {
    signer: string;
    signature: any;
    payload: any;
  };
}

export const web3Login = async (): Promise<string> => {
  const allAddresses: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  console.log(`!!! allAddresses`, allAddresses);

  return allAddresses[0];
};

const alchemyApiKey = process.env.ALCHEMY_API_KEY;

const web3NFTs_ = async (address: string): Promise<string[]> => {
  try {
    const getNFTsURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${alchemyApiKey}/getNFTs?owner=${address}&withMetadata=true`;
    console.log(`>>> GET ${getNFTsURL}`);
    const response = await fetchWithTimeout(getNFTsURL, { method: "GET" });
    const { status } = response;
    console.log(`<<< GET ${getNFTsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const nfts = await response.json();
    const result: string[] = [];
    nfts.ownedNfts.forEach((nft: any) => {
      // TBD: capture and return nft.title to use for tooltip
      nft.media.forEach((medium: any) => {
        result.push(medium.thumbnail);
      });
    });

    try {
      const result2 = await web3NFTcollections(address);
      console.log("!!! web3NFTcollections", result2);
    } catch (error: any) {
      console.error("!!! web3NFTcollections", error);
      throw error;
    }

    return result;
  } catch (error: any) {
    console.error("!!! web3NFTs", error);
    throw error;
  }
};

const poapApiKey = process.env.POAP_API_KEY as string;

const web3POAPs_ = async (address: string): Promise<POAP[]> => {
  try {
    const getPOAPsURL = `https://api.poap.tech/actions/scan/${address}`;
    console.log(`>>> GET ${getPOAPsURL}`);
    const response = await fetchWithTimeout(getPOAPsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": poapApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getPOAPsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const poaps = await response.json();
    const result: any[] = [];
    poaps.forEach((poap: any) => {
      result.push(poap);
    });

    return result;
  } catch (error: any) {
    console.error("!!! web3POAPs", error);
    throw error;
  }
};

const simplehashApiKey = process.env.SIMPLEHASH_API_KEY as string;

export const web3NFTs = async (address: string): Promise<any[]> => {
  try {
    const getNFTsURL = `https://api.simplehash.com/api/v0/nfts/owners?chains=ethereum&wallet_addresses=${address}`;
    console.log(`>>> GET ${getNFTsURL}`);
    const response = await fetchWithTimeout(getNFTsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": simplehashApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getNFTsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const nfts = await response.json();
    const result: any[] = [];
    nfts.nfts.forEach((nft: any) => {
      const tooltip: string = nft.collection.name + ": " + nft.name;
      const thumbnail: string = nft.previews?.image_small_url
        ? nft.previews.image_small_url
        : nft.image_url;
      /* TBD: uncomment this line, and delete the line following the comment...
      result.push({ tooltip, thumbnail });
*/
      result.push(thumbnail);
    });

    return result;
  } catch (error: any) {
    console.error("!!! web3NFTs", error);
    throw error;
  }
};

export const web3NFTcollections = async (
  address: string
): Promise<NFTcollection[]> => {
  try {
    const getNFTcollectionsURL = `https://api.simplehash.com/api/v0/nfts/collections_by_wallets?chains=ethereum&wallet_addresses=${address}`;
    console.log(`>>> GET ${getNFTcollectionsURL}`);
    const response = await fetchWithTimeout(getNFTcollectionsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": simplehashApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getNFTcollectionsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const collections = await response.json();
    const result: any[] = [];
    collections.collections.forEach((collection: any) => {
      result.push(collection);
    });

    return result;
  } catch (error: any) {
    console.error("!!! web3NFTcollections", error);
    throw error;
  }
};

const STORAGE_KEY = "mock.web3.authentication";

export const web3Prove = async (web3Address: string): Promise<Web3Auth> => {
  if (!web3Address) {
    throw new Error("not logged into Web3");
  }

  window.web3 = new Web3(window.ethereum);
  if (!window.web3) {
    throw new Error("unable to create Web3 object");
  }

  const nonce = new Uint8Array(32);
  crypto.getRandomValues(nonce);

  const message: EIP4361Message = {
    domain: "talk.brave.com",
    address: web3Address,
    statement:
      "Please sign this message so Brave Talk knows that you own this address",
    uri: "https://talk.brave.com",
    version: "1",
    chainId: 1,
    // HT:https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex/40031979
    // btoa has some characters not allowed by the EIP-4361 ABNF
    nonce: [...nonce].map((x) => x.toString(16).padStart(2, "0")).join(""),
    issuedAt: new Date().toISOString(),
  };
  const payload = window.web3.utils.utf8ToHex(createEIP4361Message(message));

  const signature = await window.web3.eth.sign(payload, web3Address);
  console.log(`!!! web3 signature=${signature}`);

  const result = {
    method: "EIP-4361-json",
    proof: {
      signer: web3Address,
      signature: signature,
      payload: payload,
    },
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));

  return result;
};

export const web3RestoreAuth = (): any => {
  try {
    if (!window.web3) {
      window.web3 = new Web3(window.ethereum);
      if (!window.web3) {
        throw new Error("unable to create Web3 object");
      }
    }

    const auth = window.localStorage.getItem(STORAGE_KEY);

    return JSON.parse(auth);
  } catch (error) {
    // continue regardless of error
  }
};

const poapContractAddress = "0x22c1f6050e56d2876009903609a2cc3fef83b415";
const poapContractChain = "gnosis";

export const web3POAPs = async (address: string): Promise<POAP[]> => {
  try {
    const getPOAPsURL = `https://api.simplehash.com/api/v0/nfts/owners?chains=${poapContractChain}&wallet_addresses=${address}&contract_addresses=${poapContractAddress}`;
    console.log(`>>> GET ${getPOAPsURL}`);
    const response = await fetchWithTimeout(getPOAPsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": simplehashApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getPOAPsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const data = await response.json();
    const result: any[] = [];
    data.nfts.forEach((nft: any) => {
      const parts: string[] = nft.external_url.split("/");
      const eventID = parts[parts.length - 2];
      result.push({
        event: { id: eventID, name: nft.name, image_url: nft.image_url },
        tokenId: nft.token_id,
      });
    });

    return result;
  } catch (error: any) {
    console.error("!!! web3POAPs", error);
    throw error;
  }
};

// these three functions are used for mocking

const web3POAPevent_ = async (eventID: number): Promise<boolean> => {
  try {
    const getPOAPsURL = `https://api.poap.tech/events/id/${eventID}`;
    console.log(`>>> GET ${getPOAPsURL}`);
    const response = await fetchWithTimeout(getPOAPsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": poapApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getPOAPsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }
    return true;
  } catch (error: any) {
    console.error(`!!! web3POAPevent: eventID=${eventID}`, error);
    return false;
  }
};

export const web3POAPevent = async (eventID: number): Promise<boolean> => {
  try {
    const getPOAPsURL = `https://api.simplehash.com/api/v0/nfts/${poapContractChain}/${poapContractAddress}/${eventID}`;
    console.log(`>>> GET ${getPOAPsURL}`);
    const response = await fetchWithTimeout(getPOAPsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": simplehashApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getPOAPsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const data = await response.json();
    return !!data.nft_id;
  } catch (error: any) {
    console.error(`!!! web3POAPevent: eventID=${eventID}`, error);
    return false;
  }
};

export const web3NFTcollection = async (
  collectionID: string
): Promise<boolean> => {
  try {
    const getNFTcollectionsURL = `https://api.simplehash.com/api/v0/nfts/collections/ids?collection_ids=${collectionID}`;
    console.log(`>>> GET ${getNFTcollectionsURL}`);
    const response = await fetchWithTimeout(getNFTcollectionsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": simplehashApiKey,
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getNFTcollectionsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const collections: any[] = await response.json();
    return collections.length > 0;
  } catch (error: any) {
    console.error(`!!! web3NFTcollection: collectionId=${collectionID}`, error);
    return false;
  }
};
