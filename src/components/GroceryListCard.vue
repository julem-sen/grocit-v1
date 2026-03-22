<template>
  <div
    class="grocit-card list-card"
    :class="{ 'completed-card': list.is_completed }"
    @click="$emit('open')"
  >
    <div class="card-top-row">
      <span class="status-badge" :style="tagStyle">
        <ion-icon v-if="list.is_completed" :icon="checkmarkCircle" />
        {{ statusLabel }}
      </span>
      <ion-button fill="clear" size="small" class="trash-btn" @click.stop="$emit('delete')">
        <ion-icon slot="icon-only" :icon="trashOutline" />
      </ion-button>
    </div>

    <h2 class="list-name">{{ list.name }}</h2>

    <div class="budget-row">
      <span class="budget-label">{{ list.is_completed ? 'TOTAL SPENT' : 'BUDGET PROGRESS' }}</span>
      <span class="budget-amount">₱{{ spent }} / ₱{{ list.budget }}</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" :style="progressStyle" />
    </div>

    <p v-if="over && !list.is_completed" class="over-budget-hint">
      ⚠ Budget adjustment recommended
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { trashOutline, checkmarkCircle } from 'ionicons/icons'
import { GroceryList } from '@/models/GroceryList'
import {
  getSpent, getProgress, isOverBudget,
  getStatusLabel, getTagStyle, getProgressStyle
} from '@/utils/budgetUtils'

const props = defineProps<{ list: GroceryList; listTotals: Record<string, number> }>()
defineEmits<{ open: []; delete: [] }>()

const spent = computed(() => getSpent(props.list, props.listTotals).toFixed(2))
const over = computed(() => isOverBudget(props.list, props.listTotals))
const statusLabel = computed(() => props.list.is_completed ? 'DONE' : getStatusLabel(props.list, props.listTotals))
const tagStyle = computed(() => props.list.is_completed ? { background: '#e8f5e9', color: '#2d5a27' } : getTagStyle(props.list, props.listTotals))
const progressStyle = computed(() => getProgressStyle(props.list, props.listTotals))
</script>

<style scoped>
.list-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.list-card:active { transform: scale(0.98); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.completed-card { border: 1.5px solid var(--ion-color-success); opacity: 0.85; }
.card-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.status-badge {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em;
  padding: 4px 10px; border-radius: 999px;
  display: inline-flex; align-items: center; gap: 4px;
}
.trash-btn { --color: #ccc; margin: -6px -8px 0 0; }
.list-name { font-size: 1.3rem; font-weight: 800; color: #1a3a1a; margin: 0 0 10px; }
.budget-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.budget-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; color: #aaa; }
.budget-amount { font-size: 0.8rem; font-weight: 600; color: #555; }
.progress-track { width: 100%; height: 12px; background: #ececec; border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.over-budget-hint { font-size: 0.7rem; color: #c62828; margin: 6px 0 0; font-style: italic; }
</style>