import { useState } from "react";

interface Params {
  // url has "create=y" meaning we've been invokved from the /talk slack extension
  // in this case, we should only automatiucally create the room if the user is a subscriber
  isCreate: boolean;

  // url has "create_only=y" meaning we should create the room but then immediately close the window
  // rather than entering the room. This is used by the google calendar extension.
  isCreateOnly: boolean;

  isDebug: boolean;
}

export function useParams(): Params {
  // we're using state here only to capture the _initial_ state of the query params. But
  // we don't want this to get updated if the url changes for any reason.
  const [params] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      isCreate: p.get("create") === "y",
      isCreateOnly: p.get("create_only") === "y",
      isDebug: p.get("debug") === "y",
    };
  });

  return params;
}
