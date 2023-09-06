import { Text } from "../Text";
import { css, keyframes } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { generateSIWEForCrypto } from "./api";
import { IJitsiMeetApi } from "../../jitsi/types";
import { getNonce } from "./api";
import { SiweMessage } from "siwe";
import { verifyMessage, parseUnits, Transaction } from "ethers";
import { Buffer } from "buffer";
import { AllowedERC20Tokens, sendCrypto } from "./send-crypto";
import { AnimatedArrow } from "./AnimatedArrow";

const DEBUG = false;

const fadeInAnim = keyframes`
  0% { 
    opacity: 0; 
    transform: translateY(-20px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

const popupBaseCSS = css`
  position: absolute;
  border-radius: var(--radius-xl, 8px);
  border: 1px solid var(--semantic-border-color, #e5e5e5);
  border-radius: 8px;
  background: var(--semantic-container-background, #fff);
  display: flex;
  width: 500px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  background-color: #ffffff;
  color: #000000;
  z-index: 99999;
  animation: ease-in-out 0.5s ${fadeInAnim};
`;

const popupCSSTopLeft = css`
  top: 10px;
  left: 10px;
`;

const popupCSSBottomRight = css`
  bottom: 10px;
  right: 10px;
`;

const popupCSSCetner = css`
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

const popupContentCSS = css`
  padding: 20px;
  font-size: 16px;
`;

const actionsCSS = css`
  display: flex;
  padding: 20px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: var(--spacing-xl, 16px);
  align-self: stretch;
`;

const buttonCSS = css`
  width: 150px;
  height: 44px;
  margin-right: 16px;
  margin-left: 16px;
  border-radius: 22px;
  background-color: #3f39e8;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  flex: 1 0 0;
`;

const popupHeaderCSS = css`
  display: flex;
  height: 56px;
  padding: 8px 16px 8px 24px;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
`;

const inputCSS = css`
  width: 80px;
  height: 16px;
  gap: 8px;
  border: 0px;
  font-size: 16px;
  border-bottom: 1px solid #a1abba;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
  vertical-align: middle;
  &:focus {
    border-bottom: 2px solid #3f39e8;
  }
  &:invalid {
    border-bottom: 2px solid #ff0000;
  }
  outline: none;
`;

const highlightBoxCSS = css`
  border-radius: 4px;
  background: #e9eeff;
  padding: 16px;
`;

const onlyNumberOrDecimal = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const charCode = e.key.charCodeAt(0);
  if (
    charCode > 31 &&
    (charCode < 48 || charCode > 57) &&
    charCode !== 46 &&
    e.key != "Backspace"
  ) {
    e.preventDefault();
  }
};

const Divider = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="500px"
      height="1"
      viewBox="0 0 500 1"
      fill="none"
      css={css`
        display: flex;
        height: 1px;
        justify-content: center;
        align-items: center;
        align-self: stretch;
      `}
    >
      <rect width="500" height="1" fill="#A1ABBA" fill-opacity="0.4" />
    </svg>
  );
};

const getNameFromId = async (jitsi: IJitsiMeetApi, id: string) => {
  const info = (await jitsi.getRoomsInfo()).rooms;
  const room = info.filter((r: any) => r.isMainRoom)[0];
  const name = room.participants.filter((p: any) => p.id === id)[0].displayName;

  return name;
};

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
  jitsiId: string;
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

const DEBUG_SHOW = true;

export const CryptoRecievePopup: React.FC<CryptoPopupProps> = ({
  incomingRequests,
  setIncomingRequests,
  web3Address,
  jitsi,
}) => {
  const [showing, setShowing] = useState(DEBUG_SHOW);
  const [params, setParams] = useState({} as any);

  const returnSIWEToOrigin = async () => {
    let siwe: SIWEReturnParams;
    try {
      siwe = await generateSIWEForCrypto(
        web3Address,
        params,
        `Please sign this message so that ${params.senderDisplayName} knows that you own this address, and may send you ${params.amount} ${params.token}.`
      );
    } catch (e) {
      console.log(e);
      rejectIncomingRequest();
      return;
    }
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
          <div css={popupHeaderCSS}>Incoming Crypto Send Request</div>
          <Divider />
          <div css={popupContentCSS}>
            {incomingRequests.length > 1 && (
              <div>{`Pending Requests (${incomingRequests.length})`}</div>
            )}
            <div css={{ margin: "10px" }}>
              <Text variant="body">{`${params.senderDisplayName} wants to send you ${params.amount} ${params.token}! Your current address is ${web3Address}.`}</Text>
            </div>
            <div css={actionsCSS}>
              <button onClick={returnSIWEToOrigin} css={buttonCSS}>
                Accept
              </button>
              <button onClick={rejectIncomingRequest} css={buttonCSS}>
                Reject
              </button>
            </div>
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
  const [showing, setShowing] = useState(DEBUG_SHOW);
  const [value, setValue] = useState(0.0);
  const [pendingName, setPendingName] = useState("");
  const sendAndRegisterOutgoingRequest = async () => {
    const amount = value;
    const token = "BAT";
    const nonce = await getNonce();
    const recipientDisplayName = await getNameFromId(jitsi, pending);

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
    const _setName = async (id: string) => {
      setPendingName(await getNameFromId(jitsi, id));
    };
    if (pending) {
      _setName(pending);
      setShowing(true);
    } else {
      setShowing(false);
    }
  }, [pending]);

  return (
    <div>
      {showing && (
        <div css={[popupBaseCSS, popupCSSBottomRight]}>
          <div css={popupHeaderCSS}>Send Crypto</div>
          <Divider />
          <div css={popupContentCSS}>
            <div css={{ fontSize: "16px" }}>
              <span>Send: </span>
              <input
                type="text"
                pattern="\d*.?\d*"
                onKeyDown={onlyNumberOrDecimal}
                css={inputCSS}
                onChange={(e) => {
                  e.target.value === ""
                    ? setValue(0.0)
                    : setValue(
                        Math.min(
                          parseFloat(e.target.value),
                          Number.MAX_SAFE_INTEGER
                        )
                      );
                }}
              />
              <span>BAT</span>
              <AnimatedArrow />
              <span>{pendingName}</span>
            </div>
            <div css={actionsCSS}>
              <button onClick={sendAndRegisterOutgoingRequest} css={buttonCSS}>
                Send
              </button>
              <button onClick={() => setPending("")} css={buttonCSS}>
                Cancel
              </button>
            </div>
          </div>
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
  const [showing, setShowing] = useState(DEBUG_SHOW);
  const [currentPendingParams, setCurrentPendingParams] =
    useState<CryptoTransactionParams | null>();

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
    let tx;
    try {
      tx = await sendCrypto(
        currentRequest.amount,
        currentRequest.token,
        proof.signer
      );
    } catch (e) {
      console.log("!!! error sending crypto", e);
    }
    setOutstandingRequests(
      outstandingRequests.filter((r) => r.nonce !== msg.nonce)
    );
    setCurrentResolution(null);
  };

  const removePending = () => {
    if (!currentResolution) return console.log("!!! currentResolution not set");
    const { proof } = currentResolution.siwe;
    const { signer, signature, payload } = proof;
    const payloadStr = Buffer.from(payload.slice(2), "hex").toString("utf8");
    const msg = new SiweMessage(payloadStr);

    setOutstandingRequests(
      outstandingRequests.filter((r) => r.nonce !== msg.nonce)
    );
    setCurrentResolution(null);
    setCurrentPendingParams(null);
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

      const currentPendingParams = outstandingRequests.filter(
        (r) => r.nonce === nonce && r.recipient === currentResolution.jitsiId
      )[0];
      setShowing(true);
      setCurrentPendingParams(currentPendingParams);
    } else {
      setShowing(false);
    }
  }, [currentResolution]);

  return (
    <div>
      {currentResolution && (
        <div css={[popupBaseCSS, popupCSSCetner]}>
          <div css={popupHeaderCSS}>Confirm Send</div>
          <Divider />
          <div css={popupContentCSS}>
            <div
              css={{ margin: "10px" }}
            >{`${currentResolution.senderDisplayName} has signed a message for you with the address below. Please verify with the recipient that their address is the following:`}</div>
            <div
              css={[
                {
                  margin: "10px",
                  textAlign: "center",
                  fontFamily: "monospace",
                },
                highlightBoxCSS,
              ]}
            >{`${currentResolution.siwe.proof.signer}`}</div>
            <div>
              {`You will be sending ${currentPendingParams?.amount} ${currentPendingParams?.token} to ${currentResolution.senderDisplayName}.`}
            </div>
            <div css={actionsCSS}>
              <button css={buttonCSS} onClick={resolvePending}>
                Send
              </button>
              <button
                css={buttonCSS}
                onClick={() => {
                  setCurrentResolution(null);
                  removePending();
                }}
              >
                {" "}
                Cancel
              </button>
            </div>
          </div>
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
      {(incomingRequests.length > 0 || outstandingRequests.length > 0) &&
        DEBUG && (
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
