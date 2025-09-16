<template>
  <ion-app>
    <SideMenu />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { IonApp, IonRouterOutlet } from '@ionic/vue';

  import SideMenu from './components/SideMenu.vue';
  import { showActionSheet } from './utils/actionSheet'
  import { initNetworkService, getNetworkStatus, openNetworkSettings } from './services/networkService';

  const { t } = useI18n() // <-- i18n

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(async () => {
    // Initialize network service
    await initNetworkService();

    // Check once when app launches
    const networkStatus = getNetworkStatus();
    if (!networkStatus.connected) {
      showActionSheet({
      header: t('common.noInternet'),
      subHeader: t('common.enableInternet'),
      buttons: [
        {
          text: t('common.wifiSettings'),
          handler: () => openNetworkSettings('wifi')
        },
        {
          text: t('common.mobileData'),
          handler: () => openNetworkSettings('data')
        },
        {
          text: t('common.cancel'),
          role: 'cancel'
        }
      ]
      })
    }        
  });

</script>
