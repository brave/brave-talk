import React, { Dispatch, SetStateAction } from "react";
import { POAP } from "./core";
import { ExapandablePanel } from "./ExpandablePanel";
import { SelectableImageList } from "./SelectableImageList";
import { SelectablePoapList } from "./SelectablePoapList";
import { OptionalSelections } from "./StartCall";

interface Props {
  nfts?: string[];
  poaps?: POAP[];
  selections: OptionalSelections;
  onSelectionChange: Dispatch<SetStateAction<OptionalSelections>>;
}

export const OptionalSettings: React.FC<Props> = ({
  nfts = [],
  poaps,
  selections,
  onSelectionChange,
}) => {
  const nftItems = nfts.map((url) => ({ imageUrl: url }));
  const selectedNftIdx = nftItems.findIndex(
    (i) => i.imageUrl === selections.nft
  );

  return (
    <div css={{ maxWidth: "563px", margin: "0 auto 0" }}>
      <div>Optional Web3 room preferences:</div>

      <ExapandablePanel
        header="Your Avatar NFT"
        subhead="Currently supports Ethereum ERC-721 NFTs"
        loading={!nfts}
      >
        <SelectableImageList
          items={nfts.map((url) => ({ imageUrl: url }))}
          selectedIdxs={[selectedNftIdx]}
          onToggleSelection={(idx) =>
            onSelectionChange((s) => ({ ...s, nft: nfts[idx] }))
          }
        />
      </ExapandablePanel>

      {poaps !== undefined && (
        <React.Fragment>
          <ExapandablePanel
            header="Require a POAP"
            subhead="Select a POAP that participants must verify to join"
            loading={!poaps}
          >
            <SelectablePoapList
              poaps={poaps}
              selected={selections.participantPoaps}
              onSelectionChange={(participants) =>
                onSelectionChange((s) => ({
                  ...s,
                  participantPoaps: participants,
                }))
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
              selected={selections.moderatorPoaps}
              onSelectionChange={(moderators) =>
                onSelectionChange((s) => ({ ...s, moderatorPoaps: moderators }))
              }
            />
          </ExapandablePanel>
        </React.Fragment>
      )}
    </div>
  );
};
