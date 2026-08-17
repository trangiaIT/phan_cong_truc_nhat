// ===== CONSTANTS =====
const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const defaultNames = ['Trang', 'Thảo', 'Khoa', 'Phương', 'Phúc'];

// ===== STATE =====
let names = [...defaultNames];
let startIndex = 0;

// ===== DOM ELEMENTS =====
const namesInput = document.getElementById('names-input');
const generateBtn = document.getElementById('generateBtn');
const rotateBtn = document.getElementById('rotateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const dayCards = Array.from({ length: 6 }, (_, i) => document.getElementById(`day-${i}`));

// ===== FUNCTIONS =====

/**
 * Đọc danh sách người từ input hoặc sử dụng mặc định
 */
function readNamesFromInput() {
  const inputValue = namesInput.value.trim();
  if (inputValue) {
    const parsed = inputValue.split(',').map(n => n.trim()).filter(n => n !== '');
    if (parsed.length > 0) return parsed;
  }
  return [...defaultNames];
}

/**
 * Sinh lịch trực tự động
 */
function renderSchedule() {
  names = readNamesFromInput();
  namesInput.value = names.join(', ');
  
  dayCards.forEach((card, i) => {
    const person = names[(startIndex + i) % names.length];
    const personElement = card.querySelector('.day-person');
    personElement.textContent = person;
    
    // Animation effect
    card.classList.remove('pulse');
    setTimeout(() => card.classList.add('pulse'), 10);
  });
}

/**
 * Dịch vòng (rotate) danh sách người
 */
function rotateOnce() {
  startIndex = (startIndex + 1) % names.length;
  renderSchedule();
}

/**
 * Tải lịch dưới dạng JSON
 */
function downloadJSON() {
  const schedule = days.map((d, i) => ({
    day: d,
    person: names[(startIndex + i) % names.length]
  }));
  
  const data = {
    generatedAt: new Date().toLocaleString('vi-VN'),
    week: `${new Date().toLocaleDateString('vi-VN')}`,
    schedule: schedule
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lich-truc-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Khôi phục mặc định
 */
function resetDefaults() {
  names = [...defaultNames];
  startIndex = 0;
  namesInput.value = names.join(', ');
  renderSchedule();
}

// ===== EVENT LISTENERS =====
generateBtn.addEventListener('click', renderSchedule);
rotateBtn.addEventListener('click', rotateOnce);
downloadBtn.addEventListener('click', downloadJSON);
resetBtn.addEventListener('click', resetDefaults);

// Hỗ trợ phím Enter trong input
namesInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    renderSchedule();
  }
});

// ===== INITIALIZATION =====
// Hiển thị lịch tự động khi load trang
renderSchedule();
