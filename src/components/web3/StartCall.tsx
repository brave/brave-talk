import { useEffect, useState } from "react";
import { Button } from "../Button";
import { JitsiContext } from "../../jitsi/types";
import { web3NFTs, web3POAPs, web3NFTcollections } from "./api";
import { POAP, NFT, NFTcollection, rememberAvatarUrl } from "./core";
import { Login } from "./Login";
import { OptionalSettings } from "./OptionalSettings";
import { bodyText, header } from "./styles";
import { useWeb3CallState } from "../../hooks/use-web3-call-state";

type Props = {
  setJwt: (jwt: string) => void;
  setRoomName: (roomName: string) => void;
  jitsiContext: JitsiContext;
  setJitsiContext: (context: JitsiContext) => void;
  isSubscribed: boolean;
};

export const StartCall: React.FC<Props> = ({
  setJwt,
  setRoomName,
  jitsiContext,
  setJitsiContext,
  isSubscribed,
}) => {
  const [nfts, setNfts] = useState<NFT[] | undefined>();
  const [poaps, setPoaps] = useState<POAP[] | undefined>();
  const [nftCollections, setNFTCollections] = useState<
    NFTcollection[] | undefined
  >();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const {
    web3Address,
    permissionType,
    nft,
    participantPoaps,
    moderatorPoaps,
    participantNFTCollections,
    moderatorNFTCollections,
    setWeb3Address,
    setPermissionType,
    setNft,
    setParticipantPoaps,
    setModeratorPoaps,
    setParticipantNFTCollections,
    setModeratorNFTCollections,
    startCall,
  } = useWeb3CallState(setFeedbackMessage);

  // this magic says "run this function when the web3address changes"
  useEffect(() => {
    if (web3Address) {
      setNfts([]);
      setPoaps([]);

      web3NFTs(web3Address)
        .then(setNfts)
        .catch((err) => {
          console.error("!!! failed to fetch NFTs ", err);
          setFeedbackMessage("Failed to fetch member identifiers (NFTs/POAPs)");
        });

      web3POAPs(web3Address)
        .then(setPoaps)
        .catch((err) => {
          console.error("!!! failed to fetch POAPs ", err);
          setFeedbackMessage("Failed to fetch member identifiers (NFTs/POAPs)");
        });

      web3NFTcollections(web3Address)
        .then(setNFTCollections)
        .catch((err) => {
          console.error("!!! failed to fetch NFT collections ", err);
          setFeedbackMessage("Failed to fetch member identifiers (NFTs/POAPs)");
        });
    }
  }, [web3Address]);

  const onStartCall = async () => {
    if (!web3Address) return;

    try {
      rememberAvatarUrl(nft);
      const result = await startCall();
      if (result) {
        const [roomName, jwt, web3Authentication] = result;
        const web3Participants = { "": web3Address };
        setJwt(jwt as string);
        setRoomName(roomName as string);
        setJitsiContext({
          ...jitsiContext,
          web3Participants,
          web3Authentication,
        });
      }
    } catch (err: any) {
      console.error("!!! failed to start call ", err);
      setFeedbackMessage(err.message);
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
            startCall={true}
            permissionType={permissionType}
            nfts={nfts}
            poaps={poaps}
            nftCollections={nftCollections}
            nft={nft}
            setPermissionType={setPermissionType}
            setNft={setNft}
            participantPoaps={participantPoaps}
            setParticipantPoaps={setParticipantPoaps}
            moderatorPoaps={moderatorPoaps}
            setModeratorPoaps={setModeratorPoaps}
            participantNFTCollections={participantNFTCollections}
            setParticipantNFTCollections={setParticipantNFTCollections}
            moderatorNFTCollections={moderatorNFTCollections}
            setModeratorNFTCollections={setModeratorNFTCollections}
          />

          <div css={[bodyText, { marginTop: "28px" }]}>{feedbackMessage}</div>

          <Button onClick={onStartCall} css={{ marginTop: "45px" }}>
            {isSubscribed ? (
              <>Start a Web3 Call</>
            ) : (
              <>Start free 1:1 Web3 call</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
