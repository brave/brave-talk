import { useState } from "react";
import { Dispatch } from "react";
import noNftImage from "../../images/no-nft-image.png";

export interface Item {
  imageUrl: string;
  name?: string;
  chain: string;
  collection?: {
    collection_id: string;
    name: string;
    image_url: string;
    spam_score: number;
  };
}

interface Props {
  items: Item[];
  selectedIdxs: number[];
  onToggleSelection: Dispatch<number>;
  onMouseOverText?: (item: Item) => string;
}

const showNameAndNetwork = (item: Item) => {
  return `${item.name} (${item.chain})`;
};

export const SelectableImageList: React.FC<Props> = ({
  items,
  selectedIdxs,
  onToggleSelection,
  onMouseOverText = showNameAndNetwork,
}) => {
  const showCheckbox = items.some(
    (item) => item.collection !== undefined && item.collection.spam_score >= 80,
  );
  const itemsIndexed: [Item, number][] = items.map((item, idx) => [item, idx]);
  const [showSpamItems, setShowSpamItems] = useState(false);

  const filteredItems = showSpamItems
    ? itemsIndexed
    : itemsIndexed.filter((item) => {
        if (item[0].collection?.spam_score !== undefined) {
          return item[0].collection.spam_score < 80;
        }
        return true;
      });

  const onToggleSpamItems = () => {
    setShowSpamItems(!showSpamItems);
  };

  return (
    <div css={{ display: "flex", flexDirection: "column" }}>
      {showCheckbox && (
        <div css={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={showSpamItems}
              onChange={onToggleSpamItems}
            />
            {showSpamItems
              ? "Show all NFTs"
              : "Show all NFTs (not all being shown)"}
          </label>
        </div>
      )}
      <div css={{ display: "flex", flexWrap: "wrap" }}>
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              onToggleSelection(item[1]);
            }}
            css={{ padding: "5px 5px 5px 0" }}
            title={item[0].name}
          >
            <img
              title={onMouseOverText(item[0])}
              height={167}
              width={167}
              src={item[0].imageUrl ? item[0].imageUrl : noNftImage}
              css={{
                border: `5px solid ${
                  selectedIdxs.includes(item[1]) ? "white" : "transparent"
                }`,
              }}
              alt="item"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
