<template>

  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ event?.name || 'Event Details' }}</ion-title>
        
      </ion-toolbar>
    </ion-header>

    <!-- Loading Spinner -->
    <ion-content v-if="loading" class="ion-padding">
      <ion-spinner name="crescent"></ion-spinner>
    </ion-content>

    <!-- Content -->
    <ion-content v-else>
      <ion-segment v-model="activeSegment" mode="ios">
        <ion-segment-button value="details">
          {{ t('appLabels.detailsLabel') }}
        </ion-segment-button>
        <ion-segment-button value="map">
          {{ t('appLabels.mapLabel') }}
        </ion-segment-button>
      </ion-segment>

      <!-- ---------- Details Segment ---------- -->
      <div v-show="activeSegment === 'details'" class="ion-padding">
        <div v-if="isOnline && event.images && event.images.length > 0">
          <GalleryView
            :images="event.images"
            :title="event.title"
            :default-img="defaultImg"
          />
        </div>
        <div v-else>
          <img src="@/assets/imgs/card-media.png" alt="Logo" />
        </div>

        <h4 class="title">{{ event?.name }}</h4>

        <div class="info-row">
          <ion-icon :icon="calendar" />&nbsp;
          <span>{{ event?.dates?.start?.localDate }}</span>
          <ion-icon :icon="time" style="margin-left:10px" />&nbsp;
          <span>{{ event?.dates?.start?.localTime }}</span>
        </div>

        <div class="info-row">
          <ion-icon :icon="location" />&nbsp;
          <span>{{ event?._embedded?.venues?.[0]?.name }}</span>
        </div>

        <ion-grid>
          <ion-row>
            <ion-col size="3" class="border-class">
              <social-share
                :title="event.title"
                :text="`Check out this event: ${event.title}`"
                :url="shareUrl"
                @click.stop
              />
            </ion-col>        
            <ion-col size="3" class="border-class">
              <BookmarkButton :event="event" />
            </ion-col>
            <ion-col size="3" class="border-class">
              <AddToCalendar
                :title="event?.title"
                :location="event?.location || ''"
                :info="event?.description"
                :startDate="event?.date"
              />
            </ion-col>
            <ion-col size="3">
            <ion-button fill="clear" @click.stop="goToNavigation" class="navigate-button">
              <div class="navigate-content">                
                <ion-icon :icon="navigate" class="navigate-icon"></ion-icon>
                <ion-label class="navigate-label">
                  {{ t('appLabels.navigateLabel') }}
                </ion-label>              
              </div>
            </ion-button>
          </ion-col>
          </ion-row>
        </ion-grid>

        <div class="info-row" v-if="event?.priceRanges">
          <ion-icon :icon="pricetag" />&nbsp;
          <span>{{ priceRange }}</span>
        </div>

        <p v-if="event?.info">{{ event.info }}</p>
        <p v-if="event?.pleaseNote" class="note-class">
          *{{ t('appLabels.noteLabel') }}: {{ event.pleaseNote }}
        </p>
      </div>
      

      <!-- ---------- Map Segment ---------- -->
      <div v-show="activeSegment==='map'" class="map-wrapper">
        <div v-if="centerReady" id="map" style="height: 900px;"></div>
        <div v-else class="ion-padding">
          <p>{{ t('disclaimerMessages.noMapData') }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>

</template>

<script setup lang="ts">

  import {
    IonCol, 
    IonRow, 
    IonGrid,
    IonIcon, 
    IonPage, 
    IonTitle,
    IonHeader, 
    IonToolbar, 
    IonContent, 
    IonButtons, 
    IonSpinner,
    IonSegment, 
    IonMenuButton, 
    IonSegmentButton, 
  } from '@ionic/vue'
  import { calendar, location, navigate, pricetag, time } from 'ionicons/icons'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { AppLauncher } from '@capacitor/app-launcher'
  import { ref, onMounted, computed, nextTick } from 'vue'

  import GalleryView from './GalleryView.vue'
  import { showErrorToast } from '@/utils/toast'
  import SocialShare from '@/components/SocialShare.vue'   
  import AddToCalendar from '@/components/AddToCalendar.vue'
  import BookmarkButton from '@/components/BookmarkEvent.vue'
  import { apiService } from '@/services/api/apiService'
  import { LocationService } from '@/services/locationService'

  const { t } = useI18n() // <-- i18n
  const isOnline = ref(navigator.onLine)
  const route = useRoute()
  const event = ref<any>(null)
  const loading = ref(true)
  const activeSegment = ref<'details' | 'map'>('details')
  const defaultImg = '@/assets/imgs/card-media.png'
  const priceRange = computed(() =>
    event.value?.priceRanges
      ? `${event.value.priceRanges[0].min} - ${event.value.priceRanges[0].max} ${event.value.priceRanges[0].currency}`
      : 'Free / N/A'
  )
  const center = ref<[number, number] | null>(null)
  const centerReady = computed(() => Array.isArray(center.value))
  const shareUrl = computed(() => `${window.location.origin}/events/${route.params.id}`)

  /**
   * loadMap
   * * Funtion to display event location in map within the App
   * @param latitude 
   * @param longitude 
   */
  async function loadMap(latitude: number,longitude: number){
    await nextTick()
    const map = L.map('map').setView([latitude, longitude], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    const marker = L.marker([latitude, longitude]).addTo(map)
    marker.bindPopup(event.value.name || 'Event').openPopup()
  }

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(async () => {
    try {
      const id = route.params.id as string
      event.value = await apiService.getEventDetails(`events/${id}`)
      const venue = event.value?._embedded?.venues?.[0]
      if (venue?.location) {
        const lat = Number(venue.location.latitude)
        const lng = Number(venue.location.longitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          center.value = [lat, lng]
          loadMap(lat,lng)
        }
      }
    } catch (e) {
      console.error('Failed to load event details', e)
    } finally {
      loading.value = false
    }
  })

  /**
   * goToNavigation
   * * Loads the maps app available in the device. 
   * * User location and Event location is passed to display routes between the location
   */
  async function goToNavigation() {
    try {
      // Request location permission and get current location
      const pos = await LocationService.getCurrentLocation();
      const latitude  =  pos?.lat
      const  longitude = pos?.lng 

      // Universal Google Maps URL
      const gmapsUrl = `google.navigation:q=${event.value.latitude},${event.value.longitude}&mode=d`
      const webUrl  = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${event.value.latitude},${event.value.longitude}&travelmode=driving`

      // Try to open native Google Maps app first
      const { value } = await AppLauncher.canOpenUrl({ url: 'comgooglemaps://' })
      if (value) {
        await AppLauncher.openUrl({ url: gmapsUrl })
      } else {
        // Fallback to browser if app not installed
        await AppLauncher.openUrl({ url: webUrl })
      }
    } catch (err) {
      showErrorToast(t('errorMessages.locationErrorMessage'))
    }
  }

</script>

<style scoped>

  .collage {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
  }
  
  .collage .big { flex: 2; }

  .collage .small {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .collage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .collage .small img { flex: 1; }

  .title {
    font-size: 1.1rem;
    margin: 12px 0;
    font-weight: bold;
  }

  .info-row {
    display: flex;
    align-items: center;
    margin: 6px 0;
    flex-wrap: wrap;
  }

  .note-class {
    font-style: italic;
    font-size: 0.9rem;
  }

  .border-class {
    border-right: 1px solid var(--ion-color-medium); /* vertical pipe separator */
  }

  .navigate-button {
    /* remove Ionic’s default horizontal alignment */
    --padding-start: 0;
    --padding-end: 0;
  }

  .navigate-content {
    display: flex;
    flex-direction: column;  /* stack icon over text */
    align-items: center;
    justify-content: center;
  }

  .navigate-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .navigate-label {
    font-size: 10px;
  }

</style>
