import { useEffect, useState } from "react";
import { Dispatch } from "react";
import noNftImage from "../../images/no-nft-image.png";

interface Item {
  imageUrl: string;
  name?: string;
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
}

export const SelectableImageList: React.FC<Props> = ({
  items,
  selectedIdxs,
  onToggleSelection,
}) => {
  const showCheckbox = items.some(
    (item) => item.collection !== undefined && item.collection.spam_score > 80
  );

  const [showSpamItems, setShowSpamItems] = useState(false);

  const filteredItems = showSpamItems
    ? items
    : items.filter((item) => {
        if (item.collection?.spam_score !== undefined) {
          return item.collection.spam_score < 80;
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
            {showSpamItems ? "Show All NFTs" : "Show NFTs with Less Spam Score"}
          </label>
        </div>
      )}
      <div css={{ display: "flex", flexWrap: "wrap" }}>
        {filteredItems.map((item, idx) => (
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
          </div>
        ))}
      </div>
    </div>
  );
};