document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const sendButton = document.getElementById('sendButton');

  // Load saved text if any
  browser.storage.local.get(['savedText']).then((result) => {
    if (result.savedText) {
      textInput.value = result.savedText;
    }
  });

  // Save text as user types
  textInput.addEventListener('input', () => {
    browser.storage.local.set({ savedText: textInput.value });
  });

  // Handle send button click
  sendButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
      browser.runtime.sendMessage({
        type: 'sendToHarmony',
        text: text
      });
      window.close();
    }
  });

  // Handle enter key
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });
}); 