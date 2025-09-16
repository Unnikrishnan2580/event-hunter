// src/utils/toast.ts
import { toastController } from '@ionic/vue'

export async function showErrorToast(message: string, duration = 3000) {
  const toast = await toastController.create({
    message,
    duration,
    color: 'danger',       // red background for error
    position: 'top',
    buttons: [{ text: 'OK', role: 'cancel' }]
  })
  await toast.present()
}

export async function showSuccessToast(message: string, duration = 3000) {
  const toast = await toastController.create({
    message,
    duration,
    color: 'success',       // red background for error
    position: 'top',
    buttons: [{ text: 'OK', role: 'cancel' }]
  })
  await toast.present()
}
