import React from "react";
import { POAP, NFTcollection, NFT } from "./core";
import { ExapandablePanel } from "./ExpandablePanel";
import { SelectableImageList } from "./SelectableImageList";
import { SelectablePoapList } from "./SelectablePoapList";
import { SelectableNFTCollectionList } from "./SelectableNFTCollectionList";
import { PermissionTypeSelector } from "./PermissionTypeSelector";

interface Props {
  startCall: boolean;
  nfts?: NFT[];
  poaps?: POAP[];
  nftCollections?: NFTcollection[];
  nft: string | null;
  setNft: (nft: string) => void;
  permissionType: string;
  setPermissionType: (permissionType: string) => void;
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
  const selectedNftIdx = nfts.findIndex((n) => n.image_url === nft);

  return (
    <div css={{ maxWidth: "563px", margin: "0 auto 0" }}>
      <div>Optional Web3 room preferences:</div>

      <ExapandablePanel
        header="Your Avatar NFT"
        subhead="Currently supports Ethereum ERC-721 NFTs"
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
          <div css={{ textAlign: "left", marginTop: "2rem" }}>
            Call permission type:
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
            header="Require a POAP"
            subhead="Select a POAP that participants must verify to join"
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
            header="Moderator POAP"
            subhead="Select a POAP that gives moderator privileges"
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
              header="Require an NFT Collection"
              subhead="Select an NFT Collection that participants must verify to join"
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
              header="Moderator NFT Collection"
              subhead="Select an NFT Collection that gives moderator privileges"
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
