<template>
  <main class="flex min-h-screen items-center justify-center px-5 pb-12 pt-10">
    <section class="flex w-full max-w-md flex-col items-center gap-4">
      <p class="text-xs uppercase tracking-normal text-brand">{{ zhTw.end.title }}</p>
      <h1 class="text-center text-[1.8rem] font-semibold max-[23rem]:text-[1.5rem]">
        {{ currentTheme?.name.zh }}
      </h1>
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
import { cardsData } from '@/data'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import { isValidThemeId } from '@/utils/theme'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const { applyTheme } = useTheme()

const routeThemeId = computed(() => {
  const raw = route.params.themeId
  return Array.isArray(raw) ? raw[0] : raw
})

const currentTheme = computed(() => {
  const id = routeThemeId.value
  if (!isValidThemeId(id)) {
    return null
  }
  return cardsData.themes.find((theme) => theme.id === id) ?? null
})

onMounted(() => {
  const id = routeThemeId.value
  if (!isValidThemeId(id)) {
    void router.replace({ name: 'home' })
    return
  }
  // 直接以 URL 開啟或重新整理 EndView 時，仍要維持對應主題的氛圍色
  applyTheme(id, cardsData.themes)
})

function handleBack() {
  gameStore.$reset()
  void router.push({ name: 'home' })
}
</script>
