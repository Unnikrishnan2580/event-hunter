// src/services/secureStore.ts
import { Preferences } from '@capacitor/preferences';

/**
 * Simple abstraction for storing small secrets.
 * PRODUCTION: replace internals with a native secure storage plugin (Keychain/Android Keystore).
 */
export const secureStore = {
  async set(key: string, value: string) {
    // TODO: replace with native secure storage plugin in production
    await Preferences.set({ key, value });
  },
  async get(key: string): Promise<string | null> {
    const r = await Preferences.get({ key });
    return r.value ?? null;
  },
  async remove(key: string) {
    await Preferences.remove({ key });
  }
}
