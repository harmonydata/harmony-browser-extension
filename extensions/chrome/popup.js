// Check if we're dealing with a PDF tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const currentTab = tabs[0];
  if (currentTab?.id === -1 || currentTab?.url?.toLowerCase().includes("pdf")) {
    document.getElementById("pdfInput").style.display = "block";
  }
});

// Handle PDF text submission
document.getElementById("submitPdf").addEventListener("click", function () {
  const text = document.getElementById("pdfText").value;
  if (text) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      chrome.runtime.sendMessage({
        action: "processPdfText",
        text: text,
        tab: currentTab,
      });
      window.close();
    });
  }
});

// Function to format relative time
function getRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

// Update history list
function updateHistory() {
  chrome.storage.local.get(["history"], function (result) {
    const historyList = document.getElementById("historyList");
    const history = result.history || [];

    if (history.length === 0) {
      historyList.innerHTML = '<div class="no-history">No imports yet</div>';
      return;
    }

    historyList.innerHTML = history
      .map(
        (item) => `
      <div class="history-item">
        <div class="history-text">${item.text}</div>
        <div class="history-url">From: ${item.url}</div>
        <div class="history-time">${getRelativeTime(item.timestamp)}</div>
      </div>
    `
      )
      .join("");

    // Make history items clickable to reopen in Harmony
    const historyItems = historyList.getElementsByClassName("history-item");
    Array.from(historyItems).forEach((item, index) => {
      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        // Send message to background script to open URL
        chrome.runtime.sendMessage({
          action: "openHarmonyUrl",
          url: history[index].harmonyUrl,
        });
        // Close the popup
        window.close();
      });
    });
  });
}

// Update history when popup opens
document.addEventListener("DOMContentLoaded", updateHistory);

// Update history every minute to refresh relative times
setInterval(updateHistory, 60000);
