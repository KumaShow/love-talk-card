<template>
  <div
    class="card-back absolute inset-0 flex items-center justify-center rounded-[var(--radius-card)] text-white shadow-[var(--shadow-card)]"
    data-test="card-back"
  >
    <div
      class="card-ornament flex aspect-square w-[72%] items-center justify-center rounded-[var(--radius-pill)] border border-white/45"
      aria-hidden="true"
    >
      <span class="text-[3.5rem] opacity-85">♥</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 卡牌背面：統一視覺，主色來自 CSS custom property --color-card。 */
</script>

<style scoped>
/* 卡背漸層 + 3D 背面隱藏：color-mix 與 backface-visibility 不易用 utility 表達，保留 scoped */
.card-back {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-card) 82%, white),
    var(--color-card)
  );
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 裝飾光暈：徑向漸層保留 scoped */
.card-ornament {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.25),
    rgba(255, 255, 255, 0) 65%
  );
}
</style>
