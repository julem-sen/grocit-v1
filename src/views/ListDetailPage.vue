<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="" />
        </ion-buttons>
        <ion-title>{{ store.selectedList?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="isCompleted" @click="isListModalOpen = true">Edit</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :scroll-y="false" class="detail-content">
      <div class="fixed-top">
        <BudgetProgressCard
          :total="total"
          :budget="store.selectedList?.budget || 0"
          :checkedCount="checkedCount"
          :itemCount="store.items.length"
          :isCompleted="isCompleted"
        />

        <div class="section-header">
          <div class="section-left">
            <span class="section-title">Shopping Items</span>
            <span class="item-count-pill">{{ store.items.length }}</span>
          </div>
          <button class="pill-btn-primary add-btn" :disabled="isCompleted" @click="openAddModal">
            <ion-icon :icon="addOutline" />
            Add Item
          </button>
        </div>
      </div>

      <div class="scrollable-list">
        <div v-if="store.items.length > 0" class="items-container">
          <template v-for="(item, index) in sortedItems" :key="item.id">
            <GroceryItemRow
              :item="item"
              :disabled="isCompleted"
              @toggle="store.toggleItem(item.id)"
              @edit="openEditModal(item)"
              @delete="removeItem(item.id)"
            />
            <div v-if="index < sortedItems.length - 1" class="item-divider" />
          </template>
        </div>
        <div v-else class="empty-state">
          <ion-icon :icon="cartOutline" />
          <p>No items yet. Tap Add Item to get started!</p>
        </div>
      </div>

      <AddEditItemModal
        :is-open="isItemModalOpen"
        :is-editing="isEditing"
        :editing-id="editingId"
        :initial-name="editForm.name"
        :initial-price="editForm.price"
        :initial-qty="editForm.qty"
        @close="isItemModalOpen = false"
        @saved="isItemModalOpen = false"
      />

      <EditListModal
        v-if="store.selectedList"
        :is-open="isListModalOpen"
        :list-id="store.selectedList.id"
        :initial-name="store.selectedList.name"
        :initial-budget="store.selectedList.budget"
        @close="isListModalOpen = false"
      />
    </ion-content>

    <CompleteBar
      v-if="!isCompleted"
      :checkedCount="checkedCount"
      :totalCount="store.items.length"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonBackButton
} from '@ionic/vue'
import { addOutline, cartOutline } from 'ionicons/icons'
import { useGroceryStore } from '@/store/groceryStore'
import { GroceryService } from '@/services/GroceryService'
import { showToast } from '@/utils/toastHelper'
import { GroceryItem } from '@/models/GroceryItem'
import BudgetProgressCard from '@/components/BudgetProgressCard.vue'
import GroceryItemRow from '@/components/GroceryItemRow.vue'
import AddEditItemModal from '@/components/AddEditItemModal.vue'
import EditListModal from '@/components/EditListModal.vue'
import CompleteBar from '@/components/CompleteBar.vue'
import router from '@/router'

const store = useGroceryStore()
const service = new GroceryService()

const isItemModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const isListModalOpen = ref(false)
const editForm = reactive({ name: '', price: 0, qty: 1 })

const isCompleted = computed(() => !!store.selectedList?.is_completed)
const total = computed(() => service.calculateTotal(store.items))
const checkedCount = computed(() => store.items.filter(i => i.is_checked).length)

watch(isCompleted, (val) => { if (val) router.replace('/home') })

const sortedItems = computed(() => [
  ...store.items.filter(i => !i.is_checked),
  ...store.items.filter(i => i.is_checked)
])

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  editForm.name = ''; editForm.price = 0; editForm.qty = 1
  isItemModalOpen.value = true
}

const openEditModal = (item: GroceryItem) => {
  isEditing.value = true
  editingId.value = item.id
  editForm.name = item.name; editForm.price = item.price; editForm.qty = item.quantity
  isItemModalOpen.value = true
}

const removeItem = async (id: string) => {
  try { await store.deleteItem(id); await showToast('Item deleted', 'success') }
  catch (e: any) { await showToast(`Failed: ${e.message}`) }
}
</script>

<style scoped>
.detail-content { --background: var(--ion-background-color, #f4f6f0); }
.fixed-top { position: sticky; top: 0; z-index: 10; background: var(--ion-background-color, #f4f6f0); padding: 8px 16px 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; }
.section-left { display: flex; align-items: center; gap: 8px; }
.section-title { font-size: 1rem; font-weight: 700; color: #1a3a1a; }
.item-count-pill { background: #dce8d8; color: #2d5a27; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.add-btn { font-size: 0.85rem; padding: 8px 16px; }
.scrollable-list { overflow-y: auto; height: calc(100vh - 340px); padding: 0 16px calc(90px + env(safe-area-inset-bottom, 0px)); }
.items-container { background: white; border-radius: 15px; padding: 1rem; border: 1px solid #eee; }
.item-divider { height: 1px; background: repeating-linear-gradient(90deg, #ccc 0px, #ccc 6px, transparent 6px, transparent 12px); margin: 0 8px; }
.empty-state { text-align: center; padding: 60px 20px; color: #aaa; }
.empty-state ion-icon { font-size: 64px; color: #ddd; margin-bottom: 16px; }
</style>