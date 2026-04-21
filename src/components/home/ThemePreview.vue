<template>
  <Transition name="preview-backdrop">
    <div
      v-if="theme"
      class="poc-home-preview__backdrop"
      data-test="poc-home-preview-backdrop"
      aria-hidden="true"
      @click="$emit('dismiss')"
    ></div>
  </Transition>
  <Transition name="preview-slide">
    <section
      v-if="theme"
      class="poc-home-preview"
      :style="themeStyle"
      data-test="poc-home-preview"
      role="dialog"
      aria-modal="true"
    >
      <div class="poc-home-preview__card-wrap">
        <Transition name="preview-card" mode="out-in" appear>
          <article :key="theme.id" class="poc-home-preview__card">
            <p class="poc-home-preview__card-eyebrow">今晚主題</p>
            <h2 class="poc-home-preview__card-name">{{ theme.name.zh }}</h2>
            <p class="poc-home-preview__card-desc">{{ theme.description.zh }}</p>
          </article>
        </Transition>
      </div>

      <button
        type="button"
        class="poc-home-preview__cta"
        data-test="poc-preview-cta"
        @click="$emit('start', theme)"
      >
        開始對話
      </button>
      <button
        type="button"
        class="poc-home-preview__dismiss"
        data-test="poc-preview-dismiss"
        aria-label="收起預覽"
        @click="$emit('dismiss')"
      >
        收起
      </button>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Theme } from '@/types'

const props = defineProps<{ theme: Theme | null }>()

defineEmits<{
  start: [theme: Theme]
  dismiss: []
}>()

// 以 inline CSS custom properties 注入該主題色，只影響浮層子樹
const themeStyle = computed(() => {
  if (!props.theme) {
    return {}
  }
  return {
    '--color-card-back': props.theme.colors.cardBack,
    '--color-primary': props.theme.colors.primary,
    '--color-secondary': props.theme.colors.secondary,
  } as Record<string, string>
})
</script>

<style scoped>
.poc-home-preview__backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba(12, 6, 12, 0.55);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.poc-home-preview {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  max-width: 30rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top-left-radius: 1.75rem;
  border-top-right-radius: 1.75rem;
  box-shadow: 0 -22px 44px -24px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  perspective: 1200px;
}

.poc-home-preview__card-wrap {
  position: relative;
  min-height: 180px;
}

.poc-home-preview__card {
  padding: 1.5rem 1.25rem;
  border-radius: 1.5rem;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-card-back) 78%, white),
    var(--color-card-back)
  );
  color: white;
  text-align: center;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.7rem;
  box-shadow: 0 18px 36px -22px rgba(0, 0, 0, 0.35);
}

.poc-home-preview__card-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.85;
}

.poc-home-preview__card-name {
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.poc-home-preview__card-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  color: color-mix(in srgb, white 90%, transparent);
}

.poc-home-preview__cta {
  min-height: 52px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    color-mix(in srgb, var(--color-primary) 55%, #1a0a18)
  );
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--color-primary) 55%, #000),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: transform 150ms ease, filter 150ms ease, box-shadow 150ms ease;
}

.poc-home-preview__cta:hover {
  filter: brightness(1.05);
  box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--color-primary) 60%, #000),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.poc-home-preview__cta:active {
  transform: translateY(1px);
}

.poc-home-preview__dismiss {
  align-self: center;
  min-height: 44px;
  padding: 0.4rem 1.2rem;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 65%, transparent);
  font-size: 0.9rem;
  cursor: pointer;
}

/* Backdrop 淡入淡出 */
.preview-backdrop-enter-active,
.preview-backdrop-leave-active {
  transition: opacity 280ms ease-out;
}

.preview-backdrop-enter-from,
.preview-backdrop-leave-to {
  opacity: 0;
}

/* 浮層進出場：slide-up + opacity */
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 260ms ease-out;
}

.preview-slide-enter-from,
.preview-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/*
  示意卡進場：以 rotateY 做側面翻過來的視覺，
  並 delay 180ms 讓「浮層先上來、卡片後翻面」的節奏明確。
*/
.preview-card-enter-active {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  transition: opacity 320ms ease-out 180ms,
    transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1) 180ms;
}

.preview-card-leave-active {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  transition: opacity 220ms ease-out, transform 320ms cubic-bezier(0.4, 0, 0.6, 1);
}

.preview-card-enter-from {
  opacity: 0;
  transform: rotateY(-85deg) translateX(-30%) scale(0.85);
}

.preview-card-leave-to {
  opacity: 0;
  transform: rotateY(85deg) translateX(30%) scale(0.92);
}
</style>
