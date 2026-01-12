const calendar = document.getElementById("calendar");
const fileInput = document.getElementById("excelFile");

fileInput.addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const events = XLSX.utils.sheet_to_json(sheet);
    renderCalendar(events);
  };

  reader.readAsArrayBuffer(file);
}

function renderCalendar(events) {
  calendar.innerHTML = "";

  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.innerHTML = `<strong>${day}</strong>`;

    events
      .filter((e) => e.date === dateStr)
      .forEach((e) => {
        const eventDiv = document.createElement("div");
        eventDiv.className = "event";
        eventDiv.textContent = e.title;
        dayDiv.appendChild(eventDiv);
      });

    calendar.appendChild(dayDiv);
  }
}
