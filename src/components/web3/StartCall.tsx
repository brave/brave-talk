import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import { JitsiContext } from "../../jitsi/types";
import { web3NFTs, web3POAPs, web3NFTcollections } from "./api";
import { POAP, NFT, NFTcollection, rememberAvatarUrl } from "./core";
import { Login } from "./Login";
import { OptionalSettings } from "./OptionalSettings";
import { bodyText, header } from "./styles";
import { useWeb3CallState } from "../../hooks/use-web3-call-state";
import { TranslationKeys } from "../../i18n/i18next";

type Props = {
  setJwt: (jwt: string) => void;
  setRoomName: (roomName: string) => void;
  jitsiContext: JitsiContext;
  setJitsiContext: (context: JitsiContext) => void;
  web3Account: "ETH" | "SOL" | null;
  setWeb3Account: (web3Account: "ETH" | "SOL") => void;
  isSubscribed: boolean;
};

export const StartCall: React.FC<Props> = ({
  setJwt,
  setRoomName,
  jitsiContext,
  setJitsiContext,
  web3Account,
  setWeb3Account,
  isSubscribed,
}) => {
  const { t } = useTranslation();
  const [nfts, setNfts] = useState<NFT[] | undefined>();
  const [poaps, setPoaps] = useState<POAP[] | undefined>();
  const [nftCollections, setNFTCollections] = useState<
    NFTcollection[] | undefined
  >();
  const [feedbackMessage, setFeedbackMessage] = useState<TranslationKeys>();
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
  } = useWeb3CallState(setFeedbackMessage, setWeb3Account);

  // this magic says "run this function when the web3address changes"
  useEffect(() => {
    if (web3Address) {
      setNfts([]);
      setPoaps([]);

      web3NFTs(web3Address)
        .then(setNfts)
        .catch((err) => {
          console.error("!!! failed to fetch NFTs ", err);
          setFeedbackMessage("identifier_fetch_error");
        });

      web3POAPs(web3Address)
        .then(setPoaps)
        .catch((err) => {
          console.error("!!! failed to fetch POAPs ", err);
          setFeedbackMessage("identifier_fetch_error");
        });

      web3NFTcollections(web3Address)
        .then(setNFTCollections)
        .catch((err) => {
          console.error("!!! failed to fetch NFT collections ", err);
          setFeedbackMessage("identifier_fetch_error");
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
      setFeedbackMessage("start_call_error");
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
            web3Account={web3Account}
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

          <div css={[bodyText, { marginTop: "28px" }]}>
            {feedbackMessage ? t(feedbackMessage) : ""}
          </div>

          <Button onClick={onStartCall} css={{ marginTop: "45px" }}>
            {isSubscribed ? t("start_web3_call") : t("start_free_web3_call")}
          </Button>
        </div>
      )}
    </div>
  );
};
