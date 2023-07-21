import React from "react";
import { useTranslation } from "react-i18next";
import { POAP, NFTcollection, NFT } from "./core";
import { ExapandablePanel } from "./ExpandablePanel";
import { NonExapandablePanel } from "./NonExpandablePanel";
import { SelectableImageList } from "./SelectableImageList";
import { SelectablePoapList } from "./SelectablePoapList";
import { SelectableNFTCollectionList } from "./SelectableNFTCollectionList";
import { PermissionTypeSelector } from "./PermissionTypeSelector";
import noNftImage from "../../images/no-nft-image.png";
import { Web3PermissionType } from "./api";

interface Props {
  startCall: boolean;
  nfts?: NFT[];
  poaps?: POAP[];
  nftCollections?: NFTcollection[];
  nft: NFT | null;
  setNft: (nft: NFT | null) => void;
  permissionType: string;
  setPermissionType: (permissionType: Web3PermissionType) => void;
  participantPoaps: POAP[];
  setParticipantPoaps: (participantPoaps: POAP[]) => void;
  moderatorPoaps: POAP[];
  setModeratorPoaps: (moderatorPoaps: POAP[]) => void;
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
  nfts = [],
  poaps,
  nftCollections,
  nft,
  setNft,
  permissionType,
  setPermissionType,
  participantPoaps,
  setParticipantPoaps,
  moderatorPoaps,
  setModeratorPoaps,
  participantNFTCollections,
  setParticipantNFTCollections,
  moderatorNFTCollections,
  setModeratorNFTCollections,
}) => {
  const nftItems = nfts.map((n: NFT) => ({ ...n, imageUrl: n.image_url }));
  const selectedNftIdx = nfts.findIndex((n) =>
    nft != null ? n.id === nft.id : -1
  );
  const { t } = useTranslation();
  const onToggle = (idx: number) => {
    const selectedId = nfts[idx].id;
    if (nft != null && nft.id === selectedId) {
      setNft(null);
      console.log("debug: NFT deselected");

    } else {
      setNft(nfts[idx]);
      console.log(`debug: NFT #${idx} [${nfts[idx].name}] selected.`);
    }
  };

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
          onToggleSelection={onToggle}
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
      {startCall && permissionType === "balance" && (
        <React.Fragment>
          <NonExapandablePanel
            header={t("bat_gating_panel_header")}
            subhead={t("bat_gating_panel_subheader")}
          />
        </React.Fragment>
      )}
    </div>
  );
};
