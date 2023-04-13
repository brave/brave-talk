import React from "react";

type Props = {
  permissionType: string;
  setPermissionType: (permissionType: string) => void;
};

export const PermissionTypeSelector: React.FC<Props> = ({
  setPermissionType,
  permissionType,
}) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setPermissionType(e.target.value);

  return (
    <select
      onChange={onChange}
      css={{
        width: "100%",
        borderRadius: "5px",
        outline: "none",
        border: "none",
        color: "#fff",
        background: "rgba(255, 255, 255, 0.24)",
        backdropFilter: "blur(8px)",
        marginTop: "11px",
        padding: "10px 19px",
        textAlign: "left",
        fontSize: "1.25rem",
      }}
    >
      <option
        value="POAP"
        css={{ color: "#000" }}
        selected={permissionType === "POAP"}
      >
        POAP
      </option>
      <option
        value="NFT-collection"
        css={{ color: "#000" }}
        selected={permissionType === "nft-collection"}
      >
        NFT Collection
      </option>
    </select>
  );
};
