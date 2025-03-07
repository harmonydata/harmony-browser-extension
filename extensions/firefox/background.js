// Create context menu item
browser.contextMenus.create({
  id: "sendToHarmony",
  title: "Send to Harmony",
  contexts: ["selection"]
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToHarmony") {
    const selectedText = info.selectionText;
    const url = `https://harmonydata.ac.uk/app#/upload?text=${encodeURIComponent(selectedText)}`;
    browser.tabs.create({ url });
  }
});

// Handle messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "sendToHarmony") {
    const url = `https://harmonydata.ac.uk/app#/upload?text=${encodeURIComponent(message.text)}`;
    browser.tabs.create({ url });
  }
}); 