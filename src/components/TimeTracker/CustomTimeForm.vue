<template>
  <div class="custom-time-form">
    <!-- Form chọn ngày tháng năm -->
    <div class="form-row">
      <label>Ngày thực hiện: </label>
      <DatePicker
        :modelValue="taskDate"
        @update:modelValue="$emit('update:taskDate', $event)"
        showIcon
        dateFormat="dd/mm/yy"
        placeholder="Chọn ngày"
      />
    </div>
    <!-- Form chọn giờ -->
    <div class="form-row">
      <label>Thời gian bắt đầu: </label>
      <input
        type="time"
        :value="startTime"
        @input="$emit('update:startTime', $event.target.value)"
      />
    </div>
    <div class="form-row">
      <label>Thời gian kết thúc: </label>
      <input
        type="time"
        :value="endTime"
        @input="$emit('update:endTime', $event.target.value)"
      />
    </div>
  </div>
  <div class="form-row form-buttons">
    <button @click="$emit('add-custom-task')">Thêm task</button>
  </div>
</template>

<script setup>
import DatePicker from 'primevue/datepicker';

defineProps({
  taskDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
})

defineEmits(['update:taskDate', 'update:startTime', 'update:endTime', 'add-custom-task'])
</script>

<style scoped>
.custom-time-form {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.form-row label {
  width: 150px;
  font-weight: bold;
}

.form-buttons {
  justify-content: flex-end;
}
</style>