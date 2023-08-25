import { Text } from "../Text";
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { generateSIWEForCrypto } from "./api";
import { IJitsiMeetApi } from "../../jitsi/types";
import { getNonce } from "./api";
import { SiweMessage } from "siwe";
import { verifyMessage, parseUnits, Transaction } from "ethers";
import { Buffer } from "buffer";
import { AllowedERC20Tokens, sendCrypto } from "./send-crypto";
const popupBaseCSS = css`
  position: absolute;
  margin: 10px;
  width: 30%;
  height: 10%;
  border-radius: 0.5rem;
  background-color: rgb(128, 128, 128);
  z-index: 99999;
  font-family: system-ui;
`;

const popupCSSTopLeft = css`
  top: 0;
  left: 0;
`;

const popupCSSBottomRight = css`
  bottom: 0;
  right: 0;
`;

const popupCSSCetner = css`
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

const buttonCSS = css`
  margin: 10px;
  width: 20%;
  cursor: pointer;
  border-radius: 0.2rem;
`;

export interface CryptoTransactionParams {
  senderDisplayName: string;
  sender: string;
  recipient: string;
  recipientDisplayName: string;
  amount: number;
  token: AllowedERC20Tokens;
  nonce: string;
}

export interface SIWEReturnParams {
  proof: {
    signer: string;
    signature: string;
    payload: string;
  };
  method: string;
}

interface TransactionPendingResolution {
  senderDisplayName: string;
  siwe: SIWEReturnParams;
}

interface CryptoSendMessage {
  type: "crypto";
  msgType: "REQ" | "REJECT" | "SIGNED";
  payload: SIWEReturnParams | CryptoTransactionParams | string;
}

interface CryptoPopupProps {
  incomingRequests: CryptoTransactionParams[];
  setIncomingRequests: React.Dispatch<
    React.SetStateAction<CryptoTransactionParams[]>
  >;
  web3Address: string;
  jitsi: IJitsiMeetApi;
}

export const CryptoRecievePopup: React.FC<CryptoPopupProps> = ({
  incomingRequests,
  setIncomingRequests,
  web3Address,
  jitsi,
}) => {
  const [showing, setShowing] = useState(false);
  const [params, setParams] = useState({} as any);

  const returnSIWEToOrigin = async () => {
    const siwe: SIWEReturnParams = await generateSIWEForCrypto(
      web3Address,
      params,
      "Confirm"
    );
    if (!params) return console.log("!!! params not set");
    if (!jitsi) return console.log("!!! jitsi not set");
    const msg: CryptoSendMessage = {
      type: "crypto",
      msgType: "SIGNED",
      payload: siwe,
    };
    jitsi.executeCommand(
      "sendEndpointTextMessage",
      params.sender,
      JSON.stringify(msg)
    );
    incomingRequestsPopFront();
  };
  const incomingRequestsPopFront = () => {
    setIncomingRequests(incomingRequests.slice(1));
  };
  const rejectIncomingRequest = () => {
    jitsi.executeCommand(
      "sendEndpointTextMessage",
      params.sender,
      JSON.stringify({
        type: "crypto",
        msgType: "REJECT",
        payload: params.nonce,
      })
    );
    incomingRequestsPopFront();
  };
  useEffect(() => {
    console.log("!!! incomingRequests", incomingRequests);
    if (incomingRequests.length > 0) {
      setShowing(true);
      setParams(incomingRequests[0]);
    } else {
      setShowing(false);
    }
  }, [incomingRequests]);

  return (
    <div>
      {showing && (
        <div css={[popupBaseCSS, popupCSSTopLeft]}>
          {incomingRequests.length > 1 && (
            <div>{`Pending Requests (${incomingRequests.length})`}</div>
          )}
          <div css={{ margin: "10px" }}>
            <Text variant="body">{`${params.senderDisplayName} wants to send you ${params.amount} ${params.token}! Your current address is ${web3Address}.`}</Text>
          </div>
          <div>
            <button onClick={returnSIWEToOrigin} css={buttonCSS}>
              Accept
            </button>
            <button onClick={rejectIncomingRequest} css={buttonCSS}>
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CryptoSendPopupProps {
  outgoingRequests: CryptoTransactionParams[];
  setOutgoingRequests: React.Dispatch<
    React.SetStateAction<CryptoTransactionParams[]>
  >;
  web3Address: string;
  jitsi: IJitsiMeetApi;
  pending: string;
  setPending: React.Dispatch<React.SetStateAction<string>>;
}

export const CryptoSendPopup: React.FC<CryptoSendPopupProps> = ({
  outgoingRequests,
  setOutgoingRequests,
  web3Address,
  jitsi,
  pending,
  setPending,
}) => {
  const [showing, setShowing] = useState(false);
  const [value, setValue] = useState(0);

  const sendAndRegisterOutgoingRequest = async () => {
    const amount = value;
    const token = "BAT";
    const nonce = await getNonce();
    const recipientDisplayName = (await jitsi.getRoomsInfo()).rooms
      .filter((r: any) => r.isMainRoom)[0]
      .participants.filter((p: any) => p.id === pending)[0].displayName;

    const sendParams: CryptoTransactionParams = {
      senderDisplayName: "me",
      sender: "me",
      amount,
      token,
      nonce,
      recipient: pending,
      recipientDisplayName,
    };
    const msg: CryptoSendMessage = {
      type: "crypto",
      msgType: "REQ",
      payload: sendParams,
    };
    setOutgoingRequests([...outgoingRequests, sendParams]);

    jitsi.executeCommand(
      "sendEndpointTextMessage",
      pending,
      JSON.stringify({
        type: "crypto",
        msgType: "REQ",
        payload: { amount, token, nonce },
      })
    );

    setPending("");
  };
  useEffect(() => {
    if (pending) {
      setShowing(true);
    } else {
      setShowing(false);
    }
  }, [pending]);

  return (
    <div>
      {showing && (
        <div css={[popupBaseCSS, popupCSSBottomRight]}>
          <span>Amount: </span>
          <input
            type="number"
            value={value}
            css={{ margin: "10px" }}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
          />
          <button onClick={sendAndRegisterOutgoingRequest} css={buttonCSS}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};

interface CryptoOOBPopupProps {
  currentResolution: null | TransactionPendingResolution;
  setCurrentResolution: React.Dispatch<
    React.SetStateAction<null | TransactionPendingResolution>
  >;
  outstandingRequests: CryptoTransactionParams[];
  setOutstandingRequests: React.Dispatch<
    React.SetStateAction<CryptoTransactionParams[]>
  >;
}

export const CryptoOOBPopup: React.FC<CryptoOOBPopupProps> = ({
  currentResolution,
  setCurrentResolution,
  outstandingRequests,
  setOutstandingRequests,
}) => {
  const [showing, setShowing] = useState(false);

  // TODO: wrap in try catch
  const resolvePending = async () => {
    if (!currentResolution) return console.log("!!! currentResolution not set");
    const { proof } = currentResolution.siwe;
    const { signer, signature, payload } = proof;
    const payloadStr = Buffer.from(payload.slice(2), "hex").toString("utf8");
    const msg = new SiweMessage(payloadStr);
    const currentRequest = outstandingRequests.filter(
      (r) => r.nonce === msg.nonce
    )[0];
    // check nonce exists
    const tx = await sendCrypto(
      currentRequest.amount,
      currentRequest.token,
      proof.signer
    );
    setOutstandingRequests(
      outstandingRequests.filter((r) => r.nonce !== msg.nonce)
    );
    setCurrentResolution(null);
  };

  // TODO: wrap in try catch
  useEffect(() => {
    if (currentResolution) {
      const { proof } = currentResolution.siwe;
      const { signer, signature, payload } = proof;
      const payloadStr = Buffer.from(payload.slice(2), "hex").toString("utf8");
      const addr = verifyMessage(payloadStr, signature);
      const ok = addr === signer;
      console.log("!!! ok", ok);
      console.log("!!! addr", addr, " ", signer);
      const msg = new SiweMessage(payloadStr);

      // check nonce exists
      const nonce = msg.nonce;
      const nonceExists =
        outstandingRequests.filter((r) => r.nonce === nonce).length > 0;
      if (!ok || !nonceExists) {
        setCurrentResolution(null);
        console.log("!!! not ok, bad signature");
        return;
      }
      setShowing(true);
    } else {
      setShowing(false);
    }
  }, [currentResolution]);

  return (
    <div>
      {currentResolution && (
        <div css={[popupBaseCSS, popupCSSCetner]}>
          <div
            css={{ margin: "10px" }}
          >{`Your send request to ${currentResolution.senderDisplayName} has been signed. Please verify with the recipient that their address is the following:`}</div>
          <div
            css={{
              margin: "10px",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          >{`${currentResolution.siwe.proof.signer}`}</div>
          <button css={buttonCSS} onClick={resolvePending}>
            Send
          </button>
          <button css={buttonCSS} onClick={() => setCurrentResolution(null)}>
            {" "}
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

interface CryptoWrapperProps {
  jitsi: IJitsiMeetApi;
}

// exposed global object so event handlers can access setState
export const cryptoAction = {
  addOutstandingRequest: null as any,
  resolveOutstandingRequest: null as any,
  addIncomingRequest: null as any,
  resolveIncomingRequest: null as any,
  sendOutstandingRequest: null as any,
  attemptResolveOutstandingRequest: null as any,
  rejectOutstandingRequest: null as any,
  isInit: false,
};

export const CryptoWrapper: React.FC<CryptoWrapperProps> = ({ jitsi }) => {
  const [outstandingRequests, setOutstandingRequests] = useState(
    [] as CryptoTransactionParams[]
  );
  const [incomingRequests, setIncomingRequests] = useState(
    [] as CryptoTransactionParams[]
  );
  const [web3Address, setWeb3Address] = useState("");
  const [currentPendingOutgoingRequest, setCurrentPendingOutgoingRequest] =
    useState("");
  const [currentAttemptedResolution, setCurrentAttemptedResolution] =
    useState<null | TransactionPendingResolution>(null);

  window.ethereum?.on("accountsChanged", (accounts: string[]) => {
    console.log("!!! ETH accountsChanged", accounts);
    if (accounts) setWeb3Address(accounts[0]);
  });

  const fetchCurrentAddress = async () => {
    const { ethers } = await import("ethers");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWeb3Address(address);
    console.log("!!! ETH address set for crypto popup", web3Address);
  };
  useEffect(() => {
    fetchCurrentAddress();
  }, []);

  const initializeCryptoAction = () => {
    cryptoAction.addOutstandingRequest = (params: CryptoTransactionParams) => {
      setOutstandingRequests(outstandingRequests.concat(params));
    };
    cryptoAction.resolveOutstandingRequest = (
      params: CryptoTransactionParams
    ) => {
      setOutstandingRequests(
        outstandingRequests.filter((p) => p.nonce !== params.nonce)
      );
    };
    cryptoAction.addIncomingRequest = (params: CryptoTransactionParams) => {
      setIncomingRequests(incomingRequests.concat(params));
    };
    cryptoAction.resolveIncomingRequest = (params: CryptoTransactionParams) => {
      setIncomingRequests(
        incomingRequests.filter((p) => p.nonce !== params.nonce)
      );
    };
    cryptoAction.sendOutstandingRequest = (id: string) => {
      setCurrentPendingOutgoingRequest(id);
    };
    cryptoAction.attemptResolveOutstandingRequest = (
      tx: TransactionPendingResolution
    ) => {
      setCurrentAttemptedResolution(tx);
    };
    cryptoAction.rejectOutstandingRequest = (nonce: string) => {
      console.log("!!! rejectOutstandingRequest", nonce);
      setOutstandingRequests(
        outstandingRequests.filter((r) => r.nonce !== nonce)
      );
    };
    cryptoAction.isInit = true;
  };
  initializeCryptoAction();
  useEffect(() => {
    initializeCryptoAction();
  }, []);
  return (
    <div>
      <CryptoRecievePopup
        incomingRequests={incomingRequests}
        setIncomingRequests={setIncomingRequests}
        jitsi={jitsi}
        web3Address={web3Address}
      />
      <CryptoSendPopup
        outgoingRequests={outstandingRequests}
        setOutgoingRequests={setOutstandingRequests}
        pending={currentPendingOutgoingRequest}
        setPending={setCurrentPendingOutgoingRequest}
        jitsi={jitsi}
        web3Address={web3Address}
      />
      <CryptoOOBPopup
        currentResolution={currentAttemptedResolution}
        setCurrentResolution={setCurrentAttemptedResolution}
        outstandingRequests={outstandingRequests}
        setOutstandingRequests={setOutstandingRequests}
      />
      {(incomingRequests.length > 0 || outstandingRequests.length > 0) && (
        <div
          css={[
            popupBaseCSS,
            css`
              left: 0;
              bottom: 0;
            `,
          ]}
        >
          <div css={{ margin: "10px" }}>Your address: {web3Address}</div>
          <div>
            {outstandingRequests.map((request) => (
              <div>{`ME -> ${request.recipientDisplayName}: ${request.amount}`}</div>
            ))}
          </div>
          <div>
            {incomingRequests.map((request) => (
              <div>{`${request.senderDisplayName} -> ME: ${request.amount}`}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
