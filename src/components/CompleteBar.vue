<template>
  <div class="bottom-bar">
    <p class="complete-hint">
      <ion-icon :icon="cartOutline" />
      {{ checkedCount }} items ready for checkout
    </p>
    <button
      class="pill-btn-outline"
      :disabled="checkedCount === 0 || isCompleting"
      @click="complete"
    >
      {{ isCompleting ? 'Completing...' : `Complete Shopping (${checkedCount}/${totalCount})` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonIcon, alertController } from '@ionic/vue'
import { cartOutline } from 'ionicons/icons'
import { useGroceryStore } from '@/store/groceryStore'
import { showToast } from '@/utils/toastHelper'
import router from '@/router'

const props = defineProps<{ checkedCount: number; totalCount: number }>()

const store = useGroceryStore()
const isCompleting = ref(false)

const complete = async () => {
  const alert = await alertController.create({
    header: 'Complete Shopping?',
    message: `${props.checkedCount} of ${props.totalCount} items checked. Mark as complete?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Complete',
        role: 'confirm',
        handler: async () => {
          if (!store.selectedList) return
          isCompleting.value = true
          try {
            await store.completeList(store.selectedList.id)
            await showToast('🎉 Shopping complete!', 'success')
            router.replace('/home')
          } catch (e: any) {
            await showToast(`Failed: ${e.message}`)
          } finally {
            isCompleting.value = false
          }
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.complete-hint {
  display: flex; align-items: center; justify-content: center;
  gap: 5px; font-size: 0.75rem; color: #999; margin: 0 0 8px;
}
</style>