importScripts("./js-base64/base64.js");

const harmonyURL = "https://harmonydata.ac.uk/app/#/";
const harmonyApiUrl = "https://harmonyplugincleanuptext.fastdatascience.com/api/cleanup"; // Add API URL for direct text processing

const createHarmonyUrl = ({ questions, instrument_name }) => {
  if (
    Array.isArray(questions) &&
    questions.length &&
    questions.every(
      (q) =>
        typeof q === "string" ||
        q instanceof String ||
        (q.question_text &&
          (typeof q.question_text === "string" ||
            q.question_text instanceof String))
    )
  ) {
    const qArray = questions.map((q, i) => {
      return {
        question_no: q.question_no || i,
        question_text: q.question_text || q,
      };
    });
    const iArray = { instrument_name: instrument_name, questions: qArray };
    return harmonyURL + "import/" + Base64.encode(JSON.stringify(iArray), true);
  } else {
    throw new Error(
      "questions is not properly formatted - it must be an array of question texts, or an array of objects which each must have a question_text property"
    );
  }
};

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  // Create different menu items for PDFs and regular pages
  chrome.contextMenus.create({
    id: "sendToHarmony",
    title: "Send to Harmony",
    contexts: ["selection"],
  });
  // Initialize history in storage
  chrome.storage.local.set({ history: [] });
});

// Function to find or create Harmony tab
async function findOrCreateHarmonyTab(url) {
  // First, try to find an existing tab with our target name in the URL
  const tabs = await chrome.tabs.query({});
  const harmonyTab = tabs.find(
    (tab) => tab.url && tab.url.includes(harmonyURL)
  );

  if (harmonyTab) {
    // Update existing tab
    await chrome.tabs.update(harmonyTab.id, { url: url, active: true });
    await chrome.windows.update(harmonyTab.windowId, { focused: true });
  } else {
    // Create new tab
    await chrome.tabs.create({ url: url });
  }
}

// Function to call Harmony API with selected text
async function callHarmonyApi(text, tabInfo) {
  try {
    // Debug logging before API call
    console.log("Calling API with text:", text);
    console.log("Text formatting sample:");
    console.log("---START OF TEXT---");
    console.log(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
    console.log("---END OF TEXT---");
    
    // Properly encode the text parameter for the URL
    const encodedText = encodeURIComponent(text);
    console.log("Encoded text length:", encodedText.length);
    
    let response;
    
    
    response = await fetch(harmonyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
      })
    });
    
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    return data;
  } catch (error) {
    console.error("Error calling Harmony API:", error);
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openHarmonyUrl") {
    findOrCreateHarmonyTab(request.url);
    return true;
  }
  if (request.action === "processPdfText") {
    if (request.useApi) {
      // Try API first, then fall back to traditional method
      processSelectionWithApi(request.text, request.tab).catch(error => {
        console.error("API processing failed for PDF text, falling back to traditional method:", error);
        processSelection(request.text, request.tab);
      });
    } else {
      // Use traditional method directly
      processSelection(request.text, request.tab);
    }
    return true;
  }
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  if (info.menuItemId === "sendToHarmony") {
    // Use the selectionText property from the info object
    const selectedText = info.selectionText;
    
    // Debug logging
    console.log("Selected text from context menu:", selectedText);
    console.log("Text length:", selectedText ? selectedText.length : 0);
    console.log("Text type:", typeof selectedText);
    console.log("First 100 chars:", selectedText ? selectedText.substring(0, 100) : "");
    console.log("Contains newlines:", selectedText ? selectedText.includes("\n") : false);
    console.log("Tab info:", tab);
    
    if (selectedText && selectedText.trim() !== "") {
      // If we have selected text, try to process it directly
      try {
        // First try to call the API with the selected text
        await processSelectionWithApi(selectedText, tab);
      } catch (apiError) {
        console.error("API processing failed, falling back to traditional method:", apiError);
        // If API fails, fall back to the traditional method
        await processSelection(selectedText, tab);
      }
    } else {
      // No text selected or empty selection, show popup for manual input
      console.log("No text selected or empty selection, showing popup");
      showNotification("!", "#F44336", "No text selected");
      chrome.action.openPopup();
    }
  }
});

// Helper function to show notifications
function showNotification(text, color, message = "") {
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, 2000);
  
  if (message) {
    console.log(message);
  }
}

// Process selection using the API first approach
async function processSelectionWithApi(selectedText, tab) {
  if (!selectedText) {
    return; // Handle cases where no text is selected
  }

  try {
    // Call the Harmony API with the selected text
    const questionsArray = await callHarmonyApi(selectedText, tab);
    
    const harmonyUrl = createHarmonyUrl({
      questions: questionsArray,
      instrument_name: `Imported from ${tab.title} ${tab.url}`,
    });
    
    console.log("Created Harmony URL:", harmonyUrl);
    // Store in history
    storeInHistory(selectedText, tab, harmonyUrl || null);
    
    // If API returns a URL to open, use it
    if (harmonyUrl) {
      await findOrCreateHarmonyTab(harmonyUrl);
      showNotification("✓", "#4CAF50", "Submitted to Harmony successfully");
    } else {
      // Handle other API responses as needed
      showNotification("!", "#F44336", "Failed to submit to Harmony");
      console.log("API processed successfully but:", apiResult.result);
    }
    

  } catch (error) {
    console.error("API processing error:", error);
    throw error; // Rethrow to allow fallback
  }
}

// Traditional processing method (fallback)
async function processSelection(selectedText, tab) {
  if (!selectedText) {
    return; // Handle cases where no text is selected
  }

  // Debug logging for traditional processing
  console.log("Traditional processing of text:", selectedText);
  
  // Process the selected text here...
  const questionsArray = selectedText
    .split(/\r?\n|\s*<br\s*\/?>/i)
    .filter((line) => line.trim() !== "");
  
  console.log("Split into questions:", questionsArray);
  console.log("Number of questions:", questionsArray.length);

  try {
    // Create the Harmony URL with the selected text as a question
    const harmonyUrl = createHarmonyUrl({
      questions: questionsArray,
      instrument_name: `Imported from ${tab.title} ${tab.url}`,
    });
    
    console.log("Created Harmony URL:", harmonyUrl);

    // Store in history
    storeInHistory(selectedText, tab, harmonyUrl);

    // Open or update the Harmony tab
    await findOrCreateHarmonyTab(harmonyUrl);

    // Show success notification
    showNotification("✓", "#4CAF50", "Traditional processing successful");
  } catch (error) {
    // Show error notification
    showNotification("!", "#F44336", "Error in traditional processing");
    console.error("Error:", error);
    throw error;
  }
}

// Helper function to store in history
function storeInHistory(selectedText, tab, harmonyUrl) {
  chrome.storage.local.get(["history"], function (result) {
    const history = result.history || [];
    history.unshift({
      text:
        selectedText.substring(0, 100) +
        (selectedText.length > 100 ? "..." : ""),
      url: tab.url,
      timestamp: new Date().toISOString(),
      harmonyUrl: harmonyUrl,
    });
    // Keep only last 10 items
    if (history.length > 10) history.pop();
    chrome.storage.local.set({ history: history });
  });
}
