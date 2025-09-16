<template>

  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>
          {{ t('menuLabels.profileLabel') }}
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- User Info Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ profile.name }}</ion-card-title>
          <ion-card-subtitle>{{ profile.email }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-label>ID</ion-label>
            <ion-text>{{ profile.id }}</ion-text>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- Preferences -->
      <ion-list>
        <ion-list-header>
          <ion-label>
            {{ t('common.Preferences') }}
          </ion-label>
        </ion-list-header>

          <!-- Reminder -->
          <ion-item>
            <ion-label>
              {{ t('appLabels.remindMeLabel') }}
            </ion-label>
            <ion-range v-model="profile.preferences.reminder" :min="5" :max="15" :step="1" @ionChange="onReminderChange" snaps>
              <ion-label slot="end">{{ profile.preferences.reminder }}</ion-label>
            </ion-range>
          </ion-item>

        <!-- Theme Toggle -->
        <ion-item>
          <ion-icon
            slot="start"
            :icon="isDark ? moon : sunny"
            style="color: var(--ion-text-color)"
          />
          <ion-label>
            {{ t('common.darkTheme') }}
          </ion-label>
          <ion-toggle
            v-model="isDark"
            @ionChange="onThemeToggle"
          ></ion-toggle>
        </ion-item>

        <!-- Language Selector -->
        <ion-item>
          <ion-icon slot="start" :icon="languageIcon" style="color: var(--ion-text-color)" />
          <ion-label>
            {{ t('common.language') }}
          </ion-label>
          <ion-select
            v-model="profile.preferences.language"
            interface="popover"
            placeholder="Select"
            @ionChange="savePreferences"
          >
            <ion-select-option value="en">English</ion-select-option>
            <ion-select-option value="gr">German</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>

</template>

<script setup lang="ts">

  import {
    IonPage, 
    IonCard, 
    IonItem, 
    IonText, 
    IonList, 
    IonIcon, 
    IonRange,
    IonLabel, 
    IonTitle, 
    IonToggle, 
    IonHeader, 
    IonSelect, 
    IonToolbar, 
    IonButtons, 
    IonContent,
    IonCardTitle, 
    IonCardHeader, 
    IonListHeader,
    IonCardContent,
    IonCardSubtitle, 
    IonSelectOption, 
  } from '@ionic/vue'
  import { 
    moon, 
    sunny, 
    language as languageIcon } from 'ionicons/icons'
  import { useI18n } from 'vue-i18n'
  import { ref, reactive } from 'vue'
  import { currentUser } from '@/services/auth/auth'
  import { useTheme } from '@/composables/useTheme'

  const { t } = useI18n() // <-- i18n
  // Mock user data – replace with your real auth/user store
  const profile = reactive({
    id: currentUser.value?.id,
    email: currentUser.value?.email,
    name: currentUser.value?.name,
    avatar: currentUser.value?.avatar,
    password: '********',
    preferences: {
      theme: currentUser.value?.preferences.theme,
      language: currentUser.value?.preferences.language,
      reminder: currentUser.value?.preferences.reminder
    }
  })
  const isDark = ref(profile.preferences.theme === 'dark')

  /**
   * onTemeToggle
   * * Handle theme change and save it to preferences
   */
  function onThemeToggle() {
    const newTheme = isDark.value ? 'dark' : 'light'
    const setTheme = useTheme
    const { applyTheme } = setTheme()
    applyTheme(newTheme)
    profile.preferences.theme = newTheme
    savePreferences()
  }

  /**
   * onReminderChange
   * * Handle reminder change and save it to preferences
   */
  function onReminderChange(){  
    savePreferences() 
  }


  /**
   * savePreferences
   * * Save preferences to local storage
   */
  function savePreferences() {
    localStorage.setItem('userPrefs', JSON.stringify(profile.preferences))
    localStorage.setItem('auth_session', JSON.stringify(profile))
  }

</script>

<style scoped>

  ion-card-title {
    font-size: 1.4rem;
    font-weight: bold;
  }

</style>
