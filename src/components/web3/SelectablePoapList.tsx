import { Dispatch } from "react";
import { POAP } from "./core";
import { SelectableImageList } from "./SelectableImageList";

interface Props {
  poaps: POAP[];
  selected: POAP[];
  onSelectionChange: Dispatch<POAP[]>;
}

export const SelectablePoapList: React.FC<Props> = ({
  poaps,
  selected,
  onSelectionChange,
}) => {
  const poapItems = poaps.map((p) => ({
    imageUrl: p.event.image_url,
    name: p.event.name,
    chain: p.chain,
  }));

  const selectedIdxs = poaps.flatMap((p, idx) => {
    if (selected.includes(p)) {
      return [idx];
    } else {
      return [];
    }
  });

  const onToggle = (idx: number) => {
    if (selectedIdxs.includes(idx)) {
      onSelectionChange(selected.filter((p) => p !== poaps[idx]));
    } else {
      onSelectionChange([...selected, poaps[idx]]);
    }
  };

  return (
    <SelectableImageList
      items={poapItems}
      selectedIdxs={selectedIdxs}
      onToggleSelection={onToggle}
    />
  );
};
