import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
  } | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null
  }),
  actions: {
    async setToken(token: string) {
      this.token = token;
      await Preferences.set({ key: 'auth_token', value: token });
    },
    async loadToken() {
      const { value } = await Preferences.get({ key: 'auth_token' });
      this.token = value;
    },
    async clearSession() {
      this.token = null;
      this.user = null;
      await Preferences.remove({ key: 'auth_token' });
    },
    setUser(user: AuthState['user']) {
      this.user = user;
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  }
});
