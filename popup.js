const btn = document.getElementById('killBtn');
const stat = document.getElementById('status');
const downloadBtn = document.getElementById('downloadBtn');

btn.addEventListener('click', async () => {
  stat.textContent = 'Sending request…';
  try {
    const res = await fetch('http://localhost:8080/kill?name=ClueLy.exe');
    const json = await res.json();
    if (json.success) {
      stat.textContent = json.message;
    } else {
      stat.textContent = '❌ ' + json.message;
    }
  } catch (e) {
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
