<template>

  <ion-button fill="clear" @click.stop="toggleBookmark" class="bookmark-button">
    <div class="bookmark-content">        
        <ion-icon :icon="icon" class="bookmark-icon" />
        <ion-label class="bookmark-label">
          {{t('appLabels.bookmarkLabel')}}
        </ion-label>
    </div>
  </ion-button>

</template>

<script setup lang="ts">

  import { useI18n } from 'vue-i18n'
  import { IonButton, IonIcon } from '@ionic/vue'
  import { heart, heartOutline } from 'ionicons/icons'
  import { ref, onMounted, watch, computed } from 'vue'

  import { EventItem } from '@/types/EventItem'
  import { eventBus } from '@/services/eventBus'
  import { dbService } from '@/services/data/dbService';
  import { openBookmarkSheet } from '@/composables/BookmarkSheet'

  const { t } = useI18n() // <-- i18n
  const props = defineProps<{ event: EventItem }>()
  const bookmarked = ref(false)

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(async () => {
    bookmarked.value = await dbService.isBookmarked(props.event.id)
  })
/**
 * watch
 * * Adds a watch to monitor the value of bookmarked  
 */
  watch(() => props.event.id, async (newId) => {
    bookmarked.value = await dbService.isBookmarked(newId)
  })

  /**
   * toggleBookmark
   * * function to enable and disable the toggle button associated to bookmark option
   */
  async function toggleBookmark() {
    if (bookmarked.value) {
      await dbService.removeBookmark(props.event.id)
      bookmarked.value = false
    } else {
      await openBookmarkSheet(async (bookmarkBy: string) => {
        const bookmarkType = bookmarkBy
        await dbService.addBookmark(props.event,bookmarkType)
      })
      bookmarked.value = true
    }
    eventBus.emit('bookmarkChanged')
  }

  const icon = computed(() => (bookmarked.value ? heart : heartOutline))

</script>

<!-- CSS styles used with the page -->
<style scoped>

  .bookmark-button {
    /* remove Ionic’s default horizontal alignment */
    --padding-start: 0;
    --padding-end: 0;
  }

  .bookmark-content {
    display: flex;
    flex-direction: column;  /* stack icon over text */
    align-items: center;
    justify-content: center;
  }

  .bookmark-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .bookmark-label {
    font-size: 10px;
  }

</style>