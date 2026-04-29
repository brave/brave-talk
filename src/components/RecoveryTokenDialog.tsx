import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { css } from "@emotion/react";
import Alert from "@brave/leo/react/alert";
import Button from "@brave/leo/react/button";
import Dialog from "@brave/leo/react/dialog";
import Icon from "@brave/leo/react/icon";
import Textarea from "@brave/leo/react/textarea";
import {
  createRecoveryToken,
  loadRecoveryToken,
  NoRefreshTokensError,
  PremiumRoomsConflictError,
} from "../recovery";

interface RecoveryTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const bodyStyles = css`
  text-align: left;
  margin-bottom: calc(-1 * var(--padding));
`;

const descriptionStyles = css`
  margin: var(--leo-spacing-xl) 0 0;

  a {
    color: var(--leo-color-text-interactive);
  }
`;

const actionsStyles = css`
  leo-button {
    flex-grow: 0;
  }
`;

const copyButtonStyles = css`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const alertStyles = css`
  margin-top: var(--leo-spacing-xl);
`;

export default function RecoveryTokenDialog({
  isOpen,
  onClose,
}: RecoveryTokenDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [alert, setAlert] = useState<{
    type: "error" | "warning" | "success";
    message: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);

  function setError(message: string) {
    setAlert({ type: "error", message });
  }

  async function handleGenerate() {
    setAlert(null);
    setIsGenerating(true);
    try {
      const token = await createRecoveryToken();
      setValue(token);
      setShowCopyButton(true);
    } catch (e) {
      if (e instanceof NoRefreshTokensError) {
        setError(t("recovery_token_error_no_tokens"));
      } else {
        console.error(e);
        setError(t("recovery_token_error_generic"));
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setAlert({
      type: "success",
      message: t("recovery_token_dialog_copied_title"),
    });
  }

  async function handleLoad() {
    setAlert(null);
    setIsRecovering(true);
    try {
      await loadRecoveryToken(value, forceLoad);
      onClose();
    } catch (e) {
      if (e instanceof PremiumRoomsConflictError) {
        setAlert({
          type: "warning",
          message: t("recovery_token_error_premium_conflict"),
        });
        setForceLoad(true);
      } else {
        console.error(e);
        setError(t("recovery_token_error_generic"));
      }
    } finally {
      setIsRecovering(false);
    }
  }

  return (
    <Dialog isOpen={isOpen} showClose onClose={onClose}>
      <span slot="title">{t("recovery_token_title")}</span>

      <div css={bodyStyles}>
        <Textarea
          mode="outline"
          placeholder={t("recovery_token_dialog_textarea_placeholder")}
          value={value}
          css={{ wordBreak: "break-all" }}
          onInput={({ value }) => {
            setValue(value);
            setShowCopyButton(false);
          }}
        >
          <strong>{t("recovery_token_title")}</strong>
          {showCopyButton && (
            <button
              slot="right-icon"
              css={copyButtonStyles}
              onClick={handleCopy}
            >
              <Icon name="copy" />
            </button>
          )}
        </Textarea>

        {alert && (
          <Alert type={alert.type} css={alertStyles}>
            {alert.message}
          </Alert>
        )}

        <p css={descriptionStyles}>
          <Trans i18nKey="recovery_token_dialog_description" />{" "}
          <a href="#" rel="noreferrer">
            {t("recovery_token_dialog_learn_more")}
          </a>
        </p>
      </div>

      <div slot="actions" css={actionsStyles}>
        <Button
          kind="plain"
          onClick={handleLoad}
          isLoading={isRecovering}
          isDisabled={isGenerating}
        >
          {t("recovery_token_dialog_load_button")}
        </Button>
        <Button
          kind="filled"
          onClick={handleGenerate}
          isLoading={isGenerating}
          isDisabled={isRecovering}
        >
          {t("recovery_token_dialog_generate_button")}
        </Button>
      </div>
    </Dialog>
  );
}
