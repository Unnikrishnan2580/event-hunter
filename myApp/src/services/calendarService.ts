import { Calendar } from '@awesome-cordova-plugins/calendar'

export const addEventToCalendar = async (
  title: string,
  location: string,
  notes: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    // Check if permission is granted
    const hasPermission = await Calendar.hasReadWritePermission()
    if (!hasPermission) {
      await Calendar.requestReadWritePermission()
    }

    await Calendar.createEventInteractively(
      title,
      location,
      notes,
      startDate,
      endDate
    )
    return true
  } catch (error) {
    console.error('Failed to add event to calendar:', error)
    return false
  }
}
