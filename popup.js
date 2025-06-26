const btn = document.getElementById('killBtn');
const stat = document.getElementById('status');
const downloadBtn = document.getElementById('downloadBtn');

btn.addEventListener('click', async () => {
  stat.className = '';
  stat.textContent = 'Sending request…';
  try {
    const res = await fetch('http://localhost:8080/kill?name=ClueLy.exe');
    const json = await res.json();
    if (json.success) {
      stat.className = 'notrunning';
      stat.textContent = json.message;
    } else {
      stat.className = 'error';
      stat.textContent = '❌ ' + json.message;
    }
  } catch (e) {
    stat.className = 'error';
    stat.textContent = 'Error: ' + e.message;
  }
});

downloadBtn.addEventListener('click', () => {
  const url = 'https://github.com/youruser/yourrepo/releases/download/v1.0.0/backend.exe'; // Placeholder URL
  stat.textContent = 'Starting download...';
  if (typeof chrome !== 'undefined' && chrome.downloads) {
    chrome.downloads.download({
      url: url,
      filename: 'backend.exe',
      saveAs: true
    }, (downloadId) => {
      if (downloadId) {
        stat.textContent = 'Download started!';
      } else {
        stat.textContent = 'Failed to start download.';
      }
    });
  } else {
    stat.textContent = 'chrome.downloads API not available.';
  }
});

async function pollStatus() {
  try {
    const res = await fetch('http://localhost:8080/status?name=ClueLy.exe');
    const json = await res.json();
    if (json.running) {
      stat.className = 'running';
      stat.textContent = json.message;
    } else {
      stat.className = 'notrunning';
      stat.textContent = json.message;
    }
  } catch (e) {
    stat.className = 'error';
    stat.textContent = 'Error: ' + e.message;
  }
}

let polling = true;

function startPolling() {
  polling = true;
  (async function loop() {
    while (polling) {
      await pollStatus();
      await new Promise(r => setTimeout(r, 200));
    }
  })();
}

function stopPolling() {
  polling = false;
}

window.addEventListener('DOMContentLoaded', startPolling);
window.addEventListener('unload', stopPolling);
