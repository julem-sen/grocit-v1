<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ isEditing ? 'Edit Item' : 'Add Item' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item class="modal-item">
        <ion-label position="stacked">Item Name</ion-label>
        <ion-input v-model="localName" placeholder="e.g. Rice" clearInput />
      </ion-item>
      <ion-item class="modal-item">
        <ion-label position="stacked">Price (₱)</ion-label>
        <ion-input v-model.number="localPrice" type="number" placeholder="0.00" />
      </ion-item>
      <ion-item class="modal-item">
        <ion-label position="stacked">Quantity</ion-label>
        <ion-input v-model.number="localQty" type="number" placeholder="1" />
      </ion-item>
      <button
        class="pill-btn-primary modal-submit"
        :disabled="!localName || isSaving"
        @click="save"
      >
        {{ isSaving ? 'Saving...' : 'Save Item' }}
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

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  editingId: string | null
  initialName?: string
  initialPrice?: number
  initialQty?: number
}>()

const emit = defineEmits<{ close: []; saved: [] }>()

import { useGroceryStore } from '@/store/groceryStore'
import { showToast } from '@/utils/toastHelper'

const store = useGroceryStore()
const isSaving = ref(false)
const localName = ref('')
const localPrice = ref(0)
const localQty = ref(1)

// Sync props into local state when modal opens
watch(() => props.isOpen, (val) => {
  if (val) {
    localName.value = props.initialName || ''
    localPrice.value = props.initialPrice || 0
    localQty.value = props.initialQty || 1
  }
})

const save = async () => {
  isSaving.value = true
  try {
    if (props.isEditing && props.editingId) {
      await store.updateItem(props.editingId, localName.value, localPrice.value, localQty.value)
    } else {
      await store.addItem(localName.value, localPrice.value, localQty.value)
    }
    await showToast('Item saved', 'success')
    emit('saved')
    emit('close')
  } catch (e: any) {
    await showToast(e.message)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.modal-submit { width: 100%; margin-top: 16px; padding: 14px; font-size: 1rem; }
</style>