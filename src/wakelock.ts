let wakelock: WakeLockSentinel | null = null;

export const acquireWakeLock = async () => {
  try {
    wakelock = await navigator.wakeLock.request("screen");
    console.log("!!! wakelock acquired", wakelock);
  } catch (e: any) {
    console.error(e);
  }
};

export const releaseWakeLock = async () => {
  if (wakelock !== null) {
    await wakelock.release();
    wakelock = null;
  }
};

const tryReacquireWakeLock = async () => {
  if (wakelock !== null && document.visibilityState === "visible") {
    await acquireWakeLock();
  }
};

document.addEventListener("visibilityChange", tryReacquireWakeLock);
