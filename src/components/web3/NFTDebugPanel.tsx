import React, { useState } from "react";
import { NFT } from "./core";
import { SelectableImageList } from "./SelectableImageList";

interface Props {
  startCall: boolean;
  nfts?: NFT[];
  nft: NFT | null;
  setNft: (nft: NFT | null) => void;
}

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
    .map((n: NFT) => n.id);
  const onToggle = (idx: number) => {
    console.log(selectedNftIdxs);
    if (selectedNftIdxs.includes(idx))
      setSelectedNftIdxs(selectedNftIdxs.filter((i: number) => i != idx));
    else {
      setSelectedNftIdxs(selectedNftIdxs.concat([idx]));
    }
  };
  return (
    <div>
      <div css={{ fontSize: "26px" }}>DEBUG MODE</div>
      <SelectableImageList
        items={nftItems}
        selectedIdxs={selectedNftIdxs}
        onToggleSelection={onToggle}
      />
      {selectedNftsId.map((s: string) => (
        <div>{s}</div>
      ))}
    </div>
  );
};
