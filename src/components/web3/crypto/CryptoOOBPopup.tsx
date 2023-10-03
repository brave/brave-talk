import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { verifyMessage } from "ethers";
import { Buffer } from "buffer";
import { sendCrypto } from "./send-crypto";
import {
  CryptoTransactionParams,
  TransactionPendingResolution,
} from "./common";
import {
  popupBaseCSS,
  popupHeaderCSS,
  popupContentCSS,
  actionsCSS,
  buttonCSS,
  highlightBoxCSS,
} from "./common-css";
import { Divider } from "./common-components";

const popupCSSCenter = css`
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

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
      (r) => r.nonce === msg.nonce,
    )[0];
    // check nonce exists
    let tx;
    try {
      tx = await sendCrypto(
        currentRequest.amount,
        currentRequest.token,
        proof.signer,
      );
    } catch (e) {
      console.log("!!! error sending crypto", e);
    }
    setOutstandingRequests(
      outstandingRequests.filter((r) => r.nonce !== msg.nonce),
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
      outstandingRequests.filter((r) => r.nonce !== msg.nonce),
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
        (r) => r.nonce === nonce && r.recipient === currentResolution.jitsiId,
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
        <div css={[popupBaseCSS, popupCSSCenter]}>
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
