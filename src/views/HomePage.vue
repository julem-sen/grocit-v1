<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="main-title">GrocIt</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="activeSegment" class="custom-segment">
          <ion-segment-button value="ongoing"><ion-label>Ongoing</ion-label></ion-segment-button>
          <ion-segment-button value="completed"><ion-label>Completed</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <template v-if="activeSegment === 'ongoing'">
        <GroceryListCard
          v-for="list in ongoingLists"
          :key="list.id"
          :list="list"
          :listTotals="store.listTotals"
          @open="openList(list)"
          @delete="remove(list.id)"
        />
        <div class="new-run-card" @click="isModalOpen = true">
          <ion-icon :icon="addCircleOutline" class="new-run-icon" />
          <p class="new-run-title">Plan a New Run</p>
          <p class="new-run-sub">Start an empty list for your next grocery trip</p>
        </div>
        <div v-if="ongoingLists.length === 0" class="empty-state">
          <ion-icon :icon="cartOutline" />
          <p>No ongoing lists. Tap "Plan a New Run" to start!</p>
        </div>
      </template>

      <template v-if="activeSegment === 'completed'">
        <GroceryListCard
          v-for="list in completedLists"
          :key="list.id"
          :list="list"
          :listTotals="store.listTotals"
          @open="openList(list)"
          @delete="remove(list.id)"
        />
        <div v-if="completedLists.length === 0" class="empty-state">
          <ion-icon :icon="checkmarkCircleOutline" />
          <p>No completed lists yet.</p>
        </div>
      </template>
    </ion-content>

    <ion-fab v-if="activeSegment === 'ongoing'" slot="fixed" vertical="bottom" horizontal="end" class="create-fab">
      <ion-fab-button @click="isModalOpen = true">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>

    <AddListModal :is-open="isModalOpen" @close="isModalOpen = false" />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonFab, IonFabButton, IonSegment, IonSegmentButton, IonLabel
} from '@ionic/vue'
import { addOutline, cartOutline, addCircleOutline, checkmarkCircleOutline } from 'ionicons/icons'
import { useGroceryStore } from '@/store/groceryStore'
import { showToast } from '@/utils/toastHelper'
import GroceryListCard from '@/components/GroceryListCard.vue'
import AddListModal from '@/components/AddListModal.vue'
import router from '@/router'

const store = useGroceryStore()
const isModalOpen = ref(false)
const activeSegment = ref<'ongoing' | 'completed'>('ongoing')

const ongoingLists = computed(() => store.lists.filter(l => !l.is_completed))
const completedLists = computed(() => store.lists.filter(l => !!l.is_completed))

onMounted(async () => {
  try { await store.loadLists() }
  catch (e: any) { await showToast(`Failed to load lists: ${e.message}`) }
})

const openList = async (list: any) => {
  try { await store.selectList(list.id); router.push(`/list/${list.id}`) }
  catch (e: any) { await showToast(`Failed to open list: ${e.message}`) }
}

const remove = async (id: string) => {
  try { await store.deleteList(id); await showToast('List deleted', 'success') }
  catch (e: any) { await showToast(`Failed to delete: ${e.message}`) }
}
</script>

<style scoped>
.main-title { font-size: 1.8rem; font-weight: 800; color: #1a3a1a; text-align: center; }
.custom-segment { margin: 0 16px 10px; --background: #dce8d8; border-radius: 999px; padding: 3px; width: calc(100% - 32px); }
ion-segment-button { --border-radius: 999px; --color: #666; --color-checked: #fff; --background-checked: #2d5a27; --indicator-color: transparent; font-weight: 600; font-size: 0.85rem; min-height: 36px; }
.home-content { --padding-start: 16px; --padding-end: 16px; --padding-top: 8px; --padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)); }
.new-run-card { border: 2px dashed #c4d8bf; border-radius: 20px; padding: 28px 16px; text-align: center; cursor: pointer; margin-bottom: 16px; }
.new-run-card:active { border-color: #2d5a27; }
.new-run-icon { font-size: 34px; color: #c4d8bf; margin-bottom: 8px; }
.new-run-title { font-weight: 700; color: #555; margin: 0 0 4px; }
.new-run-sub { font-size: 0.75rem; color: #aaa; margin: 0; }
.create-fab { margin-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); margin-right: 4px; }
.empty-state { text-align: center; padding: 60px 20px; color: #aaa; }
.empty-state ion-icon { font-size: 64px; color: #ddd; margin-bottom: 16px; }
</style>