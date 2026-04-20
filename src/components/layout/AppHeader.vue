<template>
  <header class="app-header" data-test="app-header">
    <button
      type="button"
      class="app-header__back"
      data-test="app-header-back"
      :aria-label="backLabel"
      @click="handleBack"
    >
      <span aria-hidden="true">←</span>
      <span class="app-header__back-text">{{ backLabel }}</span>
    </button>
    <div class="app-header__center">
      <slot name="center">
        <span
          v-if="showRemaining"
          class="app-header__remaining"
          data-test="app-header-remaining"
        >
          {{ remainingLabel }}<span class="app-header__remaining-count">{{ remainingCount }}</span>
        </span>
      </slot>
    </div>
    <div class="app-header__right">
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

<style scoped>
.app-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
}

.app-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
}

.app-header__back-text {
  font-size: 0.95rem;
}

.app-header__center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-header__remaining {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  font-size: 0.85rem;
}

.app-header__remaining-count {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
}

.app-header__right {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
