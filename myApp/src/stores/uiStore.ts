import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

interface UIState {
  darkMode: boolean;
  showModal: boolean;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    darkMode: false,
    showModal: false
  }),
  actions: {
    async toggleDarkMode() {
      this.darkMode = !this.darkMode;
      await Preferences.set({ key: 'dark_mode', value: String(this.darkMode) });
    },
    async loadDarkMode() {
      const { value } = await Preferences.get({ key: 'dark_mode' });
      this.darkMode = value === 'true';
    },
    openModal() { this.showModal = true; },
    closeModal() { this.showModal = false; }
  }
});
