import React from "react";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Web3PermissionType } from "./api";

type Props = {
  permissionType: string;
  setPermissionType: (permissionType: Web3PermissionType) => void;
};

const styles = {
  base: css({
    width: "100%",
    height: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    color: "#ffffff",
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    "&:hover": { border: "2px solid #ffffff" },
  }),
  selected: css({
    background: "rgba(255, 255, 255, 0.24)",
    backdropFilter: "blur(16px)",
    border: "1px solid transparent",

    "&:hover": { background: "rgba(255, 255, 255, 0.42)" },
  }),
};

export const PermissionTypeSelector: React.FC<Props> = ({
  setPermissionType,
  permissionType,
}) => {
  const { t } = useTranslation();
  return (
    <div css={{ display: "flex" }}>
      <button
        onClick={() => setPermissionType("POAP")}
        css={[styles.base, permissionType === "POAP" && styles.selected]}
      >
        {t("poap_permission_type")}
      </button>
      <button
        onClick={() => setPermissionType("NFT-collection")}
        css={[
          styles.base,
          permissionType === "NFT-collection" && styles.selected,
        ]}
      >
        {t("nft_collection_permission_type")}
      </button>
      <button
        onClick={() => setPermissionType("balance")}
        css={[styles.base, permissionType === "balance" && styles.selected]}
      >
        {"BAT Gating"}
      </button>
    </div>
  );
};
