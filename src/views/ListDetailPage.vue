<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/home" text="" />
                </ion-buttons>
                <ion-title>{{ store.selectedList?.name }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button :disabled="isCompleted" @click="openEditListModal">Edit</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :scroll-y="false" class="detail-content">

            <!-- ── Fixed Top ── -->
            <div class="fixed-top">

                <!-- Budget Card -->
                <div class="grocit-card budget-card"
                    :class="{ 'card-completed': isCompleted, 'card-exceeded': isOverBudget && !isCompleted }">

                    <div v-if="isCompleted" class="status-pill pill-green">
                        <ion-icon :icon="checkmarkCircle" /> SHOPPING COMPLETE
                    </div>
                    <div v-else-if="isOverBudget" class="status-pill pill-red">
                        <ion-icon :icon="alertCircleOutline" /> BUDGET EXCEEDED
                    </div>

                    <div class="budget-top-row">
                        <div>
                            <p class="budget-meta-label">Remaining</p>
                            <p class="budget-big-number" :class="isOverBudget ? 'number-danger' : ''">
                                ₱{{ remaining.toFixed(2) }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="budget-meta-label">BUDGET</p>
                            <p class="budget-big-number number-muted">
                                ₱{{ store.selectedList?.budget.toFixed(2) }}
                            </p>
                        </div>
                    </div>

                    <div class="custom-progress-track">
                        <div class="custom-progress-fill" :style="progressStyle">
                            <span class="progress-inner-text" v-if="progress > 12">
                                ₱{{ total.toFixed(2) }} Spent
                            </span>
                        </div>
                    </div>

                    <p v-if="isOverBudget" class="over-limit-label">
                        +₱{{ (total - (store.selectedList?.budget || 0)).toFixed(2) }} over limit
                    </p>

                    <p class="check-summary">
                        {{ checkedCount }} of {{ store.items.length }} items in cart
                    </p>
                </div>

                <!-- Section Header -->
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

            <!-- ── Scrollable List ── -->
            <div class="scrollable-list">
                <div v-if="store.items.length > 0" class="items-container">
                    <template v-for="(item, index) in sortedItems" :key="item.id">
                        <ion-item-sliding @ionDrag="onDrag($event, item.id)">
                            <ion-item class="item-row" :class="{ 'item-checked': item.is_checked }" lines="none">
                                <ion-checkbox slot="start" :checked="!!item.is_checked" @ion-change="toggle(item.id)"
                                    :disabled="isCompleted" class="round-checkbox" />
                                <ion-label :class="{ 'label-checked': item.is_checked }">
                                    <h2 class="item-name">{{ item.name }}</h2>
                                    <p class="item-sub">₱{{ item.price }} × {{ item.quantity }}</p>
                                </ion-label>
                                <span slot="end" class="item-total">
                                    ₱{{ (item.price * item.quantity).toFixed(2) }}
                                </span>
                            </ion-item>

                            <ion-item-options side="end">
                                <ion-item-option class="action-opt" @click="openEditModal(item)"
                                    :disabled="isCompleted">
                                    <div class="action-pill edit-pill"
                                        :class="{ 'pill-closing': closingItems.has(item.id) }">
                                        <ion-icon :icon="createOutline" />
                                    </div>
                                </ion-item-option>
                                <ion-item-option class="action-opt" @click="remove(item.id)" :disabled="isCompleted">
                                    <div class="action-pill delete-pill"
                                        :class="{ 'pill-closing': closingItems.has(item.id) }">
                                        <ion-icon :icon="trashOutline" />
                                    </div>
                                </ion-item-option>
                            </ion-item-options>
                        </ion-item-sliding>

                        <!-- Dashed divider, not after last item -->
                        <div v-if="index < sortedItems.length - 1" class="item-divider" />
                    </template>
                </div>

                <div v-else class="empty-state">
                    <ion-icon :icon="cartOutline" />
                    <p>No items yet.</p>
                    <p>Tap Add Item to get started!</p>
                </div>
            </div>

            <!-- ── Modals ── -->
            <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
                <ion-header class="ion-no-border">
                    <ion-toolbar>
                        <ion-title>{{ isEditing ? 'Edit Item' : 'Add Item' }}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeModal">Cancel</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-item class="modal-item">
                        <ion-label position="stacked">Item Name</ion-label>
                        <ion-input v-model="name" placeholder="e.g. Rice" clearInput />
                    </ion-item>
                    <ion-item class="modal-item">
                        <ion-label position="stacked">Price (₱)</ion-label>
                        <ion-input v-model.number="price" type="number" placeholder="0.00" />
                    </ion-item>
                    <ion-item class="modal-item">
                        <ion-label position="stacked">Quantity</ion-label>
                        <ion-input v-model.number="quantity" type="number" placeholder="1" />
                    </ion-item>
                    <button class="pill-btn-primary modal-submit" :disabled="!name || isSaving" @click="save">
                        {{ isSaving ? 'Saving...' : 'Save Item' }}
                    </button>
                </ion-content>
            </ion-modal>

            <ion-modal :is-open="isListModalOpen" @did-dismiss="closeListModal">
                <ion-header class="ion-no-border">
                    <ion-toolbar>
                        <ion-title>Edit List</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeListModal">Cancel</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-item class="modal-item">
                        <ion-label position="stacked">List Name</ion-label>
                        <ion-input v-model="listName" placeholder="List name" clearInput />
                    </ion-item>
                    <ion-item class="modal-item">
                        <ion-label position="stacked">Budget (₱)</ion-label>
                        <ion-input v-model.number="listBudget" type="number" placeholder="0.00" />
                    </ion-item>
                    <button class="pill-btn-primary modal-submit"
                        :disabled="!listName || listBudget <= 0 || isSavingList" @click="saveList">
                        {{ isSavingList ? 'Saving...' : 'Save Changes' }}
                    </button>
                </ion-content>
            </ion-modal>
        </ion-content>

        <!-- ── Fixed Complete Bar ── -->
        <div class="bottom-bar" v-if="!isCompleted">
            <p class="complete-hint">
                <ion-icon :icon="cartOutline" />
                {{ checkedCount }} items ready for checkout
            </p>
            <button class="pill-btn-outline" :disabled="checkedCount === 0 || isCompleting" @click="completeShopping">
                {{ isCompleting ? 'Completing...' : `Complete Shopping (${checkedCount}/${store.items.length})` }}
            </button>
        </div>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonModal, IonButtons,
    IonInput, IonIcon, IonCheckbox,
    IonItemSliding, IonItemOptions, IonItemOption,
    IonBackButton, toastController, alertController
} from '@ionic/vue'
import { cartOutline, checkmarkCircle, addOutline, alertCircleOutline, createOutline, trashOutline } from 'ionicons/icons'
import { useGroceryStore } from '@/store/groceryStore'
import { GroceryService } from '@/services/GroceryService'
import router from '@/router'

const store = useGroceryStore()
const service = new GroceryService()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const isSaving = ref(false)
const isCompleting = ref(false)
const isListModalOpen = ref(false)
const listName = ref('')
const listBudget = ref(0)
const isSavingList = ref(false)
const name = ref('')
const price = ref(0)
const quantity = ref(1)

const isCompleted = computed(() => !!store.selectedList?.is_completed)
const total = computed(() => service.calculateTotal(store.items))
const progress = computed(() => service.getProgress(store.selectedList?.budget || 0, store.items))
const checkedCount = computed(() => store.items.filter(i => i.is_checked).length)
const isOverBudget = computed(() => total.value > (store.selectedList?.budget || 0))

watch(isCompleted, (val) => { if (val) router.replace('/home') })

const sortedItems = computed(() => [
    ...store.items.filter(i => !i.is_checked),
    ...store.items.filter(i => i.is_checked)
])

const remaining = computed(() =>
    Math.max((store.selectedList?.budget || 0) - total.value, 0)
)

const progressStyle = computed(() => {
    const pct = Math.min(progress.value, 100)
    let gradient = 'linear-gradient(90deg, #66bb6a, #2e7d32)'
    if (pct >= 75) gradient = 'linear-gradient(90deg, #ef5350, #b71c1c)'
    else if (pct >= 50) gradient = 'linear-gradient(90deg, #ffa726, #e65100)'
    return { width: `${pct}%`, background: gradient }
})

const showToast = async (message: string, color: 'danger' | 'warning' | 'success' = 'danger') => {
    const toast = await toastController.create({ message, color, duration: 2000 })
    toast.present()
}

const toggle = async (id: string) => {
    try { await store.toggleItem(id) }
    catch (e: any) { await showToast(`Failed: ${e.message}`) }
}

const completeShopping = async () => {
    const alert = await alertController.create({
        header: 'Complete Shopping?',
        message: `All ${store.items.length} items checked. Mark this list as complete?`,
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

const remove = async (id: string) => {
    try { await store.deleteItem(id); await showToast('Item deleted', 'success') }
    catch (e: any) { await showToast(`Failed: ${e.message}`) }
}

const openAddModal = () => { isEditing.value = false; resetForm(); isModalOpen.value = true }

const openEditModal = (item: any) => {
    isEditing.value = true; editingId.value = item.id
    name.value = item.name; price.value = item.price; quantity.value = item.quantity
    isModalOpen.value = true
}

const save = async () => {
    isSaving.value = true
    try {
        if (isEditing.value && editingId.value) {
            await store.updateItem(editingId.value, name.value, price.value, quantity.value)
        } else {
            await store.addItem(name.value, price.value, quantity.value)
        }
        if (progress.value >= 100) await showToast('⚠️ Budget exceeded!', 'warning')
        else if (progress.value >= 90) await showToast('⚠️ Approaching limit!', 'warning')
        else await showToast('Item saved', 'success')
        closeModal()
    } catch (e: any) {
        await showToast(e.message)
    } finally {
        isSaving.value = false
    }
}

const closeModal = () => { isModalOpen.value = false; resetForm() }
const resetForm = () => { name.value = ''; price.value = 0; quantity.value = 1; editingId.value = null }

const openEditListModal = () => {
    if (!store.selectedList) return
    listName.value = store.selectedList.name
    listBudget.value = store.selectedList.budget
    isListModalOpen.value = true
}

const saveList = async () => {
    if (!store.selectedList) return
    isSavingList.value = true
    try {
        await store.updateList(store.selectedList.id, listName.value, listBudget.value)
        await showToast('List updated', 'success')
        closeListModal()
    } catch (e: any) {
        await showToast(`Failed: ${e.message}`)
    } finally {
        isSavingList.value = false
    }
}

const openItems = ref<Set<string>>(new Set())
const closingItems = ref<Set<string>>(new Set())

const onDrag = (event: CustomEvent, id: string) => {
  const ratio = Math.abs(event.detail.ratio)

  if (ratio > 0.3) {
    // Item is open — mark it, clear closing state
    openItems.value.add(id)
    closingItems.value.delete(id)
  } else if (ratio < 0.1 && openItems.value.has(id)) {
    // Was open, now closing — trigger pop-out
    openItems.value.delete(id)
    closingItems.value.add(id)
    setTimeout(() => closingItems.value.delete(id), 180)
  }
}

const closeListModal = () => { isListModalOpen.value = false }
</script>

<style scoped>
.detail-content {
    --background: var(--ion-background-color, #f4f6f0);
}

/* ── Fixed Top ── */
.fixed-top {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--ion-background-color, #f4f6f0);
    padding: 8px 16px 0;
}

/* ── Budget Card ── */
.budget-card {
    margin-bottom: 8px;
}

.card-completed {
    border: 2px solid var(--ion-color-success);
}

.card-exceeded {
    border: 2px solid var(--ion-color-danger);
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    padding: 4px 10px;
    border-radius: 999px;
    margin-bottom: 10px;
}

.pill-green {
    background: #e8f5e9;
    color: #2d5a27;
}

.pill-red {
    background: #ffebee;
    color: #b71c1c;
}

.budget-top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 10px;
}

.budget-meta-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #aaa;
    margin: 0 0 2px;
}

.budget-big-number {
    font-size: 1.7rem;
    font-weight: 800;
    color: #1a3a1a;
    margin: 0;
}

.number-danger {
    color: var(--ion-color-danger);
}

.number-muted {
    color: #999;
    font-size: 1.3rem;
}

.text-right {
    text-align: right;
}

.custom-progress-track {
    width: 100%;
    height: 26px;
    background: #ececec;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
}

.custom-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    min-width: 0;
}

.progress-inner-text {
    font-size: 0.72rem;
    font-weight: 700;
    color: white;
    white-space: nowrap;
}

.over-limit-label {
    font-size: 0.72rem;
    color: var(--ion-color-danger);
    font-weight: 600;
    text-align: right;
    margin: 4px 0 0;
}

.check-summary {
    font-size: 0.72rem;
    color: #aaa;
    text-align: right;
    margin: 5px 0 0;
}

/* ── Section Header ── */
.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
}

.section-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1a3a1a;
}

.item-count-pill {
    background: #dce8d8;
    color: #2d5a27;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
}

.add-btn {
    font-size: 0.85rem;
    padding: 8px 16px;
}

/* ── Scrollable List ── */
.scrollable-list {
    overflow-y: auto;
    height: calc(100vh - 340px);
    padding: 0 16px calc(90px + env(safe-area-inset-bottom, 0px));
}

/* ── Items Container — no background ── */
.items-container {
    background: white;
    border-radius: 15px;
    box-shadow: none;
    overflow: visible;
    padding: 1rem;
    border: 1px solid #eee;
}

/* ── Item Row ── */
.item-row {
    --background: white;
    --padding-start: 4px;
    --inner-padding-end: 4px;
    --min-height: 60px;
}

.item-checked {
    opacity: 0.5;
}

.item-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a3a1a;
}

.label-checked .item-name {
    text-decoration: line-through;
    color: #bbb;
}

.item-sub {
    font-size: 0.72rem;
    color: #999;
}

.item-total {
    font-size: 1rem;
    font-weight: 700;
    color: #1a3a1a;
    white-space: nowrap;
}

/* ── Dashed Divider ── */
.item-divider {
    height: 1px;
    background: repeating-linear-gradient(90deg,
            #ccc 0px, #ccc 6px,
            transparent 6px, transparent 12px);
    margin: 0 8px;
}

/* ── Round Checkbox ── */
.round-checkbox {
    --border-radius: 50%;
    --checkbox-background-checked: #2d5a27;
    --border-color: #ccc;
    --border-color-checked: #2d5a27;
    --size: 22px;
}

/* ── Swipe Action Buttons ── */
.action-opt {
    --background: transparent;
    background: transparent !important;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-opt::part(native) {
    background: transparent !important;
    padding: 0;
}

.action-pill {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  animation: pill-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.edit-pill  { background: #e8f5e9; color: #2d5a27; }
.delete-pill { background: #ffebee; color: #b71c1c; }

/* Pop-out overrides the pop-in when closing */
.pill-closing {
  animation: pill-popout 0.15s cubic-bezier(0.4, 0, 1, 1) forwards !important;
}

@keyframes pill-pop {
  0%   { opacity: 0; transform: scale(0.4); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pill-popout {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.4); }
}

/* ── Bottom Bar ── */
.complete-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 0.75rem;
    color: #999;
    margin: 0 0 8px;
}

/* ── Modal ── */
.modal-submit {
    width: 100%;
    margin-top: 16px;
    padding: 14px;
    font-size: 1rem;
}
</style>