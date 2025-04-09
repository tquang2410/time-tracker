<template>
  <div class="input-group">
    <!-- Chỗ nhập tên task -->
    <input
      type="text"
      :value="taskTitle"
      @input="$emit('update:taskTitle', $event.target.value)"
      placeholder="Nhập tên công việc"
    />
    <!-- Nút bắt đầu/dừng -->
    <button v-if="!showCustomForm" @click="$emit('toggle-timer')">
      {{ isRunning ? 'Dừng' : 'Bắt đầu' }}
    </button>
    <!-- Nút tuỳ chọn -->
    <button @click="$emit('toggle-custom-form')" :class="{'active': showCustomForm}">
      {{ showCustomForm ? 'Thêm task' : 'Tuỳ chọn' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  taskTitle: {
    type: String,
    required: true
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  showCustomForm: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:taskTitle', 'toggle-timer', 'toggle-custom-form'])
</script>

<style scoped>
.input-group {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.custom-option {
  margin: 10px 0;
  display: flex;
  justify-content: center;
}

.active {
  background-color: #4caf50;
  color: white;
}
</style>