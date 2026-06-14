import { createRouter, createWebHashHistory } from 'vue-router'
import EndView from '@/views/EndView.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'
import { consumeDesireAcknowledgement } from '@/router/desire-ack'
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

  const themeId = Array.isArray(to.params.themeId) ? to.params.themeId[0] : to.params.themeId

  if (!isValidThemeId(themeId)) {
    return {
      name: 'home',
    }
  }

  if (to.name === 'game' && themeId === 'desire' && !consumeDesireAcknowledgement()) {
    return {
      name: 'home',
      query: {
        notice: 'desire',
      },
    }
  }

  return true
})

export { isValidThemeId, validThemeIds }
export { acknowledgeDesireOnce, consumeDesireAcknowledgement } from '@/router/desire-ack'
export default router
