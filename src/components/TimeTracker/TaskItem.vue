<template>
  <div class="task-item">
    <div class="task-info">
      <!-- Task title và form chỉnh sửa -->
      <div class="task-title">
        <!-- Nếu đang chỉnh sửa -->
        <template v-if="isEditing">
          <div class="edit-form">
            <input
              type="text"
              v-model="editedTitle"
              placeholder="Nhập tên task"
            />
            <DatePicker
              v-model="editedDate"
              showIcon
              dateFormat="dd/mm/yy"
              placeholder="Chọn ngày"
            />
            <div class="edit-actions">
              <button @click="saveEdit">Lưu</button>
            </div>
          </div>
        </template>
        <!-- Nếu không đang chỉnh sửa -->
        <template v-else>
          {{ task.title }}
        </template>
      </div>

      <!-- Hiển thị ngày tháng -->
      <div class="task-date">
        {{ formatTaskDate(task.taskDate || timestampToDate(task.startTime)) }}
      </div>

      <!-- Các nút hành động -->
      <div class="task-actions" v-if="!isEditing">
        <button @click="$emit('edit')">Sửa</button>
        <button @click="$emit('delete')">Xóa</button>
      </div>
    </div>

    <!-- Hiển thị thời gian và nút tiếp tục -->
    <div class="task-duration">
      {{ formatDuration(task.duration) }}
      <button @click="$emit('continue')">
        {{ isCurrentTask && isRunning ? 'Kết thúc' : 'Tiếp tục' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DatePicker from 'primevue/datepicker'
import { formatDuration, formatTaskDate, timestampToDate } from '../../utils/dateTimeUtils'

// Nhận props từ component cha
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isCurrentTask: {
    type: Boolean,
    default: false
  },
  isRunning: {
    type: Boolean,
    default: false
  }
})

// Định nghĩa các sự kiện
const emit = defineEmits(['edit', 'save', 'delete', 'continue'])

// Biến local cho form chỉnh sửa
const editedTitle = ref('')
const editedDate = ref(null)

// Khởi tạo giá trị khi component được tạo
onMounted(() => {
  editedTitle.value = props.task.title
  editedDate.value = props.task.taskDate
    ? new Date(props.task.taskDate)
    : new Date(props.task.startTime)
})

// Hàm lưu thay đổi khi chỉnh sửa
const saveEdit = () => {
  // Tạo đối tượng chứa các thay đổi
  const updatedTask = {
    title: editedTitle.value
  };

  // Cập nhật taskDate nếu có
  if (editedDate.value) {
    const date = new Date(editedDate.value);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      updatedTask.taskDate = `${year}-${month}-${day}`;
    }
  }

  // Phát ra sự kiện kèm theo dữ liệu đã cập nhật
  emit('save', {
    id: props.task.id,
    updates: updatedTask
  });
}
</script>

<style scoped>
.task-item {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 20px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  align-items: center;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-title {
  display: flex;
  font-weight: bold;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.task-date {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 5px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 5px;
}

.task-duration {
  white-space: nowrap;
  color: #666;
  font-size: 0.95em;
  width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>