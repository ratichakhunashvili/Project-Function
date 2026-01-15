import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

function App() {
  const [numbers, setNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState([]); // NEW: show numbers

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const loadedNumbers = json.map((row) => row[0]).filter((num) => num); // remove empty rows

      setNumbers(loadedNumbers);
      setLog(loadedNumbers); // SHOW numbers in frontend
    };

    reader.readAsArrayBuffer(file);
  };

  const sendSMS = async () => {
    try {
      await axios.post("http://localhost:5000/send-sms", {
        numbers,
        message,
      });
      alert("Messages sent!");
    } catch (err) {
      console.error(err);
      alert("Error sending messages");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Bulk SMS Sender</h1>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      <br />
      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        cols={50}
        style={{ marginTop: "10px" }}
      />
      <br />
      <button onClick={sendSMS} style={{ marginTop: "10px" }}>
        Send Message
      </button>

      {/* NEW: Show loaded numbers */}
      {log.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Numbers loaded from Excel:</h3>
          <ul>
            {log.map((num, index) => (
              <li key={index}>{num}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
