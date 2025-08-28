// src/lib/deviceId.js
export function getDeviceId() {
    const KEY = "deviceId";
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  }
  