// ===== CONSTANTS =====
const names = ['Thảo', 'Khoa', 'Phương', 'Phúc', 'Trang'];
const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// ===== STATE =====
let weekOffset = 0; // 0 = tuần này, 1 = tuần sau, -1 = tuần trước

// ===== DOM ELEMENTS =====
const weekInfo = document.getElementById('weekInfo');
const namesList = document.getElementById('namesList');
const dayCards = Array.from({ length: daysOfWeek.length }, (_, i) => document.getElementById(`day-${i}`));
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
  const day = d.getDay(); // 0 (Sun) .. 6 (Sat)
  // Calculate difference so that Monday is returned.
  // If Sunday (0), go back 6 days; otherwise go back (day - 1).
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
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
 * Tính số ngày từ mốc tính (Thứ Hai, 24/08/2026)
 * Mốc cố định: Thứ Hai, 24/08/2026 sẽ là Thảo (index 0)
 */
function getDaysSinceOrigin(date) {
  const originDate = new Date(2026, 7, 24); // Month 7 = August (0-based)
  originDate.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const timeDiff = targetDate - originDate;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}

/**
 * Lấy người trực cho một ngày cụ thể
 * Handles negative daysSinceOrigin using safe modulo.
 */
function getPersonForDate(date) {
  const daysSinceOrigin = getDaysSinceOrigin(date);
  const n = names.length;
  const index = ((daysSinceOrigin % n) + n) % n; // safe modulo
  return names[index];
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
  // End of displayed range is Thứ Bảy (since we have 6 day cards)
  const endOfWeek = new Date(monday);
  endOfWeek.setDate(monday.getDate() + daysOfWeek.length - 1);

  // Cập nhật tiêu đề tuần
  weekInfo.textContent = `Tuần từ ${formatDate(monday)} - ${formatDate(endOfWeek)}`;
  namesList.textContent = names.join(' → ');

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
  for (let i = 0; i < daysOfWeek.length; i++) {
    const date = getDateForDay(i, weekOffset);
    schedule.push({
      day: daysOfWeek[i],
      date: formatDate(date),
      person: getPersonForDate(date)
    });
  }

  const monday = getMonday(weekOffset);
  const endOfWeek = new Date(monday);
  endOfWeek.setDate(monday.getDate() + daysOfWeek.length - 1);

  const data = {
    generatedAt: new Date().toLocaleString('vi-VN'),
    weekRange: `${formatDate(monday)} - ${formatDate(endOfWeek)}`,
    staffRotation: names,
    schedule: schedule
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const weekStr = weekOffset === 0 ? 'hien-tai' : (weekOffset > 0 ? `tuan+${weekOffset}` : `tuan${weekOffset}`);
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
