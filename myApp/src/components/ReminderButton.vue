<template>

    <ion-button fill="clear" @click.stop="toggleReminder" class="reminder-button">
    <div class="reminder-content">        
        <ion-icon :icon="isSet ? notifications : notificationsOutline" class="reminder-icon"/>
        <ion-label class="reminder-label">
          {{ t('appLabels.remindMeLabel') }}
        </ion-label>
    </div>
  </ion-button>

</template>

<script setup lang="ts">

  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { IonButton, IonIcon } from '@ionic/vue'
  import { notifications, notificationsOutline } from 'ionicons/icons'
  
  import { showErrorToast } from '@/utils/toast'
  import { currentUser } from '@/services/auth/auth'
  import { notificationService } from '@/services/notificationService'

  const { t } = useI18n() // <-- i18n
  interface Props {
    eventId: string
    eventTitle: string
    eventStart: string   // ISO date string
  }
  const props = defineProps<Props>()
  const isSet = ref(false)

  /**
   * getReminderMinutes
   * * Loads user preferred time for triggering reminder
   */
  async function getReminderMinutes(): Promise<number> {
    const pref = await currentUser.value?.preferences.reminder
    return pref ? parseInt(pref) : 5  // default 10 mins
  }

  /**
   * toggleReminder
   * * Method to set a reminder for a particular event
   */
  async function toggleReminder() {
    if (!isSet.value) {
      try {
        const minutesBefore = await getReminderMinutes()
        await notificationService.scheduleEventReminder(
          props.eventId,
          props.eventTitle,
          props.eventStart,
          { minutesBefore }
        )
        isSet.value = true
      } catch (err) {
        console.error(err)
        showErrorToast( t('errorMessages.reminderErrorMessage') + props.eventTitle)
      }
    } else {
      await notificationService.cancelReminder(props.eventId)
      isSet.value = false
    }
  }

</script>

<style scoped>

  .reminder-button {
    /* remove Ionic’s default horizontal alignment */
    --padding-start: 0;
    --padding-end: 0;
  }

  .reminder-content {
    display: flex;
    flex-direction: column;  /* stack icon over text */
    align-items: center;
    justify-content: center;
  }

  .reminder-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .reminder-label {
    font-size: 10px;
  }

</style>