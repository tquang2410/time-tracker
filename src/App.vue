<template>
  <div>
<!--    <div class="flex-auto">-->
<!--      <label for="calendar" class="font-bold block mb-2"> Calendar </label>-->
<!--      <DatePicker v-model="calendar" showIcon fluid :showOnFocus="false" inputId="calendar" />-->
<!--    </div>-->
    <TimeTracker/>

  </div>
</template>

<script setup>
import TimeTracker from './components/TimeTracker.vue'

import DatePicker from 'primevue/datepicker';

import { ref } from "vue";
const calendar = ref(null);


</script>

<style scoped>

</style>