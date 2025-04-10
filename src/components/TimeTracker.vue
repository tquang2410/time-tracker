<template>
  <div class="timer-form">
    <div class="input-group">
      <input
          type="text"
          v-model="taskTitle"
          placeholder="Nhập task "
      >
<!--      Không hiện toggleTimer khi đang mở form tùy chọn-->
      <button v-if="!showCustomForm" @click="toggleTimer">
        {{ isRunning ? 'Dừng' : 'Bắt đầu' }}
      </button>
    </div>
    <!-- Button Tuỳ chọn -->
    <div class="custom-option">
      <button @click="toggleCustomForm" :class="{ 'active': showCustomForm }">
        {{ showCustomForm ? 'Thêm task' : 'Tùy chọn' }}
      </button>
    </div>
    <!-- Form tùy chọn thời gian -->
    <div v-if="showCustomForm" class="custom-time-form">
      <div class="form-row">
        <label>Ngày thực hiện:</label>
        <DatePicker
            v-model="customTaskDate"
            showIcon
            dateFormat="dd/mm/yy"
            placeholder="Chọn ngày"
        />
      </div>
      <div class="form-row">
        <label>Thời gian bắt đầu:</label>
        <input type="time" v-model="customStartTime">
      </div>
      <div class="form-row">
        <label>Thời gian kết thúc:</label>
        <input type="time" v-model="customEndTime">
      </div>
    </div>

    <div class="timer">
      {{ formattedTime }}
    </div>

    <div class="tasks-list">
      <h3>Danh sách công việc</h3>
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-info">
          <div class="task-title">
            <template v-if="isEditing === task.id">
              <div class="edit-form">
                <input
                    type="text"
                    v-model="task.title"
                    placeholder="Nhập tên task"
                />
                <DatePicker
                    v-model="task.taskDate"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DatePicker from 'primevue/datepicker'
import { 
  formatTime, 
  formatDuration, 
  getTodayDate, 
  timestampToDate, 
  formatTaskDate,
  formatTimeForInput
} from '../utils/dateTimeUtils'

//Biến trạng thái của bộ đếm thời gian
const isRunning = ref(false)
const elapsedTime = ref(0) //Thời gian đã trôi qua
const startTime = ref(null)
const timerInterval = ref(null) //Lưu id của bộ đếm giờ
const taskTitle = ref('')

//Biến quản lý task
const tasks = ref([])
const isEditing = ref(null)
const currentTaskId = ref(null)

//Biến quản lý form
const showCustomForm = ref(false)
const customTaskDate = ref(new Date())
const customStartTime = ref('')
const customEndTime = ref('')

const formattedTime = computed(() => {
  return formatTime(elapsedTime.value)
})

// Chuyển đổi format của task
const migrateExistingTasks = () => {
  tasks.value = tasks.value.map(task => {
    //Thêm thông tin ngày tháng nếu chưa có
    if (!task.taskDate) {
      task.taskDate = task.startTime 
        ? timestampToDate(task.startTime) 
        : getTodayDate();
    }
    //Thêm thông tin thời gian kết thúc nếu chưa có
    if (!task.endTime) {
      task.endTime = (task.startTime && task.duration) 
        ? task.startTime + task.duration 
        : Date.now();
    }
    return task;
  });
  saveLocal();
}

const toggleTimer = () => {
  if (!isRunning.value) {
    //Check nếu không nhập task
    if (!taskTitle.value.trim()) {
      alert('Hãy nhập task')
      taskTitle.value = ''
      return
    }
    // Bắt đầu bộ đếm giờ
    startTime.value = Date.now()
    isRunning.value = true

    timerInterval.value = setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value
    }, 1000)
  } else {
    // Dừng bộ đếm giờ
    clearInterval(timerInterval.value)
    isRunning.value = false

    // If continuing an existing task
    if (currentTaskId.value) {
      const taskIndex = tasks.value.findIndex(task => task.id === currentTaskId.value)
      if (taskIndex !== -1) {
        // Cập nhật lại thời gian cũ + thời gian vừa đếm được
        tasks.value[taskIndex].duration += elapsedTime.value
        tasks.value[taskIndex].endTime = Date.now()
        saveLocal()
      }
      // Reset lại
      currentTaskId.value = null
      taskTitle.value = ''
      elapsedTime.value = 0
    } 
    // Nếu có một task đang chạy mà không phải task được chọn
    else if (taskTitle.value.trim()) {
      // Lưu lại task đó
      saveTask()
      // Reset lại
      taskTitle.value = ''
      elapsedTime.value = 0
    } else {
      elapsedTime.value = 0
    }
  }
}

const saveTask = (options = {}) => {
  // Đảm bảo duration luôn là một số hợp lệ
  let duration = options.duration || elapsedTime.value;
  if (typeof duration !== 'number' || isNaN(duration)) {
    duration = 0;
  }

  const taskData = {
    id: options.id || Date.now(),
    title: options.title || taskTitle.value,
    startTime: options.startTime || startTime.value,
    endTime: options.endTime || Date.now(),
    duration: duration,
    taskDate: options.taskDate || getTodayDate(),
    status: options.status || 'completed'
  }
  tasks.value.unshift(taskData)
  saveLocal()
  return taskData
}

const saveLocal = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

const startEdit = (taskId) => {
  isEditing.value = taskId;
}

const stopEdit = () => {
  // Nếu đang chỉnh sửa task nào đó
  if (isEditing.value) {
    const editingTask = tasks.value.find(task => task.id === isEditing.value);
    if (editingTask && editingTask.taskDate) {
      // Sử dụng ngày đã chọn, không bị ảnh hưởng bởi múi giờ
      const date = new Date(editingTask.taskDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        editingTask.taskDate = `${year}-${month}-${day}`;
      }
    }
  }

  isEditing.value = null;
  saveLocal();
}

const deleteTask = (taskId) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId);
}

const continueTask = (taskId) => {
  const taskToContinue = tasks.value.find(task => task.id === taskId);

  if (isRunning.value) {
    clearInterval(timerInterval.value);
    isRunning.value = false;
    if (currentTaskId.value) {
      const currentRunningTask = tasks.value.find(task => task.id === currentTaskId.value);
      if (currentRunningTask) {
        currentRunningTask.duration += elapsedTime.value;
        currentRunningTask.endTime = Date.now();
        saveLocal();
      }
    }
    // Lưu lại task đang chạy nếu đột ngột chạy bộ đếm giờ cho một task khác
    else if (taskTitle.value.trim()) {
      saveTask();
    }

    if (currentTaskId.value === taskId) {
      currentTaskId.value = null;
      taskTitle.value = '';
      elapsedTime.value = 0;
      return;
    }
  }

  // Bắt đầu chạy task được chọn
  taskTitle.value = taskToContinue.title;
  currentTaskId.value = taskId;
  startTime.value = Date.now();
  elapsedTime.value = 0;
  isRunning.value = true;

  // Tăng thời gian đếm cho task đang chạy mỗi 1 giây
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value;
  }, 1000);
}

const toggleCustomForm = () => {
  // Nếu có task đang chạy, lập tức dừng và lưu task
  if (isRunning.value) {
    clearInterval(timerInterval.value);
    isRunning.value = false;
    if (taskTitle.value.trim())
    {
      saveTask();
      taskTitle.value = '';
      elapsedTime.value = 0;
    }
  }
  // Đảo ngược trạng thái hiển thị của form tùy chọn (nếu đang hiện -> ẩn, nếu đang ẩn -> hiện)
  showCustomForm.value = !showCustomForm.value;
  
  // Nếu bật form lên
  if (showCustomForm.value) {
    // Thì lấy ngày hiện tại làm mặc định
    customTaskDate.value = new Date();
    
    // Tạo thời gian bắt đầu mặc định
    customStartTime.value = formatTimeForInput(new Date());
    
    // Tạo thời gian kết thúc mặc định (thêm 1 giờ)
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 1);
    customEndTime.value = formatTimeForInput(endDate);
  } 
  // Nếu đóng form và có tên task
  else if (taskTitle.value.trim()) {
    addCustomTask();
  } else {
    console.log('Form tùy chọn đã được đóng');
  }
}

const addCustomTask = () => {
  // Kiểm tra nếu chưa nhập task
  if (!taskTitle.value.trim()) {
    alert('Hãy nhập task');
    return;
  }

  try {
    // Lấy giá trị ngày từ DatePicker
    const selectedDate = new Date(customTaskDate.value);
    if (isNaN(selectedDate.getTime())) {
      throw new Error('Ngày không hợp lệ');
    }
    
    // Xử lý giờ bắt đầu
    const startTimeParts = customStartTime.value.split(':');
    const startHour = parseInt(startTimeParts[0], 10); // Dùng radix 10
    const startMinute = parseInt(startTimeParts[1], 10);
    
    // Kiểm tra giá trị hợp lệ
    if (isNaN(startHour) || isNaN(startMinute)) {
      throw new Error('Giờ bắt đầu không hợp lệ');
    }
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    // Xử lý giờ kết thúc
    const endTimeParts = customEndTime.value.split(':');
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);
    
    // Kiểm tra giá trị hợp lệ
    if (isNaN(endHour) || isNaN(endMinute)) {
      throw new Error('Giờ kết thúc không hợp lệ');
    }
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Kiểm tra logic
    if (endDateTime <= startDateTime) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }
    
    // Tính thời gian thực hiện
    const duration = endDateTime.getTime() - startDateTime.getTime();
    
    // Định dạng ngày tháng
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Thêm 0 vào trước tháng nếu cần
    const day = String(selectedDate.getDate()).padStart(2, '0'); // Thêm 0 vào trước ngày nếu cần
    const formattedDate = `${year}-${month}-${day}`;
    
    // Lưu task mới
    saveTask({
      title: taskTitle.value,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration: duration,
      taskDate: formattedDate
    });
    
    // Reset form
    taskTitle.value = '';
    showCustomForm.value = false;
 
  } catch (error) {
    console.error('Lỗi ', error);

  }
}

onMounted(() => {
  const savedTasks = localStorage.getItem('tasks')
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks)
    // Cập nhật lại task đã lưu
    migrateExistingTasks()
  }
})
</script>

<style scoped>
.timer-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.timer {
  font-size: 2em;
  font-weight: bold;
  margin: 20px 0;
  text-align: center;
}

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

.task-title input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

/* CSS cho form tùy chọn */
.custom-option {
  margin: 10px 0;
  display: flex;
  justify-content: center;
}

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
.active-option {
  background-color: #4caf50;
  color: white;
}
</style>