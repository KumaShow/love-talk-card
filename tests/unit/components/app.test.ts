import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '@/App.vue'

/** 驗證根元件會渲染路由出口。 */
describe('App', () => {
  it('渲染 RouterView 位置', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<div data-test="router-view" />',
          },
        },
      },
    })

    expect(wrapper.get('[data-test="router-view"]').exists()).toBe(true)
  })
})
