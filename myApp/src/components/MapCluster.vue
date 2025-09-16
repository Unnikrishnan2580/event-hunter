<template>

  <div id="map" style="height: 100%; width: 100%"></div>

</template>

<script setup lang="ts">

  import L from 'leaflet';
  import 'leaflet.markercluster';
  import { onMounted, watch } from 'vue';

  import { EventItem } from '@/types/EventItem';

  const props = defineProps<{ events: EventItem[] }>();
  let map: L.Map;
  let clusterGroup: L.MarkerClusterGroup;

  /**
   * onMounter
   * * Load the required data or runs the tasks required to be completed before the view gets loaded
   */
  onMounted(() => {
    map = L.map('map').setView([33.44589900, -112.07131300], 10); // Default Bangalore
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    clusterGroup = L.markerClusterGroup();
    map.addLayer(clusterGroup);
  });

  watch(() => props.events, (newEvents) => {
    clusterGroup.clearLayers();
    newEvents.forEach(ev => {
      const lat = ev?.latitude;
      const lng = ev?.longitude;
      if (lat && lng) {
        const marker = L.marker([+lat, +lng])
          .bindPopup(`<b>${ev.title}</b><br>${ev?.date}`);
        clusterGroup.addLayer(marker);
      }
    });
  });
  
</script>
