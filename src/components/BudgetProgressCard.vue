<template>
  <div
    class="grocit-card budget-card"
    :class="{ 'card-completed': isCompleted, 'card-exceeded': isOverBudget && !isCompleted }"
  >
    <div v-if="isCompleted" class="status-pill pill-green">
      <ion-icon :icon="checkmarkCircle" /> SHOPPING COMPLETE
    </div>
    <div v-else-if="isOverBudget" class="status-pill pill-red">
      <ion-icon :icon="alertCircleOutline" /> BUDGET EXCEEDED
    </div>

    <div class="budget-top-row">
      <div>
        <p class="budget-meta-label">REMAINING</p>
        <p class="budget-big-number" :class="{ 'number-danger': isOverBudget }">
          ₱{{ remaining.toFixed(2) }}
        </p>
      </div>
      <div class="text-right">
        <p class="budget-meta-label">BUDGET</p>
        <p class="budget-big-number number-muted">₱{{ budget.toFixed(2) }}</p>
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
      +₱{{ (total - budget).toFixed(2) }} over limit
    </p>

    <p class="check-summary">{{ checkedCount }} of {{ itemCount }} items in cart</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { checkmarkCircle, alertCircleOutline } from 'ionicons/icons'
import { calcProgressStyle } from '@/utils/budgetUtils'

const props = defineProps<{
  total: number
  budget: number
  checkedCount: number
  itemCount: number
  isCompleted: boolean
}>()

const remaining = computed(() => Math.max(props.budget - props.total, 0))
const isOverBudget = computed(() => props.total > props.budget)
const progress = computed(() => props.budget > 0 ? Math.min((props.total / props.budget) * 100, 100) : 0)
const progressStyle = computed(() => calcProgressStyle(progress.value))
</script>

<style scoped>
.budget-card { margin-bottom: 8px; }
.card-completed { border: 2px solid var(--ion-color-success); }
.card-exceeded  { border: 2px solid var(--ion-color-danger); }
.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em;
  padding: 4px 10px; border-radius: 999px; margin-bottom: 10px;
}
.pill-green { background: #e8f5e9; color: #2d5a27; }
.pill-red   { background: #ffebee; color: #b71c1c; }
.budget-top-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
.budget-meta-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; color: #aaa; margin: 0 0 2px; }
.budget-big-number { font-size: 1.7rem; font-weight: 800; color: #1a3a1a; margin: 0; }
.number-danger { color: var(--ion-color-danger); }
.number-muted  { color: #999; font-size: 1.3rem; }
.text-right    { text-align: right; }
.custom-progress-track {
  width: 100%; height: 26px; background: #ececec;
  border-radius: 999px; overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
}
.custom-progress-fill {
  height: 100%; border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  display: flex; align-items: center; justify-content: flex-end;
  padding-right: 10px; min-width: 0;
}
.progress-inner-text { font-size: 0.72rem; font-weight: 700; color: white; white-space: nowrap; }
.over-limit-label { font-size: 0.72rem; color: var(--ion-color-danger); font-weight: 600; text-align: right; margin: 4px 0 0; }
.check-summary { font-size: 0.72rem; color: #aaa; text-align: right; margin: 5px 0 0; }
</style>