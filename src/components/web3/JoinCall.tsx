import { useEffect, useState } from "react";
import { web3NFTs, web3Prove } from "./api";
import { rememberAvatarUrl } from "./core";
import { Login } from "./Login";
import { OptionalSettings } from "./OptionalSettings";
import { OptionalSelections } from "./StartCall";
import { bodyText, header } from "./styles";

interface Props {
  roomName: string;
}

export const JoinCall: React.FC<Props> = ({ roomName }) => {
  const [web3Address, setWeb3Address] = useState<string>();
  const [nfts, setNfts] = useState<string[] | undefined>();
  const [options, setOptions] = useState<OptionalSelections>({
    participantPoaps: [],
    moderatorPoaps: [],
  });
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // this magic says "run this function when the web3address changes"
  useEffect(() => {
    if (web3Address) {
      setNfts(undefined);

      web3NFTs(web3Address)
        .then(setNfts)
        .catch((err) => console.error("!!! failed to fetch NTFs ", err));
    }
  }, [web3Address]);

  const onJoinCallClicked = async () => {
    if (!web3Address) return;

    rememberAvatarUrl(options.nft);
    setFeedbackMessage("Requesting Web3 proof...");
    const auth = await web3Prove(web3Address);

    setFeedbackMessage("Joining...");
    alert("join call now!");
    // TODO:
    // await joinCall({
    //   roomName,
    //   auth,
    //   nft: options.nft,
    //   web3Address,
    //   feedback: setFeedbackMessage,
    // });
  };

  return (
    <div
      css={{
        display: "flex",
        justifyContent: "center",
        marginTop: "62px",
        flexDirection: "column",
      }}
    >
      <div css={[header, { marginBottom: "22px" }]}>Join a Web3 Call</div>

      <Login web3address={web3Address} onAddressSelected={setWeb3Address} />

      {web3Address && (
        <div css={{ marginTop: "28px" }}>
          <OptionalSettings
            nfts={nfts}
            selections={options}
            onSelectionChange={setOptions}
          />

          <button
            className="welcome-page-button"
            onClick={onJoinCallClicked}
            css={{ marginTop: "45px" }}
          >
            <div>Join Web3 call</div>
          </button>

          <div css={[bodyText, { marginTop: "28px" }]}>{feedbackMessage}</div>
        </div>
      )}
    </div>
  );
};
