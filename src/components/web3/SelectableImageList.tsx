import { Dispatch } from "react";

interface Item {
  imageUrl: string;
  name?: string;
}

interface Props {
  items: Item[];
  selectedIdxs: number[];
  onToggleSelection: Dispatch<number>;
}

export const SelectableImageList: React.FC<Props> = ({
  items,
  selectedIdxs,
  onToggleSelection,
}) => {
  return (
    <div css={{ display: "flex", flexWrap: "wrap" }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          onClick={() => onToggleSelection(idx)}
          css={{ padding: "5px 5px 5px 0" }}
          title={item.name}
        >
          <img
            height={167}
            width={167}
            src={item.imageUrl}
            css={{
              border: `5px solid ${
                selectedIdxs.includes(idx) ? "white" : "transparent"
              }`,
            }}
            alt="item"
          />
          {}
        </div>
      ))}
    </div>
  );
};
