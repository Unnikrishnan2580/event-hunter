// src/composables/useTheme.ts
import { watch } from 'vue'
import { useAuth } from './useAuth'

export function useTheme() {
  const { currentUser } = useAuth()

  /** Apply the dark/light class to <body> */
  function applyTheme(theme: string) {
    document.body.classList.toggle('dark', theme === 'dark')
  }

  /** Watch for theme changes at runtime */
  watch(
    () => currentUser.value?.preferences?.theme,
    theme => {
      if (theme) applyTheme(theme)
    },
    { immediate: true } // apply on first load too
  )

  return { applyTheme }
}
