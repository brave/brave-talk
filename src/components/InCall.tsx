import { useEffect, useRef, useState } from "react";
import {
  IJistiMeetApi,
  renderConferencePage,
  miniLoadedExternalApi,
} from "../jitsi";

interface Props {
  roomName: string;
  jwt: string;
  isMobile: boolean;
}

export const InCall: React.FC<Props> = (props) => {
  const divRef = useRef(null);
  const [jistiMeet, setJitsiMeet] = useState<IJistiMeetApi>();

  useEffect(() => {
    if (!jistiMeet && divRef.current) {
      miniLoadedExternalApi();
      setJitsiMeet(
        renderConferencePage(
          divRef.current,
          props.roomName,
          props.jwt,
          props.isMobile
        )
      );
    }
  }, [divRef, jistiMeet, props]);

  return <div ref={divRef} css={{ height: "100%" }} />;
};
