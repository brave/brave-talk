import {
  DownloadedTranscript,
  TranscriptAction,
  TranscriptionEvent,
  parseTranscriptLines,
} from "../downloaded-transcript";
import { useEffect, useMemo, useRef, useState } from "react";
import { css, keyframes } from "@emotion/react";
import { formatDuration, formatRelativeDay } from "../recordings-utils";
import Button from "@brave/leo/react/button";
import Icon from "@brave/leo/react/icon";
import Input from "@brave/leo/react/input";
import { useTranslation } from "react-i18next";

interface MeetingTranscriptProps {
  transcript: DownloadedTranscript;
}

interface MeetingTranscriptDisplayProps {
  transcriptId: string;
  transcriptUrlBase?: string;
}

interface BrandingConfig {
  avatarBackgrounds?: string[];
}

const pulse = keyframes`
  from { opacity: 0.6; }
  to { opacity: 0.2; }
`;

const styles = {
  card: css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--leo-spacing-4xl);
    width: min(940px, 100%);
    margin: var(--leo-spacing-none) auto;
    padding: var(--leo-spacing-6xl);
    border-radius: var(--leo-radius-xl);
    background: var(--leo-color-container-background);
    box-shadow: var(--leo-effect-elevation-01);
    text-align: left;

    @media only screen and (max-width: 600px) {
      gap: var(--leo-spacing-2xl);
      margin-bottom: 16px;
      padding: var(--leo-spacing-2xl);
    }
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: var(--leo-spacing-xl);

    @media only screen and (max-width: 600px) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--leo-spacing-l);
    }
  `,
  headerTitle: css`
    display: flex;
    flex: 1 0 0;
    align-items: center;
    gap: var(--leo-spacing-xl);
    min-width: 0;
  `,
  h1: css`
    margin: var(--leo-spacing-none);
    color: var(--leo-color-text-primary);
    font: var(--leo-font-heading-h2);
    letter-spacing: var(--leo-typography-heading-h2-letter-spacing);
    white-space: nowrap;
  `,
  downloadButton: css`
    /* leo-button hosts default to flex-grow: 1 */
    flex: 0 0 auto;
  `,
  headingIcon: css`
    --leo-icon-size: 28px;
    --leo-icon-color: var(--leo-color-icon-default);
  `,
  meta: css`
    display: flex;
    flex-direction: column;
    gap: var(--leo-spacing-xl);
  `,
  metaDateTime: css`
    display: flex;
    align-items: center;
    gap: var(--leo-spacing-xl);
    margin: var(--leo-spacing-none);
    color: var(--leo-color-text-primary);
    white-space: nowrap;
  `,
  metaDate: css`
    font: var(--leo-font-heading-h4);
    letter-spacing: var(--leo-typography-heading-h4-letter-spacing);
  `,
  metaTime: css`
    font: var(--leo-font-large-regular);
    letter-spacing: var(--leo-typography-large-regular-letter-spacing);
  `,
  events: css`
    display: flex;
    flex-direction: column;

    ::highlight(search-results) {
      background-color: var(--leo-color-primitive-yellow-90);
    }
    @media (prefers-color-scheme: dark) {
      ::highlight(search-results) {
        color: var(--leo-color-primitive-yellow-80);
        background-color: var(--leo-color-primitive-yellow-5);
      }
    }
  `,
  eventRow: css`
    display: flex;
    align-items: flex-start;
    gap: var(--leo-spacing-xl);
    padding: var(--leo-spacing-m) 0;

    @media only screen and (max-width: 600px) {
      flex-direction: column;
      gap: var(--leo-spacing-none);
    }
  `,
  participant: css`
    flex-shrink: 0;
    width: 128px;
    font: var(--leo-font-large-semibold);
    letter-spacing: var(--leo-typography-large-semibold-letter-spacing);

    @media only screen and (max-width: 600px) {
      width: auto;
    }
  `,
  message: css`
    flex: 1 0 0;
    min-width: 0;
    color: var(--leo-color-text-primary);
    font: var(--leo-font-large-regular);
    letter-spacing: var(--leo-typography-large-regular-letter-spacing);
    overflow-wrap: break-word;
  `,
  action: css`
    color: var(--leo-color-text-tertiary);
    font-style: italic;
  `,
  skeletonBar: css`
    height: 16px;
    border-radius: var(--leo-radius-s);
    background: var(--leo-color-divider-subtle);
    animation: ${pulse} 1s ease-in-out infinite alternate;
  `,
};

// Speakers are assigned a colour in the order they first appear.
const DEFAULT_PARTICIPANT_COLORS = [
  "var(--leo-color-secondary-40)",
  "var(--leo-color-orange-40)",
  "var(--leo-color-green-40)",
  "var(--leo-color-primary-40)",
  "var(--leo-color-purple-40)",
  "var(--leo-color-teal-40)",
  "var(--leo-color-pink-40)",
];

// Offsets look like "12m34s", counted from the start of the call.
const parseTimeOffsetSecs = (timeOffset: string): number | undefined => {
  const match = timeOffset.match(/^(\d+)m(\d\d)s$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
};

const transcriptDurationSecs = (
  events: TranscriptionEvent[],
): number | undefined =>
  events.length
    ? parseTimeOffsetSecs(events[events.length - 1].timeOffset)
    : undefined;

const TranscriptHeading = () => {
  const { t } = useTranslation();

  return (
    <div css={styles.headerTitle}>
      <h1 css={styles.h1}>{t("Meeting Transcript")}</h1>
    </div>
  );
};

const MeetingTranscript = ({ transcript }: MeetingTranscriptProps) => {
  const { t } = useTranslation();
  const { events, startDateTime } = transcript;
  const [participantPalette, setParticipantPalette] = useState<string[]>(
    DEFAULT_PARTICIPANT_COLORS,
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/branding-config.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`branding-config.json: ${response.status}`);
        }
        return response.json() as Promise<BrandingConfig>;
      })
      .then((config) => {
        if (cancelled) {
          return;
        }

        const avatarBackgrounds = config.avatarBackgrounds?.filter(Boolean);
        if (avatarBackgrounds && avatarBackgrounds.length > 0) {
          setParticipantPalette(avatarBackgrounds);
        }
      })
      .catch(() => {
        // Keep fallback colours when branding config is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const participantColors = useMemo(() => {
    const colors = new Map<string, string>();
    events.forEach(({ participant }) => {
      if (!colors.has(participant)) {
        colors.set(
          participant,
          participantPalette[colors.size % participantPalette.length],
        );
      }
    });
    return colors;
  }, [events, participantPalette]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const textRef = useRef<HTMLDivElement>(null);
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
  }, [searchTerm, events]);

  const ACTION_MESSAGE: Record<TranscriptAction, string> = {
    [TranscriptAction.Join]: t("PARTICIPANT: joined the call"),
    [TranscriptAction.Leave]: t("PARTICIPANT: left the call"),
  };

  const durationSecs = transcriptDurationSecs(events);

  return (
    <div css={styles.card}>
      <div css={styles.header}>
        <TranscriptHeading />
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
          <Icon slot="icon-before" name="download" />
          {t("download_transcript_button")}
        </Button>
      </div>
      <div css={styles.meta}>
        {startDateTime && (
          <p css={styles.metaDateTime}>
            <strong css={styles.metaDate}>
              {formatRelativeDay(startDateTime)}
            </strong>
            <span css={styles.metaTime}>
              {startDateTime.toLocaleTimeString()}
              {durationSecs !== undefined &&
                `, ${formatDuration(durationSecs)}`}
            </span>
          </p>
        )}
        <Input
          size="normal"
          placeholder={t("transcript_search_placeholder")}
          onInput={(e: any) => setSearchTerm(e.value)}
        >
          <Icon slot="left-icon" name="search" />
        </Input>
      </div>
      <div ref={textRef} css={styles.events}>
        {events.map((event, i) => (
          <div css={styles.eventRow} key={i}>
            <div
              css={[
                styles.participant,
                { color: participantColors.get(event.participant) },
              ]}
            >
              {event.participant}
            </div>
            {typeof event.messageOrAction === "string" ? (
              <div css={styles.message}>{event.messageOrAction}</div>
            ) : (
              <div css={[styles.message, styles.action]}>
                {ACTION_MESSAGE[event.messageOrAction]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SKELETON_WIDTHS = ["82%", "64%", "91%", "48%", "76%", "58%"];

const TranscriptSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div css={styles.card} aria-busy="true" aria-label={t("loading")}>
      <div css={styles.header}>
        <TranscriptHeading />
      </div>
      <div css={styles.events}>
        {SKELETON_WIDTHS.map((width, i) => (
          <div css={styles.eventRow} key={i}>
            <div css={[styles.participant, styles.skeletonBar]} />
            <div
              css={[styles.message, styles.skeletonBar, { maxWidth: width }]}
            />
          </div>
        ))}
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
    <TranscriptSkeleton />
  );
};

export default MeetingTranscriptDisplay;
