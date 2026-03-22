<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Edit List</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item class="modal-item">
        <ion-label position="stacked">List Name</ion-label>
        <ion-input v-model="localName" placeholder="List name" clearInput />
      </ion-item>
      <ion-item class="modal-item">
        <ion-label position="stacked">Budget (₱)</ion-label>
        <ion-input v-model.number="localBudget" type="number" placeholder="0.00" />
      </ion-item>
      <button
        class="pill-btn-primary modal-submit"
        :disabled="!localName || localBudget <= 0 || isSaving"
        @click="save"
      >
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonButtons
} from '@ionic/vue'
import { useGroceryStore } from '@/store/groceryStore'
import { showToast } from '@/utils/toastHelper'

const props = defineProps<{
  isOpen: boolean
  listId: string
  initialName: string
  initialBudget: number
}>()

const emit = defineEmits<{ close: [] }>()

const store = useGroceryStore()
const isSaving = ref(false)
const localName = ref('')
const localBudget = ref(0)

watch(() => props.isOpen, (val) => {
  if (val) {
    localName.value = props.initialName
    localBudget.value = props.initialBudget
  }
})

const save = async () => {
  isSaving.value = true
  try {
    await store.updateList(props.listId, localName.value, localBudget.value)
    await showToast('List updated', 'success')
    emit('close')
  } catch (e: any) {
    await showToast(`Failed: ${e.message}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.modal-submit { width: 100%; margin-top: 16px; padding: 14px; font-size: 1rem; }
</style>