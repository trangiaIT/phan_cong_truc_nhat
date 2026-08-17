// ===== CONSTANTS =====
const names = ['Trang', 'Thảo', 'Khoa', 'Phương', 'Phúc'];
const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// ===== STATE =====
let weekOffset = 0; // 0 = tuần này, 1 = tuần sau, -1 = tuần trước

// ===== DOM ELEMENTS =====
const weekInfo = document.getElementById('weekInfo');
const namesList = document.getElementById('namesList');
const dayCards = Array.from({ length: 6 }, (_, i) => document.getElementById(`day-${i}`));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// ===== HELPER FUNCTIONS =====

/**
 * Tìm Thứ Hai của tuần chứa ngày cho trước
 */
function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi Sunday
  return new Date(d.setDate(diff));
}

/**
 * Lấy Thứ Hai của tuần hiện tại + offset tuần
 */
function getMonday(offsetWeek = 0) {
  const today = new Date();
  const monday = getMondayOfWeek(today);
  monday.setDate(monday.getDate() + offsetWeek * 7);
  return monday;
}

/**
 * Lấy ngày cho một slot (0-5 = Thứ 2-7)
 */
function getDateForDay(slotIndex, offsetWeek = 0) {
  const monday = getMonday(offsetWeek);
  const date = new Date(monday);
  date.setDate(date.getDate() + slotIndex);
  return date;
}

/**
 * Tính số ngày từ mốc tính (Thứ 2 đầu tiên của năm hoặc mốc cố định)
 */
function getDaysSinceOrigin(date) {
  // Mốc: Thứ 2 của tuần đầu tiên trong năm
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const firstMonday = getMondayOfWeek(firstDay);
  
  const timeDiff = date - firstMonday;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff;
}

/**
 * Lấy người trực cho một ngày cụ thể
 */
function getPersonForDate(date) {
  const daysSinceOrigin = getDaysSinceOrigin(date);
  return names[daysSinceOrigin % names.length];
}

/**
 * Định dạng ngày
 */
function formatDate(date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

/**
 * Sinh lịch cho tuần
 */
function renderSchedule() {
  const monday = getMonday(weekOffset);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  
  // Cập nhật tiêu đề tuần
  weekInfo.textContent = `Tuần từ ${formatDate(monday)} - ${formatDate(sunday)}`;
  namesList.textContent = names.join(' → ')
  
  // Render từng ngày
  dayCards.forEach((card, slotIndex) => {
    const date = getDateForDay(slotIndex, weekOffset);
    const person = getPersonForDate(date);
    const dayLabel = card.querySelector('.day-label');
    const dayDate = card.querySelector('.day-date');
    const dayPerson = card.querySelector('.day-person');
    
    dayLabel.textContent = daysOfWeek[slotIndex];
    dayDate.textContent = formatDate(date);
    dayPerson.textContent = person;
    
    // Highlight ngày hôm nay
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      card.classList.add('today');
    } else {
      card.classList.remove('today');
    }
    
    // Animation
    card.classList.remove('pulse');
    setTimeout(() => card.classList.add('pulse'), 10);
  });
}

/**
 * Tải lịch dưới dạng JSON
 */
function downloadJSON() {
  const schedule = [];
  for (let i = 0; i < 6; i++) {
    const date = getDateForDate(i, weekOffset);
    schedule.push({
      day: daysOfWeek[i],
      date: formatDate(date),
      person: getPersonForDate(date)
    });
  }
  
  const monday = getMonday(weekOffset);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  
  const data = {
    generatedAt: new Date().toLocaleString('vi-VN'),
    weekRange: `${formatDate(monday)} - ${formatDate(sunday)}`,
    staffRotation: names,
    schedule: schedule
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const weekStr = weekOffset === 0 ? 'hien-tai' : `+${weekOffset}`;
  a.download = `lich-truc-tuan-${weekStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ===== EVENT LISTENERS =====
prevBtn.addEventListener('click', () => {
  weekOffset--;
  renderSchedule();
});

nextBtn.addEventListener('click', () => {
  weekOffset++;
  renderSchedule();
});

resetBtn.addEventListener('click', () => {
  weekOffset = 0;
  renderSchedule();
});

downloadBtn.addEventListener('click', downloadJSON);

// ===== INITIALIZATION =====
renderSchedule();