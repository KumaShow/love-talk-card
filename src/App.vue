<template>
  <RouterView />
  <OrientationGuard />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import OrientationGuard from '@/components/layout/OrientationGuard.vue'
</script>
