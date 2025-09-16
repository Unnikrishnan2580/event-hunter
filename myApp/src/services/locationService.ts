// src/services/locationService.ts
import { Geolocation } from '@capacitor/geolocation';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings';
import { Capacitor } from '@capacitor/core';
import { alertController } from '@ionic/vue';

export class LocationService {
  static async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const granted = await this.ensurePermission();
      if (!granted) return null;

      // Try to get location with a timeout
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
    } catch (err) {
      console.error('Location error:', err);
      return null;
    }
  }

  private static async ensurePermission(): Promise<boolean> {
    const perm = await Geolocation.checkPermissions();

    if (perm.location === 'granted') return true;

    if (perm.location === 'prompt') {
      const req = await Geolocation.requestPermissions();
      return req.location === 'granted';
    }

    // If denied, ask to open settings
    if (perm.location === 'denied') {
      await this.askToOpenSettings();
      const after = await Geolocation.checkPermissions();
      return after.location === 'granted';
    }
    return false;
  }

  private static async askToOpenSettings() {
    const alert = await alertController.create({
      header: 'Enable Location',
      message: 'We need location access to show events near you. Open settings?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Open Settings',
          handler: () => {
            if (Capacitor.getPlatform() !== 'web') {
              OpenNativeSettings.open('location');
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
