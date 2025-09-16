<template>

  <ion-page>
    <ion-content fullscreen class="login-content">
      <div class="overlay">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">
              {{ t('login.title') }}
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <!-- Email -->
            <ion-input
              v-model="email"
              type="email"
              :placeholder="t('login.emailPlaceholder')"
              class="curved-input"
              @ionBlur="validateEmail"
            />
            <ion-text color="danger" v-if="emailError">
              <small>{{ emailError }}</small>
            </ion-text>

            <!-- Password -->
            <ion-input
              v-model="password"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              class="curved-input ion-margin-top"
              @ionBlur="validatePassword"
            />
            <ion-text color="danger" v-if="passwordError">
              <small>{{ passwordError }}</small>
            </ion-text>

            <!-- Sign In Button -->
            <ion-button
              expand="block"
              :disabled="!isFormValid"
              class="curved-button ion-margin-top"
              @click="submitLogin"
            >
              {{ t('login.signIn') }}
            </ion-button>

            <!-- Biometric Button -->
            <ion-button
              expand="block"
              fill="clear"
              v-if="biometricAvailable && biometricEnabled"
              @click="doBiometricLogin"
            >
              <ion-icon slot="start" :icon="fingerprintIcon" />
              {{ t('login.unlockBiometric') }}
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>

</template>

<script setup lang="ts">

  import {
    IonPage,
    IonCard,
    IonText,
    IonIcon,
    IonInput,
    IonButton,
    IonContent,
    IonCardTitle,
    IonCardHeader,
    IonCardContent
  } from '@ionic/vue'
  import router from '@/router'
  import { useI18n } from 'vue-i18n'
  import { ref, computed } from 'vue'
  import { fingerPrint } from 'ionicons/icons'

  import {
    login,
    canUseBiometrics,
    tryBiometricRestore,
    enableBiometricsForCurrentUser,
  } from '@/services/auth/auth'
  import { showErrorToast } from '@/utils/toast'
  import { showActionSheet } from '@/utils/actionSheet'

  const { t } = useI18n() // <-- i18n

  const email = ref('')
  const password = ref('')
  const emailError = ref('')
  const passwordError = ref('')
  const biometricAvailable = ref(false)
  const biometricEnabled = ref(false)
  const fingerprintIcon = fingerPrint

  // checks for a valid form, if the form is not valid throws validation messages
  const isFormValid = computed(
    () => !emailError.value && !passwordError.value && email.value && password.value
  )

  /**
   * ValidateEmail
   * * Used to validate format of the email (sample supported email format: sample@email.com)
   */
  function validateEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    emailError.value = regex.test(email.value) ? '' : t('errorMessages.invalidEmail')
  }

  /**
   * ValidatePassword
   * * Used to validate the password. Only checking wether the password field is empty or not.
   */
  function validatePassword() {
    passwordError.value = password.value ? '' : t('errorMessages.passwordRequired')
  }

  /**
   * submitLogin
   * * Used to authenticate user credentials
   */
  function submitLogin() {
    // checks wether email and password are valid 
    validateEmail()
    validatePassword()
    if (login(email.value, password.value)) {
      // Invoke biometric authentication for future logins.
      promptEnableBiometric()
    } else {
      showErrorToast(t('errorMessages.loginFailure'))
    }
  }

  /**
   * doBiometricLogin
   * * Function to do biometric login for already logged in users.
   */
  async function doBiometricLogin() {
    const ok = await tryBiometricRestore()
    if (ok) {
      // Requests biometric permission
      promptEnableBiometric()
    } else {
      showErrorToast(t('requestMessages.enableBiometricAUth'))
    }
  }

  /**
   * promptEnableBiometric
   * * Loads a alert pop to request access to biometric authentication
   */
  async function promptEnableBiometric() {
    const s = await canUseBiometrics()
    if (!s.available) return
    showActionSheet({
      header: t('biometric.enableHeader'),
      subHeader: t('biometric.enableMessage'),
      buttons: [
        {
          text: t('common.yes'),
          handler: () => 
          {
            enableBiometricsForCurrentUser()
            router.replace('/tabs/events')
          }
        },
        {
          text: t('common.cancel'),
          role: 'cancel'
        }
      ]
    })
  }

</script>

<!-- CSS styles used with the page -->
<style scoped>

  .login-content {
    --background: url('@/assets/imgs/login-bg.jpeg') no-repeat center center / cover;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .overlay {
    width: 100%;
    height: 100%;
    backdrop-filter: brightness(0.8);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-card {
    width: 90%;
    max-width: 360px;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .curved-input {
    --background: #fff;
    --border-radius: 25px;
    --padding-start: 16px;
    --padding-end: 16px;
    --placeholder-color: var(--ion-color-medium);
    margin-top: 12px;
    border: 1px solid var(--ion-color-medium);
  }

  .curved-button {
    --background: black;
    --border-radius: 25px;
    --padding-start: 16px;
    --padding-end: 16px;
    margin-top: 12px;
  }

</style>
