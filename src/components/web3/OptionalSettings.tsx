import React from "react";
import { useTranslation } from "react-i18next";
import { POAP, NFTcollection, NFT } from "./core";
import { ExapandablePanel } from "./ExpandablePanel";
import { SelectableImageList } from "./SelectableImageList";
import { SelectablePoapList } from "./SelectablePoapList";
import { SelectableNFTCollectionList } from "./SelectableNFTCollectionList";
import { PermissionTypeSelector } from "./PermissionTypeSelector";

interface Props {
  startCall: boolean;
  web3Account: "ETH" | "SOL" | null;
  nfts?: NFT[];
  poaps?: POAP[];
  nftCollections?: NFTcollection[];
  nft: string | null;
  setNft: (nft: string) => void;
  permissionType: string;
  setPermissionType: (permissionType: string) => void;
  participantPoaps?: POAP[];
  setParticipantPoaps?: (participantPoaps: POAP[]) => void;
  moderatorPoaps?: POAP[];
  setModeratorPoaps?: (moderatorPoaps: POAP[]) => void;
  participantNFTCollections: NFTcollection[];
  setParticipantNFTCollections: (
    participantNFTCollections: NFTcollection[]
  ) => void;
  moderatorNFTCollections: NFTcollection[];
  setModeratorNFTCollections: (
    moderatorNFTCollections: NFTcollection[]
  ) => void;
}

export const OptionalSettings: React.FC<Props> = ({
  startCall,
  web3Account,
  nfts = [],
  poaps,
  nftCollections,
  nft,
  setNft,
  permissionType,
  setPermissionType,
  participantPoaps = [],
  setParticipantPoaps = () => {
    return [];
  },
  moderatorPoaps = [],
  setModeratorPoaps = () => {
    return [];
  },
  participantNFTCollections,
  setParticipantNFTCollections,
  moderatorNFTCollections,
  setModeratorNFTCollections,
}) => {
  const nftItems = nfts.map((n: NFT) => ({ ...n, imageUrl: n.image_url }));
  const selectedNftIdx = nfts.findIndex((n) => n.image_url === nft);
  const { t } = useTranslation();

  return (
    <div css={{ maxWidth: "563px", margin: "0 auto 0" }}>
      <div>Optional Web3 room preferences:</div>

      <ExapandablePanel
        header={t("your_avatar_nft_header")}
        subhead={t("avatar_nft_subhead")}
        loading={!nfts}
      >
        <SelectableImageList
          items={nftItems}
          selectedIdxs={
            typeof selectedNftIdx === "number" ? [selectedNftIdx] : []
          }
          onToggleSelection={(idx) => setNft(nfts[idx].image_url)}
        />
      </ExapandablePanel>

      {startCall && (
        <>
          <div
            css={{ textAlign: "left", marginTop: "2rem", fontSize: "1.25rem" }}
          >
            {t("call_permission_type")}
          </div>

          <PermissionTypeSelector
            permissionType={permissionType}
            setPermissionType={setPermissionType}
            web3Account={web3Account}
          />
        </>
      )}

      {startCall && permissionType === "POAP" && poaps !== undefined && (
        <React.Fragment>
          <ExapandablePanel
            header={t("participant_poap_panel_header")}
            subhead={t("participant_poap_panel_subhead")}
            loading={!poaps}
          >
            <SelectablePoapList
              poaps={poaps}
              selected={participantPoaps}
              onSelectionChange={(participants) =>
                setParticipantPoaps(participants)
              }
            />
          </ExapandablePanel>

          <ExapandablePanel
            header={t("moderator_poap_panel_header")}
            subhead={t("moderator_poap_panel_subhead")}
            loading={!poaps}
          >
            <SelectablePoapList
              poaps={poaps}
              selected={moderatorPoaps}
              onSelectionChange={(moderators) => setModeratorPoaps(moderators)}
            />
          </ExapandablePanel>
        </React.Fragment>
      )}

      {startCall &&
        permissionType === "NFT-collection" &&
        nftCollections !== undefined && (
          <React.Fragment>
            <ExapandablePanel
              header={t("participant_nft_collection_panel_header")}
              subhead={t("participant_nft_collection_panel_subhead")}
              loading={!poaps}
            >
              <SelectableNFTCollectionList
                nftCollections={nftCollections}
                selected={participantNFTCollections}
                onSelectionChange={(participants) =>
                  setParticipantNFTCollections(participants)
                }
              />
            </ExapandablePanel>

            <ExapandablePanel
              header={t("moderator_nft_collection_panel_header")}
              subhead={t("moderator_nft_collection_panel_subhead")}
              loading={!nftCollections}
            >
              <SelectableNFTCollectionList
                nftCollections={nftCollections}
                selected={moderatorNFTCollections}
                onSelectionChange={(moderators) =>
                  setModeratorNFTCollections(moderators)
                }
              />
            </ExapandablePanel>
          </React.Fragment>
        )}
    </div>
  );
};
