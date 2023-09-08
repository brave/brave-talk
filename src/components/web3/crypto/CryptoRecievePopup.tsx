import { Text } from "../../Text";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { generateSIWEForCrypto } from "../api";
import { IJitsiMeetApi } from "../../../jitsi/types";
import {
  CryptoTransactionParams,
  SIWEReturnParams,
  CryptoSendMessage,
  isValidEthAddress,
} from "./common";
import {
  popupBaseCSS,
  popupHeaderCSS,
  popupContentCSS,
  actionsCSS,
  buttonCSS,
} from "./common-css";
import { Divider } from "./common-components";

const popupCSSTopLeft = css`
  top: 10px;
  left: 10px;
`;

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
    let siwe: SIWEReturnParams;
    try {
      if (!isValidEthAddress(web3Address)) throw "Invalid address";
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
