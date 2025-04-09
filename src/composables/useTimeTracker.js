// Nơi chứa logic xử lý bộ đếm thời gian
import { ref, computed } from 'vue';
import { formatTime } from '../utils/dateTimeUtils';

export default function useTimeTracker() {
  // Trạng thái của bộ đếm thời gian
  const isRunning = ref(false);
  const elapsedTime = ref(0); // Thời gian đã trôi qua
  const startTime = ref(null);
  const timerInterval = ref(null); // Lưu id của interval để dừng thời gian

  // Định dạng thời gian
  const formattedTime = computed(() => {
    return formatTime(elapsedTime.value)
  })

  // Bắt đầu đếm thời gian
  const startTimer = () => {
    startTime.value = Date.now()
    isRunning.value = true;
    // Cập nhật thời gian đã trôi qua mỗi giây
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value
    }, 1000)
  }

  // Dừng bộ đếm thời gian
  const stopTimer = () => {
    clearInterval(timerInterval.value)
    isRunning.value = false;
    return elapsedTime.value
  }

  // Hàm reset lại thời gian
  const resetTimer = () => {
    elapsedTime.value = 0
  }

  // Trả về các biến và hàm để sử dụng trong component
  return {
    isRunning,
    elapsedTime,
    startTime,
    formattedTime,
    timerInterval,
    startTimer,
    stopTimer,
    resetTimer
  }
}
