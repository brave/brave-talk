import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { IJitsiMeetApi } from "../../../jitsi/types";
import { getNonce } from "../api";
import { parseUnits } from "ethers";
import { getDisplayNameFromParticipantId } from "../../../jitsi/utils";
import { CryptoTransactionParams, CryptoSendMessage } from "./common";
import {
  popupBaseCSS,
  popupHeaderCSS,
  popupContentCSS,
  actionsCSS,
  buttonCSS,
} from "./common-css";
import { Divider } from "./common-components";

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

const popupCSSBottomRight = css`
  bottom: 10px;
  right: 10px;
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
  const [value, setValue] = useState("0");
  const [pendingName, setPendingName] = useState("");
  const [warningText, setWarningText] = useState("");
  const sendAndRegisterOutgoingRequest = async () => {
    // check if the amount is a valid amount by
    // calling parseUnits on it
    try {
      parseUnits(value, 18);
    } catch (e) {
      // warn the user that the amount is not valid
      setWarningText("You enetered in invalid amount input.");
      return;
    }

    const amount = value;
    const token = "BAT";
    const nonce = await getNonce();
    const recipientDisplayName = await getDisplayNameFromParticipantId(
      jitsi,
      pending
    );

    const sendParams: CryptoTransactionParams = {
      senderDisplayName: "me",
      sender: "me",
      amount,
      token,
      nonce,
      recipient: pending,
      recipientDisplayName,
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
      setPendingName(await getDisplayNameFromParticipantId(jitsi, id));
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
                pattern="\d*\.?\d*"
                onKeyDown={(e) => {
                  setWarningText("");
                  onlyNumberOrDecimal(e);
                }}
                css={inputCSS}
                onChange={(e) => {
                  e.target.value === ""
                    ? setValue("0")
                    : setValue(e.target.value);
                }}
              />
              <span>BAT to {pendingName}</span>
            </div>
            <div css={{ color: "red" }}>{warningText}</div>
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
