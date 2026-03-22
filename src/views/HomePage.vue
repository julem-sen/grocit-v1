<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="main-title">GrocIt</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="activeSegment" class="custom-segment">
          <ion-segment-button value="ongoing">
            <ion-label>Ongoing</ion-label>
          </ion-segment-button>
          <ion-segment-button value="completed">
            <ion-label>Completed</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">

      <!-- ── Ongoing ── -->
      <template v-if="activeSegment === 'ongoing'">
        <div v-for="list in ongoingLists" :key="list.id" class="grocit-card list-card" @click="openList(list)">
          <div class="card-top-row">
            <span class="status-badge" :style="getTagStyle(list)">
              {{ getStatusLabel(list) }}
            </span>
            <ion-button fill="clear" size="small" class="trash-btn" @click.stop="remove(list.id)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-button>
          </div>

          <h2 class="list-name">{{ list.name }}</h2>

          <div class="budget-row">
            <span class="budget-label">BUDGET PROGRESS</span>
            <span class="budget-amount">₱{{ getTotal(list) }} / ₱{{ list.budget }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="getProgressStyle(list)" />
          </div>

          <p v-if="isOverBudget(list)" class="over-budget-hint">
            ⚠ Budget adjustment recommended
          </p>
        </div>

        <!-- Plan a New Run -->
        <div class="new-run-card" @click="openModal">
          <ion-icon :icon="addCircleOutline" class="new-run-icon" />
          <p class="new-run-title">Plan a New Run</p>
          <p class="new-run-sub">Start an empty list for your next grocery trip</p>
        </div>

        <div v-if="ongoingLists.length === 0" class="empty-state">
          <ion-icon :icon="cartOutline" />
          <p>No ongoing lists.</p>
          <p>Tap "Plan a New Run" to start!</p>
        </div>
      </template>

      <!-- ── Completed ── -->
      <template v-if="activeSegment === 'completed'">
        <div v-for="list in completedLists" :key="list.id" class="grocit-card list-card completed-card"
          @click="openList(list)">
          <div class="card-top-row">
            <span class="status-badge done-badge">
              <ion-icon :icon="checkmarkCircle" /> DONE
            </span>
            <ion-button fill="clear" color="danger" size="small" class="trash-btn" @click.stop="remove(list.id)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-button>
          </div>

          <h2 class="list-name">{{ list.name }}</h2>

          <div class="budget-row">
            <span class="budget-label">TOTAL SPENT</span>
            <span class="budget-amount">₱{{ getTotal(list) }} / ₱{{ list.budget }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="getProgressStyle(list)" />
          </div>
        </div>

        <div v-if="completedLists.length === 0" class="empty-state">
          <ion-icon :icon="checkmarkCircleOutline" />
          <p>No completed lists yet.</p>
          <p>Finish a shopping trip to see it here!</p>
        </div>
      </template>

    </ion-content>

    <!-- FAB -->
    <ion-fab v-if="activeSegment === 'ongoing'" slot="fixed" vertical="bottom" horizontal="end" class="create-fab">
      <ion-fab-button @click="openModal">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>

    <!-- Add List Modal -->
    <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-title>New List</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Cancel</ion-button>
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
        <button class="pill-btn-primary modal-submit" :disabled="!form.name || !form.budget || isSubmitting"
          @click="submitList">
          {{ isSubmitting ? 'Creating...' : '+ Create List' }}
        </button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonFab, IonFabButton,
  IonModal, IonButtons, IonInput, IonItem, IonLabel,
  IonSegment, IonSegmentButton, toastController
} from '@ionic/vue'
import {
  trashOutline, addOutline, cartOutline, addCircleOutline,
  checkmarkCircle, checkmarkCircleOutline, notificationsOutline
} from 'ionicons/icons'
import { useGroceryStore } from '@/store/groceryStore'
import { GroceryList } from '@/models/GroceryList'
import router from '@/router'

const store = useGroceryStore()
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const activeSegment = ref<'ongoing' | 'completed'>('ongoing')
const form = reactive({ name: '', budget: '' })

const ongoingLists = computed(() => store.lists.filter(l => !l.is_completed))
const completedLists = computed(() => store.lists.filter(l => !!l.is_completed))
const totalSpentAllLists = computed(() =>
  Object.values(store.listTotals).reduce((sum, t) => sum + t, 0)
)

const showToast = async (message: string, color: 'danger' | 'warning' | 'success' = 'danger') => {
  const toast = await toastController.create({ message, color, duration: 2000 })
  toast.present()
}

onMounted(async () => {
  try { await store.loadLists() }
  catch (e: any) { await showToast(`Failed to load lists: ${e.message}`) }
})

const getTotal = (list: GroceryList) => (store.listTotals[list.id] || 0).toFixed(2)

const getProgress = (list: GroceryList) => {
  const spent = store.listTotals[list.id] || 0
  return list.budget > 0 ? Math.min((spent / list.budget) * 100, 100) : 0
}

const isOverBudget = (list: GroceryList) => (store.listTotals[list.id] || 0) > list.budget

const getStatusLabel = (list: GroceryList) => {
  const pct = getProgress(list)
  if (pct < 50) return '✦ SAFE ZONE'
  if (pct < 75) return '⚠ APPROACHING LIMIT'
  return '✕ EXCEEDED'
}

const getTagStyle = (list: GroceryList) => {
  const pct = getProgress(list)
  if (pct < 50) return { background: '#e8f5e9', color: '#2d5a27' }
  if (pct < 75) return { background: '#fff3e0', color: '#e65100' }
  return { background: '#ffebee', color: '#b71c1c' }
}

const getProgressStyle = (list: GroceryList) => {
  const pct = getProgress(list)
  let gradient = 'linear-gradient(90deg, #66bb6a, #2e7d32)'
  if (pct >= 75) gradient = 'linear-gradient(90deg, #ef5350, #b71c1c)'
  else if (pct >= 50) gradient = 'linear-gradient(90deg, #ffa726, #e65100)'
  return { width: `${pct}%`, background: gradient }
}

const openModal = () => isModalOpen.value = true
const closeModal = () => { isModalOpen.value = false; form.name = ''; form.budget = '' }

const submitList = async () => {
  if (!form.name || !form.budget) return
  isSubmitting.value = true
  try {
    await store.createList(form.name, Number(form.budget))
    await showToast('List created!', 'success')
    closeModal()
  } catch (e: any) {
    await showToast(e.message)
  } finally {
    isSubmitting.value = false
  }
}

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
/* ── Header ── */

.main-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--grocit-green-dark, #1a3a1a);
  text-align: center;
}

.custom-segment {
  margin: 0 16px 10px;
  --background: #dce8d8;
  border-radius: 999px;
  padding: 3px;
  width: calc(100% - 32px);
}

ion-segment-button {
  --border-radius: 999px;
  --color: #666;
  --color-checked: #fff;
  --background-checked: var(--grocit-green, #2d5a27);
  --indicator-color: transparent;
  font-weight: 600;
  font-size: 0.85rem;
  min-height: 36px;
}

.home-content {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 8px;
  --padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px 4px;
}

.eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #999;
  margin: 0 0 2px;
}

.page-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--grocit-green-dark, #1a3a1a);
  margin: 0 0 2px;
}

.header-sub {
  font-size: 0.78rem;
  color: #777;
  margin: 0;
}

.header-sub strong {
  color: var(--grocit-green, #2d5a27);
}

.notif-icon {
  font-size: 22px;
  color: var(--grocit-green, #2d5a27);
  margin-top: 18px;
}

/* ── Segment ── */
.custom-segment {
  margin: 0 16px 10px;
  --background: #dce8d8;
  border-radius: 999px;
}

/* ── List Card ── */
.list-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.list-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.completed-card {
  border: 1.5px solid var(--ion-color-success);
  opacity: 0.85;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding: 4px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.done-badge {
  background: #e8f5e9;
  color: #2d5a27;
}

.trash-btn {
  --color: #ccc;
  margin: -6px -8px 0 0;
}

.list-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1a3a1a;
  margin: 0 0 10px;
}

.budget-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.budget-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #aaa;
}

.budget-amount {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
}

.over-budget-hint {
  font-size: 0.7rem;
  color: #c62828;
  margin: 6px 0 0;
  font-style: italic;
}

/* ── Plan a New Run ── */
.new-run-card {
  border: 2px dashed #c4d8bf;
  border-radius: var(--grocit-card-radius, 20px);
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.new-run-card:active {
  border-color: #2d5a27;
}

.new-run-icon {
  font-size: 34px;
  color: #c4d8bf;
  margin-bottom: 8px;
}

.new-run-title {
  font-weight: 700;
  color: #555;
  margin: 0 0 4px;
}

.new-run-sub {
  font-size: 0.75rem;
  color: #aaa;
  margin: 0;
}

/* ── FAB ── */
.create-fab {
  margin-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  margin-right: 4px;
}

/* ── Modal ── */
.modal-submit {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  font-size: 1rem;
}
</style>