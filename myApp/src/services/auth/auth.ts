import { ref } from 'vue'
// import { dbService } from '@services/data/dbService';
import testUsers from '@/assets/data/data.json'
import { biometricService } from '@/services/auth/biometricService'

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  preferences: { theme: string; language: string, reminder: string };
  savedEvents: string[];
  avatar?: string;
}

const currentUser = ref<User | null>(null)

/** Validate email & password against the local guest list */
export function login(email: string, password: string, authType: string): boolean {
  const user = (testUsers as User[]).find(
    user => user.email === email && user.password === password
  )
  if (user && authType === 'credentialsLogin') {
    currentUser.value = user
    localStorage.setItem('auth_session', JSON.stringify(user))
    return true
  }
  return false
}

/** Load session from localStorage on app start */
export function restoreSession() {
  const saved = localStorage.getItem('auth_session')
  if (saved) {
    currentUser.value = JSON.parse(saved) as User
  }
}

export async function enableBiometricsForCurrentUser() {
  if (!currentUser.value) return
  biometricService.enableForUser(currentUser.value.id)
}

export async function tryBiometricRestore(): Promise<boolean> {
    try {
      if (!biometricService.isEnabled()) return false
      const available = await biometricService.isAvailable()
      if (!available) return false

      const ok = await biometricService.authenticate('Unlock app')
      if (!ok) return false

      const uid = biometricService.getRegisteredUserId()
      if (!uid) return false

      // find user from mock list (or load from your user storage)
      const user = testUsers.find(u => u.id === uid) || null
      if (!user) return false

      login(user.email, user.password,'biometricLogin')
      return true
    } catch (e) {
      console.warn('biometric restore error', e)
      return false
    }
  }

  // helper: check whether biometric available/enabled
  export async function canUseBiometrics(): Promise<{ available: boolean; enabled: boolean }> {
    const available = await biometricService.isAvailable()
    return { available, enabled: biometricService.isEnabled() }
  }

/** Clear session */
export async function logout() {
  currentUser.value = null
  // await dbService.clearDatabase();
  localStorage.removeItem('auth_session')
  biometricService.disable()
}


export { currentUser }


