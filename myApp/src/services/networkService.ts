import { Network, type NetworkStatus } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings';

type NetworkListener = (status: NetworkStatus) => void;

let currentStatus: NetworkStatus = { connected: false, connectionType: 'none' };
const listeners = new Set<NetworkListener>();

/**
 * Initialize network monitoring (call once, e.g. in main.ts or App.vue)
 */
export async function initNetworkService() {
  // Get initial state
  currentStatus = await Network.getStatus();

  // Listen for changes
  Network.addListener('networkStatusChange', status => {
    currentStatus = status;
    listeners.forEach(cb => cb(status));
  });
}

/** Latest known status */
export function getNetworkStatus(): NetworkStatus {
  return { ...currentStatus };
}

/** Subscribe to network changes; returns unsubscribe fn */
export function onNetworkChange(cb: NetworkListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Verify the device currently has an active network connection.
 * Returns true if connected, false otherwise.
 */
export async function checkConnection(): Promise<boolean> {
  const status = await Network.getStatus();
  currentStatus = status;
  return status.connected;
}

/**
 * Open system network settings (Wi-Fi/Mobile Data) so user can enable data.
 * Works only on Android/iOS native apps.
 */
export async function openNetworkSettings(mode: string): Promise<void> {
  if (Capacitor.getPlatform() === 'android') {
    if(mode == 'wifi'){
      OpenNativeSettings.open(mode);
    }
    if(mode === 'data'){
      OpenNativeSettings.open(mode);
    }
    
  } else if (Capacitor.getPlatform() === 'ios') {
    // await App.openUrl({ url: 'App-Prefs:root=WIFI' });
  }
}
