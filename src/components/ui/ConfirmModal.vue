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
        class="absolute inset-0 bg-[rgb(40_20_30/0.5)] backdrop-blur-sm"
        data-test="confirm-modal-backdrop"
        @click="emit('cancel')"
      />
      <div
        class="relative flex w-full max-w-[22rem] flex-col gap-3 rounded-[var(--radius-panel)] bg-white p-7 text-ink shadow-[var(--shadow-modal)] max-[23rem]:p-[1.4rem]"
      >
        <h2 :id="titleId" class="text-lg font-semibold max-[23rem]:text-base">{{ title }}</h2>
        <p
          v-if="description"
          class="confirm-modal-desc text-[0.95rem] leading-[1.5]"
          data-test="confirm-modal-description"
        >
          {{ description }}
        </p>
        <div class="mt-2 flex justify-end gap-3">
          <button
            type="button"
            class="confirm-modal-ghost min-h-11 min-w-11 cursor-pointer rounded-[var(--radius-pill)] px-5 py-2 font-semibold max-[23rem]:px-4"
            data-test="confirm-modal-cancel"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="min-h-11 min-w-11 cursor-pointer rounded-[var(--radius-pill)] border-0 bg-brand px-5 py-2 font-semibold text-white max-[23rem]:px-4"
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
/* 描述文字：color-mix 半透明墨色，保留 scoped */
.confirm-modal-desc {
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

/* 取消（ghost）按鈕：透明底 + color-mix 文字與外框，保留 scoped */
.confirm-modal-ghost {
  background: transparent;
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-ink) 25%, transparent);
}
</style>
