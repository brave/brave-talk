import { useRecordings } from "../hooks/use-recordings";
import { Recording } from "../recordings-store";
import { formatDuration, formatRelativeDay } from "../recordings-utils";

import DownloadImage from "../images/download.svg";
import MediaPlayerImage from "../images/media_player.svg";
import { Section } from "./Section";
import { Text } from "./Text";

const RecordingDisplay: React.FC<{ recording: Recording }> = ({
  recording: r,
}) => {
  const recordingDate = new Date(r.createdAt * 1000);

  return (
    <a href={r.url} css={{ textDecoration: "none", color: "inherit" }}>
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
            {formatDuration(r.expiresAt - r.ttl - r.createdAt)}
          </Text>
        </div>
        <div>
          <img src={DownloadImage} height="16" width="18" alt="download" />
        </div>
      </div>
    </a>
  );
};

export const Recordings: React.FC = () => {
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
      {recordings.map((r, idx) => (
        <RecordingDisplay key={idx} recording={r} />
      ))}
    </Section>
  );
};
