<template>
  <main class="poc-home">
    <section class="poc-home__inner">
      <header class="poc-home__header">
        <p class="poc-home__eyebrow">POC · UX 重塑預覽</p>
        <h1 class="poc-home__title">挑選一副牌堆</h1>
        <p class="poc-home__description">四個主題，四副蓋著的卡牌，點選一副就開始今晚的對話。</p>
      </header>

      <div class="poc-home__toggle">
        <ToggleSwitch
          :model-value="settingsStore.intimateMode"
          data-test="intimate-toggle"
          label="私密模式"
          @update:model-value="handleToggleIntimate"
        />
        <p class="poc-home__toggle-hint">加入 5 張更貼近身體與情感的題目。</p>
      </div>

      <ul class="poc-home__grid" data-test="poc-home-grid">
        <li v-for="theme in dataset.themes" :key="theme.id">
          <PocThemeCard :theme="theme" @select="handleSelect" />
        </li>
      </ul>

      <footer class="poc-home__footer">
        CP2 — 點選任一主題可預覽卡面並開始對話；CP3 再加扇形抽牌。
      </footer>
    </section>

    <PocHomePreview
      :theme="selectedTheme"
      @start="handleStart"
      @dismiss="selectedTheme = null"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import PocHomePreview from '@/components/poc/PocHomePreview.vue'
import PocThemeCard from '@/components/poc/PocThemeCard.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import cardsData from '@/data/cards.json'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { CardsData, Theme } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const dataset = cardsData as CardsData

const selectedTheme = ref<Theme | null>(null)

function handleToggleIntimate(): void {
  settingsStore.toggleIntimateMode()
}

function handleSelect(theme: Theme): void {
  selectedTheme.value = theme
}

function handleStart(theme: Theme): void {
  gameStore.startSession(theme.id, settingsStore.intimateMode)
  void router.push({ name: 'poc-game', params: { themeId: theme.id } })
}
</script>

<style scoped>
.poc-home {
  min-height: 100vh;
  padding: 2rem 1.25rem 3rem;
}

.poc-home__inner {
  max-width: 30rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.poc-home__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.poc-home__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.poc-home__title {
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: clamp(1.75rem, 6vw, 2.25rem);
  font-weight: 600;
}

.poc-home__description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.poc-home__toggle {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  min-height: 44px;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.75);
}

.poc-home__toggle-hint {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.poc-home__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.poc-home__footer {
  text-align: center;
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
</style>
