import { ref, onMounted } from 'vue';
import { getTodayDate } from '../utils/dateTimeUtils.js'

export default function useTaskManager() {
  // Các biến trạng thái của task
  const tasks = ref([]); // Danh sách các task
  const currentTaskId = ref(null); // Task hiện tại đang chạy

  // Hàm thêm task mới
  const saveTask = (taskData) => {
    const newTask = {
      id: taskData.id || Date.now(),
      title: taskData.title,
      startTime: taskData.startTime,
      endTime: taskData.endTime || Date.now(),
      duration: taskData.duration || 0,
      taskDate: taskData.taskDate || getTodayDate(),
      status: taskData.status || 'completed',
    }
    tasks.value.unshift(newTask) // Thêm task mới vào đầu danh sách
    saveToLocalStorage() // Lưu danh sách task vào localStorage
    return newTask
  }

  // Hàm cập nhật task
  const updateTask = (taskId, updates) => {
    const index = tasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates }
      saveToLocalStorage()
    }
  }

  // Hàm xoá task
  const deleteTask = (taskId) => {
    tasks.value = tasks.value.filter(task => task.id !== taskId)
    saveToLocalStorage()
  }

  // Hàm lưu danh sách task vào localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  // Hàm lấy danh sách task từ localStorage
  const loadFromLocalStorage = () => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks)
      // Chuyển đổi format của task nếu cần
      migrateExistingTasks()
    }
  }

  // Chuyển đổi format của task cũ sang format mới
  const migrateExistingTasks = () => {
    tasks.value = tasks.value.map(task => {
      // Thêm thông tin ngày tháng nếu chưa có
      if (!task.taskDate) {
        task.taskDate = task.startTime 
          ? getTodayDate(task.startTime) 
          : getTodayDate();
      }
      // Thêm thông tin thời gian kết thúc nếu chưa có
      if (!task.endTime) {
        task.endTime = (task.startTime && task.duration) 
          ? task.startTime + task.duration 
          : Date.now();
      }
      return task;
    });
    saveToLocalStorage();
  }

  // Khi component được tạo, đọc dữ liệu từ localStorage
  onMounted(() => {
    loadFromLocalStorage()
  })

  // Trả về các biến và hàm để sử dụng bên ngoài
  return {
    tasks,
    currentTaskId,
    saveTask,
    updateTask,
    deleteTask,
    loadFromLocalStorage
  }
}
