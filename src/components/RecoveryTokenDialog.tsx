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
  savePendingRecoveryToken,
  TooManyRoomsError,
} from "../recovery";
import { premiumLoginUrl } from "../services";

interface RecoveryTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken: string | null;
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

const conflictActionsStyles = css`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: var(--leo-spacing-m);
  margin-top: var(--leo-spacing-m);
  leo-button {
    flex-grow: 0;
    width: auto;
  }
`;

interface AlertState {
  type: "error" | "warning" | "success";
  message: string;
  showConflictActions?: boolean;
}

export default function RecoveryTokenDialog({
  isOpen,
  onClose,
  initialToken,
}: RecoveryTokenDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialToken ?? "");
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
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
      } else if (e instanceof TooManyRoomsError) {
        setError(t("recovery_token_error_too_many_rooms_backup"));
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

  async function performLoad(force: boolean) {
    setAlert(null);
    setIsRecovering(true);
    try {
      await loadRecoveryToken(value, force);
      onClose();
    } catch (e) {
      if (e instanceof PremiumRoomsConflictError) {
        setAlert({
          type: "warning",
          message: t("recovery_token_error_premium_conflict"),
          showConflictActions: true,
        });
      } else if (e instanceof TooManyRoomsError) {
        setError(t("recovery_token_error_too_many_rooms_restore"));
      } else {
        console.error(e);
        setError(t("recovery_token_error_generic"));
      }
    } finally {
      setIsRecovering(false);
    }
  }

  function handleSignIn() {
    savePendingRecoveryToken(value);
    window.location.href = premiumLoginUrl();
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
            setAlert(null);
          }}
        >
          <strong>{t("recovery_token_title")}</strong>
          {showCopyButton && (
            <button
              type="button"
              slot="right-icon"
              aria-label="Copy to clipboard"
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
            {alert.showConflictActions && (
              <div css={conflictActionsStyles}>
                <Button
                  kind="filled"
                  size="small"
                  onClick={handleSignIn}
                  isDisabled={isRecovering}
                >
                  {t("recovery_token_dialog_signin_button")}
                </Button>
                <Button
                  kind="plain"
                  size="small"
                  onClick={() => performLoad(true)}
                  isLoading={isRecovering}
                >
                  {t("recovery_token_dialog_load_free_button")}
                </Button>
              </div>
            )}
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
          onClick={() => performLoad(false)}
          isLoading={isRecovering}
          isDisabled={isGenerating || !value.trim()}
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
