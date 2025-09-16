<template>

  <ion-card class="event-card">

    <!-- Image Collage -->
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
    <!-- Image Collage ends--> 

    <ion-card-header>
      <ion-card-subtitle>{{ event.title }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content @click="goToDetails">
      <div class="info-row">
        <ion-icon :icon="calendar" />&nbsp;
        <span>{{ event.date }}</span>
      </div>
      <div class="info-row">
        <ion-icon :icon="location" />&nbsp;
        <span>{{ event.location }}</span>
      </div>
      <div class="info-row">
        <ion-icon :icon="pricetag" />&nbsp;
        <span>{{ event.price || 'Free / N/A' }}</span>
      </div>

       <!-- Social share button & Bookmark button -->
      <ion-grid>
        <ion-row>
          <ion-col class="border-class">
            <social-share
              :title="event.title"
              :text="`Check out this event: ${event.title}`"
              :url="shareUrl"
              @click.stop
            />
          </ion-col>        
          <ion-col class="border-class">
            <BookmarkButton :event="event" />
          </ion-col>
          <ion-col class="border-class">
            <AddToCalendar
              :title="event?.title"
              :location="event?.location || ''"
              :info="event?.description"
              :startDate="event?.date"
            />
          </ion-col>
          <ion-col class="border-class">
            <ion-button fill="clear" @click.stop="goToNavigation" class="navigate-button">
              <div class="navigate-content">                
                <ion-icon :icon="navigate" class="navigate-icon"></ion-icon>
                <ion-label class="navigate-label">{{ t('appLabels.navigateLabel') }}</ion-label>              
              </div>
            </ion-button>
          </ion-col>
          <ion-col>
            <ReminderButton
              :event-id="event.id"
              :event-title="event.title"
              :event-start="event.date"
            />

          </ion-col>
        </ion-row>
      </ion-grid>
      <!-- Social share button & Bookmark button ends-->
      
    </ion-card-content>
  </ion-card>

</template>

<script setup lang="ts">

  import { 
    IonCol, 
    IonRow, 
    IonCard, 
    IonGrid, 
    IonIcon, 
    IonCardHeader, 
    IonCardContent, 
    IonCardSubtitle, 
  } from '@ionic/vue'
  import router from '@/router'
  import { useI18n } from 'vue-i18n'
  import { ref, computed, PropType } from 'vue'
  import { AppLauncher } from '@capacitor/app-launcher'
  import { calendar, location, navigate, pricetag } from 'ionicons/icons'

  import GalleryView from './GalleryView.vue'
  import { EventItem } from '@/types/EventItem'
  import { showErrorToast } from '@/utils/toast'
  import ReminderButton from './ReminderButton.vue'
  import SocialShare from '@/components/SocialShare.vue'
  import AddToCalendar from '@/components/AddToCalendar.vue'
  import BookmarkButton from '@/components/BookmarkEvent.vue'
  import { LocationService } from '@/services/locationService'

  const { t } = useI18n() // <-- i18n

  const isOnline = ref(navigator.onLine)
  const props = defineProps({
    event: { type: Object as PropType<EventItem>, required: true },
    defaultImg: { type: String, default: '@/assets/imgs/card-media.png' }
  })

  // Link to the detail page for sharing
  const shareUrl = computed(() =>
    `${window.location.origin}/#/event-detail/${props.event.id}`
  )

  /**
   * getToDetails
   * * Loads the Event Details page based on event ID
   */
  function goToDetails(){
      router.push({ name: 'event-detail', params: { id: props.event.id } })
  }

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
      const gmapsUrl = `google.navigation:q=${props.event.latitude},${props.event.longitude}&mode=d`
      const webUrl  = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${props.event.latitude},${props.event.longitude}&travelmode=driving`

      // Try to open native Google Maps app first
      const { value } = await AppLauncher.canOpenUrl({ url: 'comgooglemaps://' })
      if (value) {
        await AppLauncher.openUrl({ url: gmapsUrl })
      } else {
        // Fallback to browser if app not installed
        await AppLauncher.openUrl({ url: webUrl })
      }
    } catch (err) {
      showErrorToast('Please enable location and try again.')
    }
  }

</script>

<style scoped>
  
  .event-card {
    margin: 12px;
    border-radius: 12px;
    overflow: hidden;
  }

  .collage {
    display: flex;
    height: 100%;
    width: 100%;
    gap: 2px;
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
    border-radius: 2px;
  }

  .collage .small img { flex: 1; }

  .info-row {
    display: flex;
    align-items: center;
    margin: 4px 0;
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
