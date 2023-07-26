import { Dispatch } from "react";
import { NFTcollection } from "./core";
import { SelectableImageList } from "./SelectableImageList";

interface Props {
  nftCollections: NFTcollection[];
  selected: NFTcollection[];
  onSelectionChange: Dispatch<NFTcollection[]>;
}

export const SelectableNFTCollectionList: React.FC<Props> = ({
  nftCollections,
  selected,
  onSelectionChange,
}) => {
  const nftCollectionItems = nftCollections.map((p) => ({
    imageUrl: p.image_url,
    name: p.name,
    chain: p.chain,
  }));

  const selectedIdxs = nftCollections.flatMap((p, idx) => {
    if (selected.includes(p)) {
      return [idx];
    } else {
      return [];
    }
  });

  const onToggle = (idx: number) => {
    if (selectedIdxs.includes(idx)) {
      onSelectionChange(selected.filter((p) => p !== nftCollections[idx]));
    } else {
      onSelectionChange([...selected, nftCollections[idx]]);
    }
  };

  return (
    <SelectableImageList
      items={nftCollectionItems}
      selectedIdxs={selectedIdxs}
      onToggleSelection={onToggle}
    />
  );
};
