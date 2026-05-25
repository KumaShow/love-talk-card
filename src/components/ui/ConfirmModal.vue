<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-6"
      data-test="confirm-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div
        class="confirm-modal__backdrop absolute inset-0 bg-[rgb(40_20_30/0.5)] backdrop-blur-[4px]"
        @click="emit('cancel')"
      />
      <div
        class="relative flex w-full max-w-[22rem] flex-col gap-3 rounded-[var(--radius-panel)] bg-white p-7 text-ink shadow-[var(--shadow-modal)]"
      >
        <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
        <p v-if="description" class="confirm-modal__description">{{ description }}</p>
        <div class="mt-2 flex justify-end gap-3">
          <button
            type="button"
            class="confirm-modal__button confirm-modal__button--ghost min-h-[44px] min-w-[44px] cursor-pointer rounded-[var(--radius-pill)] px-5 py-2 font-semibold"
            data-test="confirm-modal-cancel"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] cursor-pointer rounded-[var(--radius-pill)] border-0 bg-brand px-5 py-2 font-semibold text-white"
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
.confirm-modal__description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.confirm-modal__button--ghost {
  background: transparent;
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-ink) 25%, transparent);
}
</style>
