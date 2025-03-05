// Keep track of whether the background is initialized
let isInitialized = false;

// Initialize the background script
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script initialized");
  isInitialized = true;
});

// Handle all messages in a single listener for clarity and reliability
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);

  if (!isInitialized) {
    console.warn("Background not fully initialized, ignoring message");
    sendResponse({ error: "Background not ready" });
    return;
  }

  try {
    if (message.type === "logError") {
      console.error("Popup error:", message.error);
      sendResponse({ status: "Logged error" });
    } else if (message.type === "log") {
      console.log("Popup log:", message.message);
      sendResponse({ status: "Logged message" });
    } else if (message.type === 'postSetupCheck') {
      sendResponse({ status: 'OK' });
    } else {
      console.warn("Unknown message type:", message.type);
      sendResponse({ error: "Unknown message type" });
    }
  } catch (error) {
    console.error("Error processing message:", error);
    sendResponse({ error: error.message });
  }

  // Keep the message channel open for asynchronous responses
  return true;
});

// Keep the service worker alive with a periodic ping (optional, but recommended)
setInterval(() => {
  console.log("Background ping - keeping service worker alive");
}, 30000); // Ping every 30 seconds to prevent termination

// Handle connection errors or termination (optional)
chrome.runtime.onSuspend.addListener(() => {
  console.log("Background script suspending");
  isInitialized = false;
});