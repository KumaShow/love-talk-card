<script setup lang="ts">
/**
 * T043：私密模式切換元件。
 *
 * 膠囊式切換開關，遵循 WAI-ARIA switch pattern：
 * 以 role="switch" 搭配 aria-checked 表達開關狀態，
 * 並以 v-model 雙向綁定 modelValue。
 * 觸控區最小 44x44px 以符合可存取性標準。
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
    class="toggle-switch"
    :class="{
      'toggle-switch--on': modelValue,
      'toggle-switch--disabled': disabled,
    }"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-label="label || undefined"
    :tabindex="disabled ? -1 : 0"
    :disabled="disabled"
    :style="{ minWidth: '44px', minHeight: '44px' }"
    @click="handleClick"
  >
    <span class="toggle-switch__track" aria-hidden="true">
      <span class="toggle-switch__thumb" />
    </span>
    <span v-if="$slots.default || label" class="toggle-switch__label">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 999px;
}

.toggle-switch:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.toggle-switch__track {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-text) 20%, transparent);
  transition: background-color 160ms ease;
}

.toggle-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 160ms ease;
}

.toggle-switch--on .toggle-switch__track {
  background: var(--color-primary);
}

.toggle-switch--on .toggle-switch__thumb {
  transform: translateX(20px);
}

.toggle-switch--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.toggle-switch__label {
  font-size: 0.95rem;
  font-weight: 500;
}
</style>
