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
  gap: "6px",
  padding: "8px 12px",
  borderRadius: "999px",
  boxShadow: "inset 0 0 0 1px #464649",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: "18px",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
  "&:hover": { background: "rgba(255, 255, 255, 0.08)" },
  "&:active": { background: "rgba(255, 255, 255, 0.12)" },
};

const ExpiryLabel = ({ mobileOnly = false }: { mobileOnly?: boolean }) => (
  <span
    css={{
      display: mobileOnly ? "none" : "inline-flex",
      flexShrink: 0,
      padding: "1px 5px",
      border: "1px solid #ffd43b",
      borderRadius: "4px",
      color: "#ffd43b",
      fontSize: "10px",
      lineHeight: "14px",
      letterSpacing: "-0.08px",
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
    const transcriptPath = getTranscriptDisplayPath(transcriptUrl);
    const handler: MouseEventHandler<HTMLAnchorElement> = (e) => {
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
        gap: "16px",
        width: "100%",
        minHeight: "56px",
        padding: "12px 16px 12px 24px",
        borderRadius: "16px",
        background: "#252527",
        "@media only screen and (max-width: 720px)": {
          alignItems: "stretch",
          flexDirection: "column",
          gap: "8px",
          padding: "12px 0",
        },
      }}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: 0,
          color: "#aaaaad",
          fontSize: "16px",
          lineHeight: "24px",
          letterSpacing: "-0.23px",
          whiteSpace: "nowrap",
          "@media only screen and (max-width: 720px)": {
            width: "100%",
            padding: "0 24px",
          },
        }}
      >
        <strong css={{ flexShrink: 0, color: "#ffffff", fontWeight: 600 }}>
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
          gap: "8px",
          flexShrink: 0,
          "@media only screen and (max-width: 720px)": {
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexDirection: isExpiringSoon ? "column" : "row",
            width: "100%",
            padding: "0 16px",
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
        "@media only screen and (max-width: 600px)": {
          padding: "8px",
        },
      }}
    >
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "32px",
          textAlign: "left",
          "@media only screen and (max-width: 600px)": {
            marginBottom: "8px",
            padding: "16px",
          },
        }}
      >
        <h2
          css={{
            margin: 0,
            color: "#ffffff",
            fontSize: "22px",
            fontWeight: 600,
            lineHeight: "28px",
            letterSpacing: "-0.5px",
          }}
        >
          Your recorded calls
        </h2>
        <p
          css={{
            margin: 0,
            color: "#aaaaad",
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "-0.23px",
          }}
        >
          Recorded calls are automatically cleared 24 hours after their
          recording time.
        </p>
      </div>
      <div css={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
