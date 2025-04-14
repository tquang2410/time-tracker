<script setup>
import {ref} from "vue";
import {formatDuration, formatTaskDate, timestampToDate} from "@/utils/dateTimeUtils.js";
import DatePicker from "primevue/datepicker";

const props = defineProps({
  tasks: Array,
  currentTaskId: Number,
  isRunning: Boolean,
  isEditing: Number
})
const emit = defineEmits(['deleteTask', 'startEdit', 'stopEdit', 'continueTask']);
// Hàm xử lý sự kiện
const deleteTask = (taskId) =>{
  emit('deleteTask', taskId)
}
const editingData = ref({
  title: '',
  taskDate: null
})
const startEdit = (taskId) =>{
  const task = props.tasks.find(task => task.id === taskId)
  if (task)
  {
    editingData.value = {
      title: task.title,
      taskDate: task.taskDate
    }
  }
  emit('startEdit', taskId)
}
const stopEdit = () =>{
emit('stopEdit',{
  id: props.isEditing,
  title: editingData.value.title,
  taskDate: editingData.value.taskDate
})
}
const continueTask = (taskId) =>{
  emit('continueTask', taskId)
}

</script>

<template>
  <div class="tasks-list">
    <h3>Danh sách công việc</h3>
    <div v-for="task in tasks" :key="task.id" class="task-item">
      <div class="task-info">
        <div class="task-title">
          <template v-if="isEditing === task.id">
            <div class="edit-form">
              <input
                  type="text"
                  v-model="editingData.title"
                  placeholder="Nhập tên task"
              />
              <DatePicker
                  v-model="editingData.taskDate"
                  showIcon
                  inputId="calendar"
                  dateFormat="dd/mm/yy"
                  placeholder="Chọn ngày"
              />
              <div class="edit-actions">
                <button @click="stopEdit">Lưu</button>
              </div>
            </div>
          </template>
          <template v-else>
            {{ task.title }}
          </template>
        </div>
        <!--              Hiện ngày của task-->
        <div class="task-date">{{ formatTaskDate(task.taskDate || timestampToDate(task.startTime)) }}</div>

        <div class="task-actions">
          <template v-if="isEditing !== task.id">
            <button @click="startEdit(task.id)">Sửa</button>
            <button @click="deleteTask(task.id)">Xóa</button>
<!--            <button @click="$emit('delete-task', task.id)">Xóa</button>-->
          </template>
        </div>
      </div>
      <div class="task-duration">{{ formatDuration(task.duration) }}
        <button @click="continueTask(task.id)">
          {{ currentTaskId === task.id && isRunning ? 'Kết thúc' : 'Tiếp tục' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style >

.tasks-list {
  margin-top: 30px;
}

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

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}


</style>