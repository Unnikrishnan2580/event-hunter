<template>
  
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/events">
          <ion-icon aria-hidden="true" :icon="locationOutline" />
          <ion-label>{{ t('menuLabels.discoverLabel') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/bookmarks">
          <ion-icon aria-hidden="true" :icon="bookmarkOutline" />
          <ion-label>{{ t('menuLabels.bookmarkLabel') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/profile">
          <ion-icon aria-hidden="true" :icon="personCircleOutline" />
          <ion-label>{{ t('menuLabels.profileLabel') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>

</template>

<script setup lang="ts">

  import { useI18n } from 'vue-i18n'
  import { 
    IonTabs, 
    IonIcon, 
    IonPage, 
    IonLabel, 
    IonTabBar, 
    IonTabButton, 
    IonRouterOutlet 
  } from '@ionic/vue';
  import { 
    bookmarkOutline, 
    personCircleOutline, 
    locationOutline 
  } from 'ionicons/icons';

  const { t } = useI18n() // <-- i18n

</script>
