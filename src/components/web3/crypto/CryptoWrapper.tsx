import { isProduction } from "../environment";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { IJitsiMeetApi } from "../../../jitsi/types";
import {
  CryptoTransactionParams,
  TransactionPendingResolution,
} from "./common";
import { popupBaseCSS } from "./common-css";
import { CryptoRecievePopup } from "./CryptoRecievePopup";
import { CryptoOOBPopup } from "./CryptoOOBPopup";
import { CryptoSendPopup } from "./CryptoSendPopup";

const DEBUG = false;

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

export const CryptoWrapper: React.FC<CryptoWrapperProps> = ({
  jitsi,
}: CryptoWrapperProps) => {
  const [outstandingRequests, setOutstandingRequests] = useState(
    [] as CryptoTransactionParams[],
  );
  const [incomingRequests, setIncomingRequests] = useState(
    [] as CryptoTransactionParams[],
  );
  const [web3Address, setWeb3Address] = useState("");
  const [currentPendingOutgoingRequest, setCurrentPendingOutgoingRequest] =
    useState("");
  const [currentAttemptedResolution, setCurrentAttemptedResolution] =
    useState<null | TransactionPendingResolution>(null);

  window.ethereum?.on("accountsChanged", (accounts: string[]) => {
    if (!isProduction) {
      console.log("!!! ETH accountsChanged", accounts);
    }
    fetchCurrentAddress();
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
      params: CryptoTransactionParams,
    ) => {
      setOutstandingRequests(
        outstandingRequests.filter((p) => p.nonce !== params.nonce),
      );
    };
    cryptoAction.addIncomingRequest = (params: CryptoTransactionParams) => {
      setIncomingRequests(incomingRequests.concat(params));
    };
    cryptoAction.resolveIncomingRequest = (params: CryptoTransactionParams) => {
      setIncomingRequests(
        incomingRequests.filter((p) => p.nonce !== params.nonce),
      );
    };
    cryptoAction.sendOutstandingRequest = (id: string) => {
      setCurrentPendingOutgoingRequest(id);
    };
    cryptoAction.attemptResolveOutstandingRequest = (
      tx: TransactionPendingResolution,
    ) => {
      setCurrentAttemptedResolution(tx);
    };
    cryptoAction.rejectOutstandingRequest = (nonce: string) => {
      console.log("!!! rejectOutstandingRequest", nonce);
      setOutstandingRequests(
        outstandingRequests.filter((r) => r.nonce !== nonce),
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
                <div
                  key={request.nonce}
                >{`ME -> ${request.recipientDisplayName}: ${request.amount}`}</div>
              ))}
            </div>
            <div>
              {incomingRequests.map((request) => (
                <div
                  key={request.nonce}
                >{`${request.senderDisplayName} -> ME: ${request.amount}`}</div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
