<template>

  <ion-menu content-id="main-content" menu-id="main-menu" side="start">
    <ion-content>
      
      <div class="user-info" @click="goToProfile">
        <ion-avatar class="user-avatar">
          <img :src="user.avatar || defaultAvatar" alt="User Avatar" />
        </ion-avatar>
        <h2 class="user-name">{{ user.name || 'Guest User' }}</h2>
        <p class="user-email">{{ user.email || 'guest@example.com' }}</p>
      </div>
      
      <ion-list lines="none">

        <ion-menu-toggle>
          <ion-item router-link="/" detail>
            <ion-icon slot="start" :icon="home" style="color: var(--app-icon-color)" />
            <ion-label>{{ t('menuLabels.homeLabel') }}</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle>
          <ion-item router-link="/tabs/bookmarks" detail>
            <ion-icon slot="start" :icon="bookmarkOutline" style="color: var(--app-icon-color)" />
            <ion-label>{{ t('menuLabels.bookmarkLabel') }}</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle>
          <ion-item router-link="/tabs/profile" detail>
            <ion-icon slot="start" :icon="personCircleOutline" style="color: var(--app-icon-color)" />
            <ion-label>{{ t('menuLabels.profileLabel') }}</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle>
          <ion-item button @click="logOut">
            <ion-icon slot="start" :icon="logOutOutline" style="color: var(--app-icon-color)" />
            <ion-label>{{ t('menuLabels.logoutLabel') }}</ion-label>
          </ion-item>
        </ion-menu-toggle>

      </ion-list>

    </ion-content>
  </ion-menu>
  
</template>

<script setup lang="ts">

  import {
    IonMenu,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonAvatar,
    IonContent,
    IonMenuToggle
  } from '@ionic/vue'
  import { 
    home, 
    logOutOutline, 
    bookmarkOutline, 
    personCircleOutline 
  } from 'ionicons/icons'
  import { useI18n } from 'vue-i18n'
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  import { logout, currentUser } from '@/services/auth/auth'

  const { t } = useI18n() // <-- i18n
  const router = useRouter()
  const user = ref({ name: '', email: '', avatar: '' })
  const defaultAvatar = new URL('@/assets/imgs/avatar.png', import.meta.url).href

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(() => {
    if (currentUser.value) {
      user.value = {
        name: currentUser.value.name,
        email: currentUser.value.email,
        avatar: currentUser.value.avatar || defaultAvatar
      }
    }
  })

  /**
   * logOut
   * * Method to take user back to Login page and clear all the user related data
   */
  function logOut() {
    logout()
    router.replace('/login')
  }

  /**
   * goToProfile
   * Loads the profile page
   */
  function goToProfile() {
    router.push('/tabs/profile')
  }

</script>

<!-- CSS styles used with the page -->
<style scoped>

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 25%;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
  }

  .user-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ion-text-color);
  }

  .user-email {
    margin: 4px 0 0;
    font-size: 0.9rem;
    color: var(--ion-color-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
