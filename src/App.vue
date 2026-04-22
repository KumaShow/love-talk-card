<template>
  <RouterView />
  <OrientationGuard />
  <audio
    class="app-bgm"
    data-test="bgm-audio"
    :muted="bgmMuted"
    loop
    preload="auto"
    aria-hidden="true"
  >
    <source v-for="src in bgmSourceUrls" :key="src" :src="src" />
  </audio>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import OrientationGuard from '@/components/layout/OrientationGuard.vue'
import { useAudio } from '@/composables/useAudio'

const { bgmMuted, bgmSourceUrls } = useAudio()
</script>

<style scoped>
.app-bgm {
  display: none;
}
</style>
