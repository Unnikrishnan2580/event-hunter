import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import { StatusBar, Style } from '@capacitor/status-bar';

import i18n from '@/assets/i18n'
import { useTheme } from './composables/useTheme'
import { currentUser } from './services/auth/auth'
import { restoreSession, tryBiometricRestore } from './services/auth/auth'
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

restoreSession()
const app = createApp(App).use(IonicVue).use(router);

// Start watching theme preference
const theme = currentUser?.value?.preferences?.theme ? currentUser.value.preferences.theme : 'light'
const setTheme = useTheme
const { applyTheme } = setTheme()
applyTheme(theme)
router.isReady().then(async () => {
  await tryBiometricRestore()
  await StatusBar.setOverlaysWebView({ overlay: true });
  
  // Optional: match Ionic toolbar color
  await StatusBar.setBackgroundColor({ color: '#3880ff' }); // your primary color
  await StatusBar.setStyle({ style: Style.Light });
  app.use(i18n)

  app.mount('#app');
});
