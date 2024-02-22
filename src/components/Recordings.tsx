import { useRecordings } from "../hooks/use-recordings";
import { RECORDING_TTL_SECS, Recording } from "../recordings-store";
import { formatDuration, formatRelativeDay } from "../recordings-utils";

import DownloadImage from "../images/download.svg";
import MediaPlayerImage from "../images/media_player.svg";
import TranscriptImage from "../images/transcript.svg";
import { Section } from "./Section";
import { Text } from "./Text";

interface Props {
  recording: Recording;
}

const RecordingDisplay = ({ recording: r }: Props) => {
  const recordingDate = new Date(r.createdAt * 1000);

  return (
    <div
      css={{
        display: "flex",
        justifyContent: "space-between",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        margin: "21px auto 0",
        padding: "16px 27px",
        maxWidth: "377px",
      }}
    >
      <div>
        <Text variant="body">
          <strong>{formatRelativeDay(recordingDate)}</strong>
          {", "}
          {recordingDate.toLocaleTimeString()}
          {", "}
          {formatDuration(r.expiresAt - RECORDING_TTL_SECS - r.createdAt)}
        </Text>
      </div>
      <div>
        {r.url && (
          <a
            href={r.url}
            css={{ textDecoration: "none", color: "inherit" }}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={DownloadImage}
              height="16"
              width="18"
              alt="recording download"
            />
          </a>
        )}
        {r.transcriptUrl && (
          <a
            href={r.transcriptUrl}
            css={{ textDecoration: "none", color: "inherit" }}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={TranscriptImage}
              height="16"
              width="18"
              alt="transcript download"
              css={{ marginLeft: "1em" }}
            />
          </a>
        )}
      </div>
    </div>
  );
};

export const Recordings = () => {
  const recordings = useRecordings();

  if (recordings.length === 0) {
    return null;
  }

  return (
    <Section css={{ padding: "16px 16px 36px" }}>
      <p
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <img src={MediaPlayerImage} alt="" />
        <Text variant="secondary-section-head">Your recorded calls</Text>
      </p>
      <p css={{ margin: "8px auto 22px", maxWidth: "300px" }}>
        <Text variant="body">
          Recorded calls are automatically cleared 24 hours after their
          recording time
        </Text>
      </p>
      {recordings
        .filter((r) => r.transcriptUrl || r.url)
        .map((r, idx) => (
          <RecordingDisplay key={idx} recording={r} />
        ))}
    </Section>
  );
};
