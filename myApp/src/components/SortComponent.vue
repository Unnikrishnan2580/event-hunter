<template>

  <ion-item lines="none" button>
    <ion-icon
      :icon="funnel"
      slot="start"
      style="font-size: 22px; color: var(--ion-color-primary);"
    ></ion-icon>

    <ion-select
      interface="popover"
      aria-label="Sort Events"
      placeholder="Sort"
      :value="modelValue"
      @ionChange="onChange"
    >
      <ion-select-option value="date">Date</ion-select-option>
      <ion-select-option value="distance">Distance</ion-select-option>
      <ion-select-option value="popularity">Popularity</ion-select-option>
      <ion-select-option value="price">Price</ion-select-option>
    </ion-select>
  </ion-item>

</template>

<script setup lang="ts">

  import {
    IonItem,
    IonSelect,
    IonSelectOption,
    IonIcon
  } from '@ionic/vue'
  import { funnel } from 'ionicons/icons'

  defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  /**
   * onChange
   * * Function to track the on change event of select option
   * @param ev 
   */
  function onChange(ev: CustomEvent) {
    emit('update:modelValue', ev.detail.value)
  }

</script>

<style scoped>
ion-item {
  --padding-start: 0;
}
ion-select {
  /* Hide default select border to let the icon stand out */
  --padding-start: 0;
}
</style>
