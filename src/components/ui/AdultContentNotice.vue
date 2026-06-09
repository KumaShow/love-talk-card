<template>
  <Transition name="adult-notice-backdrop" appear>
    <div
      class="fixed inset-0 z-[59] bg-[rgb(18_8_14/0.68)] backdrop-blur-[5px]"
      data-test="adult-notice-backdrop"
      aria-hidden="true"
      @click="emitDismiss"
    ></div>
  </Transition>

  <Transition name="adult-notice-panel" appear>
    <section
      ref="panelRef"
      class="fixed inset-x-4 top-1/2 z-[60] mx-auto flex max-w-[28rem] -translate-y-1/2 flex-col gap-5 rounded-[1.75rem] border border-white/20 bg-[linear-gradient(145deg,#3E1E2E,#2A1620)] px-5 py-6 text-[#F7E9EF] shadow-[0_28px_70px_-32px_rgba(0,0,0,0.8)] outline-none max-[23rem]:gap-4 max-[23rem]:px-4 max-[23rem]:py-5"
      data-test="adult-notice"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <div class="flex flex-col gap-3 text-center">
        <p class="m-0 text-[0.72rem] uppercase tracking-[0.14em] text-[#E6A3BA]">
          {{ zhTw.theme.desire.name }}
        </p>
        <h2 :id="titleId" class="m-0 font-serif text-[1.75rem] font-semibold">
          {{ zhTw.notice.adult.title }}
        </h2>
        <p class="m-0 text-[0.95rem] leading-[1.65] text-[#F7E9EF]/85">
          {{ zhTw.notice.adult.body }}
        </p>
      </div>

      <label
        class="flex cursor-pointer items-start gap-3 rounded-[1.1rem] bg-white/10 px-4 py-3 text-[0.92rem] leading-[1.55]"
      >
        <input
          v-model="isAgeConfirmed"
          class="mt-1 size-5 shrink-0 accent-[#B5546F]"
          type="checkbox"
          data-test="adult-notice-age"
        />
        <span>{{ zhTw.notice.adult.ageConfirm }}</span>
      </label>

      <div class="flex flex-col gap-3">
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-[var(--radius-pill)] border-0 bg-[#F7E9EF] px-5 text-[1rem] font-bold text-[#5C2238] shadow-[0_16px_32px_-20px_rgba(247,233,239,0.9)] transition disabled:cursor-not-allowed disabled:opacity-50"
          data-test="adult-notice-continue"
          :disabled="!isAgeConfirmed"
          @click="emitConfirm"
        >
          {{ zhTw.notice.adult.continue }}
        </button>
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-[var(--radius-pill)] border border-white/25 bg-transparent px-5 text-[0.95rem] font-semibold text-[#F7E9EF]"
          data-test="adult-notice-back"
          @click="emitDismiss"
        >
          {{ zhTw.notice.adult.back }}
        </button>
      </div>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

import zhTw from '@/i18n/zh-TW.json'

const emit = defineEmits<{
  confirm: []
  dismiss: []
}>()

const titleId = 'adult-content-notice-title'
const isAgeConfirmed = ref(false)
const panelRef = ref<HTMLElement | null>(null)

function emitConfirm(): void {
  if (!isAgeConfirmed.value) {
    return
  }
  emit('confirm')
}

function emitDismiss(): void {
  emit('dismiss')
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emitDismiss()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  void nextTick(() => {
    panelRef.value?.focus()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Vue Transition class 必須以 scoped CSS 表達，維持單一語義前綴。 */
.adult-notice-backdrop-enter-active,
.adult-notice-backdrop-leave-active,
.adult-notice-panel-enter-active,
.adult-notice-panel-leave-active {
  transition:
    opacity 220ms ease-out,
    transform 320ms var(--ease-card);
}

.adult-notice-backdrop-enter-from,
.adult-notice-backdrop-leave-to {
  opacity: 0;
}

.adult-notice-panel-enter-from,
.adult-notice-panel-leave-to {
  opacity: 0;
  transform: translateY(calc(-50% + 1rem)) scale(0.96);
}
</style>
