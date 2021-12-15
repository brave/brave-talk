import "./css/recordings.css";
import DownloadImage from "./images/download.svg";
import MediaPlayerImage from "./images/media_player.svg";
import React, { Dispatch } from "react";
import ReactDOM from "react-dom";
import {
  formatDuration,
  formatRelativeDay,
  RecordingWithUrl,
  sortedRecordings,
} from "./recordings-utils";
import { loadLocalStore } from "./store";

export const populateRecordings = (recordingsEl: HTMLElement) => {
  const records = sortedRecordings();

  console.log("!!! records", records);

  const onClearAll = () => {
    loadLocalStore().clearAllRecordings();
    recordingsEl.style.display = "none";
  };

  if (records.length > 0) {
    ReactDOM.render(
      <Recordings recordings={records} onClearAll={onClearAll} />,
      recordingsEl
    );
    recordingsEl.style.display = "block";
  }
};

export const Recordings: React.FC<{
  recordings: RecordingWithUrl[];
  onClearAll: Dispatch<void>;
}> = ({ recordings, onClearAll }) => {
  return (
    <>
      <p className="recordings-header">
        <img src={MediaPlayerImage} />
        <span>Your recorded calls</span>
      </p>
      {recordings.map((r, idx) => (
        <RecordingDisplay key={idx} recording={r} />
      ))}
      <div className="recordings-footer" onClick={() => onClearAll()}>
        Clear all
      </div>
    </>
  );
};

const RecordingDisplay: React.FC<{ recording: RecordingWithUrl }> = ({
  recording: r,
}) => {
  const recordingDate = new Date(r.createdAt * 1000);

  return (
    <a href={r.url}>
      <div className="recording">
        <div>
          <strong>{formatRelativeDay(recordingDate)}</strong>
          {", "}
          {recordingDate.toLocaleTimeString()}
          {", "}
          {formatDuration(r.expiresAt - r.ttl - r.createdAt)}
        </div>
        <div>
          <img src={DownloadImage} height="16" width="18" />
        </div>
      </div>
    </a>
  );
};
