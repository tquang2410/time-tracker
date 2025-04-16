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
    <CustomForm
        :showCustomForm="showCustomForm"
        v-model:customTaskDate="customTaskDate"
        v-model:customStartTime="customStartTime"
        v-model:customEndTime="customEndTime"
        @toggleCustomForm="toggleCustomForm"
        @addCustomTask="addCustomTask"
    />
    <div class="timer">
      {{ formattedTime }}
    </div>

<TaskList
    :tasks="tasks"
    :current-task-id="currentTaskId"
    :is-running="isRunning"
    :is-editing="isEditing"
    @delete-task="deleteTask"
    @start-edit="startEdit"
    @stop-edit="stopEdit"
    @continue-task="continueTask"
/>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DatePicker from 'primevue/datepicker'
import TaskList from "@/components/TaskList.vue";
import CustomForm from "@/components/CustomForm.vue";
import { 
  formatTime, 
  formatDuration, 
  getTodayDate, 
  timestampToDate, 
  formatTaskDate,
  formatTimeForInput
} from '../utils/dateTimeUtils'

//Biến trạng thái của bộ đếm thời gian
const elapsedTime = ref(0) //Thời gian đã trôi qua
const startTime = ref(null)
const timerInterval = ref(null) //Lưu id của bộ đếm giờ
const taskTitle = ref('')

//Biến quản lý task
const tasks = ref([])
const isEditing = ref(null)
const currentTaskId = ref(null)
const isRunning = ref(false)

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
    // Check nếu không nhập task
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

    // Nếu tiếp tục một task
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
// Lưu task khi tạo mới hoặc cập nhật
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

const stopEdit = (editedData) => {
  if (isEditing.value) {
    const taskIndex = tasks.value.findIndex(task => task.id === isEditing.value);
    if (taskIndex !== -1) {
      // Cập nhật title từ form
      tasks.value[taskIndex].title = editedData.title;
      
      // Cập nhật và format taskDate
      if (editedData.taskDate) {
        const date = new Date(editedData.taskDate);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          tasks.value[taskIndex].taskDate = `${year}-${month}-${day}`;
        }
      }
    }
  }
  isEditing.value = null;
  saveLocal();
}

const deleteTask = (taskId) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId);
  saveLocal();
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

.task-title input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-row label {
  width: 150px;
  font-weight: bold;
}
</style>