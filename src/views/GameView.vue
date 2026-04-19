<template>
  <main class="min-h-screen px-6 py-10">
    <section class="mx-auto max-w-xl space-y-6">
      <RouterLink
        :to="{ name: 'home' }"
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/80 px-4 text-sm font-medium shadow-sm"
      >
        {{ zhTw.actions.back }}
      </RouterLink>

      <article class="rounded-[2rem] bg-white/75 p-6 shadow-sm">
        <p class="text-sm uppercase tracking-[0.2em] text-[color:var(--color-primary)]">
          {{ zhTw.labels.theme }}
        </p>
        <h1 class="mt-3 text-3xl font-semibold">{{ currentTheme?.name.zh }}</h1>
        <p class="mt-3 text-base text-[color:var(--color-text)]/80">
          {{ currentTheme?.description.zh }}
        </p>
        <div class="mt-6 rounded-3xl border border-dashed border-[color:var(--color-secondary)] p-6 text-center">
          <p class="text-sm">{{ zhTw.actions.draw }}</p>
          <p class="mt-3 text-lg font-medium">{{ previewCard?.text.zh }}</p>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'

const route = useRoute()

const routeThemeId = computed(() => String(route.params.themeId ?? ''))

const currentTheme = computed(() =>
  cardsData.themes.find((theme) => theme.id === routeThemeId.value),
)

const previewCard = computed(() =>
  cardsData.cards.find((card) => card.theme === routeThemeId.value && !card.isIntimate),
)
</script>
