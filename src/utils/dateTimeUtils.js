/**
 * Các hàm tiện ích xử lý thời gian và ngày tháng
 */

/**
 * Định dạng thời gian theo giờ:phút:giây
 * @param {number} timeInMs - Thời gian tính bằng milliseconds
 * @returns {string} Chuỗi thời gian định dạng HH:MM:SS
 */
export const formatTime = (timeInMs) => {
  const hours = Math.floor(timeInMs / 3600000)
  const minutes = Math.floor((timeInMs % 3600000) / 60000)
  const seconds = Math.floor((timeInMs % 60000) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Định dạng khoảng thời gian theo giờ phút giây
 * @param {number} duration - Khoảng thời gian tính bằng milliseconds
 * @returns {string} Chuỗi thời gian định dạng Xh Ym Zs
 */
export const formatDuration = (duration) => {
  // Kiểm tra và xử lý nếu duration không phải là số hợp lệ
  if (typeof duration !== 'number' || isNaN(duration)) {
    return '0h 0m 0s';
  }
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}

/**
 * Lấy ngày hiện tại theo định dạng YYYY-MM-DD
 * @returns {string} Ngày hiện tại định dạng YYYY-MM-DD
 */
// export const getTodayDate = () => {
//   const today = new Date();
//   return today.toISOString().split('T')[0];
// }
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Chuyển đổi timestamp thành định dạng YYYY-MM-DD
 * @param {number} timestamp - Thời gian tính bằng milliseconds
 * @returns {string} Ngày định dạng YYYY-MM-DD
 */
// export const timestampToDate = (timestamp) => {
//   if (!timestamp) return getTodayDate();
//   const date = new Date(timestamp);
//   return date.toISOString().split('T')[0]; //làm lệch ngày 1 ngày nếu đang ở múi giờ Đông Nam Á (+7)
// }
export const timestampToDate = (timestamp) => {
  if (!timestamp) return getTodayDate();
  const date = new Date(timestamp);

  // Lấy ngày tháng năm theo múi giờ địa phương
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Định dạng ngày tháng chi tiết
 * @param {string} dateStr - Chuỗi ngày tháng
 * @returns {string} Ngày tháng định dạng Thứ-Tháng-Ngày-Năm
 */
export const formatTaskDate = (dateStr) => {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${dayName}-${monthName}-${day}-${year}`;
  } catch (e) {
    return dateStr;
  }
}
/**
 * Định dạng thời gian cho input type="time" HTML
 * @param {Date} date - Đối tượng Date cần định dạng
 * @returns {string} Chuỗi thời gian định dạng HH:MM
 */
export const formatTimeForInput = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    // Trả về giờ hiện tại nếu date không hợp lệ
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}