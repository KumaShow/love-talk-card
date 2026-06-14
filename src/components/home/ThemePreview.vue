<template>
  <Transition name="preview-backdrop">
    <div
      v-if="theme"
      class="fixed inset-0 z-[49] bg-[rgb(12_6_12/0.55)] backdrop-blur-[3px]"
      data-test="preview-backdrop"
      aria-hidden="true"
      @click="$emit('dismiss')"
    ></div>
  </Transition>
  <Transition name="preview-slide">
    <section
      v-if="theme"
      class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[30rem] flex-col gap-4 rounded-t-[var(--radius-card)] bg-white/[0.98] px-5 pb-8 pt-6 shadow-[var(--shadow-sheet)] backdrop-blur-[14px] [perspective:75rem] max-[23rem]:gap-[0.85rem] max-[23rem]:px-4 max-[23rem]:pb-6 max-[23rem]:pt-5"
      :style="themeStyle"
      data-test="home-preview"
      role="dialog"
      aria-modal="true"
    >
      <div class="relative min-h-[11.25rem] max-[23rem]:min-h-[10rem]">
        <Transition name="preview-card" mode="out-in" appear>
          <article
            :key="theme.id"
            class="theme-preview-card flex min-h-[11.25rem] flex-col justify-center gap-[0.7rem] rounded-[var(--radius-panel)] px-5 py-6 text-center text-white shadow-[0_18px_36px_-22px_rgba(0,0,0,0.35)] max-[23rem]:min-h-[10rem] max-[23rem]:px-4 max-[23rem]:py-[1.2rem]"
          >
            <p class="text-[0.7rem] uppercase tracking-normal opacity-85">
              {{ zhTw.home.preview.eyebrow }}
            </p>
            <h2 class="m-0 font-serif text-[1.75rem] font-semibold max-[23rem]:text-[1.5rem]">
              {{ theme.name.zh }}
            </h2>
            <p class="preview-desc m-0 text-[0.95rem] leading-[1.6] max-[23rem]:text-[0.9rem]">
              {{ theme.description.zh }}
            </p>
            <p
              v-if="theme.id === 'desire'"
              class="m-0 rounded-[0.9rem] bg-white/15 px-3 py-2 text-[0.82rem] leading-[1.55] text-white/90"
              data-test="preview-adult-hint"
            >
              {{ zhTw.home.preview.adultHint }}
            </p>
          </article>
        </Transition>
      </div>

      <button
        type="button"
        class="preview-cta min-h-[3.25rem] cursor-pointer rounded-[var(--radius-pill)] border-0 text-[1.05rem] font-bold tracking-normal text-white"
        data-test="preview-cta"
        @click="$emit('start', theme)"
      >
        {{ zhTw.home.preview.startCta }}
      </button>
      <button
        type="button"
        class="preview-dismiss min-h-11 cursor-pointer self-center border-0 bg-transparent px-[1.2rem] py-[0.4rem] text-[0.9rem]"
        data-test="preview-dismiss"
        :aria-label="zhTw.home.preview.dismissAriaLabel"
        @click="$emit('dismiss')"
      >
        {{ zhTw.home.preview.dismissLabel }}
      </button>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import zhTw from '@/i18n/zh-TW.json'
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
    '--color-card': props.theme.colors.cardBack,
    '--color-brand': props.theme.colors.primary,
    '--color-accent': props.theme.colors.secondary,
  } as Record<string, string>
})
</script>

<style scoped>
/* 示意卡漸層底（color-mix），保留 scoped */
.theme-preview-card {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-card) 78%, white),
    var(--color-card)
  );
}

/* 卡描述文字：color-mix 半透明白，保留 scoped */
.preview-desc {
  color: color-mix(in srgb, white 90%, transparent);
}

/* 主 CTA：漸層、文字陰影、雙層光暈與 hover/active 微互動（color-mix），保留 scoped */
.preview-cta {
  background: linear-gradient(
    135deg,
    var(--color-brand),
    color-mix(in srgb, var(--color-brand) 55%, #1a0a18)
  );
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  box-shadow:
    0 10px 24px -10px color-mix(in srgb, var(--color-brand) 55%, #000),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition:
    transform 150ms ease,
    filter 150ms ease,
    box-shadow 150ms ease;
}

.preview-cta:hover {
  filter: brightness(1.05);
  box-shadow:
    0 14px 28px -10px color-mix(in srgb, var(--color-brand) 60%, #000),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.preview-cta:active {
  transform: translateY(1px);
}

/* 略過按鈕文字：color-mix 半透明墨色，保留 scoped */
.preview-dismiss {
  color: color-mix(in srgb, var(--color-ink) 65%, transparent);
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
  transition:
    transform 420ms var(--ease-card),
    opacity 260ms ease-out;
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
  transition:
    opacity 320ms ease-out 180ms,
    transform 520ms var(--ease-card) 180ms;
}

.preview-card-leave-active {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  transition:
    opacity 220ms ease-out,
    transform 320ms cubic-bezier(0.4, 0, 0.6, 1);
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
