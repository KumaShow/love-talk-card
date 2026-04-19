import { createRouter, createWebHashHistory } from 'vue-router'
import type { ThemeId } from '@/types'
import EndView from '@/views/EndView.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'

const validThemeIds: ThemeId[] = ['attraction', 'self', 'interaction', 'trust']

/** 檢查路由參數中的主題識別碼是否有效。 */
function isValidThemeId(themeId: unknown): themeId is ThemeId {
  return typeof themeId === 'string' && validThemeIds.includes(themeId as ThemeId)
}

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
