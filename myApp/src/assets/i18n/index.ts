import { createI18n } from 'vue-i18n'
import en from './en.json'
import fr from './fr.json'
import de from './de.json'
import { currentUser } from '@/services/auth/auth' 

const i18n = createI18n({
  legacy: false,
  locale: currentUser?.value?.preferences?.language,
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    de
  }
})

export default i18n
