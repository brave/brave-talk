import { useEffect, useState } from "react";
import { availableRecordings, Recording } from "../recordings-store";

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useRecordings(): Readonly<Recording[]> {
  const [recordings, setRecordings] = useState(availableRecordings());

  // and automatically re-read those recordings on a schedule, so expired
  // ones disappear and new ones created in other windows appear
  useEffect(() => {
    const interval = setInterval(() => {
      setRecordings(availableRecordings());
    }, AUTO_REFRESH_INTERVAL_MS);

    // the return value from an effect is a function that is called when this hook
    // is no longer in scope
    return () => {
      clearInterval(interval);
    };
  }, []);

  return recordings;
}
