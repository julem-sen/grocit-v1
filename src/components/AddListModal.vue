<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>New List</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item class="modal-item">
        <ion-label position="stacked">List Name</ion-label>
        <ion-input v-model="form.name" placeholder="e.g. Weekly Grocery" clearInput />
      </ion-item>
      <ion-item class="modal-item">
        <ion-label position="stacked">Budget (₱)</ion-label>
        <ion-input v-model="form.budget" type="number" placeholder="e.g. 2000" clearInput />
      </ion-item>
      <button
        class="pill-btn-primary modal-submit"
        :disabled="!form.name || !form.budget || isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? 'Creating...' : '+ Create List' }}
      </button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonButtons
} from '@ionic/vue'
import { useGroceryStore } from '@/store/groceryStore'
import { showToast } from '@/utils/toastHelper'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = useGroceryStore()
const isSubmitting = ref(false)
const form = reactive({ name: '', budget: '' })

const submit = async () => {
  if (!form.name || !form.budget) return
  isSubmitting.value = true
  try {
    await store.createList(form.name, Number(form.budget))
    await showToast('List created!', 'success')
    form.name = ''
    form.budget = ''
    emit('close')
  } catch (e: any) {
    await showToast(e.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-submit { width: 100%; margin-top: 16px; padding: 14px; font-size: 1rem; }
</style>