import { useEffect, useState } from "react";
import { Button } from "../Button";
import { web3Prove, web3NFTs, web3POAPs } from "./api";
import { POAP, rememberAvatarUrl } from "./core";
import { Login } from "./Login";
import { OptionalSettings } from "./OptionalSettings";
import { bodyText, header } from "./styles";

export interface OptionalSelections {
  nft?: string;
  participantPoaps: POAP[];
  moderatorPoaps: POAP[];
}

export const StartCall: React.FC = () => {
  const [web3Address, setWeb3Address] = useState<string>();
  const [nfts, setNfts] = useState<string[] | undefined>();
  const [poaps, setPoaps] = useState<POAP[] | undefined>();
  const [options, setOptions] = useState<OptionalSelections>({
    participantPoaps: [],
    moderatorPoaps: [],
  });
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // this magic says "run this function when the web3address changes"
  useEffect(() => {
    if (web3Address) {
      setNfts([]);
      setPoaps([]);

      web3NFTs(web3Address)
        .then(setNfts)
        .catch((err) => console.error("!!! failed to fetch NTFs ", err));

      web3POAPs(web3Address)
        .then(setPoaps)
        .catch((err) => console.error("!!! failed to fetch POAPs ", err));
    }
  }, [web3Address]);

  const onStartCall = async () => {
    if (!web3Address) return;

    try {
      rememberAvatarUrl(options.nft);
      setFeedbackMessage("Requesting Web3 proof...");
      const proof = await web3Prove(web3Address);

      /* TODO
      await startCall({
        auth: proof,
        web3Address: web3Address,
        participantPoaps: options.participantPoaps.map((p) => p.event.id),
        moderatorPoaps: options.moderatorPoaps.map((p) => p.event.id),
        nft: options.nft,
        feedback: setFeedbackMessage,
      });
      */
      alert("start call now!");
    } catch (err) {
      console.error("!!! failed to start call ", err);
      alert(`Failed to start call: ${err}`);
    }
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
      <div css={[header, { marginBottom: "22px" }]}>Start a Web3 Call</div>

      <Login web3address={web3Address} onAddressSelected={setWeb3Address} />

      {web3Address && (
        <div css={{ marginTop: "28px" }}>
          <OptionalSettings
            nfts={nfts}
            poaps={poaps}
            selections={options}
            onSelectionChange={setOptions}
          />

          <Button onClick={onStartCall} css={{ marginTop: "45px" }}>
            Start free 1:1 Web3 call
          </Button>

          <div css={[bodyText, { marginTop: "28px" }]}>{feedbackMessage}</div>
        </div>
      )}
    </div>
  );
};
