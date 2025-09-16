<template>

  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>
          {{ t('appTitles.bookmarkedTitle') }}
        </ion-title>

        <ion-buttons slot="end">
          <!-- <sort-component v-model="sortKey"></sort-component> -->
           <ion-button @click="showSortSheet">
            <ion-icon :icon="funnel"></ion-icon>
           </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Empty state -->
      <ion-text v-if="loading" class="ion-padding">
        {{  t('disclaimerMessages.loadingMessage') }}
      </ion-text>
      <ion-text v-else-if="bookmarks.length === 0" class="ion-padding">
        {{ t('disclaimerMessages.noBookmarks') }}
      </ion-text>

      <EventSkeleton v-if="loading && bookmarks.length === 0" :count="5" />

      <!-- Bookmark list -->
      <EventCard
        v-for="ev in bookmarks"
        :key="ev.id"
        :event="ev"
        :defaultImg="defaultImg"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

  import {
    IonPage,
    IonText,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButtons,
    onIonViewWillEnter
  } from '@ionic/vue'
  import { useI18n } from 'vue-i18n'
  import { onMounted, ref } from 'vue'
  import { funnel } from 'ionicons/icons'
  import { EventItem } from '@/types/EventItem'
  import { eventBus } from '@/services/eventBus'
  import EventCard from '@/components/EventCard.vue'
  import { dbService, } from '@/services/data/dbService'
  import { filterbookmarkSheet } from '@/composables/filterbookmarkSheet'

  const { t } = useI18n() // <-- i18n

  const bookmarks = ref<EventItem[]>([])
  const loading = ref(true)
  const defaultImg = 'assets/imgs/card-media.png' // local fallback image
  const currentSort = ref<'interested' | 'going' | 'maybe' | 'all'>('all')
  
  async function loadBookmarks() {
    bookmarks.value = []
    loading.value = true
    try {
      bookmarks.value = await dbService.getBookmarks()
    } finally {
      loading.value = false
    }
  }

  /**
   * onIonViewWillEnter
   * Method to load bookmarks before the UI gets entered 
   */
  onIonViewWillEnter(() => {
    loadBookmarks()
  })

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(() => {
    eventBus.on('bookmarkChanged', loadBookmarks)
  })

  /**
   * loadSortedEvents
   * * Loads sorted events list based on user preferences
   * @param sortBy 
   */
  async function loadSortedEvents(sortBy: string = currentSort.value) {
    await loadBookmarks()
    let data = bookmarks.value
    console.log('bookmarks: ',data);
    switch (sortBy) {
      case 'all':
        data = data.filter(data => data?.bookmarkType != '')
        break
      case 'maybe':
        data = data.filter(data => data?.bookmarkType === 'maybe')
        break
      case 'going':
        data = data.filter(data => data?.bookmarkType === 'going')
        break
      case 'interested':
        data = data.filter(data => data?.bookmarkType === 'interested')
        break
      default: // date
        data = data.filter(data => data?.bookmarkType !== '')
    }
    bookmarks.value = data
  }

  async function showSortSheet(){    
    await filterbookmarkSheet(async (bookmarkBy: string) => {
      currentSort.value = bookmarkBy as any
      await loadSortedEvents(bookmarkBy)
    })
  }

</script>

<style scoped>

  ion-text {
    display: block;
    text-align: center;
    margin-top: 2rem;
    font-size: 1.1rem;
    color: var(--ion-color-medium);
  }

</style>
