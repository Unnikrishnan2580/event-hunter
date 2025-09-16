// src/utils/actionSheet.ts
import { actionSheetController } from '@ionic/vue'

export interface ActionSheetBtn {
  text: string
  role?: string
  handler?: () => void | Promise<void>
}

export interface ActionSheetOptions {
  header?: string
  subHeader?: string
  buttons: ActionSheetBtn[]
}

/**
 * Show an Ionic Action Sheet
 */
export async function showActionSheet(options: ActionSheetOptions) {
  const sheet = await actionSheetController.create({
    header: options.header,
    subHeader: options.subHeader,
    buttons: options.buttons,
    mode: 'ios'
  })
  await sheet.present()
}
