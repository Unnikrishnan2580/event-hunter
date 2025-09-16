<template>
  
  <ion-card v-for="n in count" :key="n">
    <ion-card-header>
      <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
    </ion-card-header>
    <ion-card-content>
      <ion-skeleton-text animated style="width: 100%; height: 180px"></ion-skeleton-text>
    </ion-card-content>
  </ion-card>

</template>

<script setup lang="ts">

  import { IonCard, IonCardHeader, IonCardContent, IonSkeletonText } from '@ionic/vue'

  defineProps<{ count?: number }>()

</script>
