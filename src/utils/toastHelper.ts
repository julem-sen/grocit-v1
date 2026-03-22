import { toastController } from '@ionic/vue'

export const showToast = async (
  message: string,
  color: 'danger' | 'warning' | 'success' = 'danger',
  duration = 2000
) => {
  const toast = await toastController.create({ message, color, duration })
  toast.present()
}