<template>
  <div>
    <ion-item-sliding @ionDrag="onDrag">
      <ion-item class="item-row" :class="{ 'item-checked': item.is_checked }" lines="none">
        <ion-checkbox
          slot="start"
          :checked="!!item.is_checked"
          @ion-change="$emit('toggle')"
          :disabled="disabled"
          class="round-checkbox"
        />
        <ion-label :class="{ 'label-checked': item.is_checked }">
          <h2 class="item-name">{{ item.name }}</h2>
          <p class="item-sub">₱{{ item.price }} × {{ item.quantity }}</p>
        </ion-label>
        <span slot="end" class="item-total">
          ₱{{ (item.price * item.quantity).toFixed(2) }}
        </span>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option class="action-opt" @click="$emit('edit')" :disabled="disabled">
          <div class="action-pill edit-pill" :class="{ 'pill-closing': isClosing }">
            <ion-icon :icon="createOutline" />
          </div>
        </ion-item-option>
        <ion-item-option class="action-opt" @click="$emit('delete')" :disabled="disabled">
          <div class="action-pill delete-pill" :class="{ 'pill-closing': isClosing }">
            <ion-icon :icon="trashOutline" />
          </div>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonItem, IonLabel, IonIcon, IonCheckbox,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/vue'
import { createOutline, trashOutline } from 'ionicons/icons'
import { GroceryItem } from '@/models/GroceryItem'

defineProps<{ item: GroceryItem; disabled?: boolean }>()
defineEmits<{ toggle: []; edit: []; delete: [] }>()

const isOpen = ref(false)
const isClosing = ref(false)

const onDrag = (event: CustomEvent) => {
  const ratio = Math.abs(event.detail.ratio)
  if (ratio > 0.3) {
    isOpen.value = true
    isClosing.value = false
  } else if (ratio < 0.1 && isOpen.value) {
    isOpen.value = false
    isClosing.value = true
    setTimeout(() => isClosing.value = false, 180)
  }
}
</script>

<style scoped>
.item-row {
  --background: white;
  --padding-start: 4px;
  --inner-padding-end: 4px;
  --min-height: 60px;
}
.item-checked { opacity: 0.5; }
.item-name { font-size: 0.95rem; font-weight: 700; color: #1a3a1a; }
.label-checked .item-name { text-decoration: line-through; color: #bbb; }
.item-sub { font-size: 0.72rem; color: #999; }
.item-total { font-size: 1rem; font-weight: 700; color: #1a3a1a; white-space: nowrap; }
.round-checkbox {
  --border-radius: 50%;
  --checkbox-background-checked: #2d5a27;
  --border-color: #ccc;
  --border-color-checked: #2d5a27;
  --size: 22px;
}
.action-opt {
  --background: transparent;
  background: transparent !important;
  padding: 0 6px;
  display: flex; align-items: center; justify-content: center;
}
.action-opt::part(native) { background: transparent !important; padding: 0; }
.action-pill {
  width: 46px; height: 46px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  animation: pill-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.edit-pill   { background: #e8f5e9; color: #2d5a27; }
.delete-pill { background: #ffebee; color: #b71c1c; }
.pill-closing { animation: pill-popout 0.15s cubic-bezier(0.4, 0, 1, 1) forwards !important; }
@keyframes pill-pop    { 0% { opacity:0; transform:scale(0.4); } 100% { opacity:1; transform:scale(1); } }
@keyframes pill-popout { 0% { opacity:1; transform:scale(1); } 100% { opacity:0; transform:scale(0.4); } }
</style>