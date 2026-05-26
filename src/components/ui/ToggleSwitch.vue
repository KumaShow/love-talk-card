<script setup lang="ts">
/**
 * T043：私密模式切換元件。
 *
 * 膠囊式切換開關，遵循 WAI-ARIA switch pattern：
 * 以 role="switch" 搭配 aria-checked 表達開關狀態，
 * 並以 v-model 雙向綁定 modelValue。
 * 觸控區最小 2.75rem x 2.75rem 以符合可存取性標準。
 */
defineOptions({ name: 'ToggleSwitch' })

const props = withDefaults(
  defineProps<{
    /** 目前開關值，true 表示啟用 */
    modelValue: boolean
    /** 是否停用互動 */
    disabled?: boolean
    /** 可選文字標籤（亦可透過 default slot 提供） */
    label?: string
  }>(),
  {
    disabled: false,
    label: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

/**
 * 點擊處理：停用狀態提前返回以避免 emit。
 */
function handleClick(): void {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border-0 bg-transparent px-2 py-1 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
    role="switch"
    :data-on="modelValue ? 'true' : 'false'"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-label="label || undefined"
    :tabindex="disabled ? -1 : 0"
    :disabled="disabled"
    @click="handleClick"
  >
    <span
      class="toggle-track relative inline-block h-6 w-11 rounded-[var(--radius-pill)]"
      aria-hidden="true"
    >
      <span
        class="toggle-thumb absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-[160ms]"
      />
    </span>
    <span v-if="$slots.default || label" class="text-[0.95rem] font-medium">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<style scoped>
/*
 * 軌道底色與開關狀態切換以 color-mix／主題色驅動，並以 data-on 屬性
 * 取代原本的 BEM modifier（.toggle-switch--on），保留 scoped 以承載 color-mix。
 */
.toggle-track {
  background: color-mix(in srgb, var(--color-ink) 20%, transparent);
  transition: background-color 160ms ease;
}

[data-on='true'] .toggle-track {
  background: var(--color-brand);
}

[data-on='true'] .toggle-thumb {
  transform: translateX(1.25rem);
}
</style>
