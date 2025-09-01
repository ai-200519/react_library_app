// src/lib/deviceId.js
class DeviceIdService {
  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('deviceId', deviceId);
      
      // Also store in multiple places for redundancy
      try {
        sessionStorage.setItem('deviceId_backup', deviceId);
      } catch (e) {
        // Ignore if sessionStorage not available
      }
      
      // Register device with backend
      this.registerDevice(deviceId);
    }
    
    return deviceId;
  }

  generateDeviceId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const userAgent = navigator.userAgent.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '');
    return `device_${timestamp}_${random}_${userAgent}`;
  }

  async registerDevice(deviceId) {
    try {
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
    } catch (error) {
      console.warn('Failed to register device:', error);
    }
  }

  getDeviceId() {
    return this.deviceId;
  }

  // For data migration/recovery
  recoverDeviceId() {
    const backupId = sessionStorage.getItem('deviceId_backup');
    if (backupId && !localStorage.getItem('deviceId')) {
      localStorage.setItem('deviceId', backupId);
      this.deviceId = backupId;
    }
  }
}

export default new DeviceIdService();