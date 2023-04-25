import { useEffect, useRef, useState } from "react";
import { IJistiMeetApi, renderConferencePage } from "../jitsi";

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
      renderConferencePage(
        divRef.current,
        props.roomName,
        props.jwt,
        props.isMobile
      ).then(setJitsiMeet);
    }
  }, [divRef, jistiMeet, props]);

  return <div ref={divRef} css={{ height: "100%" }} />;
};
