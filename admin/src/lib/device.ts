"use client";

const DEVICE_KEY = "hamere-admin-device";

export async function buildBrowserDeviceContext() {
  const storedId =
    typeof window !== "undefined" ? localStorage.getItem(DEVICE_KEY) : null;
  let deviceId = storedId;

  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_KEY, deviceId);
  }

  return {
    deviceId,
    deviceName:
      typeof navigator !== "undefined" ? navigator.platform : "web-client",
    devicePlatform:
      typeof navigator !== "undefined" ? navigator.userAgent : "web",
    appVersion:
      typeof document !== "undefined" ? document.title : "admin",
  };
}


