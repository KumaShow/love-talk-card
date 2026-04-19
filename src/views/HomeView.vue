<template>
  <main class="min-h-screen px-6 py-10">
    <section class="mx-auto max-w-3xl space-y-6">
      <header class="space-y-3 text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-[color:var(--color-primary)]">
          {{ zhTw.app.title }}
        </p>
        <h1 class="text-3xl font-semibold md:text-4xl">{{ zhTw.home.title }}</h1>
        <p class="text-base text-[color:var(--color-text)]/80">
          {{ zhTw.home.description }}
        </p>
      </header>

      <section class="grid gap-4 md:grid-cols-2">
        <RouterLink
          v-for="theme in cardsData.themes"
          :key="theme.id"
          :to="{ name: 'game', params: { themeId: theme.id } }"
          class="block rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p class="text-sm uppercase tracking-[0.2em] text-[color:var(--color-primary)]">
            {{ zhTw.labels.theme }}
          </p>
          <h2 class="mt-2 text-2xl font-semibold">{{ theme.name.zh }}</h2>
          <p class="mt-3 text-sm text-[color:var(--color-text)]/80">
            {{ theme.description.zh }}
          </p>
          <p class="mt-4 text-sm font-medium">{{ zhTw.actions.start }}</p>
        </RouterLink>
      </section>

      <footer class="rounded-3xl bg-white/60 p-5 text-center text-sm text-[color:var(--color-text)]/75">
        {{ zhTw.home.intimateModeHint }}
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'
</script>
