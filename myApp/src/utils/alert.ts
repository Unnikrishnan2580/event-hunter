// src/utils/alert.ts
import { alertController } from '@ionic/vue'

export interface AlertOptions {
  header?: string
  subHeader?: string
  message: string
  buttons?: string[] | { text: string; role?: string; handler?: () => void }[]
}

/**
 * Show a simple Ionic alert
 */
export async function showAlert(options: AlertOptions) {
  const alert = await alertController.create({
    header: options.header ?? 'Notice',
    subHeader: options.subHeader,
    message: options.message,
    buttons: options.buttons ?? ['OK'],
  })
  await alert.present()
}
