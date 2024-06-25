import {
  DownloadedTranscript,
  TranscriptAction,
  parseTranscriptLines,
} from "../downloaded-transcript";
import { createRef, useEffect, useState } from "react";
import { css } from "@emotion/react";
import TranscriptImage from "../images/papyrus.svg";
import DownloadImage from "../images/download_color.svg";
import SearchImage from "../images/search.svg";
import { formatRelativeDay } from "../recordings-utils";
import "@brave/leo/tokens/css/variables.css";
import Button from "@brave/leo/react/button";
import Input from "@brave/leo/react/input";
import { useTranslation } from "react-i18next";

interface MeetingTranscriptProps {
  transcript: DownloadedTranscript;
}

interface MeetingTranscriptDisplayProps {
  transcriptId: string;
  transcriptUrlBase?: string;
}

const styles = {
  outer: css`
    margin: 93px auto;
    max-width: 860px;
    text-align: left;
    display: flex;
    padding: var(--leo-spacing-7xl);
    flex-direction: column;
    align-items: center;
    gap: var(--leo-spacing-4xl);
    align-self: stretch;
    border-radius: var(--leo-radius-xl);
    background: var(--leo-color-container-background);
    box-shadow:
      0px var(--Elevation-xxs, 1px) 0px 0px
        var(--Semantic-Elevation-Primary, rgba(0, 0, 0, 0.05)),
      0px var(--Elevation-xxs, 1px) var(--Elevation-xs, 4px) 0px
        var(--Semantic-Elevation-Secondary, rgba(0, 0, 0, 0.1));
  `,
  transcriptEventRow: css`
    display: flex;
    padding: var(--leo-spacing-m, 0px);
    align-items: flex-start;
    gap: var(--leo-spacing-xl);
    align-self: stretch;
    line-height: var(--Line-height-Large, 24px);
    font-size: var(--Size-Large, 16px);
    font-family: var(--Family-Default, "Inter Variable"), Inter;
  `,
  cell: css`
    letter-spacing: -0.2px;
  `,
  actor: css`
    width: 128px;
    font-style: normal;
    font-weight: 600;
  `,
  messageOrAction: css`
    flex: 1 0 0;
    font-weight: 400;
  `,
  action: css`
    font-style: italic;
    color: var(--leo-color-systemfeedback-error-text);
  `,
  message: css`
    color: var(--leo-color-text-primary);
    font-style: normal;
  `,
  searchBoxAndDateTimeContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: --leo-spacing-xl;
    align-self: stretch;
  `,
  transcriptMessagesContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--Spacing-None, 0px);
    align-self: stretch;

    ::highlight(search-results) {
      background-color: #ffe08d;
    }
    @media (prefers-color-scheme: dark) {
      ::highlight(search-results) {
        color: #e4c780;
        background-color: #110f0b;
      }
    }
  `,
  searchBoxImage: css`
    margin-bottom: -6px;
    @media (prefers-color-scheme: dark) {
      filter: invert(1);
    }
  `,
  dateTime: css`
    color: var(--leo-color-text-primary);
    font-family: var(--Family-Headings, Poppins);
    font-size: var(--Size-H4, 16px);
    font-style: normal;
    font-weight: 600;
    line-height: var(--Line-height-H4, 26px); /* 162.5% */
  `,
  dateTimeContainer: css`
    display: flex;
    align-items: center;
    gap: --leo-spacing-xl;
    align-self: stretch;
  `,
  downloadButtonImage: css`
    margin-bottom: -2px;
  `,
  downloadButton: css`
    display: flex;
    min-height: 44px;
    padding: var(--leo-spacing-l) var(--leo-spacing-xl);
    justify-content: center;
    align-items: center;
    max-width: fit-content;
  `,
  h1: css`
    color: var(--leo-color-text-primary);
    font-family: var(--Family-Headings, Poppins);
    font-size: var(--Size-H2, 28px);
    font-style: normal;
    font-weight: 600;
    line-height: var(--Line-height-H2, 36px);
    letter-spacing: var(--Letter-spacing-Headings, -0.5px);
    text-wrap: nowrap;
  `,
  searchBoxContainer: css`
    width: 100%;
  `,
  headerTitle: css`
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1 0 0;
  `,
  headerAndDownloadButton: css`
    display: flex;
    align-items: center;
    align-self: stretch;
  `,
};

const COLORS = [
  "var(--leo-color-secondary-40)",
  "var(--leo-color-primary-40)",
  "var(--leo-color-green-40)",
  "orange",
  "#BADA55",
  "purple",
];

export const MeetingTranscript = ({ transcript }: MeetingTranscriptProps) => {
  const { t } = useTranslation();
  const participantColorMap = new Map<string, string>();
  let participantCounter = 0;
  const { events, startDateTime } = transcript;
  events.forEach((e) => {
    const color = participantColorMap.get(e.participant);
    if (!color) {
      participantColorMap.set(
        e.participant,
        COLORS[participantCounter++ % COLORS.length],
      );
    }
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const textRef = createRef<HTMLDivElement>();
  useEffect(() => {
    if (!window.CSS?.highlights) {
      return;
    }
    CSS.highlights.clear();
    const str = searchTerm.trim().toLowerCase();
    if (!str || !textRef.current) {
      return;
    }
    const ranges: Range[] = [];
    for (const rowElement of textRef.current.childNodes) {
      const textNode = rowElement.lastChild?.firstChild;
      if (!textNode) {
        continue;
      }
      const content = textNode?.textContent?.toLowerCase();
      if (!content) {
        continue;
      }
      let index = content.indexOf(str);
      while (index > -1) {
        const range = new Range();
        range.setStart(textNode, index);
        range.setEnd(textNode, index + str.length);
        ranges.push(range);

        index = content.indexOf(str, index + 1);
      }
    }
    const highlight = new Highlight(...ranges);
    CSS.highlights.set("search-results", highlight);
  }, [searchTerm, transcript]);

  const ACTION_MESSAGE: Record<TranscriptAction, string> = {
    [TranscriptAction.Join]: t("PARTICIPANT: joined the call"),
    [TranscriptAction.Leave]: t("PARTICIPANT: left the call"),
  };

  return (
    <div css={styles.outer}>
      <div css={styles.headerAndDownloadButton}>
        <div css={styles.headerTitle}>
          <img
            src={TranscriptImage}
            height="28"
            width="28"
            alt={t("Meeting Transcript")}
          />{" "}
          <h1 css={styles.h1}>{t("Meeting Transcript")}</h1>
        </div>
        <Button
          css={styles.downloadButton}
          kind="outline"
          title={t("download_transcript_button")}
          onClick={() => {
            const link = document.createElement("a");
            link.href = transcript.blobUrl;
            link.download = `${transcript.id}.txt`;
            link.click();
          }}
        >
          <span slot="icon-before">
            <img
              src={DownloadImage}
              height="16"
              width="18"
              alt="download"
              css={styles.downloadButtonImage}
            />
          </span>
          {t("download_transcript_button")}
        </Button>
      </div>
      <div css={styles.searchBoxAndDateTimeContainer}>
        {startDateTime && (
          <div css={styles.dateTimeContainer}>
            <p css={styles.dateTime}>
              <strong>{formatRelativeDay(startDateTime)}</strong>
              {", "}
              {startDateTime.toLocaleTimeString()}{" "}
            </p>
          </div>
        )}
        <div css={styles.searchBoxContainer}>
          <Input size="normal" onInput={(e) => setSearchTerm(e.value)}>
            <span slot="left-icon">
              <img
                src={SearchImage}
                css={styles.searchBoxImage}
                height="20"
                width="20"
                alt="search"
              />
            </span>
          </Input>
        </div>
      </div>
      <div ref={textRef} css={styles.transcriptMessagesContainer}>
        {events.map((event, i) =>
          typeof event.messageOrAction !== "string" ? (
            <div css={styles.transcriptEventRow} key={i}>
              <div
                css={[
                  styles.cell,
                  styles.actor,
                  { color: participantColorMap.get(event.participant) },
                ]}
              >
                {event.participant}
              </div>
              <div css={[styles.cell, styles.messageOrAction, styles.action]}>
                {ACTION_MESSAGE[event.messageOrAction]}
              </div>
            </div>
          ) : (
            <div css={styles.transcriptEventRow} key={i}>
              <div
                css={[
                  styles.cell,
                  styles.actor,
                  { color: participantColorMap.get(event.participant) },
                ]}
              >
                {event.participant}
              </div>
              <div css={[styles.cell, styles.messageOrAction, styles.message]}>
                {event.messageOrAction}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export const MeetingTranscriptDisplay = ({
  transcriptId,
  transcriptUrlBase,
}: MeetingTranscriptDisplayProps) => {
  const [transcript, setTranscript] = useState<
    DownloadedTranscript | undefined
  >();

  useEffect(() => {
    const transcriptUrl =
      (transcriptUrlBase || "/api/v1/transcripts/") + transcriptId;
    fetch(transcriptUrl)
      .then((r) => r.text())
      .then(parseTranscriptLines)
      .then(({ events, text }) => {
        setTranscript({
          id: transcriptId,
          url: transcriptUrl,
          blobUrl: URL.createObjectURL(
            new Blob([text], { type: "text/plain" }),
          ),
          events,
          startDateTime:
            window.history.state?.startDateTime &&
            new Date(window.history.state.startDateTime),
        });
      });
  }, [transcriptId, transcriptUrlBase]);

  return transcript ? (
    <MeetingTranscript transcript={transcript} />
  ) : (
    <p>Loading</p>
  );
};

export default MeetingTranscript;
