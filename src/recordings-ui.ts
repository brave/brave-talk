import { availableRecordings } from "./recordings";
import type { Recording } from "./store";
import "./css/recordings.css";

export type RecordingWithUrl = Recording & { url: string };

export const sortedRecordings = (): RecordingWithUrl[] => {
  const recordings = availableRecordings();

  /* sort by descending creation timestamp and then group by roomName
   */
  const records: RecordingWithUrl[] = [];
  Object.entries(recordings).forEach(([url, recording]) => {
    const entry = Object.assign({}, recording, { url: url });

    entry.url = url;
    records.push(entry);
  });
  records.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });
  records.sort((a, b) => {
    if (a.roomName === b.roomName) return 0;

    for (let i = 0; i < records.length; i++) {
      const roomName = records[i].roomName;

      if (a.roomName === roomName) return -1;
      if (b.roomName === roomName) return 1;
    }

    return 0;
  });

  return records;
};

export const populateRecordings = (recordingsEl: HTMLElement) => {
  const records = sortedRecordings();

  console.log("!!! records", records);

  if (records.length > 0) {
    const table = document.createElement("table");
    const thead = table.createTHead();

    const tr = document.createElement("tr");

    const th1 = document.createElement("td");
    th1.innerText = "Created";
    tr.appendChild(th1);

    const th2 = document.createElement("td");
    th2.innerText = "Duration";
    tr.appendChild(th2);

    const th3 = document.createElement("td");
    th3.innerText = "Expires";
    tr.appendChild(th3);

    thead.appendChild(tr);

    const tbody = table.createTBody();

    const getDate = (s: number) => {
      let datetime = new Date(s).toLocaleString();
      let x = datetime.indexOf(", ");

      return datetime.substr(0, x + 2);
    };

    const now = new Date().getTime();
    const offsets = {
      Today: getDate(now),
      Yesterday: getDate(now - 24 * 60 * 60 * 1000),
      Tomorrow: getDate(now + 24 * 60 * 60 * 1000),
    };

    const getCreateTime = (seconds: number) => {
      const s = new Date(seconds * 1000).toLocaleString();

      let result = s;

      Object.entries(offsets).forEach(([prefix, epoch]) => {
        if (s.indexOf(epoch) === 0) {
          result = prefix + " " + s.substr(epoch.length);
        }
      });

      return result;
    };

    const getDuration = (s: number) => {
      const pos = s >= 3600 ? 11 : 14;
      const len = s >= 3600 ? 8 : 5;

      return new Date(s * 1000).toISOString().substr(pos, len);
    };

    const getExpireTime = (seconds: number) => {
      let result = "";
      let diff = seconds - Math.ceil(now / 1000);

      if (diff >= 60 * 60) {
        result += Math.floor(diff / (60 * 60)) + "h" + " ";
        diff %= 60 * 60;
      }
      if (diff > 60) {
        result += Math.floor(diff / 60) + "m";
      }
      if (result === " ") {
        result = new Date(seconds * 1000).toLocaleString();
      }
      console.log("!!! result=" + result);

      return result;
    };

    records.forEach((r) => {
      const tr = document.createElement("tr");

      const td1 = document.createElement("td");
      const link = document.createElement("a");
      link.innerText = getCreateTime(r.createdAt);
      link.href = r.url;
      link.target = "_blank";
      link.title = r.roomName;
      td1.appendChild(link);
      tr.appendChild(td1);

      const td2 = document.createElement("td");
      td2.innerText = getDuration(r.expiresAt - r.ttl - r.createdAt);
      tr.appendChild(td2);

      const td3 = document.createElement("td");
      td3.innerText = getExpireTime(r.expiresAt);
      tr.appendChild(td3);

      tbody.appendChild(tr);
    });

    recordingsEl.appendChild(table);
    recordingsEl.style.display = "block";
  }
};
