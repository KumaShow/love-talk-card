<template>
  <main class="end-view">
    <section class="end-view__inner">
      <p class="end-view__eyebrow">{{ zhTw.end.title }}</p>
      <h1 class="end-view__title">{{ currentTheme?.name.zh }}</h1>
      <EndMessage
        v-if="currentTheme"
        :theme="currentTheme"
        :eyebrow="zhTw.app.title"
        :cta-label="zhTw.actions.finish"
        @back="handleBack"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EndMessage from '@/components/ui/EndMessage.vue'
import { useTheme } from '@/composables/useTheme'
import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import type { CardsData } from '@/types'
import { isValidThemeId } from '@/utils/theme'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const { applyTheme } = useTheme()

const dataset = cardsData as CardsData

const routeThemeId = computed(() => {
  const raw = route.params.themeId
  return Array.isArray(raw) ? raw[0] : raw
})

const currentTheme = computed(() => {
  const id = routeThemeId.value
  if (!isValidThemeId(id)) {
    return null
  }
  return dataset.themes.find((theme) => theme.id === id) ?? null
})

onMounted(() => {
  const id = routeThemeId.value
  if (!isValidThemeId(id)) {
    void router.replace({ name: 'home' })
    return
  }
  // 直接以 URL 開啟或重新整理 EndView 時，仍要維持對應主題的氛圍色
  applyTheme(id, dataset.themes)
})

function handleBack() {
  gameStore.$reset()
  void router.push({ name: 'home' })
}
</script>

<style scoped>
.end-view {
  min-height: 100vh;
  padding: 2.5rem 1.25rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-view__inner {
  max-width: 28rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.end-view__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.end-view__title {
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}
</style>
