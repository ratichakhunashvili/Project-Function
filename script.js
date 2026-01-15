const calendar = document.getElementById("calendar");
const fileInput = document.getElementById("excelFile");
const monthYearDisplay = document.getElementById("monthYear");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

const lessonModal = document.getElementById("lessonModal");
const modalDate = document.getElementById("modalDate");
const modalDateValue = document.getElementById("modalDateValue");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const lessonForm = document.getElementById("lessonForm");
const lessonTitle = document.getElementById("lessonTitle");
const lessonTime = document.getElementById("lessonTime");
const lessonDesc = document.getElementById("lessonDesc");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let allEvents = [];
let uploadedFiles = [];

function loadEventsFromStorage() {
  const saved = localStorage.getItem("calendarEvents");
  if (saved) allEvents = JSON.parse(saved);
}

function saveEventsToStorage() {
  localStorage.setItem("calendarEvents", JSON.stringify(allEvents));
}

function loadUploadedFilesFromStorage() {
  const saved = localStorage.getItem("uploadedFiles");
  if (saved) uploadedFiles = JSON.parse(saved);
}

function saveUploadedFilesToStorage() {
  localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
}

function addUploadedFile(fileName) {
  uploadedFiles.push({ name: fileName, uploadedAt: new Date().toLocaleString() });
  saveUploadedFilesToStorage();
  renderUploadedFiles();
}

function renderUploadedFiles() {
  const filesList = document.getElementById("uploadedFilesList");
  filesList.innerHTML = "";

  if (uploadedFiles.length === 0) {
    filesList.innerHTML = "<li class='no-files'>No files uploaded yet</li>";
    return;
  }

  uploadedFiles.forEach((file) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.innerHTML = `
      <span class="file-name">📄 ${file.name}</span>
      <span class="file-time">${file.uploadedAt}</span>
    `;
    filesList.appendChild(li);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadEventsFromStorage();
  loadUploadedFilesFromStorage();
  renderCalendar();
  renderUploadedFiles();
});

prevBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

fileInput.addEventListener("change", handleFile);

function updateMonthYearDisplay() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function excelDateToJSDate(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return new Date(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds()
    );
  }

  if (typeof value === "string") {
    const s = value.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10) - 1;
      const d = parseInt(m[3], 10);
      return new Date(y, mo, d);
    }

    const d = new Date(s);
    if (isNaN(d.getTime())) return null;

    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    );
  }

  if (typeof value === "number") {
    const utcMs = Date.UTC(1899, 11, 30) + Math.round(value * 86400 * 1000);
    const d = new Date(utcMs);
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    );
  }

  return null;
}

function excelTimeToString(value) {
  if (value == null || value === "") return "";

  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  if (typeof value === "object" && ("h" in value || "m" in value)) {
    const hh = String(value.h ?? 0).padStart(2, "0");
    const mm = String(value.m ?? 0).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  if (typeof value === "string") {
    const s = value.trim();
    const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return s;
    const hh = String(parseInt(m[1], 10)).padStart(2, "0");
    const mm = String(parseInt(m[2], 10)).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60);
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const mm = String(totalMinutes % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return "";
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return Number.POSITIVE_INFINITY;
  const m = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return Number.POSITIVE_INFINITY;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateToYMD(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function openModalForDay(day) {
  const ymd = dateToYMD(currentYear, currentMonth, day);
  modalDateValue.value = ymd;
  modalDate.textContent = ymd;
  lessonTitle.value = "";
  lessonTime.value = "";
  lessonDesc.value = "";
  lessonModal.classList.add("open");
  lessonModal.setAttribute("aria-hidden", "false");
  setTimeout(() => lessonTitle.focus(), 0);
}

function closeModal() {
  lessonModal.classList.remove("open");
  lessonModal.setAttribute("aria-hidden", "true");
}

modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);

lessonModal.addEventListener("click", (e) => {
  if (e.target === lessonModal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lessonModal.classList.contains("open")) closeModal();
});

lessonForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = lessonTitle.value.trim();
  const timeStr = excelTimeToString(lessonTime.value);
  const desc = lessonDesc.value.trim();
  const dateStr = modalDateValue.value;

  if (!title || !timeStr || !dateStr) return;

  const newEvent = {
    title,
    description: desc,
    date: dateStr,
    time: timeStr,
    dateObj: excelDateToJSDate(dateStr),
    timeStr: timeStr,
  };

  allEvents.push(newEvent);
  saveEventsToStorage();
  renderCalendar();
  closeModal();
});

function renderCalendar() {
  calendar.innerHTML = "";
  updateMonthYearDisplay();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.id = `day-${day}`;
    dayDiv.innerHTML = `<strong>${day}</strong>`;

    dayDiv.addEventListener("click", (ev) => {
      if (ev.target.closest(".event")) return;
      openModalForDay(day);
    });

    const todays = [];

    for (const event of allEvents) {
      const eventDate = event.dateObj || excelDateToJSDate(event.date);
      if (!eventDate || !(eventDate instanceof Date) || isNaN(eventDate.getTime())) continue;

      if (
        eventDate.getFullYear() === currentYear &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getDate() === day
      ) {
        const title = event.title || "Untitled";
        const timeText = event.timeStr || "";
        todays.push({ title, timeText });
      }
    }

    todays.sort((a, b) => parseTimeToMinutes(a.timeText) - parseTimeToMinutes(b.timeText));

    for (const ev of todays) {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event";

      let html = `<div class="event-title">${ev.title}</div>`;
      if (ev.timeText) html += `<div class="event-time">${ev.timeText}</div>`;

      eventDiv.innerHTML = html;
      dayDiv.appendChild(eventDiv);
    }

    calendar.appendChild(dayDiv);
  }
}

function handleFile(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  let filesProcessed = 0;
  let allNewEvents = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    addUploadedFile(file.name);
    const reader = new FileReader();

    reader.onload = function (event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const cleaned = rows.map((row) => {
        const lower = {};
        Object.keys(row).forEach((k) => (lower[String(k).toLowerCase().trim()] = row[k]));

        const rawDate =
          lower["date"] ??
          lower["day"] ??
          lower["lesson date"] ??
          lower["datetime"] ??
          lower["start date"];

        const rawTime =
          lower["time"] ??
          lower["start time"] ??
          lower["hour"] ??
          lower["start"];

        const title =
          lower["title"] ??
          lower["lesson"] ??
          lower["name"] ??
          "Untitled";

        const description =
          lower["description"] ??
          lower["desc"] ??
          "";

        return {
          title,
          description,
          date: rawDate,
          time: rawTime,
          dateObj: excelDateToJSDate(rawDate),
          timeStr: excelTimeToString(rawTime),
        };
      });

      allNewEvents = allNewEvents.concat(cleaned);
      filesProcessed++;

      if (filesProcessed === files.length) {
        allEvents = allEvents.concat(allNewEvents);
        saveEventsToStorage();
        renderCalendar();
      }
    };

    reader.readAsArrayBuffer(file);
  }
}
