<template>
  <div class="timer">
    {{ formattedTime }}
  </div>
</template>

<script setup>
defineProps({
  formattedTime: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.timer {
  font-size: 2em;
  font-weight: bold;
  margin: 20px 0;
  text-align: center;
}
</style>