import React, { useState } from "react";
import { NFT } from "./core";
import { Item, SelectableImageList } from "./SelectableImageList";
import { Button } from "../Button";

interface Props {
  startCall: boolean;
  nfts?: NFT[];
  nft: NFT | null;
  setNft: (nft: NFT | null) => void;
}

const showSpamScore = (item: Item) => {
  return `${item.name} (${item.chain}) ${
    item.collection?.spam_score
      ? `Spam Score: ${item.collection.spam_score}`
      : ""
  }`;
};

export const NFTDebugPanel: React.FC<Props> = ({
  startCall,
  nfts = [],
  nft,
  setNft,
}) => {
  const nftItems = nfts.map((n: NFT) => ({ ...n, imageUrl: n.image_url }));
  const [selectedNftIdxs, setSelectedNftIdxs] = useState<number[]>([]);
  const selectedNftsId = nfts
    .filter((n: NFT, index) => selectedNftIdxs.includes(index))
    .map((n: NFT) =>
      n.collection ? n.collection.collection_id : "no-collection-id"
    );
  const onToggle = (idx: number) => {
    if (selectedNftIdxs.includes(idx))
      setSelectedNftIdxs(selectedNftIdxs.filter((i: number) => i !== idx));
    else {
      setSelectedNftIdxs(selectedNftIdxs.concat([idx]));
    }
  };
  const copySelectedIdxs = () => {
    navigator.clipboard.writeText(selectedNftsId.join("\n"));
  };

  return (
    <div>
      <div css={{ fontSize: "26px" }}>DEBUG MODE</div>
      <SelectableImageList
        items={nftItems}
        selectedIdxs={selectedNftIdxs}
        onToggleSelection={onToggle}
        onMouseOverText={showSpamScore}
      />
      {selectedNftsId.map((s: string) => (
        <div>{s}</div>
      ))}
      <Button
        css={{
          marginTop: "10px",
        }}
        onClick={copySelectedIdxs}
      >
        Copy Selected IDs
      </Button>
    </div>
  );
};
