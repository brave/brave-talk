import './css/recordings.css'
import DownloadImage from './images/download.svg'
import MediaPlayerImage from './images/media_player.svg'
import React, { Dispatch } from 'react'
import ReactDOM from 'react-dom'
import { formatDuration, formatRelativeDay } from './recordings-utils'
import { availableRecordings, Recording } from './recordings-store'

export const populateRecordings = (recordingsEl: HTMLElement) => {
  const records = availableRecordings()

  console.log('!!! recordings', records)

  if (records.length > 0) {
    ReactDOM.render(<Recordings recordings={records} />, recordingsEl)
    recordingsEl.style.display = 'block'
  }
}

export const Recordings: React.FC<{
  recordings: Readonly<Recording[]>
}> = ({ recordings }) => {
  return (
    <>
      <p className='recordings-header'>
        <img src={MediaPlayerImage} />
        <span>Your recorded calls</span>
      </p>
      <p className='body-text recordings-subhead'>
        Recorded calls are automatically cleared 24 hours after their recording
        time
      </p>
      {recordings.map((r, idx) => (
        <RecordingDisplay key={idx} recording={r} />
      ))}
    </>
  )
}

const RecordingDisplay: React.FC<{ recording: Recording }> = ({
  recording: r
}) => {
  const recordingDate = new Date(r.createdAt * 1000)

  return (
    <a href={r.url}>
      <div className='recording'>
        <div>
          <strong>{formatRelativeDay(recordingDate)}</strong>
          {', '}
          {recordingDate.toLocaleTimeString()}
          {', '}
          {formatDuration(r.expiresAt - r.ttl - r.createdAt)}
        </div>
        <div>
          <img src={DownloadImage} height='16' width='18' />
        </div>
      </div>
    </a>
  )
}
