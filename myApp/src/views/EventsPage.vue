<template>
  <ion-page id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>
          {{ t('appTitles.events') }}
        </ion-title>

        <Ion-buttons slot="end">
          <!-- <sort-component v-model="sortKey"></sort-component> -->
           <ion-button @click="showSortSheet">
            <ion-icon :icon="funnel"></ion-icon>
           </ion-button>
        </Ion-buttons>

        <ion-buttons slot="end">
          <!-- Funnel icon button to toggle filter visibility -->
          <ion-button @click="openFilterModal">
            <ion-icon :icon="filter"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="search-toolbar-class">
        <SearchBar @search="handleSearch" @ionClear="loadEvents(0)"/>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-segment v-model="activeSegment" mode="ios">
        <ion-segment-button value="list">{{ t('appTitles.events') }}</ion-segment-button>
        <ion-segment-button value="map">{{ t('appLabels.mapLabel') }}</ion-segment-button>
      </ion-segment>
      <div v-show="activeSegment === 'list'" class="ion-padding">
        <ion-refresher slot="fixed" @ionRefresh="doRefresh">
          <ion-refresher-content />
        </ion-refresher>

        <!-- Offline notice -->
        <ion-item v-if="!isOnline" color="warning"  @click="connectToNetwork">
          <ion-label>
            {{  t('disclaimerMessages.offlineMessage') }}
          </ion-label>
        </ion-item>
        
        <EventSkeleton v-if="loading && events.length === 0" :count="5" />

        <EventCard
          v-for="ev in filteredEvents"
          :key="ev.id"
          :event="ev"
          :defaultImg="defaultImg"
        />

        <ion-infinite-scroll @ionInfinite="loadMore" threshold="100px" :disabled="noMore">
          <ion-infinite-scroll-content loadingSpinner="bubbles" />
        </ion-infinite-scroll>
      </div>

      <div v-show="activeSegment==='map'" class="map-wrapper">
        <div style="height: 100vh;">
          <MapCluster :events="filteredEvents" />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

  import { useI18n } from 'vue-i18n'
  import { eventBus } from '@/services/eventBus'
  import {
    IonPage, 
    IonItem, 
    IonIcon,
    IonLabel, 
    IonTitle,
    IonHeader, 
    IonButton, 
    IonContent,
    IonSegment, 
    IonToolbar, 
    IonButtons, 
    IonRefresher, 
    IonMenuButton, 
    modalController,
    IonSegmentButton,
    IonInfiniteScroll, 
    onIonViewWillEnter, 
    IonRefresherContent,
    IonInfiniteScrollContent,
  } from '@ionic/vue'
  import { ref, computed, onMounted } from 'vue'
  import { filter, funnel } from 'ionicons/icons'

  import { dbService } from '@/services/data/dbService'
  import FilterComponent from '@/components/EventFilter.vue'
  import { LocationService } from '@/services/locationService';
  import { openNetworkSettings } from '@/services/networkService'
  import { apiService, EventItem } from '@/services/api/apiService'

  import EventCard from '@/components/EventCard.vue'
  import SearchBar from '@/components/SearchBar.vue'
  import MapCluster from '@/components/MapCluster.vue'
  import EventSkeleton from '@/components/EventSkeleton.vue'
  import { showActionSheet } from '@/utils/actionSheet'
  import { openSortSheet } from '@/composables/SortSheet'

  const { t } = useI18n() // <-- i18n
  const events = ref<EventItem[]>([])
  const page = ref(0)
  const loading = ref(false)
  const noMore = ref(false)
  const searchTerm = ref('')
  const isOnline = ref(navigator.onLine)
  const filters = ref({
    category: '',
    startDate: '',
    endDate: '',
    distance: 100,
    maxPrice: 100
  })
  const PAGE_SIZE = 20
  const defaultImg = '/home/dell/Desktop/my-vue-app/src/assets/imgs/card-media.png'
  const userLocation = ref<{ lat: number; lng: number } | null>(null);
  const activeSegment = ref<'list' | 'map'>('list')
  const currentSort = ref<'date' | 'distance' | 'popularity' | 'price'>('date')
  const filteredEvents = computed(() =>
    events.value.filter(ev => {
      const matchTitle = ev.title.toLowerCase().includes(searchTerm.value.toLowerCase())
      const matchStart = filters.value.startDate ? new Date(ev.date) >= new Date(filters.value.startDate) : true
      const matchEnd = filters.value.endDate ? new Date(ev.date) <= new Date(filters.value.endDate) : true
      return matchTitle && matchStart && matchEnd
    })
  )

  /**
   * connectToNetwork
   * * Method to load action sheet util for network connection
   */
  async function connectToNetwork(){
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

  /**
   * loadEvents
   * * Method to load events from cache DB or from API(whenever network connection is available)
   * @param pageNum 
   */
  async function loadEvents(pageNum = 0) {
    loading.value = true
    events.value = []
    try {
      if (!isOnline.value) {
        // offline: use cached IndexedDB data
        const newEvents = await dbService.getAllEvents()
        await loadUIEvents(newEvents)
        noMore.value = true
        return
      }

      const newEvents = await apiService.getCombinedEvents('', pageNum)
      await loadUIEvents(newEvents)

      // Cache only first page for offline use
      if (pageNum === 0) {
        await dbService.saveEvents(newEvents)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      // Fallback to cache
      const newEvents = await dbService.getAllEvents()
        await loadUIEvents(newEvents)
      noMore.value = true
    } finally {
      loading.value = false
    }
  }

  /**
   * loadUIEvents
   * * Method to load events into UI
   * @param newEvents 
   * @param append 
   */
  async function loadUIEvents(newEvents: any[], append = true) {  
      if (newEvents.length < PAGE_SIZE) noMore.value = true
      events.value = append ? [...events.value, ...newEvents] : newEvents
      loading.value = false
  }

  /**
   * loadMore
   * * Method to load more events into events list
   * @param ev 
   */
  async function loadMore(ev?: CustomEvent) {
    if (noMore.value || !isOnline.value) {
      ev?.target && (ev.target as HTMLIonInfiniteScrollElement).complete()
      return
    }
    page.value++
    await loadEvents(page.value)
    ev?.target && (ev.target as HTMLIonInfiniteScrollElement).complete()
  }

  /**
   * doRefresh
   * * Method to refresh events list while pull to refresh
   * @param ev 
   */
  async function doRefresh(ev: CustomEvent) {
    page.value = 0
    noMore.value = false
    await loadEvents(0)
    ;(ev.target as HTMLIonRefresherElement).complete()
  }

  /**
   * handleSearch
   * * Method to handle event search based on keyword
   * @param keyword 
   */
  async function handleSearch(keyword: string) {
    events.value = []
    loading.value = true
    if (!keyword) return
    events.value = await apiService.getCombinedEvents(keyword, 0, 20)
    await loadUIEvents(events.value)
  }

  /**
   * refreshUI
   * * Refreshes the list UI
   */
  async function refreshUI(){
    await loadEvents(0)
  }

  /**
   * showSortSheet
   * * Loads action sheet with sort options
   */
  async function showSortSheet() {
    await openSortSheet(async (sortBy: string) => {
      currentSort.value = sortBy as any
      await loadSortedEvents(sortBy)
    })
  }

  /**
   * loadSortedEvents
   * * Loads sorted events list based on user preferences
   * @param sortBy 
   */
  async function loadSortedEvents(sortBy: string = currentSort.value) {
    console.log("sortBy: ",sortBy," currentSort: ",currentSort.value);
    console.log('events before sorting: ', events);
    const data = await apiService.getCombinedEvents()
    switch (sortBy) {
      case 'distance':
        // Ensure each EventItem has distance computed if you need real distance logic
        data.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
        break
      case 'popularity':
        data.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        break
      case 'price':
        data.sort((a, b) => {
          const pa = parseFloat(a.price?.split(' ')[0] || '0')
          const pb = parseFloat(b.price?.split(' ')[0] || '0')
          return pa - pb
        })
        break
      default: // date
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    events.value = data
    console.log('events after sorting: ', events);
  }

  /**
   * openFilterModal
   * * Function to open filters in a modal view
   */
  async function openFilterModal() {
    const modal = await modalController.create({
      component: FilterComponent,
      cssClass: 'filter-modal'
    })

    modal.onWillDismiss().then((event) => {
      if (event.role === 'apply' || event.data) {
        loadEvents(event.data)
      }
    })

    await modal.present()
  }

  /**
   * onIonViewWillEnter
   * * Load events before view enter
   */
  onIonViewWillEnter(() => {
    loadEvents(0)
  })

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(async () => {
    eventBus.on('bookmarkChanged', refreshUI)
    // events.value = await apiService.fetchlocationBasedEvents(33.44589900, -112.07131300);
    userLocation.value = await LocationService.getCurrentLocation();
    if (!userLocation.value) {
      console.log('Location not available or permission denied.');
    } else {
      console.log('User location:', userLocation.value);
    }

  })

</script>

<style scoped>

  .search-toolbar-class{
    --padding-top: 0%;
  }

</style>
