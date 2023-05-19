import { Dispatch } from "react";
import noNftImage from "../../images/no-nft-image.png";

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
            title={item.name}
            height={167}
            width={167}
            src={item.imageUrl ? item.imageUrl : noNftImage}
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
