<template>
  <header
    class="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-3"
    data-test="app-header"
  >
    <button
      type="button"
      class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-white/75 p-0 text-[1.2rem] font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      data-test="app-header-back"
      :aria-label="backLabel"
      :title="backLabel"
      @click="handleBack"
    >
      <span aria-hidden="true">←</span>
    </button>
    <div class="flex items-center justify-center">
      <slot name="center">
        <span
          v-if="showRemaining"
          class="inline-flex items-baseline gap-[0.35rem] rounded-[var(--radius-pill)] bg-white/65 px-[0.9rem] py-[0.35rem] text-[0.85rem]"
          data-test="app-header-remaining"
        >
          {{ remainingLabel
          }}<span class="text-base font-semibold text-brand">{{ remainingCount }}</span>
        </span>
      </slot>
    </div>
    <div class="flex justify-end gap-2">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  backLabel: string
  remainingLabel: string
  remainingCount: number
  showRemaining: boolean
  /** 當 drawnCardIds.length ≥ 8 時，返回按鈕會先詢問確認。 */
  requireConfirm?: boolean
}>()

const emit = defineEmits<{
  back: []
  requestConfirmBack: []
}>()

function handleBack() {
  if (props.requireConfirm) {
    emit('requestConfirmBack')
    return
  }
  emit('back')
}
</script>
