/**
 * Trích xuất YouTube Video ID từ link hoặc trả về chính ID nếu đã hợp lệ
 * @param {string} url - YouTube URL hoặc ID
 * @returns {string} - 11 ký tự YouTube Video ID hoặc chuỗi rỗng
 */
function extractYouTubeId(url) {
  if (!url) return '';
  url = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

module.exports = {
  extractYouTubeId
};
