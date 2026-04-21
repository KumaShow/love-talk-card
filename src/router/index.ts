import { createRouter, createWebHashHistory } from 'vue-router'
import EndView from '@/views/EndView.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'
import { isValidThemeId, validThemeIds } from '@/utils/theme'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/game/:themeId',
      name: 'game',
      component: GameView,
      meta: {
        requiresValidThemeId: true,
      },
    },
    {
      path: '/end/:themeId',
      name: 'end',
      component: EndView,
      meta: {
        requiresValidThemeId: true,
      },
    },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.requiresValidThemeId) {
    return true
  }

  if (isValidThemeId(to.params.themeId)) {
    return true
  }

  return {
    name: 'home',
  }
})

export { isValidThemeId, validThemeIds }
export default router
