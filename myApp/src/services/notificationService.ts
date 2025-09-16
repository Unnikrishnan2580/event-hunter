import { LocalNotifications } from '@capacitor/local-notifications';

export interface ReminderConfig {
  minutesBefore: number; // e.g., 5, 10, 30
}

async function requestPermission() {
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export const notificationService = {
  /** Schedule a reminder */
  async scheduleEventReminder(eventId: string, title: string, startDate: string, config: ReminderConfig) {
    if (!(await requestPermission())) {
      throw new Error('Notification permission not granted');
    }

    const eventTime = new Date(startDate).getTime();
    const triggerTime = eventTime - config.minutesBefore * 60 * 1000;

    if (triggerTime <= Date.now()) {
      throw new Error('Reminder time is in the past');
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(eventId.replace(/\D/g, '').slice(-6)) || Date.now(),
          title: 'Event Reminder',
          body: `Upcoming: ${title} in ${config.minutesBefore} minutes`,
          schedule: { at: new Date(triggerTime) },
          sound: 'default',
          smallIcon: 'ic_stat_icon', // optional custom icon
        },
      ],
    });
  },

  /** Cancel a reminder by id */
  async cancelReminder(eventId: string) {
    const id = parseInt(eventId.replace(/\D/g, '').slice(-6)) || 0;
    await LocalNotifications.cancel({ notifications: [{ id }] });
  },
};
