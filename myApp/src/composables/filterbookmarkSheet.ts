// src/composables/useBookmarkSheet.ts
import { actionSheetController } from '@ionic/vue'

export async function filterbookmarkSheet(
  onBookmarkSelected: (bookmarkBy: string) => void
) {
  const sheet = await actionSheetController.create({
    header: 'Filter bookmarked events by',
    buttons: [
      { text: 'Interested', handler: () => onBookmarkSelected('interested') },
      { text: 'Going', handler: () => onBookmarkSelected('going') },
      { text: 'Maybe', handler: () => onBookmarkSelected('maybe') },
      { text: 'All', handler: () => onBookmarkSelected('all') },
      { text: 'Cancel', role: 'cancel' }
    ],
    mode: "ios"
  })
  await sheet.present()
}
