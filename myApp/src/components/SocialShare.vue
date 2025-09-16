<template>

  <ion-button
    fill="clear"
    @click="share"
    aria-label="Share Event"
    class="share-button"
  >
    <div class="share-content">
      <ion-icon :icon="shareSocial" class="share-icon" />
      <ion-label class="share-label">
        {{ t('appLabels.shareLabel') }}
      </ion-label>
    </div>
  </ion-button>

</template>

<script setup lang="ts">

  import { useI18n } from 'vue-i18n'
  import { Share } from '@capacitor/share'
  import { shareSocial } from 'ionicons/icons'
  import { IonButton, IonIcon } from '@ionic/vue'

  const { t } = useI18n() // <-- i18n
  const props = defineProps<{
    title: string
    text?: string
    url?: string
  }>()

  /**
   * share
   * Loads the native share plugin with list of available options
   */
  async function share() {
    try {
      await Share.share({
        title: props.title,
        text: props.text || props.title,
        url: props.url || window.location.href,
        dialogTitle: 'Share this event'
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

</script>

<style scoped>

  .share-button {
    /* remove Ionic’s default horizontal alignment */
    --padding-start: 0;
    --padding-end: 0;
  }

  .share-content {
    display: flex;
    flex-direction: column;  /* stack icon over text */
    align-items: center;
    justify-content: center;
  }

  .share-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .share-label {
    font-size: 10px;
  }

</style>