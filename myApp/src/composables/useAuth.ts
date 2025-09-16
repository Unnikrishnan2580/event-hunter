// src/composables/useAuth.ts
import { ref } from 'vue'

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
}

export interface CurrentUser {
  id: string
  email: string
  name: string
  password: string
  preferences: UserPreferences
  avatar: string
}

const currentUser = ref<CurrentUser | null>(null)

export function useAuth() {
  /** Load saved user (from localStorage or API) */
  function loadUser() {
    const saved = localStorage.getItem('currentUser')
    if (saved) currentUser.value = JSON.parse(saved)
  }

  /** Save/replace the entire user */
  function setUser(user: CurrentUser) {
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  /** Update preferences & persist */
  function updatePreferences(prefs: UserPreferences) {
    if (!currentUser.value) return
    currentUser.value.preferences = prefs
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
  }

  return { currentUser, loadUser, setUser, updatePreferences }
}
