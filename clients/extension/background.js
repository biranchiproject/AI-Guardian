const API_URL = "http://localhost:5000/analyze";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_TEXT") {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: request.text })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ status: "success", data: data });
      
      // If high risk, show a system notification
      if (data.risk_level === "High") {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "AI Guardian Alert!",
          message: `${data.alert}`,
          priority: 2
        });
      }
    })
    .catch(error => {
      console.error("API Error:", error);
      sendResponse({ status: "error", message: error.message });
    });
    
    return true; // Keep channel open for async response
  }
});
