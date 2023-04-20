import { ethers, hexlify } from "ethers";
import { fetchWithTimeout } from "../../lib";
import { NFTcollection, POAP, NFT } from "./core";
import { EIP4361Message, createEIP4361Message } from "./EIP4361";

declare let window: any;

// the subscriptions service is forwarded by CloudFront onto talk.brave* so we're not
// making a cross domain call - see https://github.com/brave/devops/issues/5445.
const SIMPLEHASH_PROXY_ROOT_URL = "/api/v1/simplehash";

export interface Web3Authentication {
  method: string;
  proof: {
    signer: string;
    signature: any;
    payload: any;
  };
}

export interface Web3Authorization {
  method: string;
  POAPs: Web3AuthList;
  Collections: Web3AuthList;
}

export interface Web3AuthList {
  participantADs: Web3ResourceIdentifierList;
  moderatorADs: Web3ResourceIdentifierList;
}

export interface Web3ResourceIdentifierList {
  allow: string[];
  deny: string[];
}

export interface Web3RequestBody {
  web3Authentication: Web3Authentication;
  web3Authorization?: Web3Authorization;
  avatarURL: string | null;
}

export const web3Login = async (): Promise<string> => {
  const allAddresses: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  console.log(`!!! allAddresses`, allAddresses);

  return allAddresses[0];
};

export const web3NFTs = async (address: string): Promise<NFT[]> => {
  try {
    const getNFTsURL = `${SIMPLEHASH_PROXY_ROOT_URL}/api/v0/nfts/owners?chains=ethereum&wallet_addresses=${encodeURIComponent(
      address
    )}`;
    console.log(`>>> GET ${getNFTsURL}`);
    const response = await fetchWithTimeout(getNFTsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    const { status } = response;
    console.log(`<<< GET ${getNFTsURL} ${status}`);
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const nfts = await response.json();
    const result: NFT[] = [];
    nfts.nfts.forEach((nft: any) => {
      //const tooltip: string = nft.collection.name + ": " + nft.name;
      const thumbnail: string = nft.previews?.image_small_url
        ? nft.previews.image_small_url
        : nft.image_url;
      /* TBD: uncomment this line, and delete the line following the comment...
      result.push({ tooltip, thumbnail });
*/
      result.push({
        image_url: nft.previews?.image_small_url
          ? nft.previews.image_small_url
          : nft.image_url,
        name: nft.name,
        collection: {
          collection_id: nft.collection?.collection_id,
          name: nft.collection?.name,
        },
      });
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
  const getNFTs = async (url: string): Promise<NFTcollection[]> => {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    const { status } = response;
    if (status !== 200) {
      throw new Error(`Request failed: ${status} ${response.statusText}`);
    }

    const page = await response.json();
    let { nfts } = page;
    const { next } = page;
    if (next) {
      nfts = nfts.concat(await getNFTs(next));
    }

    const collections = nfts.reduce(
      (collections: { [key: string]: NFTcollection }, nft: NFT) => {
        if (
          nft?.collection?.collection_id &&
          !collections[nft.collection.collection_id]
        ) {
          collections[nft.collection.collection_id] = {
            id: nft.collection.collection_id,
            name: nft.collection.name,
            image_url: nft.image_url,
          };
        }

        return collections;
      },
      {}
    );

    return Object.values(collections);
  };

  try {
    const getNFTsByWalletURL = `${SIMPLEHASH_PROXY_ROOT_URL}/api/v0/nfts/owners?chains=ethereum&wallet_addresses=${encodeURIComponent(
      address
    )}`;
    console.log(`>>> GET ${getNFTsByWalletURL}`);
    return getNFTs(getNFTsByWalletURL);
  } catch (error: any) {
    console.error("!!! web3NFTcollections", error);
    throw error;
  }
};

const getNonce = async (): Promise<string> => {
  const getNonceURL = "/api/v1/nonce";
  const response = await fetchWithTimeout(getNonceURL, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  const { nonce } = await response.json();
  return nonce;
};

export const web3Prove = async (
  web3Address: string
): Promise<Web3Authentication> => {
  if (!web3Address) {
    throw new Error("not logged into Web3");
  }

  window.web3 = new ethers.BrowserProvider(window.ethereum);
  if (!window.web3) {
    throw new Error("unable to create ethers.BrowserProvider object");
  }

  const nonce = await getNonce();
  console.log("!!! nonce", nonce);
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
    nonce: nonce,
    issuedAt: new Date().toISOString(),
  };
  const payload = createEIP4361Message(message);
  const payloadBytes = new TextEncoder().encode(payload);
  const hexPayload = hexlify(payloadBytes);
  const signer = await window.web3.getSigner(web3Address);
  const signature = await signer.signMessage(payload);
  console.log(`!!! web3 signature=${signature}`);

  const result = {
    method: "EIP-4361-json",
    proof: {
      signer: web3Address,
      signature: signature,
      payload: hexPayload,
    },
  };

  return result;
};

const poapContractAddress = "0x22c1f6050e56d2876009903609a2cc3fef83b415";
const poapContractChain = "gnosis";

export const web3POAPs = async (address: string): Promise<POAP[]> => {
  try {
    const getPOAPsURL = `${SIMPLEHASH_PROXY_ROOT_URL}/api/v0/nfts/owners?chains=${poapContractChain}&wallet_addresses=${encodeURIComponent(
      address
    )}&contract_addresses=${poapContractAddress}`;
    console.log(`>>> GET ${getPOAPsURL}`);
    const response = await fetchWithTimeout(getPOAPsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
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

export const web3POAPevent = async (eventID: number): Promise<boolean> => {
  try {
    const getPOAPsURL = `${SIMPLEHASH_PROXY_ROOT_URL}/api/v0/nfts/${poapContractChain}/${poapContractAddress}/${encodeURIComponent(
      eventID
    )}`;
    console.log(`>>> GET ${getPOAPsURL}`);
    const response = await fetchWithTimeout(getPOAPsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
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
    const getNFTcollectionsURL = `${SIMPLEHASH_PROXY_ROOT_URL}/api/v0/nfts/collections/ids?collection_ids=${encodeURIComponent(
      collectionID
    )}`;
    console.log(`>>> GET ${getNFTcollectionsURL}`);
    const response = await fetchWithTimeout(getNFTcollectionsURL, {
      method: "GET",
      headers: {
        accept: "application/json",
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
