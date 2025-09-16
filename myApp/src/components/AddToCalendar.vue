<template>

  <ion-button fill="clear" @click.stop="addToCalendar" class="calendar-button">

    <div class="calendar-content">        
        <ion-icon :icon="calendarNumber" class="calendar-icon" />
        <ion-label class="calendar-label">
          {{t('appLabels.calendarLabel')}}
        </ion-label>
    </div>

  </ion-button>

</template>

<script setup lang="ts">

  import { useI18n } from 'vue-i18n'
  import { defineProps } from 'vue'
  import { IonButton, IonIcon } from '@ionic/vue'
  import { calendarNumber } from 'ionicons/icons'

  import { addEventToCalendar } from '@/services/calendarService'
  import { showErrorToast, showSuccessToast } from '@/utils/toast'

  const { t } = useI18n() // <-- i18n

  interface Props {
    title: string
    location: string
    info?: string
    startDate: string | Date
    endDate?: string | Date
  }
  const props = defineProps<Props>()

  /**
   * addToCalendar
   * * Adds the desired event to device calendar.
   */
  const addToCalendar = async () => {

    const start = new Date(props.startDate)
    const end = props.endDate ? new Date(props.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const success = await addEventToCalendar(
      props.title,
      props.location,
      props.info || '',
      start,
      end
    )
    if (success) {
      showSuccessToast(t('successMessages.calendarAddSuccess'))
    } else {
      showErrorToast(t('errorMessages.calendarAddFailed'))
    }
  }

</script>

<!-- CSS styles used with the page -->
<style scoped>

  .calendar-button {
    /* remove Ionic’s default horizontal alignment */
    --padding-start: 0;
    --padding-end: 0;
  }

  .calendar-content {
    display: flex;
    flex-direction: column;  /* stack icon over text */
    align-items: center;
    justify-content: center;
  }

  .calendar-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .calendar-label {
    font-size: 10px;
  }

</style>