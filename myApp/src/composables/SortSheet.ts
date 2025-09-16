// src/composables/useSortSheet.ts
import { actionSheetController } from '@ionic/vue'

export async function openSortSheet(
  onSortSelected: (sortBy: string) => void
) {
  const sheet = await actionSheetController.create({
    header: 'Sort by',
    buttons: [
      { text: 'Date',       handler: () => onSortSelected('date') },
      { text: 'Distance',   handler: () => onSortSelected('distance') },
      { text: 'Popularity', handler: () => onSortSelected('rank') },
      { text: 'Price',      handler: () => onSortSelected('price') },
      { text: 'Cancel', role: 'cancel' }
    ],
    mode: "ios"
  })
  await sheet.present()
}
