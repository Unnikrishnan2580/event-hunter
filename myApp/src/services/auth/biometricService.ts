// src/services/biometricService.ts
import { Capacitor } from '@capacitor/core'

// Use the Awesome Cordova wrapper
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio'
/**
 * Wrapper service for native biometric interactions.
 * - isAvailable(): checks platform & plugin availability.
 * - authenticate(): shows native biometric prompt. resolves true/false.
 */

const KEY_BIOMETRIC_ENABLED = 'biometric_enabled'
const KEY_BIOMETRIC_USER = 'biometric_user_id'

export const biometricService = {
  // returns boolean indicating plugin availability on this platform
  async isAvailable(): Promise<boolean> {
    // ensure running on device (not browser)
    if (Capacitor.getPlatform() === 'web') return false
    try {
      const res = await FingerprintAIO.isAvailable()
      // plugin returns string like "finger" or object; treat truthy as available
      return !!res
    } catch (e) {
      console.warn('biometric isAvailable check failed', e)
      return false
    }
  },

  // show biometric prompt — returns true if successful
  async authenticate(promptTitle = 'Authenticate', fallback = false): Promise<boolean> {
    try {
      // show() resolves when success; rejects on failure/cancel
      await FingerprintAIO.show({
        title: promptTitle,
        // optional Android-specific UI text:
        subtitle: '',
        description: '',
        fallbackButtonTitle: fallback ? 'Use passcode' : 'Cancel',
        disableBackup: !fallback // if disableBackup true then no passcode option
      })
      return true
    } catch (err) {
      console.warn('biometric authenticate failed', err)
      return false
    }
  },

  // enable biometric for given user id (store pointer in localStorage)
  enableForUser(userId: string) {
    localStorage.setItem(KEY_BIOMETRIC_ENABLED, '1')
    localStorage.setItem(KEY_BIOMETRIC_USER, String(userId))
  },

  // disable biometric registration
  disable() {
    localStorage.removeItem(KEY_BIOMETRIC_ENABLED)
    localStorage.removeItem(KEY_BIOMETRIC_USER)
  },

  // check if biometric enabled
  isEnabled(): boolean {
    return localStorage.getItem(KEY_BIOMETRIC_ENABLED) === '1' &&
           !!localStorage.getItem(KEY_BIOMETRIC_USER)
  },

  // get registered user id (string or null)
  getRegisteredUserId(): string | null {
    return localStorage.getItem(KEY_BIOMETRIC_USER)
  },
}
