<template>

  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{ t('appTitles.navigateEvent') }}
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div id="navMap" class="map-container"></div>
    </ion-content>
  </ion-page>

</template>

<script setup lang="ts">

  import L from 'leaflet'
  import 'leaflet-routing-machine'
  import { useI18n } from 'vue-i18n'
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
  import { LocationService } from '@/services/locationService';
  import { showErrorToast } from '@/utils/toast'

  const { t } = useI18n() // <-- i18n
  const props = defineProps<{
    eventLat: number
    eventLng: number
  }>()
  const userLocation = ref<{ lat: number; lng: number } | null>(null);
  let map: L.Map | null = null
  let routingControl: any = null

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(async () => {
    try {
      // Ask for permission and get current position
      userLocation.value = await LocationService.getCurrentLocation();
    if (!userLocation.value) {
      console.log('Location not available or permission denied.');
    } else {
      console.log('User location:', userLocation.value);
    }
      const userLatLng = [userLocation.value?.lat, userLocation.value?.lat] as [number, number]

      // Init map
      map = L.map('navMap').setView(userLatLng, 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // User marker
      L.marker(userLatLng).addTo(map).bindPopup('You are here')

      // Event marker
      const eventLatLng = [props.eventLat, props.eventLng] as [number, number]
      L.marker(eventLatLng).addTo(map).bindPopup('Event Location')

      // Route between them
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(...userLatLng),
          L.latLng(...eventLatLng)
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false
      }).addTo(map)
    } catch (err) {
      console.error('Navigation error:', err)
      showErrorToast(t('errorMessages.mapPermissionError'))
    }
  })

  onBeforeUnmount(() => {
    if (map) {
      map.remove()
      map = null
    }
  })

</script>

<style scoped>

  .map-container {
    height: 100%;
    width: 100%;
  }

</style>
