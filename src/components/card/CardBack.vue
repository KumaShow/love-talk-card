<template>
  <div class="card-back" data-test="card-back">
    <div class="card-back__ornament" aria-hidden="true">
      <span class="card-back__glyph">♥</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 卡牌背面：統一視覺，主色來自 CSS custom property --color-card-back。 */
</script>

<style scoped>
.card-back {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.75rem;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-card-back) 82%, white),
    var(--color-card-back)
  );
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.35);
  color: white;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back__ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72%;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.25),
    rgba(255, 255, 255, 0) 65%
  );
}

.card-back__glyph {
  font-size: 3.5rem;
  opacity: 0.85;
}
</style>
