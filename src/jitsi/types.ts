export type IJitsiMeetApi = any;

export type JitsiContext = {
  firstTime: boolean;
  inactiveInterval: number;
  inactiveTotal: number;
  inactiveCount: number;
  inactiveTimer: any;
  passcode: string | undefined;
};

export type JitsiEventHandler = {
  name: string;
  fn: (
    JitsiMeetJS: IJitsiMeetApi,
    context: JitsiContext,
    options: JitsiOptions,
  ) => (params: any) => void;
};

export type CustomToolbarButton = {
  backgroundColor?: string;
  icon: string;
  id: string;
  text: string;
};

export type JitsiOptions = {
  roomName: string;
  jwt: string;
  parentNode: Element | null;
  lang: string;
  configOverwrite: {
    analytics: {
      disabled: boolean;
      rtcstatsEnabled: boolean;
    };
    buttonsWithNotifyClick: string[];
    brandingRoomAlias: string;
    callStatsID: boolean;
    callStatsSecret: boolean;
    conferenceInfo: {
      autoHide: string[];
    };
    customToolbarButtons: CustomToolbarButton[];
    disabledSounds: string[];
    disableGTM: boolean;
    doNotStoreRoom: boolean;
    disableBeforeUnloadHandlers: boolean;
    disableInviteFunctions: boolean;
    disableTileEnlargement: boolean;
    dropbox: {
      appKey: string | null;
    };
    e2eeLabels: {
      e2ee: string;
      labelToolTip: string;
      description: string;
      label: string;
      warning: string;
    };
    enableTalkWhileMuted: boolean;
    faceLandmarks: {
      enableFaceExpressionsDetection: boolean;
      enableDisplayFaceExpressions: boolean;
    };
    giphy: {
      enabled: boolean;
    };
    fileSharing: {
      enabled: boolean;
    };
    hideEmailInSettings: boolean;
    inviteAppName: string;
    localSubject: string;
    prejoinPageEnabled: boolean;
    recordings: {
      recordAudioAndVideo: boolean;
    };
    resolution?: number;
    startWithAudioMuted: boolean;
    startWithVideoMuted: boolean;
    toolbarConfig: {
      autoHideWhileChatIsOpen: boolean;
    };
    toolbarButtons: string[];
    transcribingEnabled: boolean;
    transcription: {
      autoTranscribeOnRecord: boolean;
      translationLanguages: string[];
    };
    useHostPageLocalStorage: boolean;
    videoQuality: {
      persist: boolean;
    };
  };
  interfaceConfigOverwrite: {
    APP_NAME: string;
    DEFAULT_BACKGROUND: string;
    DEFAULT_LOCAL_DISPLAY_NAME: string;
    DEFAULT_LOGO_URL: string;
    DEFAULT_REMOTE_DISPLAY_NAME: string;
    DISABLE_TRANSCRIPTION_SUBTITLES: boolean;
    JITSI_WATERMARK_LINK: string;
    NATIVE_APP_NAME: string;
    PROVIDER_NAME: string;
    SHARING_FEATURES: string[];
    SHOW_CHROME_EXTENSION_BANNER: boolean;
    SUPPORT_URL: string;
    TOOLBAR_BUTTONS: string[];
  };
  onload: () => void;
};

export type JitsiTranscriptionChunk = {
  language: string;
  messageID: string;
  participant?: {
    avatarUrl?: string;
    id: string;
    name: string;
  };
  final?: string;
  stable?: string;
  unstable?: string;
  clearTimeOut?: number;
  delta: number;
  elapsed: string;
};

export type JitsiTranscriptionStatusEvent = {
  on: boolean;
};

export type JitsiRoomResult = {
  rooms: JitsiRoom[];
};

export type JitsiRoom = {
  isMainRoom: boolean;
  id: string;
  jid: string;
  participants: JitsiParticipant[];
};

export type JitsiParticipant = {
  jid: string;
  role: string;
  displayName: string;
  id: string;
};

export type JitsiDeployment = {
  environment: string;
  envType: string;
  releaseNumber: string;
  shard: string;
  region: string;
  userRegion: string;
};
