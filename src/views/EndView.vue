<template>
  <main class="min-h-screen px-6 py-10">
    <section class="mx-auto max-w-xl space-y-6 text-center">
      <article class="rounded-[2rem] bg-white/75 p-8 shadow-sm">
        <p class="text-sm uppercase tracking-[0.2em] text-[color:var(--color-primary)]">
          {{ zhTw.end.title }}
        </p>
        <h1 class="mt-3 text-3xl font-semibold">{{ currentTheme?.name.zh }}</h1>
        <p class="mt-4 text-base text-[color:var(--color-text)]/80">
          {{ currentTheme?.endMessage.zh }}
        </p>
        <RouterLink
          :to="{ name: 'home' }"
          class="mt-6 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-6 py-3 text-sm font-medium text-white shadow-sm"
        >
          {{ zhTw.actions.finish }}
        </RouterLink>
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
</script>
