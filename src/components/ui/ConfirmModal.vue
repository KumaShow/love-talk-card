<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="confirm-modal"
      data-test="confirm-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="confirm-modal__backdrop" @click="emit('cancel')" />
      <div class="confirm-modal__dialog">
        <h2 :id="titleId" class="confirm-modal__title">{{ title }}</h2>
        <p v-if="description" class="confirm-modal__description">{{ description }}</p>
        <div class="confirm-modal__actions">
          <button
            type="button"
            class="confirm-modal__button confirm-modal__button--ghost"
            data-test="confirm-modal-cancel"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="confirm-modal__button confirm-modal__button--primary"
            data-test="confirm-modal-confirm"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
</script>

<style scoped>
.confirm-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.confirm-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(40, 20, 30, 0.5);
  backdrop-filter: blur(4px);
}

.confirm-modal__dialog {
  position: relative;
  max-width: 22rem;
  width: 100%;
  padding: 1.75rem;
  border-radius: 1.5rem;
  background: white;
  color: var(--color-text);
  box-shadow: 0 25px 60px -20px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.confirm-modal__title {
  font-size: 1.125rem;
  font-weight: 600;
}

.confirm-modal__description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.confirm-modal__actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.confirm-modal__button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-modal__button--ghost {
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text) 25%, transparent);
}

.confirm-modal__button--primary {
  background: var(--color-primary);
  color: white;
}
</style>
