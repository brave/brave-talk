import { useRecordings } from "../hooks/use-recordings";
import { RECORDING_TTL_SECS, Recording } from "../recordings-store";
import { formatDuration, formatRelativeDay } from "../recordings-utils";

import DownloadImage from "../images/download.svg";
import TranscriptImage from "../images/transcript.svg";
import { Section } from "./Section";
import { MouseEventHandler, useEffect, useState } from "react";
import { getTranscriptDisplayPath } from "../transcripts";

interface Props {
  onRouterStatePushed: () => void;
}
interface DisplayProps {
  recording: Recording;
  onRouterStatePushed: () => void;
  currentTimeSecs: number;
}

const EXPIRING_SOON_SECS = 3 * 60 * 60;

const actionStyles = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--leo-spacing-m)",
  minHeight: "40px",
  padding: "var(--leo-spacing-m) var(--leo-spacing-xl)",
  borderRadius: "var(--leo-radius-full)",
  boxShadow: "inset 0 0 0 1px var(--leo-color-primitive-neutral-30)",
  color: "var(--leo-color-white)",
  font: "var(--leo-font-components-button-default)",
  letterSpacing:
    "var(--leo-typography-components-button-default-letter-spacing)",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
  transition: "var(--transition-interactive)",
  "&:hover": {
    background: "color-mix(in srgb, var(--leo-color-white) 8%, transparent)",
  },
  "&:active": {
    background: "color-mix(in srgb, var(--leo-color-white) 12%, transparent)",
    transform: "scale(var(--scale-pressed))",
  },
  "@media only screen and (max-width: 600px)": {
    width: "100%",
  },
};

const ExpiryLabel = ({ mobileOnly = false }: { mobileOnly?: boolean }) => (
  <span
    css={{
      display: mobileOnly ? "none" : "inline-flex",
      flexShrink: 0,
      padding:
        "calc(var(--leo-spacing-xs) / 2) calc(var(--leo-spacing-s) + var(--leo-spacing-xs) / 2)",
      border: "1px solid var(--leo-color-primitive-yellow-80)",
      borderRadius: "var(--leo-radius-s)",
      color: "var(--leo-color-primitive-yellow-80)",
      font: "var(--leo-font-x-small-regular)",
      letterSpacing: "var(--leo-typography-x-small-regular-letter-spacing)",
      "@media only screen and (max-width: 600px)": {
        display: mobileOnly ? "inline-flex" : "none",
      },
    }}
  >
    Expires soon
  </span>
);

const RecordingDisplay = ({
  recording: r,
  onRouterStatePushed,
  currentTimeSecs,
}: DisplayProps) => {
  const recordingDate = new Date(r.createdAt * 1000);
  const isExpiringSoon = r.expiresAt - currentTimeSecs <= EXPIRING_SOON_SECS;

  const getTranscriptOnClick = (transcriptUrl: string, startDateTime: Date) => {
    const handler: MouseEventHandler<HTMLAnchorElement> = (e) => {
      let transcriptPath: string;
      try {
        transcriptPath = getTranscriptDisplayPath(transcriptUrl);
      } catch {
        // Keep malformed URLs (e.g. local preview fixtures) from crashing the page.
        return;
      }
      // hopefully sufficient magical incantations to prevent the popup
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      window.history.pushState(
        { startDateTime: startDateTime.getTime() },
        "",
        transcriptPath,
      );
      onRouterStatePushed();
      return false;
    };
    return handler;
  };

  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--leo-spacing-xl)",
        width: "100%",
        minHeight: "56px",
        padding:
          "var(--leo-spacing-l) var(--leo-spacing-xl) var(--leo-spacing-l) var(--leo-spacing-2xl)",
        borderRadius: "var(--leo-radius-xl)",
        background: "var(--leo-color-primitive-neutral-15)",
        "@media only screen and (max-width: 600px)": {
          alignItems: "stretch",
          flexDirection: "column",
          gap: "var(--leo-spacing-m)",
          padding: "var(--leo-spacing-l) var(--leo-spacing-none)",
        },
      }}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
          gap: "var(--leo-spacing-xl)",
          minWidth: 0,
          color: "var(--leo-color-primitive-neutral-70)",
          font: "var(--leo-font-large-regular)",
          letterSpacing: "var(--leo-typography-large-regular-letter-spacing)",
          whiteSpace: "nowrap",
          "@media only screen and (max-width: 600px)": {
            alignItems: "flex-start",
            flexDirection: "column",
            gap: "var(--leo-spacing-xs)",
            width: "100%",
            padding: "var(--leo-spacing-none) var(--leo-spacing-2xl)",
          },
        }}
      >
        <strong
          css={{
            flexShrink: 0,
            color: "var(--leo-color-white)",
            font: "var(--leo-font-large-semibold)",
          }}
        >
          {formatRelativeDay(recordingDate)}
        </strong>
        <span>
          {recordingDate.toLocaleTimeString()},{" "}
          {formatDuration(r.expiresAt - RECORDING_TTL_SECS - r.createdAt)}
        </span>
        {isExpiringSoon && <ExpiryLabel />}
      </div>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "var(--leo-spacing-m)",
          flexShrink: 0,
          "@media only screen and (max-width: 600px)": {
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexDirection: "column",
            width: "100%",
            padding: "var(--leo-spacing-none) var(--leo-spacing-xl)",
          },
        }}
      >
        {isExpiringSoon && <ExpiryLabel mobileOnly />}
        {r.transcriptUrl && (
          <a
            href={r.transcriptUrl}
            css={actionStyles}
            target="_blank"
            rel="noreferrer"
            onClick={getTranscriptOnClick(r.transcriptUrl, recordingDate)}
          >
            <img src={TranscriptImage} height="14" width="14" alt="" />
            Transcript
          </a>
        )}
        {r.url && (
          <a href={r.url} css={actionStyles} target="_blank" rel="noreferrer">
            <img src={DownloadImage} height="14" width="16" alt="" />
            Download
          </a>
        )}
      </div>
    </div>
  );
};

export const Recordings = ({ onRouterStatePushed }: Props) => {
  const recordings = useRecordings();
  const [currentTimeSecs, setCurrentTimeSecs] = useState(() =>
    Math.ceil(Date.now() / 1000),
  );
  const availableRecordings = recordings.filter(
    (recording) => recording.transcriptUrl || recording.url,
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTimeSecs(Math.ceil(Date.now() / 1000));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  if (availableRecordings.length === 0) {
    return null;
  }

  return (
    <Section
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--leo-spacing-3xl)",
        overflow: "hidden",
        boxShadow: "var(--leo-effect-elevation-01)",
        "@media only screen and (max-width: 600px)": {
          gap: "var(--leo-spacing-m)",
          padding: "var(--leo-spacing-m)",
        },
      }}
    >
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--leo-spacing-m)",
          textAlign: "left",
          "@media only screen and (max-width: 600px)": {
            padding: "var(--leo-spacing-xl)",
          },
        }}
      >
        <h2
          css={{
            margin: "var(--leo-spacing-none)",
            color: "var(--leo-color-white)",
            font: "var(--leo-font-heading-h2)",
            letterSpacing: "var(--leo-typography-heading-h2-letter-spacing)",
          }}
        >
          Your recorded calls
        </h2>
        <p
          css={{
            margin: "var(--leo-spacing-none)",
            color: "var(--leo-color-primitive-neutral-70)",
            font: "var(--leo-font-large-regular)",
            letterSpacing: "var(--leo-typography-large-regular-letter-spacing)",
          }}
        >
          Recorded calls are automatically cleared 24 hours after their
          recording time.
        </p>
      </div>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--leo-spacing-m)",
        }}
      >
        {availableRecordings.map((r, idx) => (
          <RecordingDisplay
            key={idx}
            recording={r}
            onRouterStatePushed={onRouterStatePushed}
            currentTimeSecs={currentTimeSecs}
          />
        ))}
      </div>
    </Section>
  );
};
