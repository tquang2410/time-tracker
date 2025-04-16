<script setup>

import DatePicker from "primevue/datepicker";
const props = defineProps({
  showCustomForm : Boolean,
  customTaskDate : Date,
  customStartTime : String,
  customEndTime : String
})
const emit = defineEmits(['toggleCustomForm', 'update:customTaskDate', 'update:customStartTime', 'update:customEndTime']);
const handleToggleCustom = () => {
  emit('toggleCustomForm' )
}

const handleDateChange = (date) => {
  emit('update:customTaskDate', date)
}
const updateStartTime = ( event ) => {
  emit('update:customStartTime', event.target.value)
}
const updateEndTime = ( event ) => {
  emit('update:customEndTime', event.target.value)
}

</script>

<template>
  <!-- Button Tuỳ chọn -->
  <div class="custom-option">
    <button @click="handleToggleCustom" :class="{ 'active': showCustomForm }">
      {{ showCustomForm ? 'Thêm task' : 'Tùy chọn' }}
    </button>
  </div>
  <!-- Form tùy chọn thời gian -->
  <div v-if="showCustomForm" class="custom-time-form">
    <div class="form-row">
      <label>Ngày thực hiện:</label>
      <DatePicker
          :value="customTaskDate"
          @update:modelValue="handleDateChange"
          showIcon
          dateFormat="dd/mm/yy"
          placeholder="Chọn ngày"
      />
    </div>
    <div class="form-row">
      <label>Thời gian bắt đầu:</label>
      <input  type="time"
              :value="customStartTime"
              @input="updateStartTime($event)"
      >
    </div>
    <div class="form-row">
      <label>Thời gian kết thúc:</label>
      <input type="time"
             :value="customEndTime"
              @input="updateEndTime($event)"
      >
    </div>
  </div>
</template>

<style scoped>

</style>