<template>

  <ion-content class="ion-padding">
    <ion-list>
      <ion-list-header>
        <ion-toolbar>
          <ion-button slot="start" fill="clear" @click="cancelFilter">Cancel</ion-button>

          <ion-title>
            {{ t('appTitles.filterTitle') }}
          </ion-title>
          
          <ion-button slot="end" fill="clear" @click="applyFilters">
            {{ t('appButtonLabels.applyButtonLabel') }}
          </ion-button>
        </ion-toolbar>
      </ion-list-header>

      <!-- Category -->
      <ion-item>
        <ion-label>
          {{ t('appLabels.categoryLabel') }}
        </ion-label>
        <ion-select v-model="filters.category" placeholder="Select">
          <ion-select-option value="">All</ion-select-option>
          <ion-select-option value="music">Music</ion-select-option>
          <ion-select-option value="sports">Sports</ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Date Range -->
      <ion-item>
        <ion-label>
          {{  t('appLabels.startDateLabel') }}
        </ion-label>
        <ion-datetime-button datetime="start"></ion-datetime-button>
        <ion-modal keep-contents-mounted>
          <ion-datetime id="start" v-model="filters.startDate"></ion-datetime>
        </ion-modal>
      </ion-item>

      <ion-item>
        <ion-label>
          {{  t('appLabels.endDateLabel') }}
        </ion-label>
        <ion-datetime-button datetime="end"></ion-datetime-button>
        <ion-modal keep-contents-mounted>
          <ion-datetime id="end" v-model="filters.endDate"></ion-datetime>
        </ion-modal>
      </ion-item>

      <!-- Distance -->
      <ion-item>
        <ion-label>
          {{  t('appLabels.distanceLabel') }}
        </ion-label>
        <ion-range v-model="filters.distance" :min="0" :max="100" :step="5">
          <ion-label slot="end">{{ filters.distance }}</ion-label>
        </ion-range>
      </ion-item>

      <!-- Price -->
      <ion-item>
        <ion-label>
          {{  t('appLabels.priceRangeLabel') }}
        </ion-label>
        <ion-range v-model="filters.price" :min="0" :max="500" :step="10">
          <ion-label slot="end">${{ filters.price }}</ion-label>
        </ion-range>
      </ion-item>
    </ion-list>

  </ion-content>

</template>

<script setup lang="ts">

  import {
    IonList, 
    IonItem,
    IonLabel, 
    IonModal,
    IonRange, 
    IonTitle,
    IonSelect, 
    IonButton, 
    IonToolbar, 
    IonContent, 
    IonDatetime, 
    IonListHeader, 
    modalController,
    IonSelectOption, 
    IonDatetimeButton, 
  } from '@ionic/vue'
  import { reactive } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n() // <-- i18n
  const emit = defineEmits(['apply'])
  const filters = reactive({
    category: '',
    startDate: '',
    endDate: '',
    distance: 50,
    price: 100
  })

  /**
   * applyFilters
   * * Function to dismiss the filter modal and pass filter selection to the parent page
   */
  function applyFilters() {  
    emit('apply', { ...filters })
    modalController.dismiss({...filters}, 'apply')
  }

  /**
   * cancelFilter
   * * Function to dismiss the filter modal
   */
  function cancelFilter(){
    modalController.dismiss()
  }

</script>
