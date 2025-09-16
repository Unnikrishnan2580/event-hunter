// src/composables/useBookmarkSheet.ts
import { actionSheetController } from '@ionic/vue'

export async function openBookmarkSheet(
  onBookmarkSelected: (bookmarkBy: string) => void
) {
  const sheet = await actionSheetController.create({
    header: 'Bookmark by',
    buttons: [
      { text: 'Interested', handler: () => onBookmarkSelected('interested') },
      { text: 'Going', handler: () => onBookmarkSelected('going') },
      { text: 'Maybe', handler: () => onBookmarkSelected('maybe') },
      { text: 'Cancel', role: 'cancel' }
    ],
    mode: "ios"
  })
  await sheet.present()
}
