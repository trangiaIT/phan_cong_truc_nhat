// Các ngày từ Thứ 2 → Thứ 7
const days = ['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];

// Mặc định 5 người (bạn có thể thay)
let names = ['Người 1','Người 2','Người 3','Người 4','Người 5'];

// startIndex giúp dịch vòng quay (rotate)
let startIndex = 0;

const nameInputs = Array.from({length:5},(_,i)=>document.getElementById(`name${i}`));
const generateBtn = document.getElementById('generateBtn');
const rotateBtn = document.getElementById('rotateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const scheduleTableBody = document.querySelector('#scheduleTable tbody');

function readNamesFromInputs(){
  const vals = nameInputs.map(inp => inp.value.trim()).filter(v => v !== '');
  if(vals.length === 5) return vals;
  // nếu chưa nhập đủ 5 tên, lấy từng input nếu có, không trống thì thay, ngược lại dùng default theo vị trí
  const result = nameInputs.map((inp,i)=> inp.value.trim() || names[i]);
  return result;
}

function renderSchedule(){
  names = readNamesFromInputs();
  scheduleTableBody.innerHTML = '';
  for(let i=0;i<days.length;i++){
    const person = names[(startIndex + i) % names.length];
    const tr = document.createElement('tr');
    if(i === 0) tr.classList.add('highlight'); // optional: đánh dấu ngày đầu
    const tdDay = document.createElement('td');
    tdDay.textContent = days[i];
    const tdPerson = document.createElement('td');
    tdPerson.textContent = person;
    tr.appendChild(tdDay);
    tr.appendChild(tdPerson);
    scheduleTableBody.appendChild(tr);
  }
}

function rotateOnce(){
  startIndex = (startIndex + 1) % names.length;
  renderSchedule();
}

function downloadJSON(){
  const schedule = days.map((d,i)=>({day:d, person: names[(startIndex+i)%names.length]}));
  const blob = new Blob([JSON.stringify({generatedAt: new Date().toISOString(), schedule}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetDefaults(){
  names = ['Người 1','Người 2','Người 3','Người 4','Người 5'];
  startIndex = 0;
  nameInputs.forEach((inp,i)=> inp.value = '');
  renderSchedule();
}

generateBtn.addEventListener('click', renderSchedule);
rotateBtn.addEventListener('click', rotateOnce);
downloadBtn.addEventListener('click', downloadJSON);
resetBtn.addEventListener('click', resetDefaults);

// khởi tạo UI với mặc định
renderSchedule();

// support Enter key: khi người dùng chỉnh input cuối và nhấn Enter -> generate
nameInputs.forEach(inp => inp.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') renderSchedule();
}));
